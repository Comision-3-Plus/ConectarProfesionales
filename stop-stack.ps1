# Script para detener todos los servicios

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Deteniendo servicios..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Servicios detenidos exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para iniciar nuevamente:" -ForegroundColor Yellow
    Write-Host "  .\start-stack.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: No se pudieron detener los servicios" -ForegroundColor Red
    exit 1
}
