# https://docs.microsoft.com/ja-jp/office/vba/api/outlook.namespace.getdefaultfolder
$outlook = New-Object -ComObject Outlook.Application
$mapi = $outlook.GetNameSpace("MAPI")

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
function toUnixEpoch {
    param( [datetime]$Date )    
    return ( $Date - $UNIX_EPOCH ).TotalMilliSeconds
}

#------------------------------------------------------------------------------
# ���[�U�����擾
# (Attendees �Ɋ܂܂�镶����)
#------------------------------------------------------------------------------
function getAccountNames() {
    $tmp = @()
    foreach( $account in $mapi.Accounts ) {
        $tmp += $account.CurrentUser.Name
    }
    return $tmp
}

#------------------------------------------------------------------------------
# ��1��������2�������܂ނ��m�F����
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
# �\���JSON�ɕϊ�����
#------------------------------------------------------------------------------
function format( $item, $accountNames ) {
    # ��ÎҁE�K�{�E�C�ӂ𔻒肷��
    $isOrganiser = contains $item.Organizer $accountNames
    $isRequired  = contains $item.RequiredAttendees $accountNames
    $isOptional  = contains $item.OptionalAttendees $accountNames

    $entry = @{
        "start" = toUnixEpoch -Date $item.Start
        "end" = toUnixEpoch -Date  $item.End
        "allDay" = $item.AllDayEvent;
        "org" = $isOrganiser;
        "req" = $isRequired;
        "opt" = $isOptional;
        "status" = $item.MeetingStatus;
    }
    return $entry
}

#------------------------------------------------------------------------------
# �t�B���^
# �J�n���ƏI��������
# https://docs.microsoft.com/ja-jp/office/vba/api/outlook.items.find
#------------------------------------------------------------------------------
$DATETIME_FORMAT = "MM/dd/yyyy hh:mm"
function createFilter {
    param(
        [datetime]$Start,
        [datetime]$End
    )

    if( $Start ) {
        $startFilter += "[Start]>='{0}'" -f $Start.ToString($DATETIME_FORMAT)
    }

    if( $End ) {
        $endFilter += "[End]<='{0}'" -f $End.ToString($DATETIME_FORMAT)
    }

    $filter = $startFilter, $endFilter -join ' AND '

    return $filter
}


#------------------------------------------------------------------------------
# ���`�����\���Ԃ�
#------------------------------------------------------------------------------
function getCalendarEntries {
    param(
        [string]$Filter, 
        [array][string]$Names)
    $calendarFolder = $mapi.GetDefaultFolder( $olFolderCalendar )
  
    # �J��Ԃ��̗\��𓾂邽�߂̏���
    #https://docs.microsoft.com/ja-jp/office/vba/outlook/how-to/search-and-filter/search-the-calendar-for-appointments-that-occur-partially-or-entirely-in-a-given
    $items = $calendarFolder.Items
    $items.Sort( '[Start]' );
    $items.IncludeRecurrences = $true;
    
    # �t�B���^��������
    if( $Filter ) {
        $selectedItems = $items.Restrict( $filter )
    } else {
        $selectedItems = $items
    }

    $entries = @()
    foreach( $item in $selectedItems ) {
        if( $item.Class -eq $olAppointment ) {
            $tmp = format $item $Names
            $entries += $tmp
        }
    }
    return $entries
}
