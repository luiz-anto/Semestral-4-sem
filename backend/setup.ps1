$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
function Run-Npm {
    param([string[]]$NpmArguments)
    & npm @NpmArguments
    if ($LASTEXITCODE -ne 0) { throw "Falha ao executar npm $NpmArguments" }
}
if (-not (Test-Path ".env")) {
    $template = Get-Content ".env.example" -Raw
    $bytes = New-Object byte[] 48
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    $secret = [Convert]::ToBase64String($bytes)
    $template = $template.Replace("SUBSTITUA_POR_UMA_CHAVE_ALEATORIA", $secret)
    [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot ".env"), $template, (New-Object System.Text.UTF8Encoding $false))
    Write-Host "Arquivo .env criado com JWT_SECRET aleatorio."
    Write-Host "Edite DATABASE_URL no .env com os dados do seu PostgreSQL e execute este script novamente."
    exit 0
}
Run-Npm -NpmArguments @("ci")
Run-Npm -NpmArguments @("run", "prisma:generate")
Run-Npm -NpmArguments @("run", "db:migrate")
Run-Npm -NpmArguments @("test")
Write-Host "Backend preparado. Para iniciar: npm run start:prod"
