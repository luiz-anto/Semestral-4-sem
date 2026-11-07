$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
& npm ci
if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar dependencias." }
& npm test
if ($LASTEXITCODE -ne 0) { throw "Falha nos testes." }
& npm run build
if ($LASTEXITCODE -ne 0) { throw "Falha na compilacao." }
Write-Host "Frontend preparado. Execute: npm run dev"
