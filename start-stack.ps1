# Script para iniciar el stack completo de ConectarProfesionales
# Backend (FastAPI) + Frontend (Next.js) + PostgreSQL + PostGIS

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ConectarProfesionales - Full Stack Startup  " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker esté corriendo
Write-Host "Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker no está corriendo. Por favor, inicia Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker está corriendo" -ForegroundColor Green
Write-Host ""

# Verificar archivo .env
Write-Host "Verificando archivo .env..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Write-Host "ERROR: No se encontró el archivo .env" -ForegroundColor Red
    Write-Host "Copiando .env.example a .env..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ Archivo .env creado. Por favor, configura tus variables de entorno." -ForegroundColor Green
        Write-Host "Edita el archivo .env antes de continuar." -ForegroundColor Yellow
        exit 0
    } else {
        Write-Host "ERROR: Tampoco se encontró .env.example" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Archivo .env encontrado" -ForegroundColor Green
Write-Host ""

# Verificar archivo .env del frontend
Write-Host "Verificando archivo .env del frontend..." -ForegroundColor Yellow
if (-Not (Test-Path "frontend\.env.local")) {
    Write-Host "Creando frontend\.env.local desde frontend\.env.example..." -ForegroundColor Yellow
    if (Test-Path "frontend\.env.example") {
        Copy-Item "frontend\.env.example" "frontend\.env.local"
        Write-Host "✓ Archivo frontend\.env.local creado" -ForegroundColor Green
    }
}
Write-Host ""

# Detener contenedores existentes
Write-Host "Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Write-Host "✓ Contenedores detenidos" -ForegroundColor Green
Write-Host ""

# Construir e iniciar servicios
Write-Host "Construyendo e iniciando servicios..." -ForegroundColor Yellow
Write-Host "Esto puede tomar varios minutos la primera vez..." -ForegroundColor Cyan
Write-Host ""
docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Falló al iniciar los servicios" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Servicios iniciados exitosamente" -ForegroundColor Green
Write-Host ""

# Esperar a que los servicios estén listos
Write-Host "Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Mostrar estado de los servicios
Write-Host ""
Write-Host "Estado de los servicios:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Servicios disponibles:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Frontend (Next.js):     http://localhost:3000" -ForegroundColor Green
Write-Host "🚀 Backend API (FastAPI):  http://localhost:8004" -ForegroundColor Green
Write-Host "📚 API Docs (Swagger):     http://localhost:8004/docs" -ForegroundColor Green
Write-Host "📖 API Docs (ReDoc):       http://localhost:8004/redoc" -ForegroundColor Green
Write-Host "🗄️  PostgreSQL:            localhost:5432" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Aplicar migraciones
Write-Host "Aplicando migraciones de base de datos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
docker-compose exec -T api alembic upgrade head

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migraciones aplicadas exitosamente" -ForegroundColor Green
} else {
    Write-Host "⚠ Advertencia: No se pudieron aplicar las migraciones" -ForegroundColor Yellow
    Write-Host "Puedes aplicarlas manualmente con: docker-compose exec api alembic upgrade head" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Comandos útiles:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ver logs en tiempo real:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "Ver logs de un servicio específico:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f api" -ForegroundColor White
Write-Host "  docker-compose logs -f frontend" -ForegroundColor White
Write-Host ""
Write-Host "Detener servicios:" -ForegroundColor Yellow
Write-Host "  docker-compose down" -ForegroundColor White
Write-Host ""
Write-Host "Reiniciar un servicio:" -ForegroundColor Yellow
Write-Host "  docker-compose restart api" -ForegroundColor White
Write-Host "  docker-compose restart frontend" -ForegroundColor White
Write-Host ""
Write-Host "Ejecutar tests:" -ForegroundColor Yellow
Write-Host "  docker-compose exec api pytest tests/ -v" -ForegroundColor White
Write-Host ""
Write-Host "Crear usuario admin:" -ForegroundColor Yellow
Write-Host "  .\create-admin.ps1" -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "¡Listo! El stack está corriendo. 🚀" -ForegroundColor Green
Write-Host ""
