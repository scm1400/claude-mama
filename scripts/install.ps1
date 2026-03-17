# Claude Pet Installer for Windows
# Usage: irm https://raw.githubusercontent.com/scm1400/claude-pet/main/scripts/install.ps1 | iex
$ErrorActionPreference = "Stop"

$Repo = "scm1400/claude-pet"
$ApiUrl = "https://api.github.com/repos/$Repo/releases/latest"

function Info($msg)  { Write-Host "→ $msg" -ForegroundColor Blue }
function Ok($msg)    { Write-Host "✓ $msg" -ForegroundColor Green }
function Err($msg)   { Write-Host "✗ $msg" -ForegroundColor Red; exit 1 }

Info "Fetching latest release..."
try {
    $release = Invoke-RestMethod -Uri $ApiUrl -Headers @{ "User-Agent" = "claude-pet-installer" }
} catch {
    Err "Failed to fetch release info: $_"
}

$version = $release.tag_name
Info "Latest version: $version"

# Find .exe installer asset
$asset = $release.assets | Where-Object { $_.name -match '\.exe$' } | Select-Object -First 1
if (-not $asset) {
    Err "No Windows installer found in release $version"
}

$downloadUrl = $asset.browser_download_url
$fileName = $asset.name
$tempPath = Join-Path $env:TEMP $fileName

Info "Downloading $fileName..."
try {
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempPath -UseBasicParsing
} catch {
    Err "Download failed: $_"
}
Ok "Downloaded to $tempPath"

Info "Running installer..."
Start-Process -FilePath $tempPath -Wait
Ok "Installation complete!"

# Cleanup
Remove-Item -Path $tempPath -ErrorAction SilentlyContinue
Info "Claude Pet should now be available in your Start Menu."
