#------------------------------------------------------------------------------
# �C���N���[�h
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
# �ݒ�����[�h
#------------------------------------------------------------------------------
if( Test-Path $xmlPath ) {
    $xml = [XML](Get-Content $xmlPath)
    $base = $xml.config.base
    $cid = $xml.config.cid

    # �㉺���𐧌�(��)
    $tmpInterval = [int]$xml.config.interval
    $tmpInterval = ( $tmpInterval, $minInterval | Measure -Maximum ).Maximum
    $tmpInterval = ( $tmpInterval, $maxInterval | Measure -Minimum ).Minimum

    # ms�ɕϊ�
    $interval = 60 * 1000 * $tmpInterval

    '�X�V�Ԋu: {0}��' -f $tmpInterval | Write-Host
} else {
    echo "Cannot read setting.xml"
    exit
}

#------------------------------------------------------------------------------
# �ۑ����Content Property��URL���m�F
#------------------------------------------------------------------------------
$url = Get-PropertyUrl -Base $base -Cid $Cid -Key $key
'�ۑ���URL: {0}' -f $url | Write-Host

#------------------------------------------------------------------------------
# ���O�C���������
#------------------------------------------------------------------------------
$cred = Get-Credential -Message�@'Confluence�̃��O�C���������'

#------------------------------------------------------------------------------
# ���������Ƃ��̃R�[���o�b�N
#------------------------------------------------------------------------------
function timer_function($notify){
    $entries = getCalendarEntries
    try {
        ForceUpdate-Property -Base $base -Cid $cid -Key $key -Credential $cred -Value $entries
    } catch {
        Write-Host $_
    �@�@$notify.BalloonTipIcon = 'Error'
    �@�@$notify.BalloonTipTitle = 'Outlook Schedule Uploader'
    �@�@$notify.BalloonTipText = '��O�����̂��߃o�b�N�O���E���h���s���I�����܂��B'
    �@�@$notify.ShowBalloonTip(3000)
        throw $_
    }

    $datetime = (Get-Date).ToString("yyyy/MM/dd HH:mm")
    $message = "Last updated: {0}" -f $datetime
    # �c�[���`�b�v�ɓo�^
    $notify.Text = $message

    # �o���[���ŕ\��
    #�@$notify.BalloonTipIcon = 'Info'
    #�@$notify.BalloonTipText = $message
    #�@$notify.BalloonTipTitle = 'Outlook Schedule Uploader'
    #�@$notify.ShowBalloonTip(1000)
}

$backgroundTaskCallbacks = @{
    "OnStarted"  = { write-host "[info] Started" }
    "OnProgress" = { timer_function $args[0] }
    "OnFinished" = { write-host "[info] Stopped" }
}

#------------------------------------------------------------------------------
# �N���O�̏���(�Â�Content-Property���폜)
#------------------------------------------------------------------------------
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

#------------------------------------------------------------------------------
# �o�b�N�O���E���h�^�X�N�N��
#------------------------------------------------------------------------------
startBackgroundTask -Name 'CalendarScraper' -Interval $interval -Callbacks $backgroundTaskCallbacks

