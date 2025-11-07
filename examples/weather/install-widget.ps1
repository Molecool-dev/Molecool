# Install Weather Widget to Widget Container
# This script copies the built widget to the Widget Container's widgets directory

$ErrorActionPreference = "Stop"

# Get the user data directory for Electron app
$appName = "molecule-widget-container"
$userDataPath = "$env:APPDATA\$appName"
$widgetsPath = "$userDataPath\widgets\weather-widget"

Write-Host "Installing Weather Widget..." -ForegroundColor Cyan
Write-Host "Target directory: $widgetsPath" -ForegroundColor Gray

# Create widgets directory if it doesn't exist
if (-not (Test-Path $widgetsPath)) {
    New-Item -ItemType Directory -Path $widgetsPath -Force | Out-Null
    Write-Host "Created widgets directory" -ForegroundColor Green
}

# Copy widget files
Write-Host "Copying widget files..." -ForegroundColor Gray

# Copy dist folder
if (Test-Path "dist") {
    Copy-Item -Path "dist" -Destination $widgetsPath -Recurse -Force
    Write-Host "  Copied dist/" -ForegroundColor Green
} else {
    Write-Host "  dist/ not found. Run 'npm run build' first!" -ForegroundColor Red
    exit 1
}

# Copy widget.config.json
Copy-Item -Path "widget.config.json" -Destination $widgetsPath -Force
Write-Host "  Copied widget.config.json" -ForegroundColor Green

Write-Host ""
Write-Host "Weather Widget installed successfully!" -ForegroundColor Green
Write-Host "You can now create this widget from the Widget Manager." -ForegroundColor Cyan
