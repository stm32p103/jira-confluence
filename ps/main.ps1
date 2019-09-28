Set-StrictMode -Version Latest
# Scope�̎g������NG�̂��ߌ������K�v
# Set-StrictMode -Version Latest
#------------------------------------------------------------------------------
# �C���N���[�h
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

# �X�V����(��)
$minInterval = 5
$maxInterval = 60 * 24

# �������N�_�ɉ������̏����W�߂邩
$minPeriod = 5
$maxPeriod = 60

#------------------------------------------------------------------------------
# �ݒ�����[�h
#------------------------------------------------------------------------------
if( Test-Path $xmlPath ) {
    $xml = [XML](Get-Content $xmlPath)
    # Confluence URL�̃x�[�X
    $base = $xml.config.base

    # PageId
    $cid = $xml.config.cid

    # �\����
    $displayName = $xml.config.displayname

    # �㉺���𐧌�(��)
    $tmpInterval = [int]$xml.config.updateIntervalMinutes
    $tmpInterval = ( $tmpInterval, $minInterval | Measure -Maximum ).Maximum
    $tmpInterval = ( $tmpInterval, $maxInterval | Measure -Minimum ).Minimum
    $interval = 60 * 1000 * $tmpInterval

    # �㉺���𐧌�(��)
    $tmpPeriod = [int]$xml.config.period
    $tmpPeriod = ( $tmpPeriod, $minPeriod | Measure -Maximum ).Maximum
    $tmpPeriod = ( $tmpPeriod, $maxPeriod | Measure -Minimum ).Minimum
    $period = $tmpPeriod
    
    # �p�����[�^�\��
    '�X�V�Ԋu: {0}��' -f $tmpInterval | Write-Host
    '���o����: {0}��' -f $tmpPeriod   | Write-Host

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
if( $cred -eq $NULL ) {
    Write-Host '[info] �L�����Z��'
    exit
}

#------------------------------------------------------------------------------
# ���������Ƃ��̃R�[���o�b�N
#------------------------------------------------------------------------------
function OnStart {
    param( [object]$Notification )
    Write-Host '[info] �J�n'
    Write-Host '[info] ������Content-Property���폜...'

    # �ʒm��\��
    $Notification.BalloonTipIcon = 'Info'
    $Notification.BalloonTipTitle = 'Outlook Schedule Uploader'
    $Notification.BalloonTipText = '�X�P�W���[���̃A�b�v���[�h�J�n�B'
    $Notification.ShowBalloonTip(1000)
    
    # �X�V�����c�[���`�b�v�ɕ\��
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
            # �T�[�o�̉������Ȃ����A�����̃G���[
            throw $tmp
        }

        # ��������������X�e�[�^�X�R�[�h���m�F
        $statusCode = $err.StatusCode

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
}
#------------------------------------------------------------------------------
function OnTimeout {
    param( [object]$Notification )
    # ���肪�ǂ��Ȃ�悤�A������0:00�N�_�Ɏw�肳�ꂽ���Ԃ̗\����W�߂�
    $start = ( Get-Date ).Date
    $end = $start.AddDays( $period )
    $filter = Create-TermFilter -Start $start -End $end

    # �o�Ȏ҂̊m�F�Ɏg�����[�U����O�̂��ߍĎ擾����
    $names = Get-AccountNames
    
    # �\��𒊏o

    $entries = Get-CalendarItems | ForEach-CalendarItems -Process { Format-Item -Item $_ -Attendees $names }

    # ���M�f�[�^���쐬
    $sendData = @{
        'name' = $displayName;
        'entries' = $entries;
    }
    
    try {
       ForceUpdate-Property -Base $base -Cid $cid -Key $key -Credential $cred -Value $sendData
    } catch {
        Write-Host $_

        # �ʒm
    �@�@$Notification.BalloonTipIcon = 'Error'
    �@�@$Notification.BalloonTipTitle = 'Outlook Schedule Uploader'
    �@�@$Notification.BalloonTipText = '��O�����̂��߃o�b�N�O���E���h���s���I�����܂��B'
    �@�@$Notification.ShowBalloonTip(1000)

        throw $err
    }
    
    # �o���[���X�V
    $datetime = (Get-Date).ToString("yyyy/MM/dd HH:mm")
    $message = "Last updated: {0}" -f $datetime
    $Notification.Text = $message
}

function OnStop {
    param( [object]$Notification )

    # �ʒm
    $Notification.BalloonTipIcon = 'Info'
    $Notification.BalloonTipTitle = 'Outlook Schedule Uploader'
    $Notification.BalloonTipText = '�X�P�W���[���̃A�b�v���[�h��~�B'
    $Notification.ShowBalloonTip(1000)

    # �R���\�[��
    Write-host "[info] ��~"
}

$backgroundTaskCallbacks = @{
    "OnStart"   = { OnStart -Notification $args[0] }
    "OnTimeout" = { OnTimeout -Notification $args[0] }
    "OnStop"    = { OnStop -Notification $args[0] }
}

#------------------------------------------------------------------------------
# �o�b�N�O���E���h�^�X�N�N��
#------------------------------------------------------------------------------
startBackgroundTask -Name 'CalendarScraper' -Interval $interval -Callbacks $backgroundTaskCallbacks
