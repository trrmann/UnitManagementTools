# Run-Workflow-Local.ps1
# Runs the full local workflow: install, lint, format, build, and preview

Write-Host "Running full local workflow: install, lint, format, build, and preview..."

# Ensure we are in the project root
Set-Location (Resolve-Path "$PSScriptRoot\..")

Write-Host "Ensuring dependencies are installed..."
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Dependency installation failed."
    exit 1
}

Write-Host "Running lint checks..."
pnpm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Error "Lint checks failed."
    exit 1
}

Write-Host "Running code formatter..."
pnpm run format
if ($LASTEXITCODE -ne 0) {
    Write-Error "Formatting failed."
    exit 1
}

Write-Host "Building the project..."
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed."
    exit 1
}

Write-Host "Starting Vite preview server..."
pnpm run preview
