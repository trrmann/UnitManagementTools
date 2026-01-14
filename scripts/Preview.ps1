# Preview-Local.ps1
# Starts the Vite preview server for local testing (serves the built app)

Write-Host "Starting Vite preview server..."
$PSScriptRoot
Set-Location (Resolve-Path "$PSScriptRoot\..\..")

pnpm run preview
