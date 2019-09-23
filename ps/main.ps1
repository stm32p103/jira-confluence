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
$minInterval = 5
$maxInterval = 60*24



#------------------------------------------------------------------------------
# 設定をロード
#------------------------------------------------------------------------------
if( Test-Path $xmlPath ) {
    $xml = [XML](Get-Content $xmlPath)
    $base = $xml.config.base
    $cid = $xml.config.cid

    # 上下限を制限(分)
    $tmpInterval = [int]$xml.config.interval
    $tmpInterval = ( $tmpInterval, $minInterval | Measure -Maximum ).Maximum
    $tmpInterval = ( $tmpInterval, $maxInterval | Measure -Minimum ).Minimum

    # msに変換
    $interval = 60 * 1000 * $tmpInterval

    '更新間隔: {0}分' -f $tmpInterval | Write-Host
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

#------------------------------------------------------------------------------
# 周期処理とそのコールバック
#------------------------------------------------------------------------------
function timer_function($notify){
    $entries = getCalendarEntries
    try {
        ForceUpdate-Property -Base $base -Cid $cid -Key $key -Credential $cred -Value $entries
    } catch {
        Write-Host $_
    　　$notify.BalloonTipIcon = 'Error'
    　　$notify.BalloonTipTitle = 'Outlook Schedule Uploader'
    　　$notify.BalloonTipText = '例外発生のためバックグラウンド実行を終了します。'
    　　$notify.ShowBalloonTip(3000)
        throw $_
    }

    $datetime = (Get-Date).ToString("yyyy/MM/dd HH:mm")
    $message = "Last updated: {0}" -f $datetime
    # ツールチップに登録
    $notify.Text = $message

    # バルーンで表示
    #　$notify.BalloonTipIcon = 'Info'
    #　$notify.BalloonTipText = $message
    #　$notify.BalloonTipTitle = 'Outlook Schedule Uploader'
    #　$notify.ShowBalloonTip(1000)
}

$backgroundTaskCallbacks = @{
    "OnStarted"  = { write-host "[info] Started" }
    "OnProgress" = { timer_function $args[0] }
    "OnFinished" = { write-host "[info] Stopped" }
}

#------------------------------------------------------------------------------
# 起動前の準備(古いContent-Propertyを削除)
#------------------------------------------------------------------------------
try {
    Write-Host '[info] 既存のContent-Propertyを削除...'
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

#------------------------------------------------------------------------------
# バックグラウンドタスク起動
#------------------------------------------------------------------------------
startBackgroundTask -Name 'CalendarScraper' -Interval $interval -Callbacks $backgroundTaskCallbacks

