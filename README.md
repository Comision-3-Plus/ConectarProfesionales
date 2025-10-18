# 🏗️ Marketplace de Profesionales - Backend API

API RESTful headless construida con **FastAPI**, **PostgreSQL + PostGIS** y **Docker** para conectar profesionales con clientes.

## ✨ Estado del Proyecto

✅ **Módulo 1 (Auth/KYC) - COMPLETADO**
- Autenticación JWT con roles (Cliente, Profesional, Admin)
- Sistema KYC para verificación de profesionales
- Control de acceso basado en roles (RBAC)
- Testing E2E automatizado con cobertura completa

---

## 📦 Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| **Framework** | FastAPI | 0.104.1 |
| **Base de Datos** | PostgreSQL + PostGIS | 15 + 3.4 |
| **ORM** | SQLAlchemy | 2.0.23 |
| **Migraciones** | Alembic | 1.12.1 |
| **Autenticación** | JWT (python-jose) | 3.3.0 |
| **Validación** | Pydantic | 2.5.0 |
| **Testing** | pytest + httpx | 7.4.3 + 0.25.2 |
| **Containerización** | Docker + Docker Compose | - |

---

## 🗂️ Estructura del Proyecto

```
ConectarProfesionales/
├── app/                      # Código fuente
│   ├── api/                  # Endpoints REST
│   │   ├── dependencies.py   # Dependencias compartidas (auth)
│   │   └── v1/endpoints/     # Endpoints versión 1
│   │       ├── auth.py       # Register, Login
│   │       ├── users.py      # /users/me
│   │       ├── professional.py # KYC upload
│   │       └── admin.py      # KYC review/approve
│   ├── core/                 # Configuración central
│   │   ├── config.py         # Settings con Pydantic
│   │   ├── database.py       # Conexión a BD
│   │   └── security.py       # JWT, password hashing
│   ├── models/               # Modelos SQLAlchemy
│   │   ├── user.py           # Usuario
│   │   ├── professional.py   # Profesional
│   │   └── enums.py          # UserRole, VerificationStatus, etc.
│   ├── schemas/              # Schemas Pydantic (DTOs)
│   │   ├── user.py           # UserCreate, UserResponse
│   │   ├── token.py          # Token, TokenData
│   │   └── admin.py          # ProfessionalPendingReview
│   ├── services/             # Lógica de negocio
│   │   ├── kyc_service.py    # Gestión de KYC
│   │   └── user_service.py   # Gestión de usuarios
│   └── main.py               # Entry point FastAPI
├── migrations/               # Migraciones Alembic
│   └── versions/
│       └── a712bab2b239_crear_tablas_usuario_y_profesional.py
├── tests/                    # Tests E2E
│   └── test_e2e_module_1.py  # Suite de tests del Módulo 1
├── docker-compose.yml        # Orquestación de servicios
├── Dockerfile                # Imagen Docker de la API
├── requirements.txt          # Dependencias de producción
├── requirements-dev.txt      # Dependencias de desarrollo
├── pytest.ini                # Configuración de pytest
├── run_e2e_tests.ps1         # Script de testing automatizado
└── README.md                 # Este archivo
```

---

## 🚀 Inicio Rápido

### 1️⃣ Configurar Variables de Entorno

```powershell
# Si no existe .env, copiarlo desde el ejemplo
Copy-Item .env.example .env
# Editar .env con tus credenciales si es necesario
```

### 2️⃣ Levantar el Stack

```powershell
docker-compose up -d --build
```

**Servicios levantados:**
- 🌐 **API FastAPI**: http://localhost:8004
- 🗄️ **PostgreSQL + PostGIS**: localhost:5432
- 📚 **Documentación Swagger**: http://localhost:8004/docs
- 📖 **ReDoc**: http://localhost:8004/redoc

### 3️⃣ Aplicar Migraciones

```powershell
docker-compose exec api alembic upgrade head
```

### 4️⃣ Crear Usuario Admin (Requerido para tests)

```powershell
docker-compose exec api python -c "from app.core.database import SessionLocal; from app.models.user import Usuario; from app.models.enums import UserRole; from app.core.security import get_password_hash; db=SessionLocal(); u=Usuario(email='admin@example.com', password_hash=get_password_hash('Admin1234!'), nombre='Admin', apellido='User', rol=UserRole.ADMIN, is_active=True); db.add(u); db.commit(); print('Admin created:', u.id)"
```

### 5️⃣ Verificar que Todo Funciona

```powershell
# Ver logs
docker-compose logs -f api

# Health check desde el navegador
# http://localhost:8004/health
```

---

## 📚 Endpoints Disponibles (Módulo 1)

### 🔓 Públicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Registrar nuevo usuario (Cliente o Profesional) |
| `POST` | `/api/v1/auth/login` | Login con email y contraseña → JWT Token |
| `GET` | `/health` | Health check de la API |

### 🔐 Autenticados (requieren token)

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `GET` | `/api/v1/users/me` | Todos | Obtener datos del usuario actual |

### 👔 Profesionales

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `POST` | `/api/v1/professional/kyc/upload` | Profesional | Subir documentos KYC para verificación |

### 👨‍💼 Administradores

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `GET` | `/api/v1/admin/kyc/pendientes` | Admin | Listar profesionales con KYC pendiente |
| `POST` | `/api/v1/admin/kyc/approve/{id}` | Admin | Aprobar KYC de un profesional |
| `POST` | `/api/v1/admin/kyc/reject/{id}` | Admin | Rechazar KYC de un profesional |

**📖 Documentación Interactiva:**
- Swagger UI: http://localhost:8004/docs
- ReDoc: http://localhost:8004/redoc

---

## 🧪 Testing E2E - Control de Calidad

### Ejecutar Tests Automatizados

Antes de avanzar al Módulo 2, valida que todo funcione correctamente:

```powershell
.\run_e2e_tests.ps1
```

**O manualmente:**

```powershell
# 1. Instalar dependencias de testing
docker-compose exec api pip install -r requirements-dev.txt

# 2. Ejecutar tests
docker-compose exec api pytest tests/test_e2e_module_1.py -v
```

### ✅ Tests Incluidos

El script ejecuta **3 tests E2E** contra la API real (sin mocks):

#### 1️⃣ **Professional Happy Path** (Camino Feliz)
- ✓ Registro de profesional
- ✓ Login y obtención de JWT token
- ✓ Upload de documentos KYC
- ✓ Admin revisa KYC pendientes
- ✓ Admin aprueba KYC

#### 2️⃣ **Security Role Enforcement** (El Patovica 🚫)
- ✓ Cliente NO puede acceder a endpoints de Admin → 403 Forbidden
- ✓ Cliente NO puede acceder a endpoints de Profesional → 403 Forbidden

#### 3️⃣ **Authentication Guard** (Sin Token 🔒)
- ✓ Endpoints protegidos requieren token → 401 Unauthorized
- ✓ Tokens inválidos son rechazados → 401 Unauthorized

### 🎯 Resultado Esperado

```
╔══════════════════════════════════════════════════════════════════════╗
║                     ✓ ALL TESTS PASSED ✓                            ║
║  Module 1 (Auth/KYC) is ready for Production!                       ║
╚══════════════════════════════════════════════════════════════════════╝

============================== 3 passed in 1.8s ===============================
```

---

## 🗄️ Gestión de Base de Datos

### Migraciones con Alembic

```powershell
# Ver estado actual
docker-compose exec api alembic current

# Aplicar migraciones pendientes
docker-compose exec api alembic upgrade head

# Ver historial
docker-compose exec api alembic history

# Crear nueva migración (auto-detecta cambios en modelos)
docker-compose exec api alembic revision --autogenerate -m "Descripción"

# Rollback
docker-compose exec api alembic downgrade -1
```

### Acceso Directo a PostgreSQL

```powershell
# Conectarse a psql
docker-compose exec db psql -U marketplace_user -d marketplace_db

# Backup
docker-compose exec db pg_dump -U marketplace_user marketplace_db > backup.sql

# Restore
docker-compose exec -T db psql -U marketplace_user marketplace_db < backup.sql
```

---

## 🛠️ Comandos Docker Útiles

```powershell
# Levantar servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f api

# Parar servicios
docker-compose down

# Rebuild completo (tras cambiar Dockerfile o requirements.txt)
docker-compose up -d --build

# Reiniciar solo la API
docker-compose restart api

# Ejecutar comando dentro del contenedor
docker-compose exec api [comando]

# Limpiar todo (¡CUIDADO! Elimina la BD)
docker-compose down -v
```

---

## 🌍 PostGIS - Geolocalización (Preparado para Módulo 2)

PostGIS ya está habilitado y listo para el sistema de búsqueda geoespacial.

**Ejemplo de uso:**

```python
from geoalchemy2 import Geometry
from sqlalchemy import func

# Modelo con ubicación geográfica
class Profesional(Base):
    base_location = Column(Geometry(geometry_type='POINT', srid=4326))
    radio_cobertura_km = Column(Numeric(precision=6, scale=2))

# Query: Buscar profesionales en radio de 5km
professionals_nearby = session.query(Profesional).filter(
    func.ST_DWithin(
        Profesional.base_location,
        func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326),
        5000  # metros
    )
).all()
```

---

## 🔐 Variables de Entorno

Configura estas variables en tu archivo `.env`:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `POSTGRES_USER` | Usuario de PostgreSQL | `marketplace_user` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | `secure_password` |
| `POSTGRES_DB` | Nombre de la base de datos | `marketplace_db` |
| `POSTGRES_HOST` | Host de la BD (Docker) | `db` |
| `SECRET_KEY` | Clave secreta JWT | (generada automáticamente) |
| `DEBUG` | Modo debug | `true` / `false` |

---

## 🎯 Roadmap

- [x] **Módulo 1**: Autenticación, Roles y KYC ✅ **COMPLETADO**
- [ ] **Módulo 2**: Servicios y Búsqueda Geoespacial
- [ ] **Módulo 3**: Sistema de Contratación y Pagos
- [ ] **Módulo 4**: Sistema de Reseñas y Calificaciones
- [ ] **CI/CD**: GitHub Actions con tests automáticos
- [ ] **Deployment**: Producción en AWS/GCP/DigitalOcean

---

## 🐛 Troubleshooting

### ❌ El contenedor de la API no inicia

```powershell
# Ver logs detallados
docker-compose logs api
```

**Causas comunes:**
- Dependencias faltantes → Verifica `requirements.txt`
- Error en migraciones → Ejecuta `alembic upgrade head`
- Puerto 8004 ocupado → Cambia el puerto en `docker-compose.yml`

### ❌ Error de conexión a la base de datos

```powershell
# Verificar estado de la BD
docker-compose ps
docker-compose logs db
```

**Solución:** Espera a que el contenedor `db` esté "healthy" antes de levantar la API.

### ❌ Tests fallan

```powershell
# Asegúrate de que el admin exista
docker-compose exec api python -c "from app.core.database import SessionLocal; from app.models.user import Usuario; print(SessionLocal().query(Usuario).filter_by(rol='ADMIN').first())"
```

**Solución:** Crea el usuario admin (paso 4 del Inicio Rápido).

### ❌ Hot reload no funciona

Verifica que los volúmenes estén correctamente mapeados en `docker-compose.yml`:

```yaml
volumes:
  - ./app:/code/app
  - ./migrations:/code/migrations
```

---

## 📞 Recursos y Soporte

- 🌐 **Documentación API**: http://localhost:8004/docs
- 🏥 **Health Check**: http://localhost:8004/health
- 📚 **FastAPI Docs**: https://fastapi.tiangolo.com/
- 🐘 **PostgreSQL Docs**: https://www.postgresql.org/docs/
- 🗺️ **PostGIS Docs**: https://postgis.net/documentation/

---

**🚀 Desarrollado con ❤️ para conectar profesionales con clientes**
