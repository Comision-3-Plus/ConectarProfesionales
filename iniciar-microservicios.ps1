# Script para iniciar arquitectura de microservicios
# ConectarProfesionales - Microservicios

Write-Host "🚀 Iniciando Arquitectura de Microservicios..." -ForegroundColor Green
Write-Host ""

# Verificar que Docker esté corriendo
Write-Host "Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Docker no está corriendo" -ForegroundColor Red
    Write-Host "Por favor, inicia Docker Desktop y vuelve a intentar" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker está corriendo" -ForegroundColor Green
Write-Host ""

# Verificar que existe .env
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: No se encontró archivo .env" -ForegroundColor Red
    Write-Host "Por favor, crea el archivo .env con las credenciales necesarias" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
Write-Host ""

# Detener servicios anteriores
Write-Host "Deteniendo servicios anteriores..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservicios.yml down 2>&1 | Out-Null
Write-Host "✅ Servicios anteriores detenidos" -ForegroundColor Green
Write-Host ""

# Construir e iniciar servicios
Write-Host "🔨 Construyendo e iniciando servicios..." -ForegroundColor Cyan
Write-Host "Esto puede tomar varios minutos la primera vez..." -ForegroundColor Yellow
Write-Host ""

docker-compose -f docker-compose.microservicios.yml up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar servicios" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Servicios iniciados exitosamente" -ForegroundColor Green
Write-Host ""

# Esperar a que los servicios estén listos
Write-Host "⏳ Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Mostrar estado de servicios
Write-Host ""
Write-Host "📊 Estado de los servicios:" -ForegroundColor Cyan
Write-Host ""
docker-compose -f docker-compose.microservicios.yml ps

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ MICROSERVICIOS INICIADOS EXITOSAMENTE" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs de Acceso:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📡 API Gateway:              http://localhost:8000" -ForegroundColor White
Write-Host "  📚 Docs API Gateway:         http://localhost:8000/docs" -ForegroundColor White
Write-Host "  🔐 Servicio Autenticación:   http://localhost:8001/docs" -ForegroundColor White
Write-Host "  👤 Servicio Usuarios:        http://localhost:8002/docs" -ForegroundColor White
Write-Host "  👨‍💼 Servicio Profesionales:   http://localhost:8003/docs" -ForegroundColor White
Write-Host "  💬 Servicio Chat y Ofertas:  http://localhost:8004/docs" -ForegroundColor White
Write-Host "  💳 Servicio Pagos:           http://localhost:8005/docs" -ForegroundColor White
Write-Host "  🔔 Servicio Notificaciones:  http://localhost:8006/docs" -ForegroundColor White
Write-Host "  🎨 Frontend (Next.js):       http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Health Check:" -ForegroundColor Cyan
Write-Host "  curl http://localhost:8000/health" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Ver Logs:" -ForegroundColor Cyan
Write-Host "  docker-compose -f docker-compose.microservicios.yml logs -f" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Detener Servicios:" -ForegroundColor Cyan
Write-Host "  docker-compose -f docker-compose.microservicios.yml down" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

# Verificar health del gateway
Write-Host "🏥 Verificando estado de salud del Gateway..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Gateway respondiendo correctamente" -ForegroundColor Green
    Write-Host ""
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "⚠️  Gateway aún iniciándose, espera unos segundos más" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 ¡Todo listo! Los microservicios están corriendo" -ForegroundColor Green
Write-Host ""
