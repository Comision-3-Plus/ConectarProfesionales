# Script para crear usuario administrador

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Crear Usuario Administrador" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el contenedor de la API esté corriendo
$apiRunning = docker ps --filter "name=marketplace_api" --format "{{.Names}}"
if (-Not $apiRunning) {
    Write-Host "ERROR: El contenedor de la API no está corriendo." -ForegroundColor Red
    Write-Host "Ejecuta: .\start-stack.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Creando usuario administrador..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar comando Python para crear admin
$createAdminCommand = @"
from app.core.database import SessionLocal
from app.models.user import Usuario
from app.models.enums import UserRole
from app.core.security import get_password_hash

db = SessionLocal()

# Verificar si ya existe un admin
existing_admin = db.query(Usuario).filter_by(email='admin@example.com').first()
if existing_admin:
    print('⚠️  Ya existe un usuario admin con email: admin@example.com')
    print(f'   ID: {existing_admin.id}')
    print(f'   Activo: {existing_admin.is_active}')
else:
    # Crear usuario admin
    admin = Usuario(
        email='admin@example.com',
        password_hash=get_password_hash('Admin1234!'),
        nombre='Admin',
        apellido='Usuario',
        rol=UserRole.ADMIN,
        is_active=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print('✅ Usuario administrador creado exitosamente!')
    print(f'   Email: admin@example.com')
    print(f'   Contraseña: Admin1234!')
    print(f'   ID: {admin.id}')

db.close()
"@

docker-compose exec -T api python -c $createAdminCommand

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Puedes iniciar sesión en el frontend con:" -ForegroundColor Green
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Contraseña: Admin1234!" -ForegroundColor White
Write-Host ""
Write-Host "URL: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host ""
