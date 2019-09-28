#------------------------------------------------------------------------------
# Unix Epoch
#------------------------------------------------------------------------------
$UNIX_EPOCH = Get-Date("1970/1/1 0:0:0 GMT")
function toUnixEpoch {
    param( [datetime]$Date )    
    return ( $Date - $UNIX_EPOCH ).TotalMilliSeconds
}

#------------------------------------------------------------------------------
# ó\íËÇJSONÇ…ïœä∑Ç∑ÇÈ
#------------------------------------------------------------------------------
function Format-Item {
    param(
        [parameter(mandatory)]$Item,
        [string[]]$Attendees
    )
    
    # Attendees Ç™ê›íËÇ≥ÇÍÇƒÇ¢ÇΩÇÁÅAéÂç√é“ÅEïKê{ÅEîCà”ÇîªíËÇ∑ÇÈ
    if( $Attendees ) {
        $isOrganiser = contains $Item.Organizer $Attendees
        $isRequired  = contains $Item.RequiredAttendees $Attendees
        $isOptional  = contains $Item.OptionalAttendees $Attendees
    } else {
        $isOrganiser = $FALSE
        $isRequired = $FALSE
        $isOptional = $FALSE
    }

    $entry = @{
        "start" = toUnixEpoch -Date $Item.Start
        "end" = toUnixEpoch -Date  $Item.End
        "allDay" = $Item.AllDayEvent;
        "org" = $isOrganiser;
        "req" = $isRequired;
        "opt" = $isOptional;
        "status" = $Item.MeetingStatus;
    }

    return $entry
}
