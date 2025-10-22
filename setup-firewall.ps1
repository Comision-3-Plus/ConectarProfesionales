# Script para configurar el Firewall de Windows
# ⚠️ EJECUTAR COMO ADMINISTRADOR
# Click derecho en PowerShell → Ejecutar como administrador

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Configuración de Firewall" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Cómo ejecutar como administrador:" -ForegroundColor Yellow
    Write-Host "   1. Click derecho en PowerShell" -ForegroundColor Gray
    Write-Host "   2. Seleccionar 'Ejecutar como administrador'" -ForegroundColor Gray
    Write-Host "   3. Ejecutar: .\setup-firewall.ps1" -ForegroundColor Gray
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Ejecutando como Administrador" -ForegroundColor Green
Write-Host ""

# Crear regla para puerto 3000 (Frontend)
Write-Host "🔧 Configurando puerto 3000 (Next.js Frontend)..." -ForegroundColor Cyan
try {
    # Eliminar regla existente si existe
    Remove-NetFirewallRule -DisplayName "Next.js Dev Server" -ErrorAction SilentlyContinue
    
    # Crear nueva regla
    New-NetFirewallRule `
        -DisplayName "Next.js Dev Server" `
        -Description "Permite acceso al servidor de desarrollo Next.js desde la red local" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 3000 `
        -Action Allow `
        -Profile Private,Domain `
        -Enabled True | Out-Null
    
    Write-Host "   ✅ Puerto 3000 configurado correctamente" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error configurando puerto 3000: $_" -ForegroundColor Red
}

# Crear regla para puerto 8000 (Backend)
Write-Host "🔧 Configurando puerto 8000 (FastAPI Backend)..." -ForegroundColor Cyan
try {
    # Eliminar regla existente si existe
    Remove-NetFirewallRule -DisplayName "FastAPI Dev Server" -ErrorAction SilentlyContinue
    
    # Crear nueva regla
    New-NetFirewallRule `
        -DisplayName "FastAPI Dev Server" `
        -Description "Permite acceso al servidor de desarrollo FastAPI desde la red local" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 8000 `
        -Action Allow `
        -Profile Private,Domain `
        -Enabled True | Out-Null
    
    Write-Host "   ✅ Puerto 8000 configurado correctamente" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error configurando puerto 8000: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar reglas creadas
Write-Host "📋 Reglas de Firewall Activas:" -ForegroundColor Yellow
Get-NetFirewallRule -DisplayName "*Dev Server*" | Select-Object DisplayName, Enabled, Direction | Format-Table -AutoSize

Write-Host ""
Write-Host "✅ Configuración completada" -ForegroundColor Green -BackgroundColor DarkGreen
Write-Host ""
Write-Host "🚀 Ahora puedes ejecutar: .\start-network.ps1" -ForegroundColor Cyan
Write-Host ""

pause
