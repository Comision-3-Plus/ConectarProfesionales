# 🔌 Snippets de Integración - Copy & Paste

Este archivo contiene código **listo para copiar** para integrar cada página específica.

---

## 📄 /dashboard/profesional/perfil/page.tsx

### Reemplazar imports:
```typescript
// Eliminar:
import { useState, useEffect } from "react"

// Agregar:
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { professionalService } from "@/lib/services/professionalService"
import { publicService } from "@/lib/services/publicService"
import { toast } from "sonner"
```

### Reemplazar queries de datos:
```typescript
// Eliminar el mock data y useEffect

// Agregar queries:
const queryClient = useQueryClient()

const { data: profile, isLoading: loadingProfile } = useQuery({
  queryKey: ['professional-profile'],
  queryFn: professionalService.getMe,
})

const { data: oficios, isLoading: loadingOficios } = useQuery({
  queryKey: ['oficios'],
  queryFn: publicService.getOficios,
  staleTime: 300000,
})
```

### Agregar mutations:
```typescript
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

const updateOficiosMutation = useMutation({
  mutationFn: (oficio_ids: string[]) => 
    professionalService.updateOficios({ oficio_ids }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
    toast.success('Oficios actualizados')
  },
})

const updateLocationMutation = useMutation({
  mutationFn: (data: { latitude: number; longitude: number }) => 
    professionalService.updateLocation(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
    toast.success('Ubicación actualizada')
  },
})

const updatePayoutMutation = useMutation({
  mutationFn: (data: { payout_account: string }) => 
    professionalService.updatePayoutInfo(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
    toast.success('Datos de pago actualizados')
  },
})
```

### Actualizar handlers:
```typescript
// En los botones de guardar, cambiar de:
// onClick={handleSave}

// A:
onClick={() => updateTarifaMutation.mutate(Number(tarifaValue))}
disabled={updateTarifaMutation.isPending}
```

---

## 📄 /dashboard/profesional/portfolio/page.tsx

### Imports:
```typescript
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { professionalService } from "@/lib/services/professionalService"
import { toast } from "sonner"
```

### Queries:
```typescript
const queryClient = useQueryClient()

const { data: portfolio, isLoading } = useQuery({
  queryKey: ['professional-portfolio'],
  queryFn: professionalService.listPortfolio,
})
```

### Mutations:
```typescript
const createMutation = useMutation({
  mutationFn: async (data: { titulo: string; descripcion: string; imagenes: File[] }) => {
    // 1. Crear item
    const item = await professionalService.createPortfolioItem({
      titulo: data.titulo,
      descripcion: data.descripcion,
    })
    
    // 2. Subir imágenes
    for (const imagen of data.imagenes) {
      await professionalService.uploadPortfolioImage(item.id, imagen)
    }
    
    return item
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['professional-portfolio'] })
    toast.success('Item creado')
  },
})

const deleteMutation = useMutation({
  mutationFn: (itemId: string) => professionalService.deletePortfolioItem(itemId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['professional-portfolio'] })
    toast.success('Item eliminado')
  },
})
```

### Handler de creación:
```typescript
const handleCreate = () => {
  if (!titulo || !descripcion) {
    toast.error('Completa todos los campos')
    return
  }
  
  createMutation.mutate({ titulo, descripcion, imagenes })
}
```

---

## 📄 /dashboard/profesional/verificacion/page.tsx

### Imports:
```typescript
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { professionalService } from "@/lib/services/professionalService"
import { toast } from "sonner"
```

### Query:
```typescript
const queryClient = useQueryClient()

const { data: profile, isLoading } = useQuery({
  queryKey: ['professional-profile'],
  queryFn: professionalService.getMe,
})
```

### Mutation:
```typescript
const uploadKYCMutation = useMutation({
  mutationFn: (files: File[]) => professionalService.uploadKYC(files),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
    toast.success('Documentos subidos correctamente')
  },
  onError: (error: any) => {
    toast.error(error?.response?.data?.detail || 'Error al subir documentos')
  },
})
```

### Handler:
```typescript
const handleUpload = (tipo: 'DNI_FRENTE' | 'DNI_DORSO' | 'COMPROBANTE') => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      // Validar tamaño (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo es muy grande (max 5MB)')
        return
      }
      uploadKYCMutation.mutate([file])
    }
  }
  input.click()
}
```

### Mostrar estado:
```typescript
{profile?.kyc_status === 'APROBADO' && (
  <Badge className="bg-green-500">✅ Verificado</Badge>
)}
{profile?.kyc_status === 'EN_REVISION' && (
  <Badge className="bg-yellow-500">⏳ En Revisión</Badge>
)}
{profile?.kyc_status === 'RECHAZADO' && (
  <Badge className="bg-red-500">❌ Rechazado</Badge>
)}
```

---

## 📄 /dashboard/profesional/ofertas/page.tsx

### Imports:
```typescript
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { professionalService } from "@/lib/services/professionalService"
```

### Query:
```typescript
const [estadoFilter, setEstadoFilter] = useState('TODOS')

const { data: ofertas, isLoading } = useQuery({
  queryKey: ['professional-ofertas'],
  queryFn: professionalService.listOfertas,
})

// Filtrar en el cliente
const ofertasFiltradas = ofertas?.filter(o => 
  estadoFilter === 'TODOS' || o.estado === estadoFilter
)
```

### Renderizado:
```typescript
{isLoading ? (
  <Loader2 className="animate-spin" />
) : (
  ofertasFiltradas?.map(oferta => (
    <Card key={oferta.id}>
      <CardHeader>
        <CardTitle>{oferta.descripcion}</CardTitle>
        <Badge>{oferta.estado}</Badge>
      </CardHeader>
      <CardContent>
        <p>Precio: ${oferta.precio_ofertado}</p>
        <p>Cliente: {oferta.cliente_id}</p>
        <Link href={`/chat/${oferta.cliente_id}`}>Ir al Chat</Link>
      </CardContent>
    </Card>
  ))
)}
```

---

## 📄 /dashboard/profesional/trabajos/page.tsx

### Imports:
```typescript
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { professionalService } from "@/lib/services/professionalService"
```

### Query:
```typescript
const { data: trabajos, isLoading } = useQuery({
  queryKey: ['professional-trabajos'],
  queryFn: professionalService.listTrabajos,
})

// Separar por tabs
const trabajosActivos = trabajos?.filter(t => 
  t.estado === 'PENDIENTE_PAGO' || t.estado === 'PAGADO_EN_ESCROW'
)
const trabajosFinalizados = trabajos?.filter(t => t.estado === 'LIBERADO')
const trabajosCancelados = trabajos?.filter(t => t.estado === 'CANCELADO')
```

### Renderizado con Tabs:
```typescript
<Tabs defaultValue="activos">
  <TabsList>
    <TabsTrigger value="activos">Activos ({trabajosActivos?.length})</TabsTrigger>
    <TabsTrigger value="finalizados">Finalizados ({trabajosFinalizados?.length})</TabsTrigger>
    <TabsTrigger value="cancelados">Cancelados ({trabajosCancelados?.length})</TabsTrigger>
  </TabsList>

  <TabsContent value="activos">
    {trabajosActivos?.map(trabajo => (
      <Card key={trabajo.id}>
        <CardHeader>
          <Badge>{trabajo.estado}</Badge>
        </CardHeader>
        <CardContent>
          <p>Precio: ${trabajo.precio_final}</p>
          <p>Cliente: {trabajo.cliente_id}</p>
        </CardContent>
      </Card>
    ))}
  </TabsContent>
  
  {/* Repetir para otros tabs */}
</Tabs>
```

---

## 📄 /(public)/explorar/page.tsx

### Imports:
```typescript
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { searchService } from "@/lib/services/searchService"
import { publicService } from "@/lib/services/publicService"
```

### Queries:
```typescript
const [oficio, setOficio] = useState('')
const [radioKm, setRadioKm] = useState(10)
const [lat, setLat] = useState(-34.6037)
const [lng, setLng] = useState(-58.3816)

// Oficios para el filtro
const { data: oficios } = useQuery({
  queryKey: ['oficios'],
  queryFn: publicService.getOficios,
  staleTime: 300000,
})

// Búsqueda de profesionales
const { data: profesionales, isLoading, refetch } = useQuery({
  queryKey: ['search', oficio, radioKm, lat, lng],
  queryFn: () => searchService.searchProfessionals({
    oficio_nombre: oficio,
    latitud_cliente: lat,
    longitud_cliente: lng,
    radio_km: radioKm,
  }),
  enabled: !!oficio, // Solo buscar si hay oficio
})
```

### Filtros:
```typescript
<Select value={oficio} onValueChange={setOficio}>
  <SelectTrigger>
    <SelectValue placeholder="Selecciona un oficio" />
  </SelectTrigger>
  <SelectContent>
    {oficios?.map(o => (
      <SelectItem key={o.id} value={o.nombre}>{o.nombre}</SelectItem>
    ))}
  </SelectContent>
</Select>

<Input
  type="number"
  placeholder="Radio (km)"
  value={radioKm}
  onChange={(e) => setRadioKm(Number(e.target.value))}
/>

<Button onClick={() => refetch()}>Buscar</Button>
```

### Resultados:
```typescript
<div className="grid grid-cols-3 gap-4">
  {profesionales?.map(prof => (
    <Card key={prof.id}>
      <CardHeader>
        <CardTitle>{prof.nombre}</CardTitle>
        {prof.kyc_aprobado && <Badge>✅ Verificado</Badge>}
      </CardHeader>
      <CardContent>
        <p>Tarifa: ${prof.tarifa_por_hora}/hora</p>
        <p>Rating: {prof.rating_promedio || 'Sin calificación'}</p>
        <p>Distancia: {prof.distancia_km?.toFixed(1)} km</p>
        <Button asChild>
          <Link href={`/profesional/${prof.id}`}>Ver Perfil</Link>
        </Button>
      </CardContent>
    </Card>
  ))}
</div>
```

---

## 📄 /(public)/profesional/[id]/page.tsx

### Imports:
```typescript
import { useQuery } from "@tanstack/react-query"
import { publicService } from "@/lib/services/publicService"
```

### Queries:
```typescript
const { data: profile, isLoading } = useQuery({
  queryKey: ['professional-profile', params.id],
  queryFn: () => publicService.getProfessionalProfile(params.id),
})

const { data: portfolio } = useQuery({
  queryKey: ['professional-portfolio', params.id],
  queryFn: () => publicService.getProfessionalPortfolio(params.id),
})
```

### Renderizado:
```typescript
{isLoading ? (
  <Loader2 className="animate-spin" />
) : (
  <div>
    <h1>{profile?.nombre}</h1>
    {profile?.kyc_aprobado && <Badge>✅ Verificado</Badge>}
    <p>Tarifa: ${profile?.tarifa_por_hora}/hora</p>
    <p>Rating: {profile?.rating_promedio || 'Sin calificación'}</p>
    <p>Trabajos completados: {profile?.trabajos_completados}</p>
    
    {/* Portfolio */}
    <div className="grid grid-cols-3 gap-4">
      {portfolio?.map(item => (
        <Card key={item.id}>
          <img src={item.imagen_url} alt={item.titulo} />
          <CardHeader>
            <CardTitle>{item.titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{item.descripcion}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)}
```

---

## 📄 /chat/[chatId]/page.tsx

### Imports:
```typescript
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { professionalService } from "@/lib/services/professionalService"
import { clienteService } from "@/lib/services/clienteService"
import { toast } from "sonner"
```

### Determinar rol:
```typescript
// Asume que tienes un hook o context para el usuario
const { user } = useUser() // { id, rol: 'PROFESIONAL' | 'CLIENTE' }
const isProfesional = user?.rol === 'PROFESIONAL'
const isCliente = user?.rol === 'CLIENTE'
```

### Queries y Mutations:
```typescript
const queryClient = useQueryClient()

// Listar ofertas
const { data: ofertas } = useQuery({
  queryKey: ['ofertas', params.chatId],
  queryFn: () => 
    isProfesional 
      ? professionalService.listOfertas() 
      : clienteService.listOfertas(),
})

// Crear oferta (profesional)
const createOfertaMutation = useMutation({
  mutationFn: (data: { descripcion: string; precio: number }) => 
    professionalService.createOferta({
      cliente_id: params.chatId, // O extraer del chat
      descripcion: data.descripcion,
      precio_ofertado: data.precio,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['ofertas'] })
    toast.success('Oferta enviada')
  },
})

// Aceptar oferta (cliente)
const acceptOfertaMutation = useMutation({
  mutationFn: (ofertaId: string) => clienteService.acceptOferta(ofertaId),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['ofertas'] })
    toast.success('Oferta aceptada - Redirigiendo a pago...')
    window.open(data.payment_url, '_blank')
  },
})

// Rechazar oferta (cliente)
const rejectOfertaMutation = useMutation({
  mutationFn: (ofertaId: string) => clienteService.rejectOferta(ofertaId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['ofertas'] })
    toast.success('Oferta rechazada')
  },
})
```

### Renderizado de ofertas:
```typescript
{ofertas?.map(oferta => (
  <Card key={oferta.id} className="border-l-4 border-purple-500">
    <CardHeader>
      <CardTitle>Oferta Formal</CardTitle>
      <Badge>{oferta.estado}</Badge>
    </CardHeader>
    <CardContent>
      <p>{oferta.descripcion}</p>
      <p className="text-2xl font-bold">${oferta.precio_ofertado}</p>
      
      {isCliente && oferta.estado === 'OFERTADO' && (
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={() => acceptOfertaMutation.mutate(oferta.id)}
            disabled={acceptOfertaMutation.isPending}
          >
            Aceptar y Pagar
          </Button>
          <Button 
            variant="outline"
            onClick={() => rejectOfertaMutation.mutate(oferta.id)}
            disabled={rejectOfertaMutation.isPending}
          >
            Rechazar
          </Button>
        </div>
      )}
      
      {oferta.estado === 'ACEPTADO' && (
        <p className="text-green-600">✅ Aceptada - Trabajo creado</p>
      )}
    </CardContent>
  </Card>
))}

{/* Botón para crear oferta (solo profesional) */}
{isProfesional && (
  <Button onClick={() => setShowCreateDialog(true)}>
    Enviar Oferta Formal
  </Button>
)}
```

---

## 🎯 Patrón General

Para CUALQUIER página:

1. **Imports:**
   ```typescript
   import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
   import { service } from "@/lib/services/service"
   import { toast } from "sonner"
   ```

2. **Setup:**
   ```typescript
   const queryClient = useQueryClient()
   ```

3. **Query:**
   ```typescript
   const { data, isLoading } = useQuery({
     queryKey: ['key'],
     queryFn: service.method,
   })
   ```

4. **Mutation:**
   ```typescript
   const mutation = useMutation({
     mutationFn: (data) => service.method(data),
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['key'] })
       toast.success('Éxito')
     },
   })
   ```

5. **Usar en JSX:**
   ```typescript
   <Button 
     onClick={() => mutation.mutate(data)}
     disabled={mutation.isPending}
   >
     {mutation.isPending ? 'Cargando...' : 'Guardar'}
   </Button>
   ```

---

## ✅ Checklist por Página

Cuando integres una página, verifica:

- [ ] Imports correctos
- [ ] useQueryClient inicializado
- [ ] Queries con queryKey único
- [ ] Mutations con onSuccess/onError
- [ ] invalidateQueries en onSuccess
- [ ] toast.success/error en callbacks
- [ ] disabled={mutation.isPending} en botones
- [ ] Loading state con isLoading
- [ ] Mock data eliminado
- [ ] TODO comments eliminados

---

**¡Con estos snippets puedes integrar todas las páginas en minutos! 🚀**
