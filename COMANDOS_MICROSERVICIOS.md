# 🔧 Comandos Útiles - Microservicios

Guía rápida de comandos para trabajar con la arquitectura de microservicios de ConectarProfesionales.

---

## 🚀 Inicio y Detención

### Levantar todos los servicios

```powershell
docker-compose up -d
```

### Levantar con rebuild completo

```powershell
docker-compose up -d --build
```

### Levantar solo servicios específicos

```powershell
# Solo Gateway y Auth
docker-compose up -d puerta-enlace servicio-autenticacion

# Solo un servicio
docker-compose up -d servicio-usuarios
```

### Detener todos los servicios

```powershell
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ BORRA LA DB)

```powershell
docker-compose down -v
```

---

## 📊 Monitoreo y Logs

### Ver logs de todos los servicios

```powershell
docker-compose logs -f
```

### Ver logs de un servicio específico

```powershell
# Autenticación
docker-compose logs -f servicio-autenticacion

# Usuarios
docker-compose logs -f servicio-usuarios

# Gateway
docker-compose logs -f puerta-enlace

# PostgreSQL
docker-compose logs -f postgres

# Redis
docker-compose logs -f redis
```

### Ver últimas 100 líneas de logs

```powershell
docker-compose logs --tail=100 servicio-profesionales
```

### Ver estado de todos los servicios

```powershell
docker-compose ps
```

### Health check completo

```powershell
curl http://localhost:8000/health
```

O en PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health"
```

---

## 🔨 Rebuild y Restart

### Rebuild un servicio específico

```powershell
# Rebuild el servicio de autenticación
docker-compose up -d --build servicio-autenticacion

# Rebuild el gateway
docker-compose up -d --build puerta-enlace
```

### Restart un servicio sin rebuild

```powershell
docker-compose restart servicio-usuarios
```

### Restart todos los servicios

```powershell
docker-compose restart
```

---

## 🐛 Debugging

### Acceder al shell de un contenedor

```powershell
# Python shell en servicio de autenticación
docker-compose exec servicio-autenticacion /bin/bash

# Python shell en servicio de usuarios
docker-compose exec servicio-usuarios /bin/bash

# PostgreSQL shell
docker-compose exec postgres psql -U postgres.juhdzcctbpmtzvpntjpk -d postgres
```

### Ver variables de entorno de un servicio

```powershell
docker-compose exec servicio-autenticacion env
```

### Inspeccionar red de Docker

```powershell
docker network ls
docker network inspect conectarprofesionales_default
```

---

## 🗄️ Base de Datos

### Ejecutar migraciones Alembic

```powershell
# Desde el host (requiere Python local)
cd servicios/shared
alembic upgrade head

# Desde dentro del contenedor de un servicio
docker-compose exec servicio-autenticacion alembic upgrade head
```

### Crear una nueva migración

```powershell
cd servicios/shared
alembic revision --autogenerate -m "descripcion del cambio"
```

### Ver historial de migraciones

```powershell
cd servicios/shared
alembic history
```

### Downgrade de migración

```powershell
# Volver una migración atrás
alembic downgrade -1

# Volver a una versión específica
alembic downgrade <revision_id>
```

### Conectar directamente a PostgreSQL

```powershell
docker-compose exec postgres psql -U postgres.juhdzcctbpmtzvpntjpk -d postgres
```

Queries útiles en PostgreSQL:

```sql
-- Ver todas las tablas
\dt

-- Ver usuarios
SELECT id, email, role, is_active FROM users;

-- Ver profesionales
SELECT u.email, p.nombre_completo, p.kyc_status 
FROM users u 
JOIN professionals p ON u.id = p.user_id;

-- Ver trabajos
SELECT id, cliente_id, profesional_id, estado, monto_total 
FROM trabajos 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🔴 Redis

### Conectar a Redis CLI

```powershell
docker-compose exec redis redis-cli
```

Comandos útiles en Redis:

```redis
# Ver todas las keys
KEYS *

# Ver valor de una key
GET key_name

# Ver TTL de una key
TTL key_name

# Eliminar una key
DEL key_name

# Limpiar toda la base de datos (⚠️ CUIDADO)
FLUSHDB
```

---

## 📝 Testing

### Ejecutar tests E2E

```powershell
# Levantar servicios primero
docker-compose up -d

# Ejecutar tests
pytest tests/test_e2e_module_1.py -v

# Ejecutar todos los tests
pytest tests/ -v

# Con coverage
pytest tests/ --cov=servicios --cov-report=html
```

---

## 🔍 Inspección de Servicios

### Ver puertos expuestos

```powershell
docker-compose ps
```

Puertos de cada servicio:

| Servicio | Puerto | URL |
|----------|--------|-----|
| Gateway | 8000 | http://localhost:8000 |
| Autenticación | 8001 | http://localhost:8001 |
| Usuarios | 8002 | http://localhost:8002 |
| Profesionales | 8003 | http://localhost:8003 |
| Chat y Ofertas | 8004 | http://localhost:8004 |
| Pagos | 8005 | http://localhost:8005 |
| Notificaciones | 8006 | http://localhost:8006 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

### Ver documentación de cada servicio

```powershell
# Gateway
start http://localhost:8000/docs

# Autenticación
start http://localhost:8001/docs

# Usuarios
start http://localhost:8002/docs
```

### Ver uso de recursos

```powershell
docker stats
```

---

## 🧹 Limpieza

### Eliminar contenedores detenidos

```powershell
docker-compose down
```

### Limpiar imágenes no usadas

```powershell
docker image prune -a
```

### Limpiar todo (⚠️ CUIDADO - Elimina todo Docker)

```powershell
docker system prune -a --volumes
```

### Eliminar solo volúmenes huérfanos

```powershell
docker volume prune
```

---

## 🔐 Seguridad

### Ver logs de autenticación

```powershell
docker-compose logs -f servicio-autenticacion | Select-String "login\|register\|token"
```

### Ver intentos de autenticación fallidos

```powershell
docker-compose logs servicio-autenticacion | Select-String "401\|403\|invalid"
```

---

## 📦 Deployment

### Construir imágenes para producción

```powershell
# Build todas las imágenes
docker-compose build

# Build con tag específico
docker-compose build --build-arg VERSION=1.0.0

# Build una imagen específica
docker-compose build servicio-autenticacion
```

### Exportar imágenes

```powershell
# Exportar una imagen
docker save -o servicio-auth.tar conectarprofesionales-servicio-autenticacion

# Importar una imagen
docker load -i servicio-auth.tar
```

### Push a Registry (Docker Hub, ECR, etc)

```powershell
# Tag de la imagen
docker tag conectarprofesionales-servicio-autenticacion:latest tu-registry/servicio-auth:1.0.0

# Push
docker push tu-registry/servicio-auth:1.0.0
```

---

## 🆘 Troubleshooting

### Servicio no responde

```powershell
# 1. Ver logs del servicio
docker-compose logs servicio-autenticacion

# 2. Ver si el contenedor está corriendo
docker-compose ps

# 3. Restart del servicio
docker-compose restart servicio-autenticacion

# 4. Rebuild completo
docker-compose up -d --build servicio-autenticacion
```

### Error de conexión a base de datos

```powershell
# 1. Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# 2. Ver logs de PostgreSQL
docker-compose logs postgres

# 3. Verificar conectividad
docker-compose exec servicio-autenticacion ping postgres

# 4. Verificar variables de entorno
docker-compose exec servicio-autenticacion env | Select-String "DB_"
```

### Error de permisos

```powershell
# Dar permisos al directorio
icacls "servicios" /grant Users:F /T
```

### Ports already in use

```powershell
# Ver qué está usando el puerto 8000
netstat -ano | Select-String ":8000"

# Matar proceso (cambiar PID)
Stop-Process -Id <PID> -Force
```

---

## 📚 Comandos de Desarrollo Frecuentes

### Workflow típico de desarrollo

```powershell
# 1. Levantar servicios
docker-compose up -d

# 2. Ver logs en tiempo real
docker-compose logs -f puerta-enlace servicio-autenticacion

# 3. Hacer cambios en el código
# (editar archivos en servicios/servicio_autenticacion/app/)

# 4. Rebuild solo el servicio modificado
docker-compose up -d --build servicio-autenticacion

# 5. Ver logs para verificar
docker-compose logs -f servicio-autenticacion
```

### Agregar un nuevo endpoint

```powershell
# 1. Editar servicios/servicio_usuarios/app/main.py

# 2. Rebuild el servicio
docker-compose up -d --build servicio-usuarios

# 3. Verificar en Swagger
start http://localhost:8002/docs

# 4. Probar a través del Gateway
curl http://localhost:8000/api/v1/users/nuevo-endpoint
```

### Actualizar dependencias

```powershell
# 1. Editar servicios/servicio_autenticacion/requirements.txt

# 2. Rebuild con --no-cache para forzar reinstalación
docker-compose build --no-cache servicio-autenticacion

# 3. Levantar con el nuevo build
docker-compose up -d servicio-autenticacion
```

---

## 🌟 Tips Avanzados

### Ver tráfico entre servicios

```powershell
# Usar tcpdump en el contenedor
docker-compose exec puerta-enlace tcpdump -i any -n port 8001
```

### Benchmark de endpoints

```powershell
# Instalar Apache Bench
# En Linux/Mac: ab -n 1000 -c 10 http://localhost:8000/api/v1/auth/validate-token

# En PowerShell con Measure-Command
Measure-Command {
    1..100 | ForEach-Object {
        Invoke-RestMethod -Uri "http://localhost:8000/api/v1/users/me" -Headers @{"Authorization"="Bearer TOKEN"}
    }
}
```

### Hot reload de código (desarrollo)

Para habilitar hot reload, modificar el docker-compose.yml:

```yaml
servicio-usuarios:
  volumes:
    - ./servicios/servicio_usuarios/app:/app/app
  command: uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

---

## 📖 Referencias

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [MIGRACION_MICROSERVICIOS.md](./MIGRACION_MICROSERVICIOS.md)
- [README.md](./README.md)

---

**Última actualización**: Enero 2025
