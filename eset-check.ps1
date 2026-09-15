
$paths = @(
  'HKLM:\SOFTWARE\ESET\ESET Security\CurrentVersion',
  'HKLM:\SOFTWARE\ESET\ESET Security\CurrentVersion\Plugins\FW',
  'HKLM:\SOFTWARE\ESET\ESET Security\CurrentVersion\Plugins',
  'HKCU:\Software\ESET\ESET Security\CurrentVersion',
  'HKCU:\Software\ESET\ESET Security\CurrentVersion\Plugins\FW'
)

$keysOfInterest = @('SSL','Tls','Filter','Ssl','Filt','Disable','Enable','Exclusion','Exclud','Scan','Protection','Fw','Firewall','SslFilter','SslTls','SslTlsFiltering','SslFiltering')

function Scan-Property($path) {
  if (-not (Test-Path $path)) { return }
  $props = Get-ItemProperty $path -ErrorAction SilentlyContinue
  if (-not $props) { return }
  $props.PSObject.Properties | Where-Object { $_.Name -in $keysOfInterest } | Format-Table Name,Value -AutoSize
}

foreach ($p in $paths) {
  Write-Host "=== $p ==="
  Scan-Property $p
}

# Also dump all property names for CurrentVersion
Write-Host "=== ALL PROPS: HKLM CurrentVersion ==="
Get-ItemProperty 'HKLM:\SOFTWARE\ESET\ESET Security\CurrentVersion' -ErrorAction SilentlyContinue | Format-List

Write-Host "=== ALL PROPS: HKCU CurrentVersion ==="
Get-ItemProperty 'HKCU:\Software\ESET\ESET Security\CurrentVersion' -ErrorAction SilentlyContinue | Format-List

Write-Host "=== FW PLUGIN KEYS ==="
Get-ChildItem 'HKLM:\SOFTWARE\ESET\ESET Security\CurrentVersion\Plugins' -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "  Subkey: $_.Name" }
Get-ChildItem 'HKCU:\Software\ESET\ESET Security\CurrentVersion\Plugins' -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "  Subkey: $_.Name" }
