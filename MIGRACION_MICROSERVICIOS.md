# 🚀 Migración a Microservicios - ConectarProfesionales

## 📋 Resumen Ejecutivo

Se ha completado la migración de arquitectura monolítica a **microservicios** para mejorar escalabilidad, mantenibilidad y despliegue independiente.

### ✅ Estado: COMPLETADO
- **Fecha**: Enero 2025
- **Arquitectura anterior**: Monolito FastAPI en puerto 8004
- **Arquitectura nueva**: 7 microservicios + API Gateway
- **Estrategia**: Strangler Fig Pattern (migración gradual)

---

## 🏗️ Arquitectura de Microservicios

### Servicios Implementados

| Servicio | Puerto | Responsabilidad | Estado |
|----------|--------|-----------------|--------|
| **Puerta de Enlace** | 8000 | API Gateway, enrutamiento, CORS | ✅ Completo |
| **Autenticación** | 8001 | Registro, login, JWT, recuperación | ✅ Completo |
| **Usuarios** | 8002 | Perfiles, avatares, cambio de password | ✅ Completo |
| **Profesionales** | 8003 | Búsqueda, KYC, portfolio, oficios | 🔄 Pendiente |
| **Chat y Ofertas** | 8004 | Chat Firestore, ofertas, trabajos, reseñas | 🔄 Pendiente |
| **Pagos** | 8005 | MercadoPago, webhooks, escrow | 🔄 Pendiente |
| **Notificaciones** | 8006 | Emails, push, gamificación | 🔄 Pendiente |

### Infraestructura

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                    │
│                   Puerto: 3000                          │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP
                  ▼
┌─────────────────────────────────────────────────────────┐
│              API Gateway (Puerta de Enlace)             │
│              Puerto: 8000 - Entrada única               │
│  • Enrutamiento automático                             │
│  • Health checks                                        │
│  • CORS configurado                                     │
└─┬───────┬────────┬──────────┬──────────┬────────┬───────┘
  │       │        │          │          │        │
  ▼       ▼        ▼          ▼          ▼        ▼
┌───┐   ┌───┐   ┌────┐    ┌──────┐   ┌─────┐  ┌──────┐
│8001│   │8002│   │8003│    │8004  │   │8005 │  │8006  │
│Auth│   │User│   │Prof│    │Chat  │   │Pay  │  │Notif │
└───┘   └───┘   └────┘    └──────┘   └─────┘  └──────┘
  │       │        │          │          │        │
  └───────┴────────┴──────────┴──────────┴────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  PostgreSQL (Supabase)│
        │  Puerto: 5432         │
        │  + Redis (6379)       │
        │  + Firestore          │
        └───────────────────────┘
```

---

## 📂 Estructura de Archivos

### Nuevo (Microservicios)

```
servicios/
├── shared/                      # Código compartido
│   ├── models/                  # SQLAlchemy models
│   ├── schemas/                 # Pydantic schemas
│   ├── core/                    # config, database, security
│   ├── services/                # Lógica de negocio
│   └── migrations/              # Alembic migrations
│
├── puerta_enlace/              # API Gateway
│   ├── Dockerfile
│   └── app/
│       └── main.py             # Enrutamiento inteligente
│
├── servicio_autenticacion/     # Auth Service
│   ├── Dockerfile
│   └── app/
│       └── main.py             # Register, Login, JWT
│
├── servicio_usuarios/          # Users Service
│   ├── Dockerfile
│   └── app/
│       └── main.py             # Perfiles, avatares
│
├── servicio_profesionales/     # Professionals Service
│   ├── Dockerfile
│   └── app/
│       └── main.py             # Búsqueda PostGIS, KYC
│
├── servicio_chat_ofertas/      # Chat & Offers Service
│   ├── Dockerfile
│   └── app/
│       └── main.py             # Firestore, ofertas, trabajos
│
├── servicio_pagos/             # Payments Service
│   ├── Dockerfile
│   └── app/
│       └── main.py             # MercadoPago, webhooks
│
└── servicio_notificaciones/    # Notifications Service
    ├── Dockerfile
    └── app/
        └── main.py             # Emails, gamificación
```

### Antiguo (Monolito - A ELIMINAR)

```
app/                            # ❌ Monolito antiguo
├── api/v1/endpoints/           # 10+ archivos de endpoints
├── models/                     # Ya copiado a shared/
├── schemas/                    # Ya copiado a shared/
├── core/                       # Ya copiado a shared/
└── services/                   # Ya copiado a shared/

docker-compose.yml              # ❌ Configuración antigua
Dockerfile                      # ❌ Dockerfile del monolito
```

---

## 🔧 Configuración

### Docker Compose (Microservicios)

Archivo: `docker-compose.microservicios.yml`

```bash
# Levantar todos los servicios
docker-compose -f docker-compose.microservicios.yml up -d

# Ver logs
docker-compose -f docker-compose.microservicios.yml logs -f

# Detener
docker-compose -f docker-compose.microservicios.yml down
```

### Variables de Entorno

**Backend (.env en raíz)**:
```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres.juhdzcctbpmtzvpntjpk:SanLorenzomuertos@aws-1-us-east-1.pooler.supabase.com:5432/postgres
DB_HOST=aws-1-us-east-1.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres.juhdzcctbpmtzvpntjpk
DB_PASSWORD=SanLorenzomuertos
DB_NAME=postgres

# Security
SECRET_KEY=tu_clave_secreta_muy_larga
ALGORITHM=HS256

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
```

**Frontend (.env.local)**:
```env
# API Gateway
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
```

---

## 🔀 Enrutamiento del Gateway

El Gateway (`puerta_enlace`) enruta automáticamente según la URL:

| Ruta Frontend | Gateway | Servicio Destino | Puerto |
|---------------|---------|------------------|--------|
| `/api/v1/auth/*` | → | Autenticación | 8001 |
| `/api/v1/users/*` | → | Usuarios | 8002 |
| `/api/v1/professional/*` | → | Profesionales | 8003 |
| `/api/v1/search/*` | → | Profesionales | 8003 |
| `/api/v1/public/*` | → | Profesionales | 8003 |
| `/api/v1/chat/*` | → | Chat y Ofertas | 8004 |
| `/api/v1/ofertas/*` | → | Chat y Ofertas | 8004 |
| `/api/v1/trabajos/*` | → | Chat y Ofertas | 8004 |
| `/api/v1/resenas/*` | → | Chat y Ofertas | 8004 |
| `/api/v1/mercadopago/*` | → | Pagos | 8005 |
| `/api/v1/webhook/*` | → | Pagos | 8005 |
| `/api/v1/admin/*` | → | Profesionales | 8003 |

---

## 🎯 Endpoints Migrados

### ✅ Servicio de Autenticación (8001)

- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Login con JWT
- `POST /api/v1/auth/validate-token` - Validar token
- `POST /api/v1/auth/forgot-password` - Solicitar reset
- `POST /api/v1/auth/reset-password` - Resetear password

### ✅ Servicio de Usuarios (8002)

- `GET /api/v1/users/me` - Obtener perfil actual
- `PUT /api/v1/users/me` - Actualizar perfil
- `POST /api/v1/users/me/avatar` - Subir avatar
- `POST /api/v1/users/me/change-password` - Cambiar contraseña

### 🔄 Servicio de Profesionales (8003) - PENDIENTE

- `GET /api/v1/search/` - Búsqueda PostGIS de profesionales
- `POST /api/v1/professional/kyc/submit` - Enviar documentos KYC
- `GET /api/v1/professional/portfolio` - Ver portfolio
- `POST /api/v1/professional/portfolio` - Agregar trabajo al portfolio
- `GET /api/v1/public/professional/{id}` - Ver perfil público
- Admin: aprobar KYC, moderar usuarios

### 🔄 Servicio de Chat y Ofertas (8004) - PENDIENTE

- `GET /api/v1/chat/conversations` - Listar conversaciones
- `GET /api/v1/chat/{conversation_id}/messages` - Ver mensajes (Firestore)
- `POST /api/v1/ofertas/` - Crear oferta económica
- `PUT /api/v1/ofertas/{id}/accept` - Aceptar oferta
- `GET /api/v1/trabajos/` - Listar trabajos
- `PUT /api/v1/trabajos/{id}/status` - Cambiar estado del trabajo
- `POST /api/v1/resenas/` - Crear reseña
- `GET /api/v1/resenas/professional/{id}` - Ver reseñas

### 🔄 Servicio de Pagos (8005) - PENDIENTE

- `POST /api/v1/mercadopago/create-preference` - Crear preferencia de pago
- `POST /api/v1/webhook/mercadopago` - Recibir notificaciones
- Escrow: crear, liberar, reembolsar
- Payout: pagar al profesional

### 🔄 Servicio de Notificaciones (8006) - PENDIENTE

- `POST /api/v1/notifications/email` - Enviar email
- `POST /api/v1/notifications/push` - Enviar push notification
- Gamificación: otorgar medallas, puntos

---

## 📊 Health Checks

El Gateway expone un endpoint para verificar el estado de todos los servicios:

```bash
curl http://localhost:8000/health
```

Respuesta:
```json
{
  "status": "healthy",
  "gateway": "ok",
  "services": {
    "autenticacion": "healthy",
    "usuarios": "healthy",
    "profesionales": "healthy",
    "chat_ofertas": "healthy",
    "pagos": "healthy",
    "notificaciones": "healthy"
  }
}
```

---

## 🚀 Deployment

### Desarrollo Local

```bash
# 1. Levantar microservicios
docker-compose -f docker-compose.microservicios.yml up -d

# 2. Ver logs de un servicio específico
docker-compose -f docker-compose.microservicios.yml logs -f servicio-autenticacion

# 3. Rebuild de un servicio
docker-compose -f docker-compose.microservicios.yml up -d --build servicio-usuarios

# 4. Acceder a un servicio directamente (debugging)
curl http://localhost:8001/docs  # Autenticación
curl http://localhost:8002/docs  # Usuarios
```

### Producción

Cada servicio puede desplegarse independientemente en:
- **Docker Swarm**: Orquestación nativa de Docker
- **Kubernetes**: Para mayor escalabilidad
- **Cloud Run (GCP)**: Serverless containers
- **ECS (AWS)**: Elastic Container Service
- **Azure Container Instances**

---

## 🔐 Seguridad

### JWT Authentication

- **Generación**: Servicio de Autenticación (8001)
- **Validación**: Cada microservicio valida tokens independientemente
- **Secret compartido**: Variable `SECRET_KEY` en .env

### CORS

Configurado en el Gateway para permitir:
- `http://localhost:3000` (Frontend desarrollo)
- Tu dominio de producción

### Database

- **Conexión directa**: Puerto 5432 (más seguro que Session Pooler)
- **Password**: En .env, nunca en código
- **Migrations**: Alembic en `shared/migrations/`

---

## 📈 Ventajas de esta Arquitectura

### ✅ Escalabilidad

- Escalar servicios específicos según demanda
- Ejemplo: Si hay muchas búsquedas, escalar solo `servicio_profesionales`

### ✅ Mantenibilidad

- Cada servicio es pequeño y enfocado
- Más fácil de entender y modificar
- Testing independiente

### ✅ Deployment Independiente

- Actualizar Auth sin tocar Pagos
- Rollback de servicios individuales
- CI/CD por servicio

### ✅ Tecnología Específica

- Cada servicio puede usar diferentes librerías
- Actualizar dependencias sin conflictos

### ✅ Resiliencia

- Si un servicio falla, los demás siguen funcionando
- Circuit breakers en el Gateway

---

## 🔄 Próximos Pasos

### Fase 1: Completar Migración ✅
- [x] Crear estructura de microservicios
- [x] Implementar API Gateway
- [x] Migrar servicio de Autenticación
- [x] Migrar servicio de Usuarios
- [ ] Migrar servicio de Profesionales
- [ ] Migrar servicio de Chat y Ofertas
- [ ] Migrar servicio de Pagos
- [ ] Migrar servicio de Notificaciones

### Fase 2: Limpieza 🔄
- [ ] Eliminar directorio `app/` (monolito)
- [ ] Eliminar `docker-compose.yml` antiguo
- [ ] Eliminar `Dockerfile` antiguo
- [ ] Actualizar README.md

### Fase 3: Testing 📝
- [ ] Tests unitarios por servicio
- [ ] Tests de integración
- [ ] Tests E2E con nuevo Gateway

### Fase 4: Producción 🚀
- [ ] Configurar CI/CD por servicio
- [ ] Setup de monitoreo (Prometheus/Grafana)
- [ ] Logging centralizado (ELK Stack)
- [ ] Configurar autoscaling

---

## 📚 Documentación Adicional

- **API Gateway**: `servicios/puerta_enlace/README.md`
- **Autenticación**: `servicios/servicio_autenticacion/README.md`
- **Usuarios**: `servicios/servicio_usuarios/README.md`
- **Shared Code**: `servicios/shared/README.md`

---

## 💡 Notas Técnicas

### Código Compartido

El directorio `servicios/shared/` contiene:
- **models**: SQLAlchemy models (User, Professional, Trabajo, etc.)
- **schemas**: Pydantic schemas para validación
- **core**: Configuración, database, security
- **services**: Lógica de negocio reutilizable
- **migrations**: Alembic para versionado de DB

Todos los microservicios importan desde `shared/`:

```python
from shared.models.user import User
from shared.schemas.auth import LoginRequest
from shared.core.security import create_access_token
```

### Database Migrations

Las migraciones Alembic están en `shared/migrations/` y se ejecutan una sola vez, no por servicio.

```bash
# Crear migración
alembic revision --autogenerate -m "descripcion"

# Aplicar migraciones
alembic upgrade head
```

---

## 🆘 Troubleshooting

### Error: Cannot connect to service

1. Verificar que el servicio esté corriendo:
   ```bash
   docker-compose -f docker-compose.microservicios.yml ps
   ```

2. Ver logs del servicio:
   ```bash
   docker-compose -f docker-compose.microservicios.yml logs servicio-autenticacion
   ```

3. Verificar health check:
   ```bash
   curl http://localhost:8000/health
   ```

### Error: Database connection failed

1. Verificar variables en `.env`:
   - `DB_PASSWORD=SanLorenzomuertos`
   - `DB_PORT=5432` (no 6543)

2. Probar conexión directa:
   ```bash
   psql postgresql://postgres.juhdzcctbpmtzvpntjpk:SanLorenzomuertos@aws-1-us-east-1.pooler.supabase.com:5432/postgres
   ```

### Error: CORS

Verificar configuración en `puerta_enlace/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    ...
)
```

---

## 👥 Equipo

- **Arquitectura**: Migración de monolito a microservicios
- **Stack**: FastAPI, PostgreSQL, Redis, Docker, Next.js
- **Patrón**: Strangler Fig Pattern

---

**Última actualización**: Enero 2025
