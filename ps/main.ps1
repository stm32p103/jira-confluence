. .\outlook.ps1
. .\content-property.ps1
. .\background-task.ps1

# const
$xmlPath = '.\setting.xml'
$key = 'schedule'

if( Test-Path $xmlPath ) {
    $xml = [XML](Get-Content $xmlPath)
    $base = $xml.config.base
    $cid = $xml.config.cid
}

echo $cid
echo $base

$cred = Get-Credential

function timer_function($notify){
    $entries = getCalendarEntries
    try {
        ForceUpdate-Property -Base $base -Cid $cid -Key $key -Credential $cred -Value $entries
    } catch {
        Write-Host $_
        throw $_
    }

    $datetime = (Get-Date).ToString("yyyy/MM/dd HH:mm")
    $message = "Last updated: {0}" -f $datetime
    # ツールチップに登録
    $notify.Text = $message

    # バルーンで表示
    $notify.BalloonTipIcon = 'Info'
    $notify.BalloonTipText = $message
    $notify.BalloonTipTitle = 'Outlook Schedule Uploader'
    $notify.ShowBalloonTip(1000)
}

$backgroundTaskCallbacks = @{
    "OnStarted"  = { write-host "[info] Started" }
    "OnProgress" = { timer_function $args[0] }
    "OnFinished" = { write-host "[info] Stopped" }
}

# 更新が頻繁にあるため、起動時にこれまでのプロパティを消す
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

startBackgroundTask -Name 'CalendarScraper' -Interval ( 10 * 1000 ) -Callbacks $backgroundTaskCallbacks

