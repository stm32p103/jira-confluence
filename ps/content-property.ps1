#------------------------------------------------------------------------------
# HTTP Basic Auth
# 与えられたHeaderに、Basic Authenticationヘッダを追加する。
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
# HTTPリクエストを発行する部分(共通)
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
# 強制的に更新する・存在しなければ作る
function ForceUpdate-Property {
    param(
        [parameter(mandatory)][string]$Base,
        [parameter(mandatory)][string]$Cid,
        [parameter(mandatory)][string]$Key,
        [parameter(mandatory)][object]$Value,
        [parameter(mandatory)][object]$Credential
    )
    try {
        # 取得した応答のContentをJSONに変換し、次のバージョンを算出する
        $latest = ( ( Get-Property -Base $Base -Cid $Cid -Key $Key -Credential $Credential ).Content | ConvertFrom-Json )
        $version = $latest.version.number + 1
    } catch {
        # 応答からステータスコードを取得
        $statusCode = $_.Exception.Response.StatusCode

        if( $statusCode -eq 'Unauthorized' ) {
            # 権限ない場合は続行不可
            Write-Host "[error] ユーザ名またはパスワードが不一致。"
            throw $_
        } elseif( $statusCode -eq 'NotFound' ) {
            # 見つからない場合は新規作成できるかもしれないため、続行可能。
            Write-Host "[info] Content PropertyまたはContentが存在しない。"
        } else {
            # URL間違いもここに分類される
            Write-Host "[error] 未分類のエラー。"
            throw $_
        }
    }

    if( $latest ) {
        Write-Host "[info] Content Propertyを更新..."
        $res = Update-Property -Base $base -Cid $cid -Key $key -Credential $cred -Value $entries -Version $version
    } else {
        Write-Host "[info] Content Propertyを新規作成..."

        try {
            $res = Create-Property -Base $base -Cid $cid -Key $key -Credential $cred -Value $entries
        } catch {
            $statusCode = $_.Exception.Response.StatusCode

            # プロパティが作れないとしたら、設定ミスなので続行不可
            if( $statusCode -eq 'Forbidden' ) {
                Write-Host "[error] 指令されたContentが存在しないため、Content Property作成不可。"
                throw $_
            } else {
                # URL間違いもここに分類される
                Write-Host "[error] 未分類のエラー。"
                throw $_
            }
        }
    }
    #  update or postの結果を返す
    return $res
}
