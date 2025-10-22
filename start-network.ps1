# Script para iniciar Frontend y Backend en red local
# Ejecutar como: .\start-network.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  ConectarProfesionales - Network" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Obtener IP local
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "26.*" -or $_.IPAddress -like "192.168.*" } | Select-Object -First 1).IPAddress

if (-not $ip) {
    Write-Host "❌ No se pudo detectar la IP de red local" -ForegroundColor Red
    exit 1
}

Write-Host "✅ IP detectada: $ip" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Acceso desde la red:" -ForegroundColor Yellow
Write-Host "   Frontend: http://${ip}:3000" -ForegroundColor White
Write-Host "   Backend:  http://${ip}:8000" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   - El navegador mostrará 'No seguro' (normal con HTTP)" -ForegroundColor Gray
Write-Host "   - Para producción, configura HTTPS (ver SECURITY_GUIDE.md)" -ForegroundColor Gray
Write-Host ""

# Verificar si los puertos están en uso
$frontendPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$backendPort = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if ($frontendPort) {
    Write-Host "⚠️  Puerto 3000 ya está en uso. Detén el proceso anterior." -ForegroundColor Yellow
}

if ($backendPort) {
    Write-Host "⚠️  Puerto 8000 ya está en uso. Detén el proceso anterior." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Iniciando servidores..." -ForegroundColor Cyan
Write-Host ""

# Abrir terminal para Backend
Write-Host "📦 Iniciando Backend (FastAPI)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host '🐍 Backend - FastAPI' -ForegroundColor Magenta; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

# Esperar un poco para que el backend inicie
Start-Sleep -Seconds 3

# Abrir terminal para Frontend
Write-Host "⚛️  Iniciando Frontend (Next.js)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '⚛️  Frontend - Next.js' -ForegroundColor Blue; npm run dev"

Write-Host ""
Write-Host "✅ Servidores iniciados en ventanas separadas" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Comparte esta URL con dispositivos en tu red:" -ForegroundColor Cyan
Write-Host "   http://${ip}:3000" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host ""
Write-Host "🛑 Para detener: Cierra las ventanas de PowerShell" -ForegroundColor Yellow
