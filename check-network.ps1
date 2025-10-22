# Script para verificar la configuración de red
# Ejecutar como: .\check-network.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Verificación de Red - ConectarPro" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar IP
Write-Host "1️⃣  Dirección IP de Red:" -ForegroundColor Yellow
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "26.*" -or $_.IPAddress -like "192.168.*" } | Select-Object -First 1).IPAddress
if ($ip) {
    Write-Host "   ✅ IP: $ip" -ForegroundColor Green
} else {
    Write-Host "   ❌ No se detectó IP de red" -ForegroundColor Red
}
Write-Host ""

# 2. Verificar puertos
Write-Host "2️⃣  Estado de Puertos:" -ForegroundColor Yellow
$frontend = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$backend = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if ($frontend) {
    Write-Host "   ✅ Puerto 3000 (Frontend): EN USO" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Puerto 3000 (Frontend): LIBRE" -ForegroundColor Yellow
}

if ($backend) {
    Write-Host "   ✅ Puerto 8000 (Backend): EN USO" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Puerto 8000 (Backend): LIBRE" -ForegroundColor Yellow
}
Write-Host ""

# 3. Verificar firewall
Write-Host "3️⃣  Reglas de Firewall:" -ForegroundColor Yellow
$rule3000 = Get-NetFirewallRule -DisplayName "Next.js Dev*" -ErrorAction SilentlyContinue
$rule8000 = Get-NetFirewallRule -DisplayName "FastAPI Dev*" -ErrorAction SilentlyContinue

if ($rule3000) {
    Write-Host "   ✅ Puerto 3000 permitido en firewall" -ForegroundColor Green
} else {
    Write-Host "   ❌ Puerto 3000 NO permitido en firewall" -ForegroundColor Red
    Write-Host "      Ejecuta: New-NetFirewallRule -DisplayName 'Next.js Dev' -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow" -ForegroundColor Gray
}

if ($rule8000) {
    Write-Host "   ✅ Puerto 8000 permitido en firewall" -ForegroundColor Green
} else {
    Write-Host "   ❌ Puerto 8000 NO permitido en firewall" -ForegroundColor Red
    Write-Host "      Ejecuta: New-NetFirewallRule -DisplayName 'FastAPI Dev' -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow" -ForegroundColor Gray
}
Write-Host ""

# 4. Verificar archivos de configuración
Write-Host "4️⃣  Configuración de Archivos:" -ForegroundColor Yellow

# Check .env.local
if (Test-Path "frontend\.env.local") {
    $envContent = Get-Content "frontend\.env.local" -Raw
    if ($envContent -match $ip) {
        Write-Host "   ✅ .env.local configurado con IP correcta" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  .env.local existe pero puede necesitar actualización" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ frontend\.env.local NO existe" -ForegroundColor Red
}

# Check package.json
if (Test-Path "frontend\package.json") {
    $packageJson = Get-Content "frontend\package.json" -Raw
    if ($packageJson -match "0\.0\.0\.0") {
        Write-Host "   ✅ package.json configurado para red (-H 0.0.0.0)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ package.json NO configurado para red" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ frontend\package.json NO existe" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Resumen
if ($ip -and $frontend -and $backend -and $rule3000 -and $rule8000) {
    Write-Host "✅ TODO CONFIGURADO CORRECTAMENTE" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host ""
    Write-Host "🌐 Accede desde cualquier dispositivo en tu red:" -ForegroundColor Cyan
    Write-Host "   http://${ip}:3000" -ForegroundColor White
} else {
    Write-Host "⚠️  ALGUNAS CONFIGURACIONES NECESITAN ATENCIÓN" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📖 Consulta NETWORK_FIX.md para más detalles" -ForegroundColor Gray
}

Write-Host ""
