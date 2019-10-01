#------------------------------------------------------------------------------
# インクルード
#------------------------------------------------------------------------------
. .\outlook.ps1
. .\format.ps1

# アカウント名取得
$users = Get-AccountNames

# 期間を設定
$start = ( Get-Date -year 2019 -Month 9 -Day 10 ).Date
$end = $start.AddDays( 30 )
$filter = Create-TermFilter -Start $start -End $end

Get-CalendarItems | ForEach-CalendarItems -Process { Format-Item -Item $_ -Attendees $users }
# | ForEach-CalendarItems -Process { $_ }
    
# 予定を抽出
# $entries = getCalendarEntries -Filter $filter -Names $names

# 表示
# $names | ConvertTo-Json | Write-Host
# $entries | ConvertTo-Json | Write-Host


