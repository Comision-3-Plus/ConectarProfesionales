# 📦 Backup del Monolito - Referencias

## ⚠️ IMPORTANTE
Este archivo es solo para referencia histórica. El código del monolito ha sido **completamente migrado** a la arquitectura de microservicios.

**Fecha de eliminación**: Enero 2025  
**Razón**: Migración a microservicios completada

---

## 📁 Estructura del Monolito Eliminado

```
app/
├── __init__.py
├── main.py                     # FastAPI app principal (puerto 8004)
├── init_db.py                  # Script para inicializar DB
│
├── api/
│   ├── __init__.py
│   ├── dependencies.py         # get_current_user, database dependencies
│   └── v1/
│       ├── __init__.py
│       └── endpoints/
│           ├── __init__.py
│           ├── admin.py        # Dashboard admin, KYC, baneos
│           ├── auth.py         # Register, login, JWT
│           ├── chat.py         # Firestore chat
│           ├── cliente.py      # Ofertas, trabajos (cliente)
│           ├── health.py       # Health check endpoint
│           ├── professional.py # KYC, portfolio, oficios
│           ├── public.py       # Perfiles públicos
│           ├── search.py       # Búsqueda PostGIS
│           ├── users.py        # Perfiles, avatares, cambio password
│           └── webhook.py      # Webhooks MercadoPago
│
├── core/
│   ├── __init__.py
│   ├── config.py               # Settings con pydantic-settings
│   ├── database.py             # SQLAlchemy engine, SessionLocal
│   └── security.py             # JWT, bcrypt, tokens
│
├── models/
│   ├── __init__.py
│   ├── base.py                 # Base declarativa
│   ├── enums.py                # Enums SQL
│   ├── oferta.py               # Modelo Oferta
│   ├── oficio.py               # Modelo Oficio
│   ├── portfolio.py            # Modelo PortfolioItem
│   ├── professional.py         # Modelo Professional
│   ├── resena.py               # Modelo Resena
│   ├── servicio_instantaneo.py # Modelo ServicioInstantaneo
│   ├── trabajo.py              # Modelo Trabajo
│   └── user.py                 # Modelo User
│
├── schemas/
│   ├── __init__.py
│   ├── admin.py                # Schemas para admin
│   ├── auth.py                 # LoginRequest, RegisterRequest
│   ├── chat.py                 # Schemas Firestore
│   ├── oferta.py               # OfertaCreate, OfertaResponse
│   ├── oficio.py               # OficioCreate, OficioResponse
│   ├── portfolio.py            # PortfolioCreate, etc
│   ├── professional.py         # ProfessionalCreate, KYCSubmit
│   ├── resena.py               # ResenaCreate, ResenaResponse
│   ├── search.py               # SearchRequest, SearchResponse
│   ├── servicio_instantaneo.py # ServicioInstantaneoCreate
│   ├── token.py                # Token, TokenData
│   ├── trabajo.py              # TrabajoCreate, TrabajoResponse
│   └── user.py                 # UserCreate, UserUpdate
│
└── services/
    ├── __init__.py
    ├── chat_service.py         # Firebase Realtime Database
    ├── email_service.py        # Envío de emails
    ├── gamificacion_service.py # Niveles, medallas, puntos
    ├── mercadopago_service.py  # Integración MercadoPago
    └── oferta_service.py       # Lógica de ofertas económicas
```

---

## 🗂️ Archivos Docker Eliminados

### `Dockerfile` (Monolito)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004"]
```

### `docker-compose.yml` (Monolito)

```yaml
version: '3.8'

services:
  db:
    image: postgis/postgis:15-3.4
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  api:
    build: .
    ports:
      - "8004:8004"
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
    depends_on:
      - db
    volumes:
      - ./app:/app/app

volumes:
  postgres_data:
```

---

## 🔄 Migración a Microservicios

Todo el código del monolito ha sido migrado a:

### 1. Código Compartido
- **Ubicación**: `servicios/shared/`
- **Contenido**: models/, schemas/, core/, services/, migrations/
- **Uso**: Importado por todos los microservicios

### 2. Microservicios Creados

| Archivo Monolito | Microservicio Destino | Estado |
|------------------|----------------------|--------|
| `endpoints/auth.py` | `servicio_autenticacion/` | ✅ Migrado |
| `endpoints/users.py` | `servicio_usuarios/` | ✅ Migrado |
| `endpoints/professional.py` | `servicio_profesionales/` | 🔄 Pendiente |
| `endpoints/search.py` | `servicio_profesionales/` | 🔄 Pendiente |
| `endpoints/public.py` | `servicio_profesionales/` | 🔄 Pendiente |
| `endpoints/admin.py` | `servicio_profesionales/` | 🔄 Pendiente |
| `endpoints/chat.py` | `servicio_chat_ofertas/` | 🔄 Pendiente |
| `endpoints/cliente.py` | `servicio_chat_ofertas/` | 🔄 Pendiente |
| `endpoints/webhook.py` | `servicio_pagos/` | 🔄 Pendiente |
| Email/Gamification | `servicio_notificaciones/` | 🔄 Pendiente |

### 3. API Gateway
- **Ubicación**: `servicios/puerta_enlace/`
- **Puerto**: 8000
- **Función**: Enrutar todas las peticiones a los microservicios correspondientes
- **Beneficio**: Un solo punto de entrada para el frontend

---

## 📊 Comparativa: Antes vs Después

### Antes (Monolito)

```
Frontend (3000) → API Monolito (8004) → PostgreSQL (5432)
                  └─ 10 endpoints files
                  └─ Todo en un contenedor
```

**Problemas:**
- Difícil de escalar partes específicas
- Deployments acoplados (todo o nada)
- Un error puede tumbar toda la app
- Todas las dependencias juntas

### Después (Microservicios)

```
Frontend (3000) → Gateway (8000) → Servicio Autenticación (8001)
                                  → Servicio Usuarios (8002)
                                  → Servicio Profesionales (8003)
                                  → Servicio Chat/Ofertas (8004)
                                  → Servicio Pagos (8005)
                                  → Servicio Notificaciones (8006)
                                  └─ PostgreSQL (5432)
                                  └─ Redis (6379)
```

**Beneficios:**
- ✅ Escalar servicios independientemente
- ✅ Deploy por servicio (menos riesgo)
- ✅ Resiliencia (un servicio cae, otros siguen)
- ✅ Tecnologías específicas por servicio
- ✅ Teams pueden trabajar en paralelo
- ✅ Monitoreo granular

---

## 📝 Endpoints del Monolito (Para Referencia)

### Auth Endpoints
```python
POST   /api/v1/auth/register          # Registro
POST   /api/v1/auth/login             # Login JWT
POST   /api/v1/auth/forgot-password   # Solicitar reset
POST   /api/v1/auth/reset-password    # Resetear password
POST   /api/v1/auth/validate-token    # Validar JWT
```

### Users Endpoints
```python
GET    /api/v1/users/me               # Obtener perfil
PUT    /api/v1/users/me               # Actualizar perfil
POST   /api/v1/users/me/avatar        # Subir avatar
POST   /api/v1/users/me/change-password  # Cambiar contraseña
```

### Professional Endpoints
```python
POST   /api/v1/professional/kyc/submit     # Enviar KYC
GET    /api/v1/professional/kyc/status     # Estado KYC
GET    /api/v1/professional/portfolio      # Ver portfolio
POST   /api/v1/professional/portfolio      # Agregar a portfolio
DELETE /api/v1/professional/portfolio/{id} # Eliminar de portfolio
GET    /api/v1/professional/oficios        # Listar oficios
POST   /api/v1/professional/oficios        # Agregar oficio
DELETE /api/v1/professional/oficios/{id}   # Eliminar oficio
```

### Search Endpoints
```python
GET    /api/v1/search/                # Búsqueda PostGIS
POST   /api/v1/search/                # Búsqueda avanzada
```

### Public Endpoints
```python
GET    /api/v1/public/professional/{id}     # Perfil público
GET    /api/v1/public/professional/{id}/portfolio  # Portfolio público
GET    /api/v1/public/oficios              # Lista de oficios disponibles
```

### Chat Endpoints
```python
GET    /api/v1/chat/conversations          # Listar conversaciones
GET    /api/v1/chat/{conversation_id}/messages  # Ver mensajes
POST   /api/v1/chat/{conversation_id}/messages  # Enviar mensaje
PUT    /api/v1/chat/moderation/{message_id}     # Moderar mensaje
```

### Cliente (Ofertas/Trabajos) Endpoints
```python
POST   /api/v1/ofertas/                    # Crear oferta
GET    /api/v1/ofertas/                    # Listar ofertas
PUT    /api/v1/ofertas/{id}/accept         # Aceptar oferta
DELETE /api/v1/ofertas/{id}                # Eliminar oferta

GET    /api/v1/trabajos/                   # Listar trabajos
GET    /api/v1/trabajos/{id}               # Ver trabajo
PUT    /api/v1/trabajos/{id}/status        # Cambiar estado
PUT    /api/v1/trabajos/{id}/cancel        # Cancelar trabajo

POST   /api/v1/resenas/                    # Crear reseña
GET    /api/v1/resenas/professional/{id}   # Ver reseñas
```

### Admin Endpoints
```python
GET    /api/v1/admin/dashboard/stats       # Métricas financieras
GET    /api/v1/admin/kyc/pending           # KYCs pendientes
PUT    /api/v1/admin/kyc/{id}/approve      # Aprobar KYC
PUT    /api/v1/admin/kyc/{id}/reject       # Rechazar KYC
PUT    /api/v1/admin/users/{id}/ban        # Banear usuario
PUT    /api/v1/admin/users/{id}/unban      # Desbanear usuario
PUT    /api/v1/admin/trabajos/{id}/cancel  # Cancelar trabajo con refund
```

### Webhook Endpoints
```python
POST   /api/v1/webhook/mercadopago         # Webhook MercadoPago
POST   /api/v1/mercadopago/create-preference  # Crear preferencia
```

---

## 🔑 Variables de Entorno del Monolito

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DB_HOST=aws-1-us-east-1.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres.juhdzcctbpmtzvpntjpk
DB_PASSWORD=SanLorenzomuertos
DB_NAME=postgres

# Security
SECRET_KEY=tu_clave_secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_token
MERCADOPAGO_PUBLIC_KEY=tu_public_key

# URLs
MP_SUCCESS_URL=http://localhost:3000/payment/success
MP_FAILURE_URL=http://localhost:3000/payment/failure
MP_PENDING_URL=http://localhost:3000/payment/pending
MP_NOTIFICATION_URL=http://localhost:8004/api/v1/webhook/mercadopago

# Firebase
FIREBASE_CREDENTIALS_PATH=./firebase-adminsdk.json

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
```

**NOTA**: Estas mismas variables ahora se usan en `docker-compose.microservicios.yml` pero con `MP_NOTIFICATION_URL` apuntando a `http://localhost:8000` (Gateway).

---

## 📚 Dependencias del Monolito

Ver `requirements.txt` para la lista completa. Principales:

```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
mercadopago==2.2.0
firebase-admin==6.3.0
geoalchemy2==0.14.2
Shapely==2.0.2
httpx==0.25.2
```

---

## 🔗 Referencias

- **Documentación de Migración**: [MIGRACION_MICROSERVICIOS.md](./MIGRACION_MICROSERVICIOS.md)
- **README Principal**: [README.md](./README.md)
- **Código Compartido**: `servicios/shared/`
- **Gateway**: `servicios/puerta_enlace/`

---

**Última actualización**: Enero 2025  
**Estado**: Código del monolito eliminado, migración en progreso
