# Install-pnpm.ps1
# Installs pnpm globally if not already installed



# Ensure script runs from project root
Set-Location (Resolve-Path "$PSScriptRoot\..")

Write-Host "Checking for pnpm installation..."

$pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
if ($null -eq $pnpm) {
    Write-Host "pnpm not found. Installing pnpm globally via npm..."
    npm install -g pnpm
    if ($LASTEXITCODE -eq 0) {
        Write-Host "pnpm installed successfully."
    } else {
        Write-Error "Failed to install pnpm."
        exit 1
    }
} else {
    Write-Host "pnpm is already installed."
}
