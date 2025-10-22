# 🚀 ConectarProfesionales - Inicio Rápido

## Ejecutar todo con un solo comando

```powershell
docker-compose up --build -d
```

Eso es todo. Docker se encargará de:
- ✅ Crear el usuario y base de datos PostgreSQL automáticamente
- ✅ Habilitar PostGIS
- ✅ Construir y ejecutar el backend FastAPI
- ✅ Aplicar las migraciones de base de datos automáticamente
- ✅ Construir y ejecutar el frontend Next.js

## 🌐 URLs

Después de 1-2 minutos, accede a:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8004
- **Documentación API**: http://localhost:8004/docs

## 👤 Usuario Administrador

Para crear un usuario admin, mientras los contenedores están corriendo:

```powershell
docker-compose exec api /code/create_admin.sh
```

**Credenciales:**
- Email: `admin@example.com`
- Password: `Admin1234!`

## 🛑 Detener todo

```powershell
docker-compose down
```

## 🗑️ Limpiar todo (incluye base de datos)

```powershell
docker-compose down -v
```

## 📝 Ver logs

```powershell
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f api

# Solo frontend
docker-compose logs -f frontend
```

## 🧪 Ejecutar tests

```powershell
docker-compose exec api pytest tests/ -v
```

---

## 📋 Requisitos

- Docker Desktop instalado y corriendo
- Puertos libres: 3000, 8004, 5432

---

## ✅ Confirmación

Verifica que todo esté corriendo:

```powershell
docker-compose ps
```

Deberías ver 3 contenedores: `marketplace_db`, `marketplace_api`, `marketplace_frontend` - todos en estado "Up".

---

**Eso es todo. Un solo comando y está funcionando.** 🎉
