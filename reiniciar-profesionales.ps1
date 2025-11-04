# Script para reiniciar el servicio de profesionales
# Aplica los cambios sin reiniciar todo el stack

Write-Host "`n🔄 REINICIANDO SERVICIO DE PROFESIONALES..." -ForegroundColor Cyan
Write-Host "=" * 60

# Reiniciar el contenedor
Write-Host "`n⏳ Deteniendo servicio..." -ForegroundColor Yellow
docker-compose stop servicio_profesionales

Write-Host "⏳ Reconstruyendo imagen..." -ForegroundColor Yellow
docker-compose build servicio_profesionales

Write-Host "⏳ Iniciando servicio..." -ForegroundColor Yellow
docker-compose up -d servicio_profesionales

Write-Host "`n⏳ Esperando a que el servicio esté listo (10 segundos)..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Verificar que está corriendo
Write-Host "`n🔍 Verificando estado..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8003/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Servicio de Profesionales está corriendo correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ El servicio no responde en el health check" -ForegroundColor Red
    Write-Host "💡 Revisa los logs con: docker-compose logs servicio_profesionales" -ForegroundColor Yellow
    exit 1
}

# Mostrar últimas líneas del log
Write-Host "`n📋 Últimas líneas del log:" -ForegroundColor Cyan
Write-Host "=" * 60
docker-compose logs --tail=20 servicio_profesionales

Write-Host "`n" + ("=" * 60)
Write-Host "✨ CAMBIOS APLICADOS ✨" -ForegroundColor Green
Write-Host "=" * 60

Write-Host "`n📝 Cambios aplicados:" -ForegroundColor White
Write-Host "   ✅ GET /professional/me ahora crea el perfil automáticamente"
Write-Host "   ✅ Nuevo endpoint POST /professional/initialize"
Write-Host ""

Write-Host "🧪 Prueba ahora:" -ForegroundColor Cyan
Write-Host "   1. Abre el frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   2. Ve a /perfil/editar (como profesional)" -ForegroundColor White
Write-Host "   3. ✅ Debería cargar sin error 404" -ForegroundColor Green
Write-Host ""

Write-Host "📚 Documentación completa en:" -ForegroundColor Yellow
Write-Host "   SOLUCION_ERROR_404_PERFIL.md" -ForegroundColor White
Write-Host ""
