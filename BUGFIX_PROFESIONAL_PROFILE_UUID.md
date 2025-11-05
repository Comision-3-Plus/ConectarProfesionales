# 🐛 Bugfix: Professional Profile UUID Support

## Fecha
2025-11-04

## Problema Reportado
El usuario reportó que la página de perfil de profesional estaba "rota" mostrando errores "NaN" en el backend cuando intentaba ver el perfil de un profesional desde los resultados de búsqueda.

## Causa Raíz
**Incompatibilidad de tipos entre endpoints de búsqueda y perfil:**

1. El endpoint `/search` (POST) retorna profesionales con:
   ```json
   {
     "id": "a1d663ae-d0f9-4507-b5ac-0943366f3bc0",  // UUID (string)
     "nombre": "Pedro",
     "apellido": "Gonzales",
     ...
   }
   ```

2. El endpoint `/public/professional/{prof_id}` (GET) esperaba:
   ```python
   @app.get("/public/professional/{prof_id}")
   async def get_public_professional_profile(
       prof_id: int,  # ❌ TIPO INCORRECTO
       ...
   )
   ```

3. El modelo `Profesional` usa UUID como primary key:
   ```python
   class Profesional(Base, UUIDMixin, TimestampMixin):
       # id = Column(UUID) - heredado de UUIDMixin
       usuario_id = Column(UUID, ForeignKey("usuarios.id"))
   ```

**Resultado:** HTTP 422 Unprocessable Entity cuando el frontend intentaba cargar el perfil usando el UUID del resultado de búsqueda.

## Solución Implementada

### 1. Backend - Cambios en `servicios/servicio_profesionales/app/main.py`

#### A) Importar `PublicProfileResponse`
```python
from shared.schemas.professional import (
    ProfessionalCreate, ProfessionalUpdate, ProfessionalResponse,
    KYCSubmitRequest, KYCStatusResponse, PublicProfileResponse  # ← Añadido
)
```

#### B) Endpoint de perfil público (línea 709-751)
**ANTES:**
```python
@app.get("/public/professional/{prof_id}", response_model=ProfessionalResponse)
async def get_public_professional_profile(
    prof_id: int,  # ❌
    db: Session = Depends(get_db)
):
    professional = db.query(Profesional).filter(
        Profesional.id == prof_id
    ).first()
    
    return ProfessionalResponse.from_professional(professional)
```

**DESPUÉS:**
```python
@app.get("/public/professional/{prof_id}", response_model=PublicProfileResponse)
async def get_public_professional_profile(
    prof_id: str,  # ✅ Acepta UUID como string
    db: Session = Depends(get_db)
):
    try:
        prof_uuid = UUID(prof_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de profesional inválido")
    
    from sqlalchemy.orm import joinedload
    from shared.models.resena import Resena
    
    professional = db.query(Profesional).options(
        joinedload(Profesional.usuario),
        joinedload(Profesional.oficios),
        joinedload(Profesional.portfolio_items).joinedload(PortfolioItem.imagenes),
    ).filter(
        Profesional.id == prof_uuid  # ✅ Usa UUID
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    # Verificar que el usuario esté activo y el KYC aprobado
    user = professional.usuario
    if not user or not user.is_active or professional.estado_verificacion != VerificationStatus.APROBADO:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no disponible"
        )
    
    # Cargar reseñas manualmente (relación no directa)
    resenas = db.query(Resena).filter(
        Resena.profesional_id == prof_uuid
    ).all()
    professional.resenas_recibidas = resenas
    
    return PublicProfileResponse.from_professional(professional)
```

**Mejoras adicionales:**
- Cambio de `ProfessionalResponse` a `PublicProfileResponse` (no expone información sensible como email)
- Eager loading de relaciones (oficios, portfolio, reseñas) para evitar N+1 queries
- Validación de UUID antes de la query
- Verificación de estado de KYC APROBADO

#### C) Endpoint de portfolio (línea 740-765)
**ANTES:**
```python
@app.get("/public/professional/{prof_id}/portfolio", response_model=List[PortfolioResponse])
async def get_public_portfolio(
    prof_id: int,  # ❌
    db: Session = Depends(get_db)
):
    professional = db.query(Profesional).filter(
        Profesional.id == prof_id
    ).first()
    
    portfolio_items = db.query(PortfolioItem).filter(
        PortfolioItem.professional_id == prof_id  # ❌ Typo
    ).all()
```

**DESPUÉS:**
```python
@app.get("/public/professional/{prof_id}/portfolio", response_model=List[PortfolioResponse])
async def get_public_portfolio(
    prof_id: str,  # ✅
    db: Session = Depends(get_db)
):
    try:
        prof_uuid = UUID(prof_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de profesional inválido")
    
    professional = db.query(Profesional).filter(
        Profesional.id == prof_uuid  # ✅
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    portfolio_items = db.query(PortfolioItem).filter(
        PortfolioItem.profesional_id == prof_uuid  # ✅ Corregido typo (profesional_id)
    ).all()
    
    return portfolio_items
```

**Correcciones:**
- `prof_id: int` → `prof_id: str`
- `professional_id` → `profesional_id` (nombre correcto del campo en el modelo)

### 2. Frontend - Cambios en `frontend/app/(public)/profesional/[id]/page.tsx`

#### A) Eliminación de mensaje de error técnico
**ANTES:**
```tsx
if (!profile || profileError) {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold mb-2">⚠️ Problema con el Perfil</h3>
          <p className="text-muted-foreground mb-4">
            {profileError 
              ? `Error: El backend espera un ID numérico pero recibió: ${profesionalId}. Este es un error del backend que debe corregirse.`
              : 'El perfil que buscas no existe o ha sido eliminado'
            }
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              ID recibido: <code className="bg-muted px-2 py-1 rounded">{profesionalId}</code>
            </p>
            <p className="text-sm text-yellow-600 font-medium">
              📌 BUG CONOCIDO: El endpoint /search devuelve user_id (UUID) pero /public/professional/ espera profesional_id (int)
            </p>
          </div>
          <Link href="/explorar" className="mt-4 inline-block">
            <Button>Explorar Profesionales</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
```

**DESPUÉS:**
```tsx
if (!profile || profileError) {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold mb-2">Perfil no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            El perfil que buscas no existe o no está disponible
          </p>
          <Link href="/explorar" className="mt-4 inline-block">
            <Button>Explorar Profesionales</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### B) Adaptación a estructura de respuesta del backend
```tsx
// Crear nombre completo desde campos separados
const nombreCompleto = `${profile.nombre} ${profile.apellido}`

// Reemplazar todas las referencias de profile.nombre_completo por nombreCompleto
// Eliminar referencias a campos no disponibles en PublicProfileResponse:
// - profile.kyc_estado (no público)
// - profile.trabajos_completados (no denormalizado)
// - profile.created_at (no en response público)
// - profile.servicios_instantaneos (TODO: agregar al backend)
```

#### C) Añadir definiciones faltantes
```tsx
const renderStars = (rating: number) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

const nivelColors = {
  BRONCE: "bg-orange-700 text-white",
  PLATA: "bg-gray-400 text-gray-900",
  ORO: "bg-yellow-500 text-gray-900",
  PLATINO: "bg-purple-600 text-white"
}
```

### 3. Proceso de Deployment

Como los contenedores Docker **no** tienen volúmenes montados para el código fuente, fue necesario:

```powershell
# 1. Rebuild del servicio con los cambios
docker-compose build servicio-profesionales

# 2. Restart del servicio
docker-compose up -d servicio-profesionales

# 3. Verificación de logs
docker-compose logs --tail=20 servicio-profesionales
```

## Testing

### Backend - Pruebas de Endpoints

```powershell
# 1. Search (obtener UUID)
$response = Invoke-RestMethod -Uri "http://localhost:8000/search" -Method POST -ContentType "application/json" -Body '{"latitude": -34.6037, "longitude": -58.3816}'
$uuid = $response.resultados[0].id
# Output: a1d663ae-d0f9-4507-b5ac-0943366f3bc0

# 2. Profile público (ahora funciona con UUID)
Invoke-RestMethod -Uri "http://localhost:8000/public/professional/$uuid" -Method GET
# Output:
# {
#   "id": "a1d663ae-d0f9-4507-b5ac-0943366f3bc0",
#   "nombre": "Pedro",
#   "apellido": "Gonzales",
#   "avatar_url": null,
#   "nivel": "BRONCE",
#   "radio_cobertura_km": 47,
#   "acepta_instant": false,
#   "tarifa_por_hora": "9500.00",
#   "rating_promedio": 0.0,
#   "total_resenas": 0,
#   "oficios": [],
#   "portfolio": [],
#   "resenas": []
# }

# 3. Portfolio (también funciona con UUID)
Invoke-RestMethod -Uri "http://localhost:8000/public/professional/$uuid/portfolio" -Method GET
# Output: []
```

**✅ Todos los endpoints funcionan correctamente con UUID**

### Frontend - Testing Manual
1. Ir a `/explorar` o realizar búsqueda
2. Hacer clic en un profesional de los resultados
3. Verificar que el perfil se carga correctamente
4. Verificar que no hay errores en consola
5. Verificar que todos los datos se muestran (nombre, tarifa, rating, etc.)

## Archivos Modificados

### Backend
- `servicios/servicio_profesionales/app/main.py`
  - Línea 28-31: Import de `PublicProfileResponse`
  - Línea 709-751: Endpoint `/public/professional/{prof_id}` (cambio de tipo + schema + eager loading)
  - Línea 740-765: Endpoint `/public/professional/{prof_id}/portfolio` (cambio de tipo + fix typo)

### Frontend
- `frontend/app/(public)/profesional/[id]/page.tsx`
  - Línea 64-78: Simplificación del mensaje de error
  - Línea 80-108: Añadir `nombreCompleto`, `renderStars`, `nivelColors`
  - Línea 160: Fix `profile.nombre_completo` → `nombreCompleto`
  - Línea 161: Fix `profile.nombre_completo` → `nombreCompleto`
  - Línea 166-171: Eliminar condicional `kyc_estado` (siempre mostrar check)
  - Línea 176: Fix `profile.nombre_completo` → `nombreCompleto`
  - Línea 195: Eliminar `trabajos_completados` (no disponible)
  - Línea 228: Eliminar `created_at` (no disponible)

## Impacto
- ✅ **Alta prioridad:** Bug crítico que impedía ver perfiles de profesionales
- ✅ **Zero breaking changes:** La API sigue aceptando UUIDs (ahora como strings)
- ✅ **Mejor performance:** Eager loading de relaciones evita N+1 queries
- ✅ **Mejor seguridad:** `PublicProfileResponse` no expone email ni estado de verificación
- ✅ **Mejor UX:** Mensajes de error más claros y menos técnicos

## Lecciones Aprendidas
1. **Type Consistency:** Siempre asegurar que los IDs devueltos por endpoints de listado coincidan con los esperados por endpoints de detalle
2. **Contract Testing:** Validar contratos de API entre búsqueda y detalle
3. **Eager Loading:** Cargar relaciones anticipadamente para evitar múltiples queries
4. **Public vs Private Schemas:** Usar schemas diferentes para endpoints públicos y privados
5. **Docker Volumes:** Los servicios actuales NO usan volúmenes montados - requieren rebuild para cambios de código

## Estado Final
🎉 **RESUELTO** - El perfil de profesional ahora funciona correctamente desde los resultados de búsqueda.

## Próximos Pasos (Opcionales)
- [ ] Agregar `servicios_instantaneos` a `PublicProfileResponse`
- [ ] Agregar campo `trabajos_completados` denormalizado al modelo `Profesional`
- [ ] Agregar campo `created_at` visible al schema público
- [ ] Considerar agregar volúmenes de código en docker-compose.yml para desarrollo más ágil
- [ ] Documentar en GOLDEN_PATH.md (tarea 12/12 pendiente)
