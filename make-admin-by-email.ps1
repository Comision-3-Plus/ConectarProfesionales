# Script para convertir un usuario específico en ADMIN
# Uso: .\make-admin-by-email.ps1

$EMAIL = "lautisalinas4@gmail.com"

Write-Host "Convirtiendo $EMAIL en ADMIN..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker está corriendo
$CONTAINER_STATUS = docker ps --filter "name=marketplace_db" --format "{{.Status}}"

if ([string]::IsNullOrEmpty($CONTAINER_STATUS)) {
    Write-Host "Error: El contenedor marketplace_db no esta corriendo." -ForegroundColor Red
    Write-Host "Por favor ejecuta: docker compose up -d" -ForegroundColor Yellow
    exit 1
}

# Ejecutar SQL directamente en el contenedor de PostgreSQL
Write-Host "Actualizando rol a ADMIN..." -ForegroundColor Yellow
docker exec marketplace_db psql -U marketplace_user -d marketplace_db -c "UPDATE usuarios SET rol = 'ADMIN' WHERE email = '$EMAIL';"

# Verificar el cambio
Write-Host ""
Write-Host "Verificando el cambio..." -ForegroundColor Green
docker exec marketplace_db psql -U marketplace_user -d marketplace_db -c "SELECT id, email, nombre, apellido, rol, is_active FROM usuarios WHERE email = '$EMAIL';"

Write-Host ""
Write-Host "Usuario actualizado a ADMIN exitosamente!" -ForegroundColor Green
Write-Host "Ahora puedes iniciar sesion y acceder al panel de administracion." -ForegroundColor Yellow
