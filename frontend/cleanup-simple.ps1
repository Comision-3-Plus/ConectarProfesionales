# Script de Limpieza Simplificado
# Ejecutar desde: ConectarProfesionales/frontend/

Write-Host "Iniciando limpieza..." -ForegroundColor Cyan

# 1. Eliminar components/reviews
if (Test-Path "components\reviews") {
    Remove-Item -Path "components\reviews" -Recurse -Force
    Write-Host "✓ Eliminado: components/reviews/" -ForegroundColor Green
}

# 2. Eliminar Chat duplicados
$files = @(
    "components\features\ChatWindow.tsx",
    "components\features\ChatInput.tsx",
    "components\features\ChatMessage.tsx",
    "components\features\ChatList.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Host "✓ Eliminado: $file" -ForegroundColor Green
    }
}

# 3. Eliminar page_v2
$pageV2 = "app\(dashboard)\dashboard\profesional\perfil\page_v2.tsx"
if (Test-Path $pageV2) {
    Remove-Item -Path $pageV2 -Force
    Write-Host "✓ Eliminado: page_v2.tsx" -ForegroundColor Green
}

# 4. Eliminar components/payment
if (Test-Path "components\payment") {
    Remove-Item -Path "components\payment" -Recurse -Force
    Write-Host "✓ Eliminado: components/payment/" -ForegroundColor Green
}

Write-Host ""
Write-Host "Limpieza completada!" -ForegroundColor Green
