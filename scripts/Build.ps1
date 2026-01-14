# Build.ps1
# Runs Vite build for the project

Write-Host "Starting Vite build..."


# Ensure we are in the project root
Set-Location (Resolve-Path "$PSScriptRoot\..")

# Run the Vite build
pnpm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build completed successfully."
}
else {
    Write-Error "Build failed."
    exit 1
}
