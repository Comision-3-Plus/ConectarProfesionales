# ⚡ Quick Start - Integración Backend

## 🎯 Objetivo

Conectar las 10 páginas restantes (Módulos A, B, C) con el backend usando React Query.

---

## 📁 Archivos de Ayuda

1. **`FRONTEND_COMPLETO_RESUMEN.md`** → Overview general del proyecto
2. **`INTEGRACION_BACKEND_GUIA.md`** → Ejemplos completos con explicaciones
3. **`SNIPPETS_INTEGRACION.md`** → 🔥 Código copy-paste por página

---

## 🚀 Empezar AHORA (5 minutos)

### Paso 1: Abrir Archivo a Integrar

Ejemplo: `/dashboard/profesional/perfil/page.tsx`

### Paso 2: Abrir SNIPPETS_INTEGRACION.md

Buscar la sección: "## 📄 /dashboard/profesional/perfil/page.tsx"

### Paso 3: Copiar y Reemplazar

**3.1. Reemplazar imports:**
```typescript
// Copiar de SNIPPETS_INTEGRACION.md
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { professionalService } from "@/lib/services/professionalService"
import { publicService } from "@/lib/services/publicService"
import { toast } from "sonner"
```

**3.2. Agregar queries:**
```typescript
// Copiar el bloque de queries del snippet
const queryClient = useQueryClient()

const { data: profile, isLoading } = useQuery({
  queryKey: ['professional-profile'],
  queryFn: professionalService.getMe,
})
```

**3.3. Agregar mutations:**
```typescript
// Copiar todas las mutations del snippet
const updateTarifaMutation = useMutation({
  mutationFn: (tarifa: number) => 
    professionalService.updateProfile({ tarifa_por_hora: tarifa }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
    toast.success('Tarifa actualizada')
  },
})
```

**3.4. Actualizar handlers:**
```typescript
// Cambiar de:
const handleSave = () => {
  console.log('guardando')
}

// A:
const handleSave = (tarifa: number) => {
  updateTarifaMutation.mutate(tarifa)
}
```

### Paso 4: Eliminar Mock Data

Buscar y eliminar:
- `const mockData = [...]`
- `const [data, setData] = useState(mockData)`
- `useEffect(() => { /* TODO */ }, [])`

### Paso 5: Probar

```bash
# 1. Backend corriendo
docker compose up

# 2. Frontend corriendo
cd frontend
npm run dev

# 3. Abrir en navegador
http://localhost:3000/dashboard/profesional/perfil

# 4. Ver Network tab en DevTools
# Deberías ver requests a http://localhost:8004/api/v1/...
```

---

## 📋 Orden Sugerido de Integración

### Prioridad Alta (empezar por aquí)

1. **Perfil Profesional** (15 min)
   - Archivo: `/dashboard/profesional/perfil/page.tsx`
   - Snippet: Sección correspondiente en SNIPPETS_INTEGRACION.md
   - Servicios: `professionalService`, `publicService`

2. **Portfolio** (20 min)
   - Archivo: `/dashboard/profesional/portfolio/page.tsx`
   - Snippet: Sección correspondiente
   - Servicios: `professionalService` (CRUD + upload)

3. **Explorar Profesionales** (15 min)
   - Archivo: `/(public)/explorar/page.tsx`
   - Snippet: Sección correspondiente
   - Servicios: `searchService`, `publicService`

### Prioridad Media

4. **Ofertas Profesional** (10 min)
   - Archivo: `/dashboard/profesional/ofertas/page.tsx`
   - Snippet: Sección correspondiente
   - Servicios: `professionalService`

5. **Trabajos Profesional** (10 min)
   - Archivo: `/dashboard/profesional/trabajos/page.tsx`
   - Snippet: Sección correspondiente
   - Servicios: `professionalService`

6. **Perfil Público** (15 min)
   - Archivo: `/(public)/profesional/[id]/page.tsx`
   - Snippet: Sección correspondiente
   - Servicios: `publicService`

### Prioridad Baja (después)

7. **Verificación KYC** (10 min)
   - Archivo: `/dashboard/profesional/verificacion/page.tsx`
   - Snippet: Sección correspondiente
   - Servicios: `professionalService`

8. **Chat con Ofertas** (25 min) - Más complejo
   - Archivo: `/chat/[chatId]/page.tsx`
   - Snippet: Sección correspondiente
   - Servicios: `professionalService`, `clienteService`

---

## ✅ Checklist por Página

Cuando termines de integrar una página, verifica:

- [ ] ✅ Imports actualizados con React Query
- [ ] ✅ useQueryClient inicializado
- [ ] ✅ Queries con queryKey único
- [ ] ✅ Mutations con onSuccess
- [ ] ✅ invalidateQueries en onSuccess
- [ ] ✅ toast en callbacks
- [ ] ✅ disabled={isPending} en botones
- [ ] ✅ Loading states
- [ ] ✅ Mock data eliminado
- [ ] ✅ TODO comments eliminados
- [ ] ✅ Probado en navegador
- [ ] ✅ Network requests visible en DevTools

---

## 🐛 Problemas Comunes

### Error: "Cannot find module 'react'"

**Solución:** Errores de lint normales. El código funcionará en Docker.

### Error: 401 Unauthorized

**Solución:** 
```javascript
// Verificar token en DevTools > Application > Local Storage
localStorage.getItem('access_token')

// Si no hay token, hacer login primero
```

### Error: Network Error

**Solución:**
```bash
# Verificar que el backend esté corriendo
docker compose ps

# Ver logs
docker logs marketplace_api --tail 50

# Probar endpoint manualmente
curl http://localhost:8004/api/v1/public/oficios
```

### Mutation no actualiza la vista

**Solución:**
```typescript
// Asegurar que invalidas las queries correctas
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['la-query-key-correcta'] })
}
```

### Loading infinito

**Solución:**
```typescript
// Verificar que el queryFn retorna datos
queryFn: () => service.method() // ✅ Correcto
queryFn: service.method()       // ❌ Incorrecto (ejecuta inmediatamente)
```

---

## 📊 Progreso

Marca con ✅ cuando completes:

- [ ] Perfil Profesional
- [ ] Portfolio
- [ ] Explorar
- [ ] Ofertas
- [ ] Trabajos
- [ ] Perfil Público
- [ ] KYC
- [ ] Chat

**Cuando completes las 8, tendrás el frontend 100% integrado! 🎉**

---

## 🎓 Recursos

- **SNIPPETS_INTEGRACION.md** → Código específico por página
- **INTEGRACION_BACKEND_GUIA.md** → Ejemplos con explicaciones
- **FRONTEND_COMPLETO_RESUMEN.md** → Overview del proyecto
- **API Docs:** http://localhost:8004/docs

---

## 💡 Pro Tips

1. **Usa el patrón:** No reinventes la rueda, copia de SNIPPETS y adapta
2. **Revisa Admin:** Las páginas de admin ya están integradas, úsalas de referencia
3. **DevTools:** Siempre abre Network tab para ver requests
4. **Logs Backend:** `docker logs marketplace_api -f` para ver errores en tiempo real
5. **Git:** Haz commits pequeños después de cada página integrada

---

## 🚀 Comando de Inicio

```bash
# Terminal 1: Backend
docker compose up

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Logs backend (opcional)
docker logs marketplace_api -f
```

Abre http://localhost:3000 y empieza a integrar! 🎯

---

## ⏱️ Tiempo Estimado

- **Perfil + Portfolio + Explorar:** 50 minutos
- **Ofertas + Trabajos + Perfil Público:** 35 minutos
- **KYC + Chat:** 35 minutos

**Total: ~2 horas** para integrar todo el frontend 🚀

---

**¡Empieza por Perfil Profesional y sigue el orden sugerido!**
