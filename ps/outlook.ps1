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
# ユーザ名を取得
# (Attendees に含まれる文字列)
#------------------------------------------------------------------------------
function Get-AccountNames {
    [string[]]$tmp = @()

    foreach( $account in $mapi.Accounts ) {
        $tmp += $account.CurrentUser.Name
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
# 期間によるフィルタ文字列を作る
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
# 予定表からItemsを返す
# https://docs.microsoft.com/ja-jp/office/vba/outlook/how-to/search-and-filter/search-the-calendar-for-appointments-that-occur-partially-or-entirely-in-a-given
#------------------------------------------------------------------------------
function Get-CalendarItems {
    param(
        [string]$Filter
    )
    $calendarFolder = $mapi.GetDefaultFolder( $olFolderCalendar )
    
    # 繰り返しの予定を得るための準備
    $items = $calendarFolder.Items
    $items.Sort( '[Start]' );
    $items.IncludeRecurrences = $true;
    
    # フィルタがあればかける
    if( $Filter ) {
        $selected = $Items.Restrict( $filter )
    } else {
        $selected =$Items
    }

    return $selected
}

#------------------------------------------------------------------------------
# Itemsに対して処理する
# AppointmentItemに限定
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
        # Pipelineから得たItems(AppointementItemの集まり)に対し、
        # AppointmentItemであることを確認してから、与えられたProcessコールバックを呼び出す
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
