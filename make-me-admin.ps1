# Script para convertir tu usuario en administrador

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Convertir Usuario en Administrador" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Solicitar email del usuario
$userEmail = Read-Host "Ingresa tu email"

if ([string]::IsNullOrWhiteSpace($userEmail)) {
    Write-Host "ERROR: Debes ingresar un email" -ForegroundColor Red
    exit 1
}

# Verificar que el contenedor de la API esté corriendo
$apiRunning = docker ps --filter "name=marketplace_api" --format "{{.Names}}"
if (-Not $apiRunning) {
    Write-Host "ERROR: El contenedor de la API no está corriendo." -ForegroundColor Red
    Write-Host "Ejecuta: docker compose up" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Buscando usuario con email: $userEmail ..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar comando Python para convertir a admin
$makeAdminCommand = @"
from app.core.database import SessionLocal
from app.models.user import Usuario
from app.models.enums import UserRole

db = SessionLocal()

# Buscar usuario por email
user = db.query(Usuario).filter_by(email='$userEmail').first()

if not user:
    print('❌ No se encontró ningún usuario con ese email')
    print('   Verifica que el email sea correcto')
else:
    # Actualizar rol a ADMIN
    old_role = user.rol
    user.rol = UserRole.ADMIN
    db.commit()
    db.refresh(user)
    
    print('✅ Usuario actualizado exitosamente!')
    print(f'   Email: {user.email}')
    print(f'   Nombre: {user.nombre} {user.apellido}')
    print(f'   Rol anterior: {old_role}')
    print(f'   Rol nuevo: {user.rol}')
    print(f'   ID: {user.id}')

db.close()
"@

docker compose exec -T api python -c $makeAdminCommand

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "¡Listo! Ahora recarga la página para ver los cambios." -ForegroundColor Green
Write-Host ""
Write-Host "Podrás acceder a:" -ForegroundColor Cyan
Write-Host "  - Panel de administración" -ForegroundColor White
Write-Host "  - Gestión de usuarios" -ForegroundColor White
Write-Host "  - Revisión de KYC" -ForegroundColor White
Write-Host "  - Métricas del sistema" -ForegroundColor White
Write-Host ""
