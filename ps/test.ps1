#------------------------------------------------------------------------------
# �C���N���[�h
#------------------------------------------------------------------------------
. .\outlook.ps1

# �A�J�E���g���擾
$names = getAccountNames

# ���Ԃ�ݒ�
$start = ( Get-Date ).Date
$end = $start.AddDays( 10 )
$filter = createFilter -Start $start -End $end

# �o�Ȏ҂̊m�F�Ɏg�����[�U�����擾����
$names = getAccountNames
    
# �\��𒊏o
$entries = getCalendarEntries -Filter $filter -Names $names

# �\��
$names | ConvertTo-Json | Write-Host
$entries | ConvertTo-Json | Write-Host
