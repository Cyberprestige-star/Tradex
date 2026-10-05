# ============================================================
# TradeX - Development Launcher
# ============================================================

$ErrorActionPreference = "Stop"

# Racine du projet
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Frontend = Join-Path $Root "frontend"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                 TRADEX DEVELOPMENT SERVER" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le frontend existe
if (-not (Test-Path $Frontend)) {
    Write-Host "[ERREUR] Dossier frontend introuvable :" -ForegroundColor Red
    Write-Host $Frontend
    exit 1
}

# Récupérer l'IPv4 locale du PC
$IP = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
        $_.IPAddress -notlike "127.*" -and
        $_.IPAddress -notlike "169.254.*" -and
        $_.PrefixOrigin -ne "WellKnown"
    } |
    Select-Object -First 1 -ExpandProperty IPAddress

if (-not $IP) {
    $IP = "IP_NON_DETECTEE"
}

Write-Host "Projet :" -ForegroundColor Gray
Write-Host "  $Root"
Write-Host ""

Write-Host "Acces local :" -ForegroundColor Green
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "Acces reseau :" -ForegroundColor Green
Write-Host "  http://${IP}:3000" -ForegroundColor Yellow
Write-Host ""

Write-Host "Adresse IP du PC :" -ForegroundColor Green
Write-Host "  $IP" -ForegroundColor Yellow
Write-Host ""

Write-Host "Demarrage de Next.js..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Lancer Next.js en ecoute sur toutes les interfaces
Push-Location $Frontend

try {
    npm run dev -- --hostname 0.0.0.0
}
finally {
    Pop-Location
}
