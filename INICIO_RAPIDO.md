# 🎯 INICIO RÁPIDO - Microservicios

## ✅ Problemas Resueltos

1. **Base de datos**: Conexión a Supabase arreglada ✅
2. **Arquitectura**: Migración a microservicios completada ✅

## 🚀 Iniciar Sistema Completo

### Opción Recomendada: Docker Compose

```powershell
# Construir todos los servicios
docker-compose -f docker-compose.microservicios.yml build

# Iniciar todos los servicios
docker-compose -f docker-compose.microservicios.yml up -d

# Ver logs
docker-compose -f docker-compose.microservicios.yml logs -f
```

### Si Solo Quieres Probar el Gateway + Auth

```powershell
# Construir servicios básicos
docker-compose -f docker-compose.microservicios.yml build puerta-enlace servicio-autenticacion

# Iniciar solo gateway y auth
docker-compose -f docker-compose.microservicios.yml up puerta-enlace servicio-autenticacion redis
```

## 📊 Verificar que Funciona

### 1. Health Check

```powershell
# Espera 10 segundos después de iniciar, luego:
curl http://localhost:8000/health
```

### 2. Registrar Usuario

```powershell
curl -X POST http://localhost:8000/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "prueba@example.com",
    "password": "password123",
    "nombre": "Usuario",
    "apellido": "Prueba",
    "rol": "CLIENTE"
  }'
```

### 3. Login

```powershell
curl -X POST http://localhost:8000/auth/login `
  -F "username=prueba@example.com" `
  -F "password=password123"
```

Deberías recibir un JWT token.

## 🔗 URLs de Acceso

| Servicio | URL | Documentación |
|----------|-----|---------------|
| **Gateway** | http://localhost:8000 | http://localhost:8000/docs |
| **Auth** | http://localhost:8001 | http://localhost:8001/docs |
| **Usuarios** | http://localhost:8002 | http://localhost:8002/docs |
| **Profesionales** | http://localhost:8003 | http://localhost:8003/docs |
| **Chat** | http://localhost:8004 | http://localhost:8004/docs |
| **Pagos** | http://localhost:8005 | http://localhost:8005/docs |
| **Notificaciones** | http://localhost:8006 | http://localhost:8006/docs |
| **Frontend** | http://localhost:3000 | - |

## 🛑 Detener Todo

```powershell
docker-compose -f docker-compose.microservicios.yml down
```

## 📚 Documentación Completa

- `IMPLEMENTACION_MICROSERVICIOS.md` - Resumen de la implementación
- `MICROSERVICES_ARCHITECTURE.md` - Arquitectura técnica detallada
- `servicios/README.md` - Guía de desarrollo
- `RESUMEN_MIGRACION.md` - Plan de migración completo

## ⚠️ Notas Importantes

1. **Primera vez**: La construcción puede tardar 5-10 minutos
2. **FIREBASE_CREDENTIALS_PATH**: Warning normal si no usas Firebase
3. **Version warning**: Docker Compose v2 - ignorar warning
4. **PostgreSQL**: Usa Supabase, no BD local

## 🔧 Troubleshooting

### Error: "Cannot bind parameter"
- Problema con el script PowerShell
- **Solución**: Usa comandos docker-compose directamente

### Error: "Port already in use"
```powershell
# Ver qué usa el puerto
netstat -ano | findstr :8000

# Detener el servicio que lo usa o cambiar puerto
```

### Error: "Connection refused"
```powershell
# Espera más tiempo (servicios tardando en iniciar)
Start-Sleep -Seconds 20

# O revisa logs
docker-compose -f docker-compose.microservicios.yml logs servicio-autenticacion
```

## 🎉 ¡Listo!

El sistema de microservicios está funcionando. El frontend en http://localhost:3000 ahora usará el Gateway en http://localhost:8000.

---

**Fecha**: Noviembre 2025  
**Estado**: ✅ Funcionando
