# Arquitectura de Microservicios - ConectarProfesionales

## 📋 Resumen Ejecutivo

Este documento detalla la migración del backend monolítico de ConectarProfesionales a una arquitectura de microservicios escalable, mantenible y resiliente.

## 🎯 Objetivos de la Migración

1. **Escalabilidad**: Escalar servicios individualmente según demanda
2. **Mantenibilidad**: Equipos independientes por servicio
3. **Resiliencia**: Aislamiento de fallos entre servicios
4. **Despliegue**: Deploy independiente de cada microservicio
5. **Tecnología**: Adoptar tecnologías específicas por servicio si es necesario

## 🏗️ Arquitectura Actual (Monolito)

### Estructura Actual
```
app/
├── api/v1/endpoints/
│   ├── auth.py          # Autenticación y registro
│   ├── users.py         # Gestión de usuarios
│   ├── professional.py  # Perfil profesional
│   ├── cliente.py       # Ofertas y trabajos del cliente
│   ├── chat.py          # Sistema de mensajería
│   ├── search.py        # Búsqueda geoespacial
│   ├── webhook.py       # Webhooks de MercadoPago
│   └── admin.py         # Panel de administración
├── services/
│   ├── user_service.py
│   ├── firebase_service.py
│   ├── mercadopago_service.py
│   ├── chat_service.py
│   ├── search_service.py
│   └── gamification_service.py
└── models/
    ├── user.py
    ├── professional.py
    ├── oferta.py
    ├── trabajo.py
    ├── resena.py
    └── chat (Firestore)
```

### Problemas Identificados

1. **Escalabilidad limitada**: Todo escala junto, incluso si solo chat necesita más recursos
2. **Acoplamiento**: Cambios en un módulo requieren redesplegar todo
3. **Base de datos monolítica**: Todos los servicios comparten la misma BD
4. **Punto único de fallo**: Si cae el monolito, cae todo el sistema
5. **Dificultad para equipos**: Conflictos en el mismo código base

## 🚀 Nueva Arquitectura de Microservicios

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│                         Puerto 3000                              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (FastAPI)                       │
│                         Puerto 8000                              │
│  - Rate Limiting                                                 │
│  - Authentication Validation                                     │
│  - Request Routing                                               │
│  - Load Balancing                                                │
└─────┬───────┬────────┬────────┬──────────┬──────────┬───────────┘
      │       │        │        │          │          │
      ▼       ▼        ▼        ▼          ▼          ▼
┌─────────┐ ┌────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐
│  Auth   │ │  User  │ │Professional│ │  Chat  │ │ Payment │ │  Notify  │
│ Service │ │Service │ │  Service   │ │Service │ │ Service │ │ Service  │
│ :8001   │ │ :8002  │ │   :8003    │ │ :8004  │ │  :8005  │ │  :8006   │
└────┬────┘ └───┬────┘ └─────┬──────┘ └───┬────┘ └────┬────┘ └─────┬────┘
     │          │            │            │           │            │
     ▼          ▼            ▼            ▼           ▼            ▼
┌────────────────────────────────────────────────────────────────────┐
│                    CAPA DE PERSISTENCIA                            │
├────────────┬─────────────┬──────────────┬────────────┬────────────┤
│ PostgreSQL │ PostgreSQL  │  PostgreSQL  │ Firestore  │   Redis    │
│  (Auth)    │   (Users)   │ (Professionals)│  (Chat)  │  (Cache)   │
└────────────┴─────────────┴──────────────┴────────────┴────────────┘
```

## 📦 Descripción de Microservicios

### 1. **API Gateway** (Puerto 8000)
**Responsabilidad**: Punto de entrada único, enrutamiento y seguridad

**Funcionalidades**:
- Enrutamiento de requests a microservicios
- Autenticación y validación de tokens JWT
- Rate limiting global
- CORS y headers de seguridad
- Agregación de respuestas (si es necesario)
- Circuit breaker para servicios caídos
- Logging y monitoreo centralizado

**Tecnología**: FastAPI
**Dependencias**: Redis (para rate limiting y cache)

---

### 2. **Auth Service** (Puerto 8001)
**Responsabilidad**: Autenticación, autorización y gestión de tokens

**Endpoints**:
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Login y generación de JWT
- `POST /auth/refresh` - Refresh de tokens
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Solicitar reset
- `POST /auth/reset-password` - Cambiar contraseña

**Base de Datos**: 
- PostgreSQL (tabla: `usuarios`)
- Redis (blacklist de tokens, rate limiting)

**Comunicación**:
- Expone endpoint interno para validar tokens (usado por API Gateway)

---

### 3. **User Service** (Puerto 8002)
**Responsabilidad**: Gestión de perfiles de usuario

**Endpoints**:
- `GET /users/me` - Perfil del usuario actual
- `PUT /users/me` - Actualizar perfil
- `POST /users/me/avatar` - Subir avatar
- `PATCH /users/me/password` - Cambiar contraseña
- `GET /users/{user_id}` - Perfil público (admin)

**Base de Datos**:
- PostgreSQL (tabla: `usuarios`)
- S3/MinIO (avatares)

**Comunicación**:
- Consume Auth Service para validar tokens
- Publica eventos: `UserCreated`, `UserUpdated`, `UserDeleted`

---

### 4. **Professional Service** (Puerto 8003)
**Responsabilidad**: Gestión de profesionales, KYC, búsqueda geoespacial

**Endpoints**:
- `GET /professional/profile` - Perfil profesional
- `PUT /professional/profile` - Actualizar perfil
- `POST /professional/oficios` - Actualizar oficios
- `POST /professional/location` - Actualizar ubicación
- `GET /professional/portfolio` - Portfolio
- `POST /professional/portfolio` - Agregar item
- `GET /search/professionals` - Búsqueda geoespacial (PostGIS)
- `POST /professional/kyc/submit` - Enviar documentación KYC
- `GET /public/professional/{id}` - Perfil público

**Base de Datos**:
- PostgreSQL con PostGIS (profesionales, ubicaciones, portfolio)
- S3/MinIO (imágenes de portfolio)

**Comunicación**:
- Consume User Service para datos de usuario
- Publica eventos: `ProfessionalCreated`, `ProfessionalApproved`, `KYCSubmitted`

---

### 5. **Chat & Offer Service** (Puerto 8004)
**Responsabilidad**: Sistema de mensajería, ofertas económicas, trabajos

**Endpoints**:
- `POST /chat/create` - Crear/obtener chat
- `POST /chat/{chat_id}/message` - Enviar mensaje
- `GET /chat/list` - Lista de chats
- `POST /offers/create` - Crear oferta (profesional)
- `POST /offers/{id}/accept` - Aceptar oferta (cliente)
- `POST /offers/{id}/reject` - Rechazar oferta (cliente)
- `GET /offers` - Listar ofertas
- `GET /trabajo/{id}` - Detalle de trabajo
- `POST /trabajo/{id}/finalizar` - Finalizar trabajo
- `POST /trabajo/{id}/resena` - Crear reseña

**Base de Datos**:
- Firestore (mensajes de chat)
- PostgreSQL (ofertas, trabajos, reseñas)

**Comunicación**:
- Consume Professional Service para validar profesionales
- Consume Payment Service para crear pagos
- Publica eventos: `OfferCreated`, `OfferAccepted`, `WorkCompleted`

---

### 6. **Payment Service** (Puerto 8005)
**Responsabilidad**: Integración con MercadoPago, escrow, pagos

**Endpoints**:
- `POST /payment/create` - Crear preference de pago
- `POST /payment/webhook/mercadopago` - Webhook de MercadoPago
- `GET /payment/status/{payment_id}` - Estado de pago
- `POST /payment/refund` - Reembolsar
- `POST /payment/payout` - Liberar fondos a profesional
- `GET /payment/history/{user_id}` - Historial de pagos

**Base de Datos**:
- PostgreSQL (transacciones, escrow)

**Comunicación**:
- API externa: MercadoPago
- Publica eventos: `PaymentCreated`, `PaymentConfirmed`, `PaymentFailed`, `Refunded`, `PayoutCompleted`

---

### 7. **Notification Service** (Puerto 8006)
**Responsabilidad**: Notificaciones push, emails, webhooks

**Endpoints**:
- `POST /notify/push` - Enviar notificación push
- `POST /notify/email` - Enviar email
- `POST /notify/sms` - Enviar SMS
- `GET /notify/preferences/{user_id}` - Preferencias de notificación

**Base de Datos**:
- PostgreSQL (preferencias, historial)
- Redis (cola de notificaciones)

**Comunicación**:
- API externa: Firebase Cloud Messaging, SendGrid, Twilio
- Consume eventos de todos los servicios para enviar notificaciones

---

## 🔄 Comunicación entre Microservicios

### Patrón de Comunicación

1. **Síncrona (HTTP/REST)**:
   - Para operaciones que requieren respuesta inmediata
   - API Gateway → Microservicios
   - Microservicio → Microservicio (casos específicos)

2. **Asíncrona (Event Bus)**:
   - Para notificaciones y actualizaciones no críticas
   - Usar RabbitMQ o Redis Pub/Sub
   - Desacopla servicios y mejora resiliencia

### Eventos del Sistema

```yaml
# Eventos publicados por cada servicio
Auth Service:
  - UserRegistered
  - UserLoggedIn
  - PasswordChanged

User Service:
  - UserUpdated
  - UserBanned
  - AvatarUploaded

Professional Service:
  - ProfessionalCreated
  - ProfessionalApproved
  - KYCSubmitted
  - KYCApproved
  - LocationUpdated

Chat Service:
  - ChatCreated
  - MessageSent
  - OfferCreated
  - OfferAccepted
  - OfferRejected
  - WorkCompleted
  - ReviewCreated

Payment Service:
  - PaymentCreated
  - PaymentConfirmed
  - PaymentFailed
  - Refunded
  - PayoutCompleted

Notification Service:
  - NotificationSent
  - EmailSent
  - PushSent
```

## 🗄️ Estrategia de Base de Datos

### Database per Service Pattern

Cada microservicio tiene su propia base de datos para garantizar independencia:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Auth Service   │────▶│  auth_db (PG)   │     │                 │
└─────────────────┘     └─────────────────┘     │                 │
                                                 │                 │
┌─────────────────┐     ┌─────────────────┐     │                 │
│  User Service   │────▶│  users_db (PG)  │     │   Supabase      │
└─────────────────┘     └─────────────────┘     │   PostgreSQL    │
                                                 │                 │
┌─────────────────┐     ┌─────────────────┐     │   (Shared       │
│ Professional    │────▶│professional_db  │────▶│   Instance)     │
│   Service       │     │     (PG)        │     │                 │
└─────────────────┘     └─────────────────┘     │                 │
                                                 │                 │
┌─────────────────┐     ┌─────────────────┐     │                 │
│ Payment Service │────▶│  payments_db    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  Chat Service   │────▶│    Firestore    │
└─────────────────┘     └─────────────────┘
```

### Migración de Datos

**Opción 1: Base de Datos Compartida (Transitoria)**
- Todos los microservicios conectan a la misma BD Supabase
- Usar schemas diferentes: `auth_schema`, `users_schema`, etc.
- Facilita migración gradual
- **Desventaja**: No es verdadera independencia

**Opción 2: Bases de Datos Separadas (Recomendada)**
- Cada servicio tiene su propia BD en Supabase
- Sincronización via eventos o APIs
- **Ventaja**: Verdadera independencia y escalabilidad

## 🔐 Seguridad

### Autenticación y Autorización

```
┌──────────┐         ┌─────────────┐         ┌──────────────┐
│ Frontend │────────▶│ API Gateway │────────▶│ Auth Service │
└──────────┘         └─────────────┘         └──────────────┘
                            │
                            │ JWT Token
                            ▼
                     ┌──────────────┐
                     │ Microservicio│
                     │  (Valida JWT)│
                     └──────────────┘
```

**Flujo de Autenticación**:
1. Cliente envía credenciales a API Gateway
2. API Gateway rutea a Auth Service
3. Auth Service valida y genera JWT
4. Cliente usa JWT en todas las requests
5. API Gateway valida JWT antes de rutear
6. Microservicios confían en el Gateway (opcionalmente validan)

### Service-to-Service Authentication

- **API Keys** para comunicación interna
- **mTLS** para producción
- **Service Mesh** (Istio/Linkerd) para seguridad avanzada

## 📊 Monitoreo y Observabilidad

### Stack de Monitoreo

```
┌─────────────────────────────────────────────────────────────┐
│                      Prometheus                              │
│              (Métricas de servicios)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                        Grafana                               │
│              (Dashboards y alertas)                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ELK Stack / Loki                          │
│              (Logs centralizados)                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Jaeger / Zipkin                         │
│              (Distributed Tracing)                           │
└─────────────────────────────────────────────────────────────┘
```

### Métricas Clave

- **Latencia**: Tiempo de respuesta por endpoint
- **Throughput**: Requests por segundo
- **Error Rate**: Porcentaje de errores
- **Disponibilidad**: Uptime de cada servicio
- **Saturación**: CPU, RAM, DB connections

## 🚢 Estrategia de Despliegue

### Despliegue Progresivo (Strangler Fig Pattern)

**Fase 1: Preparación (Semana 1-2)**
- ✅ Configurar infraestructura (Docker Compose)
- ✅ Crear API Gateway
- ✅ Configurar bases de datos por servicio

**Fase 2: Migración de Servicios Core (Semana 3-4)**
- ✅ Migrar Auth Service
- ✅ Migrar User Service
- ✅ Frontend apunta al Gateway

**Fase 3: Servicios de Negocio (Semana 5-6)**
- ✅ Migrar Professional Service
- ✅ Migrar Chat & Offer Service

**Fase 4: Servicios de Soporte (Semana 7-8)**
- ✅ Migrar Payment Service
- ✅ Migrar Notification Service
- ✅ Implementar event bus (RabbitMQ)

**Fase 5: Optimización y Producción (Semana 9-10)**
- ✅ Testing exhaustivo
- ✅ Performance tuning
- ✅ Documentación completa
- ✅ Deploy a producción

### Docker Compose para Desarrollo

```yaml
version: '3.8'

services:
  # API Gateway
  gateway:
    build: ./services/gateway
    ports:
      - "8000:8000"
    environment:
      - AUTH_SERVICE_URL=http://auth-service:8001
      - USER_SERVICE_URL=http://user-service:8002
    depends_on:
      - auth-service
      - user-service
      - redis

  # Auth Service
  auth-service:
    build: ./services/auth-service
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres-auth
      - redis

  # User Service
  user-service:
    build: ./services/user-service
    ports:
      - "8002:8002"
    environment:
      - DATABASE_URL=postgresql://...
    depends_on:
      - postgres-users

  # Professional Service
  professional-service:
    build: ./services/professional-service
    ports:
      - "8003:8003"
    environment:
      - DATABASE_URL=postgresql://...
    depends_on:
      - postgres-professionals

  # Chat & Offer Service
  chat-service:
    build: ./services/chat-service
    ports:
      - "8004:8004"
    environment:
      - DATABASE_URL=postgresql://...
      - FIRESTORE_CREDENTIALS=...
    depends_on:
      - postgres-chat

  # Payment Service
  payment-service:
    build: ./services/payment-service
    ports:
      - "8005:8005"
    environment:
      - DATABASE_URL=postgresql://...
      - MERCADOPAGO_ACCESS_TOKEN=...
    depends_on:
      - postgres-payments

  # Notification Service
  notification-service:
    build: ./services/notification-service
    ports:
      - "8006:8006"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres-notifications
      - redis

  # Shared Infrastructure
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Databases (opcional: usar Supabase en su lugar)
  postgres-auth:
    image: postgres:15
    environment:
      POSTGRES_DB: auth_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: changeme

  postgres-users:
    image: postgres:15
    environment:
      POSTGRES_DB: users_db

  postgres-professionals:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: professionals_db

  postgres-chat:
    image: postgres:15
    environment:
      POSTGRES_DB: chat_db

  postgres-payments:
    image: postgres:15
    environment:
      POSTGRES_DB: payments_db

  postgres-notifications:
    image: postgres:15
    environment:
      POSTGRES_DB: notifications_db
```

## 🎓 Ventajas vs Desventajas

### ✅ Ventajas

1. **Escalabilidad Independiente**
   - Escalar solo el servicio que necesita recursos
   - Chat puede manejar 1000 RPS mientras otros servicios están tranquilos

2. **Despliegue Continuo**
   - Deploy de un servicio sin afectar a otros
   - Rollback granular

3. **Resiliencia**
   - Si cae Payment Service, el resto sigue funcionando
   - Circuit breakers previenen cascadas de fallos

4. **Tecnología Heterogénea**
   - Payment Service puede usar Python
   - Chat Service puede usar Node.js
   - Notification Service puede usar Go

5. **Equipos Autónomos**
   - Equipos especializados por dominio
   - Menos conflictos en código

### ❌ Desventajas

1. **Complejidad Operacional**
   - Más servicios para monitorear
   - Networking entre servicios
   - Distributed tracing necesario

2. **Latencia de Red**
   - Llamadas HTTP entre servicios agregan latencia
   - Necesidad de cache (Redis)

3. **Consistencia de Datos**
   - Transacciones distribuidas son complejas
   - Eventual consistency en algunos casos

4. **Testing Complejo**
   - Tests de integración más difíciles
   - Necesidad de contracts (Pact)

5. **Debugging Distribuido**
   - Logs distribuidos
   - Necesidad de correlation IDs

## 📚 Próximos Pasos

1. ✅ Revisar y aprobar este documento
2. ⏳ Crear estructura de directorios para microservicios
3. ⏳ Implementar API Gateway básico
4. ⏳ Migrar Auth Service
5. ⏳ Actualizar Frontend para usar Gateway
6. ⏳ Migrar servicios restantes progresivamente

## 📖 Referencias

- [Microservices Pattern](https://microservices.io/patterns/microservices.html)
- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)
- [Database per Service](https://microservices.io/patterns/data/database-per-service.html)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
- [Event-Driven Architecture](https://microservices.io/patterns/data/event-driven-architecture.html)

---

**Autor**: GitHub Copilot  
**Fecha**: Noviembre 2025  
**Versión**: 1.0
