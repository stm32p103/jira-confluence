Set-StrictMode -Version Latest
# Scopeの使いかたNGのため見直し必要
# Set-StrictMode -Version Latest
#------------------------------------------------------------------------------
# インクルード
#------------------------------------------------------------------------------
. .\outlook.ps1
. .\content-property.ps1
. .\background-task.ps1
. .\format.ps1

#------------------------------------------------------------------------------
# const
#------------------------------------------------------------------------------
$xmlPath = '.\setting.xml'
$key = 'schedule'

# 更新周期(分)
$minInterval = 5
$maxInterval = 60 * 24

# 当日を起点に何日分の情報を集めるか
$minPeriod = 5
$maxPeriod = 60

#------------------------------------------------------------------------------
# 設定をロード
#------------------------------------------------------------------------------
if( Test-Path $xmlPath ) {
    $xml = [XML](Get-Content $xmlPath)
    # Confluence URLのベース
    $base = $xml.config.base

    # PageId
    $cid = $xml.config.cid

    # 表示名
    $displayName = $xml.config.displayname

    # 上下限を制限(分)
    $tmpInterval = [int]$xml.config.updateIntervalMinutes
    $tmpInterval = ( $tmpInterval, $minInterval | Measure -Maximum ).Maximum
    $tmpInterval = ( $tmpInterval, $maxInterval | Measure -Minimum ).Minimum
    $interval = 60 * 1000 * $tmpInterval

    # 上下限を制限(分)
    $tmpPeriod = [int]$xml.config.period
    $tmpPeriod = ( $tmpPeriod, $minPeriod | Measure -Maximum ).Maximum
    $tmpPeriod = ( $tmpPeriod, $maxPeriod | Measure -Minimum ).Minimum
    $period = $tmpPeriod
    
    # パラメータ表示
    '更新間隔: {0}分' -f $tmpInterval | Write-Host
    '抽出期間: {0}日' -f $tmpPeriod   | Write-Host

} else {
    echo "Cannot read setting.xml"
    exit
}

#------------------------------------------------------------------------------
# 保存先のContent PropertyのURLを確認
#------------------------------------------------------------------------------
$url = Get-PropertyUrl -Base $base -Cid $Cid -Key $key
'保存先URL: {0}' -f $url | Write-Host

#------------------------------------------------------------------------------
# ログイン情報を入力
#------------------------------------------------------------------------------
$cred = Get-Credential -Message　'Confluenceのログイン情報を入力'
if( $cred -eq $NULL ) {
    Write-Host '[info] キャンセル'
    exit
}

#------------------------------------------------------------------------------
# 周期処理とそのコールバック
#------------------------------------------------------------------------------
function OnStart {
    param( [object]$Notification )
    Write-Host '[info] 開始'
    Write-Host '[info] 既存のContent-Propertyを削除...'

    # 通知を表示
    $Notification.BalloonTipIcon = 'Info'
    $Notification.BalloonTipTitle = 'Outlook Schedule Uploader'
    $Notification.BalloonTipText = 'スケジュールのアップロード開始。'
    $Notification.ShowBalloonTip(1000)
    
    # 更新日をツールチップに表示
    $datetime = (Get-Date).ToString("yyyy/MM/dd HH:mm")
    $message = "Last updated: {0}" -f $datetime
    $Notification.Text = $message

    try {
        $res = Delete-Property -Base $base -Cid $cid -Key $key -Credential $cred
    } catch {
        try {
            $tmp = $_
            $err = $_.Exception.Response
        } catch {
            # サーバの応答がないか、内部のエラー
            throw $tmp
        }

        # 応答があったらステータスコードを確認
        $statusCode = $err.StatusCode

        # プロパティが作れないとしたら、設定ミスなので続行不可
        if( $statusCode -eq 'Unauthorized' ) {
            # 権限ない場合は続行不可
            Write-Host "[error] ユーザ名またはパスワードが不一致。"
            throw $_
        }elseif( $statusCode -eq 'Forbidden' ) {
            # 存在しないだけかもしれないため、続行可能。
            Write-Host "[info] 指令されたContentは削除済みか存在しない。"
        } else {
            # URL間違いもここに分類される。
            Write-Host "[error] 未分類のエラー。"
            throw $_
        }
    }
}
#------------------------------------------------------------------------------
function OnTimeout {
    param( [object]$Notification )
    # きりが良くなるよう、当日の0:00起点に指定された期間の予定を集める
    $start = ( Get-Date ).Date
    $end = $start.AddDays( $period )
    $filter = Create-TermFilter -Start $start -End $end

    # 出席者の確認に使うユーザ名を念のため再取得する
    $names = Get-AccountNames
    
    # 予定を抽出

    $entries = Get-CalendarItems | ForEach-CalendarItems -Process { Format-Item -Item $_ -Attendees $names }

    # 送信データを作成
    $sendData = @{
        'name' = $displayName;
        'entries' = $entries;
    }
    
    try {
       ForceUpdate-Property -Base $base -Cid $cid -Key $key -Credential $cred -Value $sendData
    } catch {
        Write-Host $_

        # 通知
    　　$Notification.BalloonTipIcon = 'Error'
    　　$Notification.BalloonTipTitle = 'Outlook Schedule Uploader'
    　　$Notification.BalloonTipText = '例外発生のためバックグラウンド実行を終了します。'
    　　$Notification.ShowBalloonTip(1000)

        throw $err
    }
    
    # バルーン更新
    $datetime = (Get-Date).ToString("yyyy/MM/dd HH:mm")
    $message = "Last updated: {0}" -f $datetime
    $Notification.Text = $message
}

function OnStop {
    param( [object]$Notification )

    # 通知
    $Notification.BalloonTipIcon = 'Info'
    $Notification.BalloonTipTitle = 'Outlook Schedule Uploader'
    $Notification.BalloonTipText = 'スケジュールのアップロード停止。'
    $Notification.ShowBalloonTip(1000)

    # コンソール
    Write-host "[info] 停止"
}

$backgroundTaskCallbacks = @{
    "OnStart"   = { OnStart -Notification $args[0] }
    "OnTimeout" = { OnTimeout -Notification $args[0] }
    "OnStop"    = { OnStop -Notification $args[0] }
}

#------------------------------------------------------------------------------
# バックグラウンドタスク起動
#------------------------------------------------------------------------------
startBackgroundTask -Name 'CalendarScraper' -Interval $interval -Callbacks $backgroundTaskCallbacks
