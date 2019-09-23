#------------------------------------------------------------------------------
# OlMeetingStatus
# https://docs.microsoft.com/ja-jp/office/vba/api/outlook.olmeetingstatus
#------------------------------------------------------------------------------
$olMeeting = 1
$olMeetingReceived = 3
$olMeetingCanceled = 5
$olMeetingReceivedAndCanceled = 7
$olNonMeeting = 0

#------------------------------------------------------------------------------
# OlObjectClass
# https://docs.microsoft.com/ja-jp/office/vba/api/outlook.olobjectclass
#------------------------------------------------------------------------------
$olAppointment = 26

#------------------------------------------------------------------------------
# OlDefaultFolders
# https://docs.microsoft.com/ja-jp/office/vba/api/outlook.oldefaultfolders
#------------------------------------------------------------------------------
$olFolderCalendar = 9

#------------------------------------------------------------------------------
# Unix Epoch
#------------------------------------------------------------------------------
$UNIX_EPOCH = Get-Date("1970/1/1 0:0:0 GMT")
function toUnixEpoch( $utc ) {
    return ( $utc - $UNIX_EPOCH ).TotalMilliSeconds
}

#------------------------------------------------------------------------------
# ユーザ名を取得
#------------------------------------------------------------------------------
function getAccountNames() {
    $tmp = @()
    foreach( $account in $mapi.Accounts ) {
        $tmp += $account.DisplayName
    }
    return $tmp
}

#------------------------------------------------------------------------------
# 第1引数が第2引数を含むか確認する
#------------------------------------------------------------------------------
function contains( $target, $arr ) {
    $res = $FALSE
  
    if( $target ) {
        foreach( $element in $arr ) {
            if( $target.Contains( $element ) ) {
                $res = $TRUE
            }
        }
    }
    return $res
}

#------------------------------------------------------------------------------
# 予定をJSONに変換する
#------------------------------------------------------------------------------
function format( $item, $accountNames ) {
    # 主催者・必須・任意を判定する
    $isOrganiser = contains $item.Organizer $accountNames
    $isRequired  = contains $item.RequiredAtendees $accountNames
    $isOptional  = contains $item.OptionalAtendees $accountNames

    $entry = @{
        "start" = toUnixEpoch $item.Start
        "end" = toUnixEpoch $item.End
        "allDay" = $item.AllDayEvent;
        "org" = $isOrganiser;
        "req" = $isRequired;
        "opt" = $isOptional;
        "status" = $item.MeetingStatus;
    }
    return $entry
}

#------------------------------------------------------------------------------
# 整形した予定を返す
#------------------------------------------------------------------------------
function getCalendarEntries() {
    $outlook = New-Object -ComObject Outlook.Application
    $mapi = $outlook.GetNameSpace("MAPI")
    $calendarFolder = $mapi.GetDefaultFolder( $olFolderCalendar )
  
    # Outlook内のユーザ名を取得
    $accounts = getAccountNames
  
    $entries = @()  
    foreach( $item in $calendarFolder.Items ) {
        if( $item.Class -eq $olAppointment ) {
            $tmp = format $item $accounts
            $entries += $tmp
        }
    }
    return $entries
}
