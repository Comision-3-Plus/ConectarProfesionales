#!/bin/bash

# Esperar a que el API esté listo
echo "⏳ Esperando que el API esté listo..."
sleep 10

# Crear usuario administrador
echo "👤 Creando usuario administrador..."
python -c "
from app.core.database import SessionLocal
from app.models.user import Usuario
from app.models.enums import UserRole
from app.core.security import get_password_hash

db = SessionLocal()

# Verificar si ya existe
admin = db.query(Usuario).filter(Usuario.email == 'admin@example.com').first()

if not admin:
    admin = Usuario(
        email='admin@example.com',
        nombre='Admin',
        apellido='System',
        password_hash=get_password_hash('Admin1234!'),
        rol=UserRole.ADMIN,
        is_active=True
    )
    db.add(admin)
    db.commit()
    print('✅ Usuario administrador creado')
    print('   Email: admin@example.com')
    print('   Password: Admin1234!')
else:
    print('ℹ️  Usuario administrador ya existe')

db.close()
"
