# 🚀 INICIO RÁPIDO DEL MVP
# Este script verifica y arranca todos los servicios necesarios

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🚀 CONECTAR PROFESIONALES - MVP QUICK START" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Función para mostrar mensajes
function Show-Step {
    param($Number, $Message, $Color = "White")
    Write-Host "[Paso $Number/4] " -NoNewline -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor $Color
}

# Paso 1: Verificar Docker
Show-Step 1 "Verificando Docker..." "Yellow"
try {
    $dockerVersion = docker --version
    Write-Host "   ✅ Docker instalado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker no está instalado o no está corriendo" -ForegroundColor Red
    Write-Host "   📥 Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Paso 2: Levantar Backend (Docker)
Show-Step 2 "Levantando microservicios (Docker)..." "Yellow"
Write-Host "   ⏳ Esto puede tardar 2-3 minutos la primera vez..." -ForegroundColor Gray

$dockerComposeProcess = Start-Process -FilePath "docker-compose" -ArgumentList "up", "--build", "-d" -NoNewWindow -PassThru -Wait

if ($dockerComposeProcess.ExitCode -eq 0) {
    Write-Host "   ✅ Microservicios levantados correctamente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error al levantar microservicios" -ForegroundColor Red
    Write-Host "   💡 Revisa los logs con: docker-compose logs" -ForegroundColor Yellow
    exit 1
}

# Esperar a que los servicios estén listos
Write-Host "`n   ⏳ Esperando a que los servicios estén listos (30 segundos)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Paso 3: Verificar servicios
Show-Step 3 "Verificando servicios..." "Yellow"

$services = @(
    @{Name="Gateway"; URL="http://localhost:8000/health"},
    @{Name="Auth"; URL="http://localhost:8001/health"},
    @{Name="Users"; URL="http://localhost:8002/health"},
    @{Name="Professionals"; URL="http://localhost:8003/health"}
)

$allOk = $true
foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ $($service.Name)" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ❌ $($service.Name) no responde" -ForegroundColor Red
        $allOk = $false
    }
}

if (-not $allOk) {
    Write-Host "`n   ⚠️  Algunos servicios no respondieron" -ForegroundColor Yellow
    Write-Host "   💡 Ejecuta: docker-compose logs | findstr ERROR" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Paso 4: Levantar Frontend
Show-Step 4 "Levantando Frontend (Next.js)..." "Yellow"
Write-Host "   ⏳ Instalando dependencias si es necesario..." -ForegroundColor Gray

Set-Location -Path "frontend"

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "   📦 Instalando dependencias (esto tardará unos minutos)..." -ForegroundColor Yellow
    npm install
}

# Levantar frontend en background
Write-Host "   🌐 Iniciando servidor de desarrollo..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Set-Location -Path ".."

# Esperar a que el frontend esté listo
Write-Host "   ⏳ Esperando a que Next.js compile (20 segundos)..." -ForegroundColor Gray
Start-Sleep -Seconds 20

# Resumen final
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✨ MVP INICIADO CORRECTAMENTE ✨" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🌐 ACCEDE A LA APLICACIÓN:" -ForegroundColor White
Write-Host "   👉 Frontend:  " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:3000" -ForegroundColor Yellow
Write-Host "   👉 Backend:   " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:8000" -ForegroundColor Yellow
Write-Host "   👉 API Docs:  " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 FLUJOS DISPONIBLES:" -ForegroundColor White
Write-Host ""
Write-Host "   1️⃣  COMO CLIENTE:" -ForegroundColor Green
Write-Host "      • Ir a /registro → Crear cuenta cliente"
Write-Host "      • Ir a /buscar → Buscar 'Plomero' o cualquier oficio"
Write-Host "      • Click en un profesional → Ver perfil completo"
Write-Host "      • Botón 'Contactar' → Iniciar chat"
Write-Host ""
Write-Host "   2️⃣  COMO PROFESIONAL:" -ForegroundColor Magenta
Write-Host "      • Ir a /registro → Crear cuenta profesional"
Write-Host "      • Ir a /perfil/editar → Completar perfil"
Write-Host "      • Agregar descripción, oficios y ubicación"
Write-Host "      • Ir a /portfolio → Subir fotos de trabajos"
Write-Host "      • Esperar mensajes de clientes en /chat"
Write-Host ""

Write-Host "🔧 COMANDOS ÚTILES:" -ForegroundColor White
Write-Host "   • Ver logs backend:    " -NoNewline
Write-Host "docker-compose logs -f" -ForegroundColor Gray
Write-Host "   • Detener servicios:   " -NoNewline
Write-Host "docker-compose down" -ForegroundColor Gray
Write-Host "   • Verificar servicios: " -NoNewline
Write-Host ".\verificar-mvp.ps1" -ForegroundColor Gray
Write-Host "   • Ver endpoints:       " -NoNewline
Write-Host "cat MVP_ENDPOINTS_CORREGIDOS.md" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 DOCUMENTACIÓN:" -ForegroundColor White
Write-Host "   • Resumen MVP:         RESUMEN_MVP.md"
Write-Host "   • Endpoints corregidos: MVP_ENDPOINTS_CORREGIDOS.md"
Write-Host "   • Análisis completo:    ANALISIS_BACKEND_COMPLETO.md"
Write-Host ""

Write-Host "💡 TIPS:" -ForegroundColor Yellow
Write-Host "   • Los endpoints fueron corregidos hoy (4 Nov 2025)"
Write-Host "   • Si ves errores 404, verifica MVP_ENDPOINTS_CORREGIDOS.md"
Write-Host "   • El chat usa Firestore para mensajes en tiempo real"
Write-Host "   • Los pagos están en modo SANDBOX de MercadoPago"
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🎉 ¡DISFRUTA TU MVP!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Abrir el navegador automáticamente
Start-Sleep -Seconds 2
Write-Host "🌐 Abriendo navegador..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"
