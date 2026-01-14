# Run-Format.ps1
# Runs the format script using pnpm

Write-Host "Running code formatter..."
$PSScriptRoot
Set-Location (Resolve-Path "$PSScriptRoot\..\..")

pnpm run format

if ($LASTEXITCODE -eq 0) {
    Write-Host "Formatting completed successfully."
} else {
    Write-Error "Formatting failed."
    exit 1
}
