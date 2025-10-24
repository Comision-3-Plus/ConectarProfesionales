# 🚀 Guía de Integración Backend - Frontend

## 📋 Tabla de Contenidos
- [Servicios Disponibles](#servicios-disponibles)
- [Ejemplos de Integración](#ejemplos-de-integración)
- [Páginas a Actualizar](#páginas-a-actualizar)
- [Patrones de Código](#patrones-de-código)

---

## 🔌 Servicios Disponibles

### 1. Professional Service
**Archivo:** `/lib/services/professionalService.ts`

```typescript
// Perfil
professionalService.getMe() // GET /api/v1/professional/me
professionalService.updateProfile(data) // PUT /api/v1/professional/profile
professionalService.updateLocation({ latitude, longitude }) // PUT /api/v1/professional/profile/location
professionalService.updateOficios({ oficio_ids: ["id1", "id2"] }) // PUT /api/v1/professional/profile/oficios
professionalService.updatePayoutInfo({ payout_account: "CVU/CBU/ALIAS" }) // PUT /api/v1/professional/payout-info

// KYC
professionalService.uploadKYC(files: File[]) // POST /api/v1/professional/kyc/upload

// Portfolio
professionalService.listPortfolio() // GET /api/v1/professional/portfolio
professionalService.createPortfolioItem(data) // POST /api/v1/professional/portfolio
professionalService.uploadPortfolioImage(itemId, file) // POST /api/v1/professional/portfolio/{id}/image
professionalService.deletePortfolioItem(itemId) // DELETE /api/v1/professional/portfolio/{id}

// Ofertas
professionalService.listOfertas() // GET /api/v1/professional/ofertas
professionalService.createOferta({ cliente_id, descripcion, precio_ofertado }) // POST /api/v1/professional/ofertas

// Trabajos
professionalService.listTrabajos() // GET /api/v1/professional/trabajos
```

### 2. Cliente Service
**Archivo:** `/lib/services/clienteService.ts`

```typescript
// Ofertas
clienteService.listOfertas() // GET /api/v1/cliente/ofertas
clienteService.getOferta(ofertaId) // GET /api/v1/cliente/ofertas/{id}
clienteService.acceptOferta(ofertaId) // POST /api/v1/cliente/ofertas/{id}/accept (genera link MP)
clienteService.rejectOferta(ofertaId) // POST /api/v1/cliente/ofertas/{id}/reject

// Trabajos
clienteService.listTrabajos() // GET /api/v1/cliente/trabajos
clienteService.getTrabajo(trabajoId) // GET /api/v1/cliente/trabajo/{id}
clienteService.finalizarTrabajo(trabajoId) // POST /api/v1/cliente/trabajo/{id}/finalizar
clienteService.cancelarTrabajo(trabajoId) // POST /api/v1/cliente/trabajo/{id}/cancelar

// Reseñas
clienteService.crearResena(trabajoId, { calificacion: 5, comentario: "..." }) // POST /api/v1/cliente/trabajo/{id}/resena
```

### 3. Public Service
**Archivo:** `/lib/services/publicService.ts`

```typescript
publicService.getOficios() // GET /api/v1/public/oficios
publicService.getProfessionalProfile(profesionalId) // GET /api/v1/public/professional/{id}
publicService.getProfessionalPortfolio(profesionalId) // GET /api/v1/public/professional/{id}/portfolio
```

### 4. Search Service
**Archivo:** `/lib/services/searchService.ts`

```typescript
searchService.searchProfessionals({
  oficio_nombre: "Plomería",
  latitud_cliente: -34.6037,
  longitud_cliente: -58.3816,
  radio_km: 10
}) // GET /api/v1/search/professionals
```

### 5. Admin Service
**Archivo:** `/lib/services/adminService.ts`
*(Ya implementado en las páginas admin)*

---

## 🎯 Ejemplos de Integración

### Ejemplo 1: Perfil Profesional con React Query

**Archivo a actualizar:** `/app/(dashboard)/dashboard/profesional/perfil/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { professionalService } from "@/lib/services/professionalService"
import { publicService } from "@/lib/services/publicService"
import { toast } from "sonner"

export default function PerfilPage() {
  const queryClient = useQueryClient()
  const [selectedOficios, setSelectedOficios] = useState<string[]>([])

  // Query: Obtener perfil
  const { data: profile, isLoading } = useQuery({
    queryKey: ['professional-profile'],
    queryFn: professionalService.getMe,
    staleTime: 30000, // Cache 30s
  })

  // Query: Obtener oficios disponibles
  const { data: oficios } = useQuery({
    queryKey: ['oficios'],
    queryFn: publicService.getOficios,
    staleTime: 300000, // Cache 5min (no cambian seguido)
  })

  // Mutation: Actualizar tarifa
  const updateTarifaMutation = useMutation({
    mutationFn: (tarifa: number) => 
      professionalService.updateProfile({ tarifa_por_hora: tarifa }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success('Tarifa actualizada')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error')
    },
  })

  // Mutation: Actualizar oficios
  const updateOficiosMutation = useMutation({
    mutationFn: (oficio_ids: string[]) => 
      professionalService.updateOficios({ oficio_ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success('Oficios actualizados')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error')
    },
  })

  // Mutation: Actualizar ubicación
  const updateLocationMutation = useMutation({
    mutationFn: (data: { latitude: number; longitude: number }) => 
      professionalService.updateLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success('Ubicación actualizada')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error')
    },
  })

  // Handler: Guardar oficios
  const handleSaveOficios = () => {
    if (selectedOficios.length === 0) {
      toast.error('Selecciona al menos un oficio')
      return
    }
    updateOficiosMutation.mutate(selectedOficios)
  }

  if (isLoading) return <div>Cargando...</div>

  return (
    <div>
      {/* Mostrar datos del perfil */}
      <h1>Perfil de {profile?.nombre}</h1>
      <p>Tarifa actual: ${profile?.tarifa_por_hora}/hora</p>
      
      {/* Formulario de oficios */}
      <div>
        {oficios?.map(oficio => (
          <label key={oficio.id}>
            <input
              type="checkbox"
              checked={selectedOficios.includes(oficio.id)}
              onChange={() => {
                setSelectedOficios(prev =>
                  prev.includes(oficio.id)
                    ? prev.filter(id => id !== oficio.id)
                    : [...prev, oficio.id]
                )
              }}
            />
            {oficio.nombre}
          </label>
        ))}
      </div>
      
      <button 
        onClick={handleSaveOficios}
        disabled={updateOficiosMutation.isPending}
      >
        {updateOficiosMutation.isPending ? 'Guardando...' : 'Guardar Oficios'}
      </button>
    </div>
  )
}
```

---

### Ejemplo 2: Portfolio con Upload de Imágenes

**Archivo a actualizar:** `/app/(dashboard)/dashboard/profesional/portfolio/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { professionalService } from "@/lib/services/professionalService"
import { toast } from "sonner"

export default function PortfolioPage() {
  const queryClient = useQueryClient()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [imagenes, setImagenes] = useState<File[]>([])

  // Query: Listar portfolio
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['professional-portfolio'],
    queryFn: professionalService.listPortfolio,
  })

  // Mutation: Crear item
  const createMutation = useMutation({
    mutationFn: async () => {
      // 1. Crear el item
      const item = await professionalService.createPortfolioItem({
        titulo,
        descripcion,
      })
      
      // 2. Subir imágenes una por una
      for (const imagen of imagenes) {
        await professionalService.uploadPortfolioImage(item.id, imagen)
      }
      
      return item
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-portfolio'] })
      toast.success('Item creado exitosamente')
      setShowCreateDialog(false)
      setTitulo("")
      setDescripcion("")
      setImagenes([])
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al crear item')
    },
  })

  // Mutation: Eliminar item
  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => professionalService.deletePortfolioItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-portfolio'] })
      toast.success('Item eliminado')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error')
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImagenes(Array.from(e.target.files))
    }
  }

  const handleCreate = () => {
    if (!titulo || !descripcion) {
      toast.error('Completa todos los campos')
      return
    }
    createMutation.mutate()
  }

  if (isLoading) return <div>Cargando...</div>

  return (
    <div>
      <h1>Mi Portfolio</h1>
      
      <button onClick={() => setShowCreateDialog(true)}>
        + Agregar Item
      </button>

      {/* Grid de items */}
      <div className="grid grid-cols-3 gap-4">
        {portfolio?.map(item => (
          <div key={item.id} className="border p-4">
            {item.imagen_url && (
              <img src={item.imagen_url} alt={item.titulo} />
            )}
            <h3>{item.titulo}</h3>
            <p>{item.descripcion}</p>
            <button 
              onClick={() => deleteMutation.mutate(item.id)}
              disabled={deleteMutation.isPending}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {/* Dialog de creación */}
      {showCreateDialog && (
        <div className="modal">
          <input
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
          <p>Imágenes seleccionadas: {imagenes.length}</p>
          
          <button onClick={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creando...' : 'Crear Item'}
          </button>
          <button onClick={() => setShowCreateDialog(false)}>Cancelar</button>
        </div>
      )}
    </div>
  )
}
```

---

### Ejemplo 3: Explorar Profesionales (Búsqueda)

**Archivo a actualizar:** `/app/(public)/explorar/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { searchService } from "@/lib/services/searchService"
import { publicService } from "@/lib/services/publicService"

export default function ExplorarPage() {
  const [oficio, setOficio] = useState("")
  const [radioKm, setRadioKm] = useState(10)
  const [lat, setLat] = useState(-34.6037)
  const [lng, setLng] = useState(-58.3816)

  // Query: Oficios para el filtro
  const { data: oficios } = useQuery({
    queryKey: ['oficios'],
    queryFn: publicService.getOficios,
    staleTime: 300000,
  })

  // Query: Búsqueda de profesionales
  const { data: profesionales, isLoading, refetch } = useQuery({
    queryKey: ['search-professionals', oficio, radioKm, lat, lng],
    queryFn: () => searchService.searchProfessionals({
      oficio_nombre: oficio,
      latitud_cliente: lat,
      longitud_cliente: lng,
      radio_km: radioKm,
    }),
    enabled: !!oficio, // Solo buscar si hay oficio seleccionado
  })

  return (
    <div>
      <h1>Explorar Profesionales</h1>

      {/* Filtros */}
      <div className="filters">
        <select value={oficio} onChange={(e) => setOficio(e.target.value)}>
          <option value="">Selecciona un oficio</option>
          {oficios?.map(o => (
            <option key={o.id} value={o.nombre}>{o.nombre}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Radio (km)"
          value={radioKm}
          onChange={(e) => setRadioKm(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Latitud"
          value={lat}
          onChange={(e) => setLat(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Longitud"
          value={lng}
          onChange={(e) => setLng(Number(e.target.value))}
        />

        <button onClick={() => refetch()}>Buscar</button>
      </div>

      {/* Resultados */}
      {isLoading && <div>Buscando...</div>}
      
      <div className="grid grid-cols-3 gap-4">
        {profesionales?.map(prof => (
          <div key={prof.id} className="card">
            <h3>{prof.nombre}</h3>
            <p>Tarifa: ${prof.tarifa_por_hora}/hora</p>
            <p>Rating: {prof.rating_promedio || 'Sin calificación'}</p>
            <p>Distancia: {prof.distancia_km?.toFixed(1)} km</p>
            {prof.kyc_aprobado && <span>✅ Verificado</span>}
            <a href={`/profesional/${prof.id}`}>Ver Perfil</a>
          </div>
        ))}
      </div>

      {profesionales?.length === 0 && (
        <div>No se encontraron profesionales</div>
      )}
    </div>
  )
}
```

---

### Ejemplo 4: Chat con Ofertas

**Archivo a actualizar:** `/app/chat/[chatId]/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { professionalService } from "@/lib/services/professionalService"
import { clienteService } from "@/lib/services/clienteService"
import { useUser } from "@/hooks/useUser" // Hook para saber si es profesional o cliente
import { toast } from "sonner"

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const queryClient = useQueryClient()
  const { user } = useUser() // { id, rol: 'PROFESIONAL' | 'CLIENTE' }
  const [showOfertaDialog, setShowOfertaDialog] = useState(false)
  const [descripcionOferta, setDescripcionOferta] = useState("")
  const [precioOferta, setPrecioOferta] = useState("")

  const isProfesional = user?.rol === 'PROFESIONAL'
  const isCliente = user?.rol === 'CLIENTE'

  // Query: Ofertas en este chat
  const { data: ofertas } = useQuery({
    queryKey: ['ofertas', params.chatId],
    queryFn: () => 
      isProfesional 
        ? professionalService.listOfertas() 
        : clienteService.listOfertas(),
    select: (data) => data.filter(o => o.chat_id === params.chatId), // Filtrar por chat
  })

  // Mutation: Crear oferta (solo profesional)
  const createOfertaMutation = useMutation({
    mutationFn: () => professionalService.createOferta({
      cliente_id: params.chatId, // O extraer del chat
      descripcion: descripcionOferta,
      precio_ofertado: Number(precioOferta),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ofertas'] })
      toast.success('Oferta enviada')
      setShowOfertaDialog(false)
      setDescripcionOferta("")
      setPrecioOferta("")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error')
    },
  })

  // Mutation: Aceptar oferta (solo cliente)
  const acceptOfertaMutation = useMutation({
    mutationFn: (ofertaId: string) => clienteService.acceptOferta(ofertaId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ofertas'] })
      toast.success('Oferta aceptada')
      // Redirigir a MercadoPago
      window.open(data.payment_url, '_blank')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error')
    },
  })

  // Mutation: Rechazar oferta (solo cliente)
  const rejectOfertaMutation = useMutation({
    mutationFn: (ofertaId: string) => clienteService.rejectOferta(ofertaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ofertas'] })
      toast.success('Oferta rechazada')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error')
    },
  })

  const handleEnviarOferta = () => {
    if (!descripcionOferta || !precioOferta) {
      toast.error('Completa todos los campos')
      return
    }
    createOfertaMutation.mutate()
  }

  return (
    <div>
      <h1>Chat</h1>

      {/* Mensajes del chat (Firebase) */}
      <div className="messages">
        {/* ... mensajes ... */}
      </div>

      {/* Ofertas integradas */}
      <div className="ofertas">
        {ofertas?.map(oferta => (
          <div key={oferta.id} className="oferta-card">
            <h3>Oferta Formal</h3>
            <p>{oferta.descripcion}</p>
            <p className="precio">${oferta.precio_ofertado}</p>
            <p className="estado">{oferta.estado}</p>

            {isCliente && oferta.estado === 'OFERTADO' && (
              <div>
                <button 
                  onClick={() => acceptOfertaMutation.mutate(oferta.id)}
                  disabled={acceptOfertaMutation.isPending}
                >
                  Aceptar y Pagar
                </button>
                <button 
                  onClick={() => rejectOfertaMutation.mutate(oferta.id)}
                  disabled={rejectOfertaMutation.isPending}
                >
                  Rechazar
                </button>
              </div>
            )}

            {oferta.estado === 'ACEPTADO' && (
              <span>✅ Aceptada - Trabajo creado</span>
            )}
          </div>
        ))}
      </div>

      {/* Botón para enviar oferta (solo profesional) */}
      {isProfesional && (
        <button onClick={() => setShowOfertaDialog(true)}>
          Enviar Oferta Formal
        </button>
      )}

      {/* Dialog de crear oferta */}
      {showOfertaDialog && (
        <div className="modal">
          <h2>Nueva Oferta</h2>
          <textarea
            placeholder="Descripción del trabajo..."
            value={descripcionOferta}
            onChange={(e) => setDescripcionOferta(e.target.value)}
          />
          <input
            type="number"
            placeholder="Precio"
            value={precioOferta}
            onChange={(e) => setPrecioOferta(e.target.value)}
          />
          <button onClick={handleEnviarOferta} disabled={createOfertaMutation.isPending}>
            {createOfertaMutation.isPending ? 'Enviando...' : 'Enviar Oferta'}
          </button>
          <button onClick={() => setShowOfertaDialog(false)}>Cancelar</button>
        </div>
      )}
    </div>
  )
}
```

---

## 📝 Páginas a Actualizar

### Módulo A - Profesional ✅

| Página | Estado | Archivo | Servicios a Usar |
|--------|--------|---------|------------------|
| Dashboard | ✅ Ya existe | `/dashboard/profesional/page.tsx` | `professionalService.getMe()` |
| Perfil | 🔄 Actualizar | `/dashboard/profesional/perfil/page.tsx` | `professionalService.updateProfile()`, `publicService.getOficios()` |
| Portfolio | 🔄 Actualizar | `/dashboard/profesional/portfolio/page.tsx` | `professionalService.listPortfolio()`, `createPortfolioItem()`, `uploadPortfolioImage()`, `deletePortfolioItem()` |
| Verificación | 🔄 Actualizar | `/dashboard/profesional/verificacion/page.tsx` | `professionalService.uploadKYC()`, `getMe()` |
| Ofertas | 🔄 Actualizar | `/dashboard/profesional/ofertas/page.tsx` | `professionalService.listOfertas()` |
| Trabajos | 🔄 Actualizar | `/dashboard/profesional/trabajos/page.tsx` | `professionalService.listTrabajos()` |

### Módulo B - Búsqueda Pública 🔍

| Página | Estado | Archivo | Servicios a Usar |
|--------|--------|---------|------------------|
| Explorar | 🔄 Actualizar | `/(public)/explorar/page.tsx` | `searchService.searchProfessionals()`, `publicService.getOficios()` |
| Perfil Público | 🔄 Actualizar | `/(public)/profesional/[id]/page.tsx` | `publicService.getProfessionalProfile()`, `getProfessionalPortfolio()` |

### Módulo C - Chat 💬

| Página | Estado | Archivo | Servicios a Usar |
|--------|--------|---------|------------------|
| Lista Chats | 🔄 Actualizar | `/chat/page.tsx` | Firebase Firestore (ya configurado) |
| Chat Individual | 🔄 Actualizar | `/chat/[chatId]/page.tsx` | `professionalService.createOferta()`, `clienteService.acceptOferta()`, `rejectOferta()` |

### Módulo D - Admin ✅

| Página | Estado | Archivo | Nota |
|--------|--------|---------|------|
| Dashboard | ✅ Completo | `/dashboard/admin/page.tsx` | Ya usa React Query |
| KYC | ✅ Completo | `/dashboard/admin/kyc/page.tsx` | Ya usa React Query |
| Usuarios | ✅ Completo | `/dashboard/admin/users/page.tsx` | Ya usa React Query |
| Oficios | ✅ Completo | `/dashboard/admin/oficios/page.tsx` | Ya usa React Query |
| Servicios | ✅ Completo | `/dashboard/admin/servicios/page.tsx` | Ya usa React Query |
| Trabajos | ✅ Completo | `/dashboard/admin/trabajos/page.tsx` | Ya usa React Query |

---

## 🎨 Patrones de Código

### Pattern 1: Query Simple

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['unique-key'],
  queryFn: async () => await service.method(),
  staleTime: 30000, // Cache duration
})
```

### Pattern 2: Mutation con Invalidación

```typescript
const mutation = useMutation({
  mutationFn: (data) => service.method(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['related-key'] })
    toast.success('Éxito')
  },
  onError: (error: any) => {
    toast.error(error?.response?.data?.detail || 'Error')
  },
})
```

### Pattern 3: Upload de Archivos

```typescript
const uploadMutation = useMutation({
  mutationFn: async (file: File) => {
    return await service.upload(file)
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['files'] })
  },
})

// En el handler
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files?.[0]) {
    uploadMutation.mutate(e.target.files[0])
  }
}
```

### Pattern 4: Query con Filtros Dinámicos

```typescript
const [filter, setFilter] = useState('todos')

const { data } = useQuery({
  queryKey: ['items', filter], // Se re-ejecuta cuando cambia filter
  queryFn: () => service.list({ status: filter }),
})
```

### Pattern 5: Manejo de Errores Global

```typescript
// En el mutation
onError: (error: any) => {
  const errorMsg = error?.response?.data?.detail || 
                   error?.message || 
                   'Error desconocido'
  toast.error(errorMsg)
  
  // Log para debugging
  console.error('Error:', error)
}
```

---

## 🚀 Pasos de Implementación

### Paso 1: Verificar Servicios
```bash
# Revisar que todos los servicios estén exportados correctamente
cat lib/services/index.ts
```

Debería contener:
```typescript
export * from './adminService'
export * from './authService'
export * from './clienteService'
export * from './professionalService'
export * from './publicService'
export * from './searchService'
export * from './userService'
```

### Paso 2: Actualizar Página por Página

1. **Abrir el archivo a actualizar**
2. **Importar servicios necesarios:**
   ```typescript
   import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
   import { professionalService } from "@/lib/services/professionalService"
   import { toast } from "sonner"
   ```

3. **Reemplazar mock data con queries:**
   ```typescript
   // Antes (mock)
   const [data, setData] = useState(mockData)
   
   // Después (React Query)
   const { data, isLoading } = useQuery({
     queryKey: ['key'],
     queryFn: service.method,
   })
   ```

4. **Reemplazar funciones con mutations:**
   ```typescript
   // Antes (fake)
   const handleSave = () => {
     console.log('Guardado')
     toast.success('Guardado')
   }
   
   // Después (real)
   const saveMutation = useMutation({
     mutationFn: (data) => service.save(data),
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['key'] })
       toast.success('Guardado')
     },
   })
   
   const handleSave = () => {
     saveMutation.mutate(formData)
   }
   ```

### Paso 3: Probar Integración

```bash
# 1. Asegurar que el backend esté corriendo
docker compose up

# 2. Levantar frontend
cd frontend
npm run dev

# 3. Abrir DevTools > Network para ver requests
# 4. Verificar que las llamadas lleguen a http://localhost:8004/api/v1/...
```

### Paso 4: Debugging

Si hay errores:

1. **Verificar token JWT:**
   ```javascript
   // En Chrome DevTools > Application > Local Storage
   localStorage.getItem('access_token')
   ```

2. **Ver errores en consola:**
   ```javascript
   console.log(error?.response?.data)
   ```

3. **Verificar que el backend responde:**
   ```bash
   curl http://localhost:8004/api/v1/public/oficios
   ```

---

## ⚡ Quick Start

Para actualizar rápidamente una página:

1. Copia el ejemplo correspondiente de esta guía
2. Adapta los imports y componentes de UI (shadcn/ui)
3. Reemplaza los `TODO` comments con el código real
4. Prueba en el navegador

---

## 📚 Recursos Adicionales

- [React Query Docs](https://tanstack.com/query/latest)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [shadcn/ui Components](https://ui.shadcn.com/)
- Backend API Docs: http://localhost:8004/docs (cuando Docker esté corriendo)

---

## ✅ Checklist de Integración

- [ ] Perfil Profesional conectado
- [ ] Portfolio con upload funcional
- [ ] Verificación KYC con upload de documentos
- [ ] Ofertas listando correctamente
- [ ] Trabajos listando correctamente
- [ ] Búsqueda de profesionales funcional
- [ ] Perfil público mostrando datos reales
- [ ] Chat con ofertas integradas
- [ ] Todas las mutaciones invalidando queries correctamente
- [ ] Manejo de errores en todas las páginas
- [ ] Loading states en todas las queries
- [ ] Toast notifications funcionando

---

**🎉 ¡Con esta guía puedes conectar todas las páginas al backend!**

Cada ejemplo puede copiarse y adaptarse a tus componentes existentes de shadcn/ui.
