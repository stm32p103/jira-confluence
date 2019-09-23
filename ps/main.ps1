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
    # �c�[���`�b�v�ɓo�^
    $notify.Text = $message

    # �o���[���ŕ\��
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

# �X�V���p�ɂɂ��邽�߁A�N�����ɂ���܂ł̃v���p�e�B������
try {
    Write-Host '[info] ������Content-Property���폜...'
    $res = Delete-Property -Base $base -Cid $cid -Key $key -Credential $cred
} catch {
    $statusCode = $_.Exception.Response.StatusCode
    # �v���p�e�B�����Ȃ��Ƃ�����A�ݒ�~�X�Ȃ̂ő��s�s��
    if( $statusCode -eq 'Unauthorized' ) {
        # �����Ȃ��ꍇ�͑��s�s��
        Write-Host "[error] ���[�U���܂��̓p�X���[�h���s��v�B"
        throw $_
    }elseif( $statusCode -eq 'Forbidden' ) {
        # ���݂��Ȃ�������������Ȃ����߁A���s�\�B
        Write-Host "[info] �w�߂��ꂽContent�͍폜�ς݂����݂��Ȃ��B"
    } else {
        # URL�ԈႢ�������ɕ��ނ����B
        Write-Host "[error] �����ނ̃G���[�B"
        throw $_
    }
}

startBackgroundTask -Name 'CalendarScraper' -Interval ( 10 * 1000 ) -Callbacks $backgroundTaskCallbacks

