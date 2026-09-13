$body = @{ provider = 'google'; callbackURL = '/' } | ConvertTo-Json
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/sign-in/social" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
    Write-Host "Status: $($r.StatusCode)"
    Write-Host "Body: $($r.Content)"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $responseBody = $reader.ReadToEnd()
    Write-Host "Status: $statusCode"
    Write-Host "Body: $responseBody"
}
