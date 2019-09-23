. .\outlook.ps1
. .\content-property.ps1
$xmlPath = '.\setting.xml'

if( Test-Path $xmlPath ) {
    $xml = [XML](Get-Content $xmlPath)
    $base = $xml.config.base
    $cid = $xml.config.cid
}

$key = 'schedule'
echo $cid
echo $base

$entries = getCalendarEntries
$cred = Get-Credential

$res = ForceUpdate-Property -Base $base -Cid $cid -Key $key -Credential $cred -Value $entries
