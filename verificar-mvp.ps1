# Script de Verificación Rápida del MVP
# Verifica que todos los microservicios respondan correctamente

Write-Host "`n🔍 VERIFICANDO MICROSERVICIOS..." -ForegroundColor Cyan
Write-Host "=" * 60

$services = @(
    @{Name="API Gateway"; URL="http://localhost:8000/health"; Port=8000},
    @{Name="Autenticación"; URL="http://localhost:8001/health"; Port=8001},
    @{Name="Usuarios"; URL="http://localhost:8002/health"; Port=8002},
    @{Name="Profesionales"; URL="http://localhost:8003/health"; Port=8003},
    @{Name="Chat/Ofertas"; URL="http://localhost:8004/health"; Port=8004},
    @{Name="Pagos"; URL="http://localhost:8005/health"; Port=8005},
    @{Name="Notificaciones"; URL="http://localhost:8006/health"; Port=8006}
)

$allOk = $true

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name) (Puerto $($service.Port))" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $($service.Name) - Status: $($response.StatusCode)" -ForegroundColor Yellow
            $allOk = $false
        }
    } catch {
        Write-Host "❌ $($service.Name) - NO RESPONDE" -ForegroundColor Red
        $allOk = $false
    }
}

Write-Host "`n" + ("=" * 60)

if ($allOk) {
    Write-Host "`n🎉 TODOS LOS SERVICIOS FUNCIONANDO CORRECTAMENTE`n" -ForegroundColor Green
    
    Write-Host "`n📋 ENDPOINTS CLAVE PARA EL MVP:`n" -ForegroundColor Cyan
    Write-Host "🔐 Registro:      POST http://localhost:8000/api/v1/auth/register"
    Write-Host "🔐 Login:         POST http://localhost:8000/api/v1/auth/login"
    Write-Host "🔍 Búsqueda:      POST http://localhost:8000/api/v1/search"
    Write-Host "👤 Mi perfil:     GET  http://localhost:8000/api/v1/users/me"
    Write-Host "👔 Perfil pro:    GET  http://localhost:8000/api/v1/professional/me"
    Write-Host "💬 Chats:         GET  http://localhost:8000/api/v1/chats"
    Write-Host "📁 Portfolio:     GET  http://localhost:8000/api/v1/professional/portfolio"
    
    Write-Host "`n🌐 FRONTEND:" -ForegroundColor Cyan
    Write-Host "   http://localhost:3000" -ForegroundColor White
    
    Write-Host "`n✨ MVP LISTO PARA USAR ✨`n" -ForegroundColor Green
    
} else {
    Write-Host "`n⚠️  ALGUNOS SERVICIOS NO ESTÁN FUNCIONANDO`n" -ForegroundColor Yellow
    Write-Host "Ejecuta: docker-compose up --build`n" -ForegroundColor White
}

Write-Host "`n🔧 ENDPOINTS CORREGIDOS RECIENTEMENTE:`n" -ForegroundColor Magenta
Write-Host "   ✅ PUT  /professional/me        (antes: /professional/profile)"
Write-Host "   ✅ POST /search                 (antes: /public/search)"
Write-Host "   ✅ GET  /public/professional/ID (nuevo endpoint público)"
Write-Host ""
