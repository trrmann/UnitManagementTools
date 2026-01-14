# Run-Lint.ps1
# Runs the lint script using pnpm

Write-Host "Running lint checks..."

# Ensure we are in the project root
Set-Location (Resolve-Path "$PSScriptRoot\..")

pnpm run lint

if ($LASTEXITCODE -eq 0) {
    Write-Host "Lint checks passed."
} else {
    Write-Error "Lint checks failed."
    exit 1
}
