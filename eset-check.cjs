const fs = require("fs");

const paths = [
  "HKLM:\\SOFTWARE\\ESET\\ESET Security\\CurrentVersion",
  "HKLM:\\SOFTWARE\\ESET\\ESET Security\\CurrentVersion\\Plugins\\FW",
  "HKLM:\\SOFTWARE\\ESET\\ESET Security\\CurrentVersion\\Plugins",
  "HKCU:\\Software\\ESET\\ESET Security\\CurrentVersion",
  "HKCU:\\Software\\ESET\\ESET Security\\CurrentVersion\\Plugins\\FW",
];

const keysOfInterest = [
  "SSL", "Tls", "Filter", "Ssl", "Filt", "Disable", "Enable",
  "Exclusion", "Exclud", "Scan", "Protection", "Fw", "Firewall",
];

function scanKey(name) {
  try {
    const props = fs.readdirSync(`\\\\.\\${name}`.replace(/^HKLM:\\/i, '\\\\ REGISTRY\\MACHINE\\').replace(/^HKCU:\\/i, '\\\\ REGISTRY\\CURRENT_USER\\'));
    // Fallback: use PowerShell-style approach via child_process
    return null;
  } catch {
    return null;
  }
}

// Use a simpler approach: write a PowerShell script and invoke it
const psScript = `
$paths = @(
  'HKLM:\\SOFTWARE\\ESET\\ESET Security\\CurrentVersion',
  'HKLM:\\SOFTWARE\\ESET\\ESET Security\\CurrentVersion\\Plugins\\FW',
  'HKLM:\\SOFTWARE\\ESET\\ESET Security\\CurrentVersion\\Plugins',
  'HKCU:\\Software\\ESET\\ESET Security\\CurrentVersion',
  'HKCU:\\Software\\ESET\\ESET Security\\CurrentVersion\\Plugins\\FW'
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
Get-ItemProperty 'HKLM:\\SOFTWARE\\ESET\\ESET Security\\CurrentVersion' -ErrorAction SilentlyContinue | Format-List

Write-Host "=== ALL PROPS: HKCU CurrentVersion ==="
Get-ItemProperty 'HKCU:\\Software\\ESET\\ESET Security\\CurrentVersion' -ErrorAction SilentlyContinue | Format-List

Write-Host "=== FW PLUGIN KEYS ==="
Get-ChildItem 'HKLM:\\SOFTWARE\\ESET\\ESET Security\\CurrentVersion\\Plugins' -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "  Subkey: \$_.Name" }
Get-ChildItem 'HKCU:\\Software\\ESET\\ESET Security\\CurrentVersion\\Plugins' -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "  Subkey: \$_.Name" }
`;

fs.writeFileSync("eset-check.ps1", psScript);
console.log("ESET check script written");
