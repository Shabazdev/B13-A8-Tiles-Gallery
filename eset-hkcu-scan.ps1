Write-Host "=== ESET HKCU CONFIG - SSL/TLS SCAN ==="

$configPaths = @(
  "HKCU:\Software\ESET\ESET Security\CurrentVersion\Config",
  "HKCU:\Software\ESET\ESET Security\CurrentVersion",
  "HKCU:\Software\ESET\ESET Security",
  "$env:APPDATA\ESET",
  "$env:LOCALAPPDATA\ESET"
)

$sslKeywords = @(
  "SSL", "Ssl", "SslFilter", "SslTls", "SslTlsFiltering",
  "Filter", "FilterSsl", "Inspection", "Exclude", "Exclusion",
  "Bypass", "Skip", "Enabled", "Active", "Setting", "Config",
  "Option", "Port", "27017", "Mongodb", "Node", "Application",
  "Exclusion", "URL", "Host", "Domain", "Certificate", "Root",
  "CA", "Trust", "Verify", "Proxy", "Intercept", "Scan",
  "Mode", "State", "Status", "Feature", "Fw", "FwFilter",
  "Enabled", "Disabled", "On", "Off", "Tls", "Tls1", "Tls12",
  "Tls13", "Cipher", "Protocol", "Connect", "Socket"
)

foreach ($base in $configPaths) {
  Write-Host "`n--- Scanning: $base ---" -ForegroundColor Cyan
  if (-not (Test-Path $base)) {
    Write-Host "  (not found)" -ForegroundColor Gray
    continue
  }
  Get-ChildItem $base -ErrorAction SilentlyContinue -Recurse -Depth 8 | ForEach-Object {
    $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
    if ($p) {
      $hits = $p.PSObject.Properties | Where-Object { $_.Name -in $sslKeywords }
      if ($hits) {
        Write-Host "  FOUND in: $($_.Name)" -ForegroundColor Yellow
        $hits | Format-Table Name,Value -AutoSize
      }
    }
  }
}

Write-Host "`n--- DONE ---" -ForegroundColor Green
