Write-Host "=== ESET SSL/TLS SPECTRUM ANALYSIS ==="
Write-Host ""

# 1. ESET SSL Filter CA details from certutil
Write-Host "--- ESET SSL Filter CA (from certutil) ---" -ForegroundColor Cyan
$esetCert = certutil -store Root 2>&1 | Select-String -Pattern "ESET SSL Filter"
if ($esetCert) {
  $esetCert | Out-String
} else {
  Write-Host "  Not found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "--- All ESET certs across all stores ---" -ForegroundColor Cyan
$allStores = @("Root","CA","My","TrustedPublisher","TrustedPeople","AuthRoot","Disallowed","SmartCardLogon")
foreach ($store in $allStores) {
  $result = certutil -store $store 2>&1 | Select-String -Pattern "ESET|ekrn|Eset" -Context 3,2
  if ($result) {
    Write-Host "  Store '$store' contains ESET cert:" -ForegroundColor Yellow
    $result | Out-String
  }
}

Write-Host ""
Write-Host "--- ESET Registry: SSL/Tls/Filter scan ---" -ForegroundColor Cyan
$allEsetPaths = @(
  "HKLM:\SOFTWARE\ESET",
  "HKCU:\Software\ESET",
  "$env:APPDATA\ESET",
  "$env:LOCALAPPDATA\ESET"
)

$scanFor = @(
  "SSL","Ssl","SslFilter","SslTls","SslTlsFiltering","SslConfig","SslSettings",
  "Filter","FilterSsl","Inspection","HttpInspect","SslInspect",
  "Exclude","Exclusion","ExcludeApp","Bypass","Skip",
  "Enabled","Disabled","Active","On","Off","Enable","Disable",
  "Setting","Config","Option","Mode","State","Status",
  "Port","27017","Mongodb","Node","Application","App",
  "URL","Host","Domain","Certificate","Cert","RootCA","Root","CA","Trust","Verify",
  "Proxy","Intercept","Scan","Tls","Tls1","Tls12","Tls13","Cipher","Protocol",
  "Connect","Socket","Server","Client","Man-in-the-Middle","MITM",
  "EncryptedCommunication","Encrypted","Decrypt","Re-encrypt"
)

$totalHits = 0
foreach ($base in $allEsetPaths) {
  if (-not (Test-Path $base)) { continue }
  Write-Host "  Scanning: $base" -ForegroundColor Gray
  Get-ChildItem $base -ErrorAction SilentlyContinue -Recurse -Depth 10 -Force | ForEach-Object {
    $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
    if ($p) {
      $hits = $p.PSObject.Properties | Where-Object { $_.Name -in $scanFor }
      if ($hits) {
        $totalHits++
        Write-Host "    HIT in $($_.Name):" -ForegroundColor Yellow
        $hits | Format-Table Name,Value -AutoSize
      }
    }
  }
}

Write-Host ""
Write-Host "Total SSL/TLS-related registry hits: $totalHits" -ForegroundColor $(if($totalHits -gt 0){"Yellow"}else{"Green"})
Write-Host ""

# 2. ESET SSL/TLS filtering control keys
Write-Host "--- ESET SSL/TLS Filtering Control ---" -ForegroundColor Cyan
$controlLocations = @(
  "HKLM:\SOFTWARE\ESET\ESET Security\CurrentVersion\Plugins\01000200",
  "HKCU:\Software\ESET\ESET Security\CurrentVersion\Plugins\01000200",
  "HKLM:\SOFTWARE\ESET\ESET Security\CurrentVersion\Config",
  "HKCU:\Software\ESET\ESET Security\CurrentVersion\Config"
)

foreach ($loc in $controlLocations) {
  Write-Host "  Checking: $loc" -ForegroundColor Gray
  if (-not (Test-Path $loc)) {
    Write-Host "    Not found" -ForegroundColor DarkGray
    continue
  }
  Write-Host "    Exists" -ForegroundColor Green
  $subKeys = Get-ChildItem $loc -ErrorAction SilentlyContinue
  if ($subKeys) {
    Write-Host "    Subkeys:" -ForegroundColor DarkYellow
    $subKeys | ForEach-Object { Write-Host "      - $($_.Name)" }
  }
  $props = Get-ItemProperty $loc -ErrorAction SilentlyContinue
  if ($props) {
    $sig = $props.PSObject.Properties | Where-Object {
      $_.Name -match "SSL|Ssl|SslFilter|SslTls|Filter|Inspection|Exclude|Exclusion|Bypass|Skip|Enable|Active|On|Off|Setting|Config|Option|State|Status|Mode|Port|27017|Certificate|Cert|RootCA|CA|Trust|Verify|Intercept|Scan|Tls|Tls1|Tls12|Tls13|Cipher|Protocol|Connect|Socket"
    }
    if ($sig) {
      Write-Host "    Significant properties:" -ForegroundColor Green
      $sig | Format-Table Name,Value -AutoSize
    }
  }
}

Write-Host ""
Write-Host "=== ANALYSIS COMPLETE ===" -ForegroundColor Green
