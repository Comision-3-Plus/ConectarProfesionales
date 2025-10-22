# 🚀 Guía Rápida de Inicio - ConectarProfesionales

## Stack Completo con Docker

Este proyecto incluye:
- 🚀 **Backend API**: FastAPI + PostgreSQL + PostGIS
- 🌐 **Frontend**: Next.js + React + TypeScript
- 🗄️ **Base de Datos**: PostgreSQL 15 + PostGIS 3.4
- 🔥 **Chat en tiempo real**: Firebase (configuración manual requerida)

---

## 📋 Pre-requisitos

1. **Docker Desktop** instalado y corriendo
   - Descargar: https://www.docker.com/products/docker-desktop

2. **Git** (para clonar el repositorio)

---

## 🎯 Inicio Rápido (3 pasos)

### 1️⃣ Configurar variables de entorno

Si no existe el archivo `.env`, se creará automáticamente desde `.env.example`.

**Edita `.env` y configura tus credenciales:**

```bash
# Database
POSTGRES_USER=conectar
POSTGRES_PASSWORD=conectar123
POSTGRES_DB=conectar_profesionales
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Security (¡CAMBIAR EN PRODUCCIÓN!)
SECRET_KEY=tu-super-secret-key-de-al-menos-32-caracteres
WEBHOOK_API_KEY=tu-webhook-secret-key

# App
APP_NAME=Marketplace de Profesionales
APP_VERSION=1.0.0
DEBUG=True
API_V1_PREFIX=/api/v1

# MercadoPago (opcional para desarrollo)
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-token-de-mercadopago
MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key

# Gamificación
PUNTOS_POR_TRABAJO=100
PUNTOS_REVIEW_5_ESTRELLAS=50
PUNTOS_REVIEW_4_ESTRELLAS=10
```

### 2️⃣ Iniciar todo el stack

```powershell
.\start-stack.ps1
```

Este script automáticamente:
- ✅ Verifica Docker
- ✅ Construye las imágenes
- ✅ Inicia PostgreSQL + Backend + Frontend
- ✅ Aplica las migraciones de base de datos
- ✅ Muestra los servicios disponibles

**Espera 1-2 minutos la primera vez** mientras descarga las imágenes y construye los contenedores.

### 3️⃣ Crear usuario administrador

```powershell
.\create-admin.ps1
```

**Credenciales:**
- Email: `admin@example.com`
- Contraseña: `Admin1234!`

---

## 🌐 Servicios Disponibles

Una vez iniciado, tendrás acceso a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Aplicación Next.js |
| **Backend API** | http://localhost:8004 | API FastAPI |
| **API Docs (Swagger)** | http://localhost:8004/docs | Documentación interactiva |
| **ReDoc** | http://localhost:8004/redoc | Documentación alternativa |
| **PostgreSQL** | localhost:5432 | Base de datos |

---

## 📝 Comandos Útiles

### Ver logs en tiempo real

```powershell
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f api

# Solo frontend
docker-compose logs -f frontend

# Solo base de datos
docker-compose logs -f db
```

### Detener servicios

```powershell
.\stop-stack.ps1
# o manualmente:
docker-compose down
```

### Reiniciar un servicio específico

```powershell
docker-compose restart api
docker-compose restart frontend
docker-compose restart db
```

### Ver estado de los servicios

```powershell
docker-compose ps
```

### Ejecutar tests E2E

```powershell
docker-compose exec api pytest tests/ -v
```

### Acceder al contenedor

```powershell
# Backend
docker-compose exec api bash

# Frontend
docker-compose exec frontend sh

# Base de datos
docker-compose exec db psql -U conectar -d conectar_profesionales
```

### Aplicar migraciones manualmente

```powershell
docker-compose exec api alembic upgrade head
```

### Ver logs de un servicio específico (últimas 100 líneas)

```powershell
docker-compose logs --tail=100 api
```

---

## 🧪 Testing

### Ejecutar todos los tests

```powershell
docker-compose exec api pytest tests/ -v
```

### Ejecutar un módulo específico

```powershell
docker-compose exec api pytest tests/test_e2e_module_1.py -v
```

### Ejecutar con coverage

```powershell
docker-compose exec api pytest tests/ --cov=app --cov-report=html
```

---

## 🔥 Firebase (Chat en tiempo real)

Para habilitar el chat, necesitas configurar Firebase:

### 1. Crear proyecto en Firebase
- Ve a https://console.firebase.google.com/
- Crea un nuevo proyecto
- Habilita Firestore Database

### 2. Obtener credenciales

**Backend:**
- Project Settings → Service Accounts → Generate new private key
- Guarda el JSON como `firebase-credentials.json` en la raíz del proyecto

**Frontend:**
- Project Settings → General → Your apps → Web app
- Copia la configuración y edita `frontend/.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### 3. Reiniciar servicios

```powershell
docker-compose restart api frontend
```

---

## 🐛 Troubleshooting

### Error: "Docker no está corriendo"
- Abre Docker Desktop y espera a que inicie completamente

### Error: "Puerto 3000/8004/5432 ya está en uso"
- Detén el proceso que está usando el puerto:
```powershell
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: "No se pueden aplicar las migraciones"
- Verifica que la base de datos esté corriendo:
```powershell
docker-compose ps db
```
- Intenta aplicarlas manualmente:
```powershell
docker-compose exec api alembic upgrade head
```

### El frontend no se conecta al backend
- Verifica que `NEXT_PUBLIC_API_URL` en `frontend/.env.local` sea `http://localhost:8004`
- Reinicia el frontend:
```powershell
docker-compose restart frontend
```

### Quiero empezar de cero (eliminar todo)
```powershell
# Detener y eliminar contenedores, volúmenes y redes
docker-compose down -v

# Iniciar nuevamente
.\start-stack.ps1
```

---

## 📦 Estructura de Docker

```
ConectarProfesionales/
├── docker-compose.yml          # Orquestación de servicios
├── Dockerfile                  # Imagen del backend (FastAPI)
├── start-stack.ps1            # Script de inicio
├── stop-stack.ps1             # Script para detener
├── create-admin.ps1           # Script para crear admin
└── frontend/
    ├── Dockerfile             # Imagen del frontend (Next.js)
    └── .dockerignore          # Archivos a excluir
```

---

## 🚀 Flujo de Trabajo de Desarrollo

### 1. Iniciar el stack
```powershell
.\start-stack.ps1
```

### 2. Desarrollar
- **Backend**: Edita archivos en `app/` → Hot reload automático
- **Frontend**: Edita archivos en `frontend/` → Hot reload automático

### 3. Ver cambios en tiempo real
- Frontend: http://localhost:3000 se recarga automáticamente
- Backend: http://localhost:8004/docs se recarga automáticamente

### 4. Ejecutar tests
```powershell
docker-compose exec api pytest tests/ -v
```

### 5. Detener al finalizar
```powershell
.\stop-stack.ps1
```

---

## 📚 Documentación Adicional

- **Integración Frontend-Backend**: Ver `frontend/INTEGRATION.md`
- **Guía de Seguridad**: Ver `SECURITY_GUIDE.md`
- **Tests E2E**: Ver `README.md` (sección Testing)
- **API Endpoints**: http://localhost:8004/docs (una vez iniciado)

---

## 🎉 ¡Listo!

Ahora tienes todo el stack corriendo. Puedes:

1. **Acceder al frontend**: http://localhost:3000
2. **Iniciar sesión como admin**: admin@example.com / Admin1234!
3. **Explorar la API**: http://localhost:8004/docs
4. **Desarrollar y ver cambios en tiempo real**

---

## 💡 Tips

- **Hot Reload**: Tanto el backend como el frontend tienen hot reload activado
- **Logs**: Usa `docker-compose logs -f` para debugging
- **Base de datos persistente**: Los datos se guardan en un volumen Docker
- **Reinicio rápido**: Usa `docker-compose restart <servicio>` en lugar de `down` + `up`

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica que Docker esté corriendo
3. Asegúrate de que los puertos no estén ocupados
4. Consulta la sección Troubleshooting arriba

---

**Desarrollado con ❤️ para conectar profesionales con clientes**
