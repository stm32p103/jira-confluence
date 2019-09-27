#------------------------------------------------------------------------------
# インクルード
#------------------------------------------------------------------------------
. .\outlook.ps1

# アカウント名取得
$names = getAccountNames

# 期間を設定
$start = ( Get-Date ).Date
$end = $start.AddDays( 10 )
$filter = createFilter -Start $start -End $end

# 出席者の確認に使うユーザ名を取得する
$names = getAccountNames
    
# 予定を抽出
$entries = getCalendarEntries -Filter $filter -Names $names

# 表示
$names | ConvertTo-Json | Write-Host
$entries | ConvertTo-Json | Write-Host
