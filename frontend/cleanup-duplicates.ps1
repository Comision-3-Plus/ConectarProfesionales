# 🧹 Script de Limpieza de Archivos Duplicados
# Ejecutar desde: frontend/
# Fecha: 4 de Noviembre 2025

Write-Host "🧹 Iniciando limpieza de archivos duplicados..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Ejecuta este script desde el directorio frontend/" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Creando backup con git..." -ForegroundColor Yellow
git add -A
git commit -m "Backup antes de limpieza de archivos duplicados - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

Write-Host ""
Write-Host "🗑️  Eliminando archivos duplicados..." -ForegroundColor Yellow
Write-Host ""

# Contador de archivos eliminados
$deletedCount = 0

# 1. Eliminar components/reviews (versión vieja)
if (Test-Path "components\reviews") {
    Write-Host "  ❌ Eliminando components/reviews/ (5 archivos)..." -ForegroundColor Red
    Remove-Item -Path "components\reviews" -Recurse -Force
    $deletedCount += 5
    Write-Host "     ✅ Eliminado" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  components/reviews/ ya no existe" -ForegroundColor Gray
}

# 2. Eliminar Chat duplicados en features/
$chatFiles = @(
    "components\features\ChatWindow.tsx",
    "components\features\ChatInput.tsx", 
    "components\features\ChatMessage.tsx",
    "components\features\ChatList.tsx"
)

foreach ($file in $chatFiles) {
    if (Test-Path $file) {
        Write-Host "  ❌ Eliminando $file..." -ForegroundColor Red
        Remove-Item -Path $file -Force
        $deletedCount++
        Write-Host "     ✅ Eliminado" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $file ya no existe" -ForegroundColor Gray
    }
}

# 3. Eliminar page_v2.tsx
$pageV2 = "app\(dashboard)\dashboard\profesional\perfil\page_v2.tsx"
if (Test-Path $pageV2) {
    Write-Host "  ❌ Eliminando $pageV2..." -ForegroundColor Red
    Remove-Item -Path $pageV2 -Force
    $deletedCount++
    Write-Host "     ✅ Eliminado" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  page_v2.tsx ya no existe" -ForegroundColor Gray
}

# 4. Eliminar components/payment (versión vieja)
if (Test-Path "components\payment") {
    Write-Host "  ❌ Eliminando components/payment/ (3 archivos)..." -ForegroundColor Red
    Remove-Item -Path "components\payment" -Recurse -Force
    $deletedCount += 3
    Write-Host "     ✅ Eliminado" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  components/payment/ ya no existe" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📊 Resumen de limpieza:" -ForegroundColor Cyan
Write-Host "   Total archivos eliminados: $deletedCount" -ForegroundColor Green
Write-Host ""

Write-Host "⚠️  ACCIÓN REQUERIDA MANUAL:" -ForegroundColor Yellow
Write-Host "   1. Actualizar import en: app/(public)/profile/[professional_id]/page.tsx" -ForegroundColor White
Write-Host "      Cambiar: import { ReviewsList } from '@/components/reviews/ReviewsList'" -ForegroundColor Red
Write-Host "      Por:     import { ReviewsList } from '@/components/features/reviews'" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Verificando build..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build exitoso! Limpieza completada." -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Crear commit de limpieza:" -ForegroundColor Cyan
    Write-Host "   git add -A" -ForegroundColor White
    Write-Host "   git commit -m ""refactor: eliminar archivos duplicados y obsoletos""" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Build falló. Revisar errores antes de commitear." -ForegroundColor Red
    Write-Host "   Puede que haya imports que necesiten actualizarse." -ForegroundColor Yellow
}
