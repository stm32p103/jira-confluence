#------------------------------------------------------------------------------
# �C���N���[�h
#------------------------------------------------------------------------------
. .\outlook.ps1
. .\format.ps1

# �A�J�E���g���擾
$users = Get-AccountNames

# ���Ԃ�ݒ�
$start = ( Get-Date -year 2019 -Month 9 -Day 10 ).Date
$end = $start.AddDays( 30 )
$filter = Create-TermFilter -Start $start -End $end

Get-CalendarItems | ForEach-CalendarItems -Process { Format-Item -Item $_ -Attendees $users }
# | ForEach-CalendarItems -Process { $_ }
    
# �\��𒊏o
# $entries = getCalendarEntries -Filter $filter -Names $names

# �\��
# $names | ConvertTo-Json | Write-Host
# $entries | ConvertTo-Json | Write-Host


