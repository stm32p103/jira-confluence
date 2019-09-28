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
# ���[�U�����擾
# (Attendees �Ɋ܂܂�镶����)
#------------------------------------------------------------------------------
function Get-AccountNames {
    [string[]]$tmp = @()

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
# ���Ԃɂ��t�B���^����������
# https://docs.microsoft.com/ja-jp/office/vba/api/outlook.items.find
#------------------------------------------------------------------------------
$DATETIME_FORMAT = "MM/dd/yyyy hh:mm"
function Create-TermFilter {
    param(
        [datetime]$Start,
        [datetime]$End
    )

    if( $Start ) {
        $startFilter += "[Start]>='{0}'" -f $Start.ToString( $DATETIME_FORMAT )
    }

    if( $End ) {
        $endFilter += "[End]<='{0}'" -f $End.ToString( $DATETIME_FORMAT )
    }

    $filter = $startFilter, $endFilter -join ' AND '

    return $filter
}

#------------------------------------------------------------------------------
# �\��\����Items��Ԃ�
# https://docs.microsoft.com/ja-jp/office/vba/outlook/how-to/search-and-filter/search-the-calendar-for-appointments-that-occur-partially-or-entirely-in-a-given
#------------------------------------------------------------------------------
function Get-CalendarItems {
    param(
        [string]$Filter
    )
    $calendarFolder = $mapi.GetDefaultFolder( $olFolderCalendar )
    
    # �J��Ԃ��̗\��𓾂邽�߂̏���
    $items = $calendarFolder.Items
    $items.Sort( '[Start]' );
    $items.IncludeRecurrences = $true;
    
    # �t�B���^������΂�����
    if( $Filter ) {
        $selected = $Items.Restrict( $filter )
    } else {
        $selected =$Items
    }

    return $selected
}

#------------------------------------------------------------------------------
# Items�ɑ΂��ď�������
# AppointmentItem�Ɍ���
#------------------------------------------------------------------------------
function ForEach-CalendarItems {
    param(
        [parameter( mandatory, ValueFromPipeline )][ValidateNotNullOrEmpty()]$Items,
        [parameter( mandatory )][ValidateNotNullOrEmpty()]$Process,
        [ValidateNotNullOrEmpty()]$Begin,
        [ValidateNotNullOrEmpty()]$End
    )
    begin {
        $results = @()
        if( $Begin ) {
            $Begin.Invoke()
        }
    }
    process {
        # Pipeline���瓾��Items(AppointementItem�̏W�܂�)�ɑ΂��A
        # AppointmentItem�ł��邱�Ƃ��m�F���Ă���A�^����ꂽProcess�R�[���o�b�N���Ăяo��
        foreach( $item in $Items ) {
            if( $item.Class -eq $olAppointment ) {
                $results += $Process.Invoke( $item )
            }
        }
    }
    end {
        if( $End ) {
            $End.Invoke()
        }
        return $results
    }
}
