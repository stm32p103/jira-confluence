# Scopeの使いかたNGのため見直し必要
# Set-StrictMode -Version Latest
#------------------------------------------------------------------------------
# インクルード
#------------------------------------------------------------------------------
. .\outlook.ps1
. .\content-property.ps1
. .\background-task.ps1

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
    $interval = 10 * 1000 * $tmpInterval

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
function OnStart(){
    Write-Host '[info] 開始'
    Write-Host '[info] 既存のContent-Propertyを削除...'
    try {
        $res = Delete-Property -Base $base -Cid $cid -Key $key -Credential $cred
    } catch {
        $statusCode = $_.Exception.Response.StatusCode
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
function OnTimeout( $notify ){
    # きりが良くなるよう、当日の0:00起点に指定された期間の予定を集める
    $start = ( Get-Date ).Date
    $end = $start.AddDays( $period )
    $filter = createFilter -Start $start -End $end

    $entries = getCalendarEntries -Filter $filter

    $sendData = @{
        'name' = $displayName;
        'entries' = $entries;
    }

    try {
       ForceUpdate-Property -Base $base -Cid $cid -Key $key -Credential $cred -Value $sendData
    } catch {
        Write-Host $_
    　　$notify.BalloonTipIcon = 'Error'
    　　$notify.BalloonTipTitle = 'Outlook Schedule Uploader'
    　　$notify.BalloonTipText = '例外発生のためバックグラウンド実行を終了します。'
    　　$notify.ShowBalloonTip(3000)
        throw $_
    }
    
    # 更新日をツールチップに表示
    $datetime = (Get-Date).ToString("yyyy/MM/dd HH:mm")
    $message = "Last updated: {0}" -f $datetime
    $notify.Text = $message
}

function OnStop() {
    write-host "[info] 停止"
}

$backgroundTaskCallbacks = @{
    "OnStart"   = { OnStart }
    "OnTimeout" = { OnTimeout $args[0] }
    "OnStop"    = { OnStop }
}

#------------------------------------------------------------------------------
# バックグラウンドタスク起動
#------------------------------------------------------------------------------
startBackgroundTask -Name 'CalendarScraper' -Interval $interval -Callbacks $backgroundTaskCallbacks
