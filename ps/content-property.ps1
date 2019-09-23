#------------------------------------------------------------------------------
# HTTP Basic Auth
# �^����ꂽHeader�ɁABasic Authentication�w�b�_��ǉ�����B
#------------------------------------------------------------------------------
function Append-AuthHeader {
    param(
        [parameter(mandatory)][object]$Credential,
        [parameter(mandatory)][object]$Header
    )
    $username = $Credential.UserName
    $password = $Credential.GetNetworkCredential().Password
    $auth = '{0}:{1}' -f $username, $password

    # Ascii -> Base64
    $bytes  = [System.Text.Encoding]::Ascii.GetBytes($auth)
    $base64 = [Convert]::ToBase64String($bytes)
    
    # Auth Header
    $Header.Add( 'Authorization', 'Basic ' + $base64 )
}

#------------------------------------------------------------------------------
# Contenet Property URL
# https://developer.atlassian.com/server/confluence/confluence-server-rest-api/
#------------------------------------------------------------------------------
function Get-PropertyUrl {
    param(
        [parameter(mandatory)][string]$Base,
        [parameter(mandatory)][string]$Cid,
        [string]$Key 
    )
    $url = '{0}/rest/api/content/{1}/property/{2}' -f $Base, $Cid, $Key
    return $url
}

#------------------------------------------------------------------------------
# Contenet Property REST API
# HTTP���N�G�X�g�𔭍s���镔��(����)
#------------------------------------------------------------------------------
function Request-Property {
    param(
        [parameter(mandatory)][string]$Url,
        [parameter(mandatory)][string]$Method,
        [object]$Credential,
        [object]$Data
    )
  
    $header = @{}
    if( $Credential -ne $NULL ) {
        Append-AuthHeader -Credential $Credential -Header $header
    }
  
    if( $Data -ne $NULL ) {
        $header.Add( 'Content-Type', 'application/json; charset=UTF-8' )
        $json = $Data | ConvertTo-Json
    }
  
    $res = Invoke-WebRequest $Url -Method $Method -Header $header -Body $json
    return $res
}

#------------------------------------------------------------------------------
function Get-Property {
     param(
        [parameter(mandatory)][string]$Base,
        [parameter(mandatory)][string]$Cid,
        [parameter(mandatory)][string]$Key,
        [parameter(mandatory)][object]$Credential 
    )
    $url = Get-PropertyUrl -Base $Base -Cid $Cid -Key $Key
  
    $res = Request-Property -Url $url -Metho GET -Credential $Credential
    return $res  
}
#------------------------------------------------------------------------------
function Create-Property {
    param(
        [parameter(mandatory)][string]$Base,
        [parameter(mandatory)][string]$Cid,
        [parameter(mandatory)][string]$Key,
        [parameter(mandatory)][object]$Value,
        [parameter(mandatory)][object]$Credential 
    )
  
    $url = Get-PropertyUrl -Base $Base -Cid $Cid -Key $Key

    $data = @{
        "key" = $Key
        "value" = $Value
    }
  
    $res = Request-Property -Url $url -Metho POST -Credential $Credential -Data $data
    return $res  
}
#------------------------------------------------------------------------------
function Update-Property {
    param(
        [parameter(mandatory)][string]$Base,
        [parameter(mandatory)][string]$Cid,
        [parameter(mandatory)][string]$Key,
        [parameter(mandatory)][int64]$Version,
        [parameter(mandatory)][object]$Value,
        [parameter(mandatory)][object]$Credential 
    )
  
    $url = Get-PropertyUrl -Base $Base -Cid $Cid -Key $Key
  
    $data = @{
        "key" = $Key
        "value" = $Value
        "version" = @{ "number" = $Version } 
    }
  
    $res = Request-Property -Url $url -Metho PUT -Credential $Credential -Data $data
    return $res  
}
#------------------------------------------------------------------------------
function Delete-Property {
    param(
        [parameter(mandatory)][string]$Base,
        [parameter(mandatory)][string]$Cid,
        [parameter(mandatory)][string]$Key,
        [parameter(mandatory)][object]$Credential 
    )
  
    $url = Get-PropertyUrl -Base $Base -Cid $Cid -Key $Key
    $res = Request-Property -Url $url -Metho DELETE -Credential $Credential
    return $res  
}
#------------------------------------------------------------------------------
# �����I�ɍX�V����E���݂��Ȃ���΍��
function ForceUpdate-Property {
    param(
        [parameter(mandatory)][string]$Base,
        [parameter(mandatory)][string]$Cid,
        [parameter(mandatory)][string]$Key,
        [parameter(mandatory)][object]$Value,
        [parameter(mandatory)][object]$Credential
    )
    try {
        # �擾����������Content��JSON�ɕϊ����A���̃o�[�W�������Z�o����
        $latest = ( ( Get-Property -Base $Base -Cid $Cid -Key $Key -Credential $Credential ).Content | ConvertFrom-Json )
        $version = $latest.version.number + 1
    } catch {
        # ��������X�e�[�^�X�R�[�h���擾
        $statusCode = $_.Exception.Response.StatusCode

        if( $statusCode -eq 'Unauthorized' ) {
            # �����Ȃ��ꍇ�͑��s�s��
            Write-Host "[error] ���[�U���܂��̓p�X���[�h���s��v�B"
            throw $_
        } elseif( $statusCode -eq 'NotFound' ) {
            # ������Ȃ��ꍇ�͐V�K�쐬�ł��邩������Ȃ����߁A���s�\�B
            Write-Host "[info] Content Property�܂���Content�����݂��Ȃ��B"
        } else {
            # URL�ԈႢ�������ɕ��ނ����
            Write-Host "[error] �����ނ̃G���[�B"
            throw $_
        }
    }

    if( $latest ) {
        Write-Host "[info] Content Property���X�V..."
        $res = Update-Property -Base $base -Cid $cid -Key $key -Credential $cred -Value $entries -Version $version
    } else {
        Write-Host "[info] Content Property��V�K�쐬..."

        try {
            $res = Create-Property -Base $base -Cid $cid -Key $key -Credential $cred -Value $entries
        } catch {
            $statusCode = $_.Exception.Response.StatusCode

            # �v���p�e�B�����Ȃ��Ƃ�����A�ݒ�~�X�Ȃ̂ő��s�s��
            if( $statusCode -eq 'Forbidden' ) {
                Write-Host "[error] �w�߂��ꂽContent�����݂��Ȃ����߁AContent Property�쐬�s�B"
                throw $_
            } else {
                # URL�ԈႢ�������ɕ��ނ����
                Write-Host "[error] �����ނ̃G���[�B"
                throw $_
            }
        }
    }
    #  update or post�̌��ʂ�Ԃ�
    return $res
}
