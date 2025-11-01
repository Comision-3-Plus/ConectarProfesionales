# 🚀 Arquitectura de Microservicios - ConectarProfesionales

## 📋 Descripción

Este directorio contiene la implementación de la arquitectura de microservicios para ConectarProfesionales.

## 🏗️ Estructura de Servicios

```
servicios/
├── puerta_enlace/          # API Gateway (Puerto 8000)
│   ├── app/
│   │   └── main.py         # Enrutamiento a microservicios
│   ├── Dockerfile
│   └── requirements.txt
│
├── servicio_autenticacion/  # Servicio de Autenticación (Puerto 8001)
│   ├── app/
│   │   ├── main.py          # Endpoints de auth
│   │   ├── database.py      # Conexión a BD
│   │   ├── models.py        # Modelos SQLAlchemy
│   │   ├── schemas.py       # Esquemas Pydantic
│   │   └── services.py      # Lógica de negocio
│   ├── Dockerfile
│   └── requirements.txt
│
├── servicio_usuarios/       # Servicio de Usuarios (Puerto 8002)
├── servicio_profesionales/  # Servicio de Profesionales (Puerto 8003)
├── servicio_chat_ofertas/   # Servicio de Chat y Ofertas (Puerto 8004)
├── servicio_pagos/          # Servicio de Pagos (Puerto 8005)
└── servicio_notificaciones/ # Servicio de Notificaciones (Puerto 8006)
```

## 🎯 Servicios Implementados

| Servicio | Puerto | Descripción | Estado |
|----------|--------|-------------|--------|
| **Puerta de Enlace** | 8000 | API Gateway - Punto único de entrada | ✅ Completo |
| **Autenticación** | 8001 | Login, registro, JWT | ✅ Completo |
| **Usuarios** | 8002 | Gestión de perfiles | 🟡 Básico |
| **Profesionales** | 8003 | Profesionales, KYC, búsqueda PostGIS | 🟡 Básico |
| **Chat y Ofertas** | 8004 | Chat, ofertas, trabajos, reseñas | 🟡 Básico |
| **Pagos** | 8005 | MercadoPago, escrow | 🟡 Básico |
| **Notificaciones** | 8006 | Push, emails, eventos | 🟡 Básico |

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Asegúrate de que el archivo `.env` en la raíz tenga:

```env
# Base de Datos
POSTGRES_USER=postgres.juhdzcctbpmtzvpntjpk
POSTGRES_PASSWORD=SanLorenzomuertos
POSTGRES_DB=postgres
POSTGRES_HOST=aws-1-us-east-1.pooler.supabase.com
POSTGRES_PORT=5432

# Seguridad
SECRET_KEY=super-secret-key-change-in-production-min-32-chars

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=TEST-your-token
MERCADOPAGO_PUBLIC_KEY=TEST-your-key
```

### 2. Iniciar Microservicios

```powershell
# Iniciar todos los servicios
docker-compose -f docker-compose.microservicios.yml up --build

# O en segundo plano
docker-compose -f docker-compose.microservicios.yml up -d --build
```

### 3. Verificar Estado de Servicios

```powershell
# Ver logs
docker-compose -f docker-compose.microservicios.yml logs -f

# Ver estado de salud
curl http://localhost:8000/health
```

### 4. Acceder a la Aplicación

- **API Gateway**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **Docs Gateway**: http://localhost:8000/docs
- **Servicio Auth**: http://localhost:8001/docs
- **Redis**: localhost:6379

## 📡 Flujo de Requests

```
Cliente/Frontend (3000)
    ↓
API Gateway (8000)
    ↓
┌─────────┬───────────┬────────────┬──────────┬─────────┬──────────┐
│  Auth   │  Usuarios │Profesionales│   Chat   │  Pagos  │ Notif.  │
│  8001   │   8002    │    8003     │   8004   │  8005   │  8006   │
└─────────┴───────────┴────────────┴──────────┴─────────┴──────────┘
    ↓           ↓            ↓            ↓         ↓          ↓
PostgreSQL (Supabase) + Firestore (Chat) + Redis (Cache)
```

## 🔍 Health Checks

Cada servicio expone un endpoint `/health`:

```bash
# Gateway y todos los servicios
curl http://localhost:8000/health

# Servicio específico
curl http://localhost:8001/health  # Auth
curl http://localhost:8002/health  # Usuarios
curl http://localhost:8003/health  # Profesionales
curl http://localhost:8004/health  # Chat
curl http://localhost:8005/health  # Pagos
curl http://localhost:8006/health  # Notificaciones
```

## 🛠️ Desarrollo

### Agregar Nuevo Endpoint

1. **En el microservicio correspondiente** (ej: `servicio_usuarios/app/main.py`):

```python
@app.get("/users/me/settings")
async def get_user_settings():
    return {"theme": "dark", "notifications": True}
```

2. **Actualizar mapeo en Gateway** (`puerta_enlace/app/main.py`):

```python
RUTAS_SERVICIO = {
    "/users": "usuarios",
    # ... otras rutas
}
```

3. El Gateway automáticamente enrutará las requests.

### Hot Reload

Todos los servicios están configurados con `--reload`, los cambios se aplican automáticamente.

## 🔐 Autenticación

### Flujo de Login

```python
# 1. Cliente envía credenciales al Gateway
POST http://localhost:8000/auth/login
{
    "username": "user@example.com",
    "password": "password123"
}

# 2. Gateway rutea a servicio_autenticacion
# 3. Servicio valida y retorna JWT
{
    "access_token": "eyJ...",
    "token_type": "bearer"
}

# 4. Cliente usa token en requests protegidas
GET http://localhost:8000/users/me
Headers: Authorization: Bearer eyJ...
```

## 📦 Comandos Útiles

```powershell
# Detener todos los servicios
docker-compose -f docker-compose.microservicios.yml down

# Reconstruir un servicio específico
docker-compose -f docker-compose.microservicios.yml up -d --build puerta-enlace

# Ver logs de un servicio específico
docker-compose -f docker-compose.microservicios.yml logs -f servicio-autenticacion

# Limpiar todo (⚠️ elimina datos)
docker-compose -f docker-compose.microservicios.yml down -v

# Escalar un servicio (ejemplo: 3 instancias de profesionales)
docker-compose -f docker-compose.microservicios.yml up -d --scale servicio-profesionales=3
```

## 🧪 Testing

```powershell
# Probar registro
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "nombre": "Test",
    "apellido": "User",
    "rol": "CLIENTE"
  }'

# Probar login
curl -X POST http://localhost:8000/auth/login \
  -F "username=test@example.com" \
  -F "password=password123"
```

## 📈 Próximos Pasos

### Fase 1: Completar Servicios Básicos ✅
- ✅ API Gateway implementado
- ✅ Servicio de Autenticación completo
- 🔄 Completar servicio de Usuarios
- 🔄 Completar servicio de Profesionales

### Fase 2: Migrar Funcionalidades del Monolito
- Migrar búsqueda geoespacial (PostGIS)
- Migrar sistema de KYC
- Migrar chat con Firestore
- Migrar ofertas y trabajos
- Migrar integración de MercadoPago

### Fase 3: Event Bus
- Implementar RabbitMQ
- Eventos entre servicios
- Notificaciones asíncronas

### Fase 4: Observabilidad
- Prometheus para métricas
- Grafana para dashboards
- Jaeger para tracing distribuido
- ELK para logs centralizados

## 🐛 Troubleshooting

### Gateway no puede conectar con servicios

```powershell
# Verificar que todos los servicios estén corriendo
docker ps

# Verificar red de Docker
docker network ls
docker network inspect conectarprofesionales_microservicios_network
```

### Error de conexión a BD

```powershell
# Verificar variables de entorno
docker-compose -f docker-compose.microservicios.yml config

# Ver logs del servicio
docker logs servicio_autenticacion
```

### Puerto ya en uso

```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :8000

# Detener el proceso o cambiar puerto en docker-compose
```

## 📚 Documentación Adicional

- [Arquitectura Completa](../MICROSERVICES_ARCHITECTURE.md)
- [Guía de Migración](../RESUMEN_MIGRACION.md)
- [Documentación del Monolito](../README.md)

## 👥 Contribuir

Para agregar nuevas funcionalidades:

1. Identificar el servicio correcto
2. Implementar en el microservicio
3. Actualizar mapeo en Gateway (si es necesario)
4. Agregar tests
5. Documentar cambios

---

**Estado**: 🚧 En Desarrollo  
**Versión**: 1.0.0  
**Última Actualización**: Noviembre 2025
