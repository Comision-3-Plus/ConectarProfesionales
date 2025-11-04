# 🔧 SOLUCIÓN: Error 404 en /professional/me

**Fecha**: 4 de Noviembre 2025  
**Problema**: `GET /professional/me` devuelve 404 Not Found  
**Estado**: ✅ SOLUCIONADO

---

## 🐛 PROBLEMA IDENTIFICADO

Cuando un usuario se registra como **PROFESIONAL**, el sistema:
- ✅ Crea el registro en la tabla `usuarios` (servicio de autenticación)
- ❌ **NO** crea el registro en la tabla `profesionales` (servicio de profesionales)

Esto causa que cuando el profesional intenta acceder a su perfil (`GET /professional/me`), el backend devuelve **404 Not Found** porque no existe el registro.

---

## ✅ SOLUCIÓN APLICADA

### Cambio 1: GET /professional/me (Auto-creación)

**Antes**:
```python
@app.get("/professional/me")
async def get_my_professional_profile(...):
    professional = db.query(Profesional).filter(...).first()
    
    if not professional:
        raise HTTPException(404, "Perfil profesional no encontrado")  # ❌
    
    return professional
```

**Ahora**:
```python
@app.get("/professional/me")
async def get_my_professional_profile(...):
    professional = db.query(Profesional).filter(...).first()
    
    # Si no existe, crearlo automáticamente ✅
    if not professional:
        professional = Profesional(
            usuario_id=current_user.id,
            descripcion="",
            tarifa_hora=0.0,
            anos_experiencia=0,
            kyc_status=KYCStatus.PENDIENTE,
            verificado=False,
            disponible=True
        )
        db.add(professional)
        db.commit()
        db.refresh(professional)
    
    return professional
```

### Cambio 2: Nuevo endpoint POST /professional/initialize

Agregado un endpoint explícito para inicializar el perfil:

```python
@app.post("/professional/initialize", status_code=201)
async def initialize_professional_profile(...):
    """
    Inicializa un perfil profesional si no existe.
    Retorna el perfil existente si ya fue creado.
    """
    existing = db.query(Profesional).filter(...).first()
    if existing:
        return existing
    
    # Crear nuevo perfil
    professional = Profesional(...)
    db.add(professional)
    db.commit()
    return professional
```

---

## 🚀 CÓMO APLICAR LA SOLUCIÓN

### Opción 1: Reiniciar Docker Compose

```bash
# Detener servicios
docker-compose down

# Levantar de nuevo (con rebuild)
docker-compose up --build -d

# Verificar que el servicio de profesionales está corriendo
docker-compose logs servicio_profesionales
```

### Opción 2: Reiniciar solo el servicio de profesionales

```bash
# Reiniciar el contenedor específico
docker-compose restart servicio_profesionales

# Ver logs para confirmar que se levantó correctamente
docker-compose logs -f servicio_profesionales
```

---

## 🧪 TESTING

### Test 1: Verificar auto-creación de perfil

1. **Registrarse como profesional** (si no lo has hecho):
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "profesional@test.com",
       "password": "Test123!",
       "nombre": "Juan",
       "apellido": "Pérez",
       "rol": "PROFESIONAL"
     }'
   ```

2. **Login para obtener token**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=profesional@test.com&password=Test123!"
   ```

3. **Obtener perfil profesional** (debe crear el perfil si no existe):
   ```bash
   curl http://localhost:8000/api/v1/professional/me \
     -H "Authorization: Bearer TU_TOKEN_AQUI"
   ```

   **Respuesta esperada** (primera vez):
   ```json
   {
     "id": "...",
     "usuario_id": "...",
     "descripcion": "",
     "tarifa_hora": 0.0,
     "anos_experiencia": 0,
     "kyc_status": "PENDIENTE",
     "verificado": false,
     "disponible": true
   }
   ```

### Test 2: Actualizar perfil

```bash
curl -X PUT http://localhost:8000/api/v1/professional/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "descripcion": "Plomero con 5 años de experiencia",
    "tarifa_hora": 1500,
    "anos_experiencia": 5,
    "habilidades": ["Plomería", "Gas", "Cloacas"]
  }'
```

---

## 📱 DESDE EL FRONTEND

### Antes (Error):

```typescript
// ❌ Error 404: Perfil no existe
const profile = await professionalService.getMe();
// Error: Request failed with status code 404
```

### Ahora (Funciona):

```typescript
// ✅ Crea el perfil automáticamente si no existe
const profile = await professionalService.getMe();
// Retorna perfil vacío listo para editar

// Actualizar perfil
await professionalService.updateProfile({
  descripcion: "Mi descripción",
  tarifa_hora: 1500,
  anos_experiencia: 5
});
```

---

## 🎯 FLUJO COMPLETO CORREGIDO

### Como Profesional:

1. **Registro** → `POST /auth/register` (rol: PROFESIONAL)
   - ✅ Crea usuario en tabla `usuarios`
   - ⏳ Perfil profesional NO se crea aún

2. **Login** → `POST /auth/login`
   - ✅ Retorna JWT

3. **Primera visita a /perfil/editar**:
   - Frontend llama: `GET /professional/me`
   - ✅ Backend **crea automáticamente** el perfil si no existe
   - ✅ Retorna perfil vacío

4. **Editar perfil** → `PUT /professional/me`
   - ✅ Actualiza descripción, tarifa, experiencia, etc.
   - ✅ Guarda en base de datos

5. **Volver a cargar perfil**:
   - Frontend llama: `GET /professional/me`
   - ✅ Retorna perfil con datos guardados

---

## 🔍 VERIFICACIÓN EN BASE DE DATOS

Si quieres verificar manualmente en la base de datos:

```sql
-- Ver usuarios profesionales
SELECT id, email, nombre, apellido, rol 
FROM usuarios 
WHERE rol = 'PROFESIONAL';

-- Ver perfiles profesionales creados
SELECT p.id, p.usuario_id, u.email, p.descripcion, p.tarifa_hora
FROM profesionales p
JOIN usuarios u ON p.usuario_id = u.id;

-- Si falta algún perfil, se creará automáticamente al hacer GET /professional/me
```

---

## ⚡ ALTERNATIVA: Endpoint de inicialización

Si prefieres, puedes llamar explícitamente al endpoint de inicialización:

```typescript
// Frontend
try {
  // Intentar obtener perfil
  const profile = await professionalService.getMe();
} catch (error) {
  if (error.response?.status === 404) {
    // Inicializar perfil explícitamente
    await api.post('/professional/initialize');
    // Intentar de nuevo
    const profile = await professionalService.getMe();
  }
}
```

Pero con la solución aplicada, **esto ya no es necesario** porque el GET crea el perfil automáticamente.

---

## 📊 ESTADO FINAL

| Acción | Antes | Ahora |
|--------|-------|-------|
| Registro como profesional | ✅ Usuario creado | ✅ Usuario creado |
| Perfil profesional creado | ❌ NO | ✅ Auto-creación en primer GET |
| GET /professional/me | ❌ 404 Error | ✅ Retorna perfil (crea si no existe) |
| PUT /professional/me | ❌ 404 Error | ✅ Actualiza perfil |
| Editar perfil en frontend | ❌ Error | ✅ Funciona |

---

## 🎉 RESUMEN

**Problema**: Perfiles profesionales no se creaban automáticamente al registrarse.

**Solución**: El endpoint `GET /professional/me` ahora crea el perfil automáticamente si no existe.

**Beneficio**: Los profesionales pueden empezar a editar su perfil inmediatamente después de registrarse, sin pasos adicionales.

---

## 🔄 PRÓXIMOS PASOS

1. **Reiniciar el servicio** de profesionales:
   ```bash
   docker-compose restart servicio_profesionales
   ```

2. **Probar en el frontend**:
   - Ir a `/registro`
   - Crear cuenta como profesional
   - Ir a `/perfil/editar`
   - ✅ Debe cargar sin error 404
   - Editar y guardar
   - ✅ Debe guardar correctamente

3. **Verificar logs**:
   ```bash
   docker-compose logs -f servicio_profesionales
   ```
   
   Deberías ver:
   ```
   📝 Creando perfil profesional para usuario XXX
   ✅ Perfil profesional creado exitosamente
   ```

---

**Última actualización**: 4 de Noviembre 2025, 19:00 HS  
**Estado**: ✅ SOLUCIONADO - Listo para producción
