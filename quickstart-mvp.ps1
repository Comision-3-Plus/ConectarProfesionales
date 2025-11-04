# 🚀 INICIO RÁPIDO - MVP ConectarProfesionales

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    🚀 ConectarProfesionales - MVP QuickStart" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
Write-Host "📦 Verificando Docker..." -ForegroundColor Blue
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker no está instalado" -ForegroundColor Red
    Write-Host "   Por favor instala Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker encontrado" -ForegroundColor Green

# Detener contenedores existentes
Write-Host ""
Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Blue
docker-compose down 2>$null

# Iniciar servicios
Write-Host ""
Write-Host "🔄 Iniciando servicios con Docker Compose..." -ForegroundColor Blue
docker-compose up -d

# Esperar a que los servicios estén listos
Write-Host ""
Write-Host "⏳ Esperando a que los servicios estén listos..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Verificar servicios
Write-Host ""
Write-Host "🔍 Verificando servicios..." -ForegroundColor Blue
docker-compose ps

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    ✅ SERVICIOS INICIADOS CORRECTAMENTE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📍 ACCESOS:" -ForegroundColor Yellow
Write-Host "   🌐 Frontend:           http://localhost:3000" -ForegroundColor White
Write-Host "   🔌 API Gateway:        http://localhost:8000" -ForegroundColor White
Write-Host "   🔐 Auth Service:       http://localhost:8001" -ForegroundColor White
Write-Host "   👤 Users Service:      http://localhost:8002" -ForegroundColor White
Write-Host "   👷 Professionals:      http://localhost:8003" -ForegroundColor White
Write-Host "   💬 Chat/Offers:        http://localhost:8004" -ForegroundColor White
Write-Host "   💰 Payments:           http://localhost:8005" -ForegroundColor White
Write-Host "   🔔 Notifications:      http://localhost:8006" -ForegroundColor White
Write-Host "   🗄️  Adminer (DB UI):   http://localhost:8080" -ForegroundColor White
Write-Host ""

Write-Host "📚 DOCUMENTACIÓN:" -ForegroundColor Yellow
Write-Host "   📄 MVP_READY.md - Guía completa del MVP" -ForegroundColor White
Write-Host "   📄 ANALISIS_BACKEND_COMPLETO.md - Todos los endpoints" -ForegroundColor White
Write-Host ""

Write-Host "🧪 USUARIOS DE PRUEBA:" -ForegroundColor Yellow
Write-Host "   Cliente:" -ForegroundColor White
Write-Host "     Email: cliente@test.com" -ForegroundColor Gray
Write-Host "     Password: Test123!" -ForegroundColor Gray
Write-Host ""
Write-Host "   Profesional:" -ForegroundColor White
Write-Host "     Email: profesional@test.com" -ForegroundColor Gray
Write-Host "     Password: Test123!" -ForegroundColor Gray
Write-Host ""

Write-Host "🎯 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "   1. Abre http://localhost:3000 en tu navegador" -ForegroundColor White
Write-Host "   2. Regístrate como CLIENTE o PROFESIONAL" -ForegroundColor White
Write-Host "   3. Si eres profesional, completa tu perfil en /perfil/editar" -ForegroundColor White
Write-Host "   4. Si eres cliente, busca profesionales en /explorar" -ForegroundColor White
Write-Host "   5. Inicia un chat y contrata!" -ForegroundColor White
Write-Host ""

Write-Host "📊 VER LOGS:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f" -ForegroundColor Gray
Write-Host ""

Write-Host "🛑 DETENER SERVICIOS:" -ForegroundColor Yellow
Write-Host "   docker-compose down" -ForegroundColor Gray
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    🎉 ¡LISTO PARA USAR!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Abrir navegador automáticamente (opcional)
$openBrowser = Read-Host "¿Abrir el navegador automáticamente? (S/N)"
if ($openBrowser -eq "S" -or $openBrowser -eq "s") {
    Start-Process "http://localhost:3000"
}
