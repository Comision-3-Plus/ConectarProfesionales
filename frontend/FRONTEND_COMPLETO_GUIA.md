# 📱 Frontend Completo - Conectar Profesionales

Este documento detalla TODAS las páginas del frontend necesarias para completar la integración con el backend.

## 🎯 Resumen de Implementación

### ✅ Páginas CREADAS (3/50+)

1. **Cliente - Publicar Proyecto** (`/dashboard/cliente/publicar`)
2. **Cliente - Ver Ofertas** (`/dashboard/cliente/ofertas`)
3. **Cliente - Mis Trabajos** (`/dashboard/cliente/trabajos`)

### 📋 Páginas PENDIENTES por Módulo

---

## 📁 MÓDULO 1: AUTENTICACIÓN Y USUARIOS

### Páginas de Auth (Ya existen parcialmente en `/app/(auth)`)
- ✅ `/login` - Login existente
- ✅ `/register` - Registro existente
- ⚠️ **Mejorar**: Agregar selector de rol (CLIENTE/PROFESIONAL) en registro

### Páginas de Perfil
- 📝 `/dashboard/perfil` - Ver y editar perfil personal
- 📝 `/dashboard/perfil/seguridad` - Cambiar contraseña
- 📝 `/dashboard/perfil/notificaciones` - Preferencias de notificaciones

---

## 📁 MÓDULO 2: PROFESIONALES

### Endpoints del Backend:
- `GET /api/v1/professional/me` - Ver perfil profesional
- `PUT /api/v1/professional/profile` - Actualizar configuración
- `PUT /api/v1/professional/profile/oficios` - Asignar oficios
- `PUT /api/v1/professional/profile/servicios-instant` - Asignar servicios instantáneos
- `PUT /api/v1/professional/profile/location` - Actualizar ubicación
- `PUT /api/v1/professional/payout-info` - Configurar cuenta de pago
- `POST /api/v1/professional/kyc/upload` - Subir documentos KYC

### Páginas Necesarias:

#### `/dashboard/profesional` - Dashboard Principal
- Resumen de métricas (trabajos activos, ingresos, rating)
- Accesos rápidos a todas las secciones

#### `/dashboard/profesional/perfil` - Configuración Profesional
**Componentes:**
- Formulario de configuración básica:
  - Radio de cobertura (km)
  - Acepta trabajos instantáneos (sí/no)
  - Tarifa por hora
- Selector de oficios (múltiple)
- Selector de servicios instantáneos
- Mapa para seleccionar ubicación base
- Configuración de cuenta de pago (CVU/CBU/Alias MP)

#### `/dashboard/profesional/verificacion` - KYC
**Componentes:**
- Upload de documentos (DNI frente/dorso, comprobante de domicilio)
- Estado de verificación (PENDIENTE/EN_REVISION/APROBADO/RECHAZADO)
- Instrucciones claras sobre qué documentos subir

#### `/dashboard/profesional/portfolio` - Gestión de Portfolio
**Componentes:**
- Listado de items de portfolio
- Botón "Crear Nuevo Item"
- Cada item:
  - Título y descripción
  - Galería de imágenes
  - Botón "Agregar Imagen"
  - Botón "Eliminar Item"

#### `/dashboard/profesional/ofertas` - Ofertas Enviadas
**Componentes:**
- Listado de ofertas enviadas
- Filtros por estado (OFERTADO/ACEPTADO/RECHAZADO)
- Vista detallada de cada oferta con:
  - Cliente
  - Chat asociado
  - Descripción y precio
  - Estado actual

#### `/dashboard/profesional/trabajos` - Mis Trabajos
**Componentes:**
- Trabajos activos (PENDIENTE_PAGO, PAGADO_EN_ESCROW)
- Trabajos finalizados (LIBERADO)
- Trabajos cancelados
- Cada trabajo muestra:
  - Cliente
  - Monto
  - Estado del escrow
  - Fecha

---

## 📁 MÓDULO 3: BÚSQUEDA Y EXPLORACIÓN PÚBLICA

### Endpoints del Backend:
- `GET /api/v1/search/professionals` - Buscar profesionales
- `GET /api/v1/public/oficios` - Listar oficios
- `GET /api/v1/public/professional/{id}` - Ver perfil público
- `GET /api/v1/public/professional/{id}/portfolio` - Ver portfolio

### Páginas Necesarias:

#### `/explorar` o `/browse` - Buscar Profesionales
**Componentes:**
- Buscador con filtros:
  - Por oficio (dropdown/select)
  - Por ubicación (input + autocomplete)
  - Radio de búsqueda (km)
- Grid de resultados:
  - Card de cada profesional:
    - Avatar
    - Nombre
    - Rating y cantidad de reseñas
    - Oficios
    - Precio por hora
    - Botón "Ver Perfil"

#### `/profesional/[id]` - Perfil Público del Profesional
**Componentes:**
- Datos básicos (nombre, avatar, rating)
- Oficios que ofrece
- Galería del portfolio
- Listado de reseñas (paginado)
- Botón "Contactar" (abre chat si está autenticado)
- Mapa con ubicación aproximada

---

## 📁 MÓDULO 4: CHAT Y OFERTAS

### Endpoints del Backend:
- `POST /api/v1/professional/ofertas` - Enviar oferta formal
- `POST /api/v1/cliente/ofertas/{id}/accept` - Aceptar oferta
- `POST /api/v1/cliente/ofertas/{id}/reject` - Rechazar oferta

### Páginas Necesarias:

#### `/chat` o `/mensajes` - Listado de Conversaciones
**Componentes:**
- Listado de chats activos
- Cada chat muestra:
  - Avatar del otro usuario
  - Nombre
  - Último mensaje
  - Badge si hay mensajes sin leer

#### `/chat/[chatId]` - Vista de Chat Individual
**Componentes:**
- Encabezado con info del otro usuario
- Área de mensajes (scroll infinito)
- Input para escribir mensaje
- **Para Profesionales**:
  - Botón "Enviar Oferta Formal"
  - Modal para crear oferta con:
    - Descripción
    - Precio
- **Para Clientes**:
  - Tarjetas de ofertas recibidas (inline en el chat)
  - Botones "Aceptar" y "Rechazar"

---

## 📁 MÓDULO 5: PAGOS Y ESCROW

### Endpoints del Backend:
- `POST /api/v1/cliente/ofertas/{id}/accept` → retorna payment_url
- `POST /api/v1/cliente/trabajo/{id}/finalizar` - Liberar pago
- `POST /api/v1/cliente/trabajo/{id}/cancelar` - Solicitar reembolso

### Páginas Necesarias:

#### `/payment/success` - Pago Exitoso
**Componentes:**
- Mensaje de confirmación
- Detalles del trabajo
- Botón "Ir a Mis Trabajos"

#### `/payment/failure` - Pago Fallido
**Componentes:**
- Mensaje de error
- Botón "Reintentar Pago"
- Botón "Volver"

#### `/payment/pending` - Pago Pendiente
**Componentes:**
- Mensaje de espera
- Instrucciones
- Botón "Ver Estado"

---

## 📁 MÓDULO 6: RESEÑAS

### Endpoints del Backend:
- `POST /api/v1/cliente/trabajo/{id}/resena` - Crear reseña
- Reseñas se ven en el perfil público del profesional

### Páginas Necesarias:

#### Diálogo/Modal de Reseña (ya incluido en `/dashboard/cliente/trabajos`)
**Componentes:**
- Selector de estrellas (1-5)
- Textarea para comentario opcional
- Botón "Publicar Reseña"

---

## 📁 MÓDULO 7: GAMIFICACIÓN

### Visible en:
- Perfil del profesional (nivel, puntos, comisión actual)
- Cada trabajo finalizado otorga puntos
- Reseñas 4-5 estrellas otorgan puntos

### Páginas Necesarias:

#### `/dashboard/profesional/gamificacion` - Panel de Gamificación
**Componentes:**
- Nivel actual (BRONCE/PLATA/ORO/PLATINO)
- Barra de progreso hacia el siguiente nivel
- Total de puntos de experiencia
- Comisión actual de la plataforma
- Tabla de niveles con requisitos y beneficios
- Historial de puntos ganados

---

## 📁 MÓDULO 8: ADMINISTRACIÓN

### Endpoints del Backend:
- `GET /api/v1/admin/kyc/pendientes` - KYCs pendientes
- `POST /api/v1/admin/kyc/approve/{id}` - Aprobar KYC
- `POST /api/v1/admin/kyc/reject/{id}` - Rechazar KYC
- `GET /api/v1/admin/users` - Listar usuarios (paginado)
- `GET /api/v1/admin/users/search` - Buscar usuarios por email
- `POST /api/v1/admin/users/{id}/ban` - Banear usuario
- `POST /api/v1/admin/users/{id}/unban` - Desbanear usuario
- `POST /api/v1/admin/oficios` - Crear oficio
- `POST /api/v1/admin/servicios-instant` - Crear servicio instantáneo
- `GET /api/v1/admin/trabajos` - Ver todos los trabajos
- `POST /api/v1/admin/trabajo/{id}/cancelar` - Cancelar trabajo (admin)
- `GET /api/v1/admin/metrics/financials` - Métricas financieras
- `GET /api/v1/admin/metrics/users` - Métricas de usuarios

### Páginas Necesarias:

#### `/dashboard/admin` - Dashboard Principal de Admin
**Componentes:**
- Cards con métricas clave:
  - Total facturado
  - Comisión total
  - Trabajos completados
  - Total clientes
  - Total profesionales
  - Profesionales pendientes KYC
  - Profesionales aprobados
- Gráficos (opcional):
  - Trabajos por mes
  - Ingresos por mes

#### `/dashboard/admin/kyc` - Gestión de Verificaciones KYC
**Componentes:**
- Listado de profesionales en estado EN_REVISION
- Cada item muestra:
  - Nombre y email del profesional
  - Fecha de solicitud
  - Botón "Ver Documentos"
  - Botones "Aprobar" y "Rechazar"
- Modal para ver documentos subidos

#### `/dashboard/admin/usuarios` - Gestión de Usuarios
**Componentes:**
- Buscador por email
- Tabla paginada de usuarios:
  - Email
  - Nombre
  - Rol (CLIENTE/PROFESIONAL/ADMIN)
  - Estado (Activo/Baneado)
  - Fecha de registro
  - Acciones:
    - Ver perfil
    - Banear/Desbanear

#### `/dashboard/admin/oficios` - Gestión de Oficios
**Componentes:**
- Listado de oficios existentes
- Botón "Crear Nuevo Oficio"
- Modal/Form para crear oficio:
  - Nombre
  - Descripción

#### `/dashboard/admin/servicios` - Gestión de Servicios Instantáneos
**Componentes:**
- Filtro por oficio
- Listado de servicios instantáneos
- Botón "Crear Nuevo Servicio"
- Modal/Form para crear servicio:
  - Nombre
  - Descripción
  - Oficio asociado

#### `/dashboard/admin/trabajos` - Monitor de Todos los Trabajos
**Componentes:**
- Tabla de todos los trabajos del sistema
- Filtros:
  - Por estado (PENDIENTE_PAGO/PAGADO_EN_ESCROW/LIBERADO/CANCELADO)
  - Por fecha
  - Por cliente o profesional
- Cada trabajo muestra:
  - ID
  - Cliente
  - Profesional
  - Monto
  - Estado
  - Fecha
  - Acciones:
    - Ver detalles
    - Cancelar (si está en escrow)

---

## 🛠️ COMPONENTES REUTILIZABLES SUGERIDOS

### Componentes UI Base (usar shadcn/ui)
- Button
- Card
- Badge
- Avatar
- Input
- Textarea
- Select
- Dialog/Modal
- Table
- Tabs
- Alert

### Componentes Custom a Crear

#### `<StarRating />` - Selector/Display de Estrellas
```tsx
interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
}
```

#### `<OfertaCard />` - Card de Oferta
```tsx
interface OfertaCardProps {
  oferta: Oferta
  onAccept?: () => void
  onReject?: () => void
  showActions?: boolean
}
```

#### `<TrabajoCard />` - Card de Trabajo
```tsx
interface TrabajoCardProps {
  trabajo: Trabajo
  onFinalizar?: () => void
  onCancelar?: () => void
  onResenar?: () => void
}
```

#### `<ProfessionalCard />` - Card de Profesional (búsqueda)
```tsx
interface ProfessionalCardProps {
  profesional: ProfessionalProfile
  onClick?: () => void
}
```

#### `<PortfolioGallery />` - Galería de Portfolio
```tsx
interface PortfolioGalleryProps {
  items: PortfolioItem[]
  editable?: boolean
  onAdd?: () => void
  onDelete?: (id: string) => void
}
```

#### `<MapSelector />` - Selector de Ubicación en Mapa
```tsx
interface MapSelectorProps {
  lat?: number
  lng?: number
  onChange: (lat: number, lng: number) => void
}
```

---

## 🔗 NAVEGACIÓN SUGERIDA

### Navbar Principal (Público - No autenticado)
- Logo → `/`
- Explorar Profesionales → `/explorar`
- Cómo Funciona → `/como-funciona`
- Blog → `/blog`
- Login → `/login`
- Registrarse → `/register`

### Navbar Autenticado (CLIENTE)
- Logo → `/`
- Dashboard → `/dashboard/cliente`
- Publicar Proyecto → `/dashboard/cliente/publicar`
- Mis Ofertas → `/dashboard/cliente/ofertas`
- Mis Trabajos → `/dashboard/cliente/trabajos`
- Mensajes → `/chat`
- Mi Perfil → `/dashboard/perfil`

### Navbar Autenticado (PROFESIONAL)
- Logo → `/`
- Dashboard → `/dashboard/profesional`
- Mi Perfil → `/dashboard/profesional/perfil`
- Portfolio → `/dashboard/profesional/portfolio`
- Mis Ofertas → `/dashboard/profesional/ofertas`
- Mis Trabajos → `/dashboard/profesional/trabajos`
- Mensajes → `/chat`
- Gamificación → `/dashboard/profesional/gamificacion`

### Navbar Autenticado (ADMIN)
- Logo → `/`
- Dashboard Admin → `/dashboard/admin`
- Verificaciones KYC → `/dashboard/admin/kyc`
- Usuarios → `/dashboard/admin/usuarios`
- Oficios → `/dashboard/admin/oficios`
- Servicios → `/dashboard/admin/servicios`
- Trabajos → `/dashboard/admin/trabajos`

---

## 📦 ESTRUCTURA DE CARPETAS SUGERIDA

```
frontend/app/
├── (auth)/
│   ├── login/
│   └── register/
├── (public)/
│   ├── explorar/
│   ├── profesional/[id]/
│   ├── como-funciona/
│   └── ...
├── (dashboard)/
│   └── dashboard/
│       ├── cliente/
│       │   ├── page.tsx (dashboard)
│       │   ├── publicar/
│       │   ├── ofertas/
│       │   └── trabajos/
│       ├── profesional/
│       │   ├── page.tsx (dashboard)
│       │   ├── perfil/
│       │   ├── verificacion/
│       │   ├── portfolio/
│       │   ├── ofertas/
│       │   ├── trabajos/
│       │   └── gamificacion/
│       ├── admin/
│       │   ├── page.tsx (dashboard)
│       │   ├── kyc/
│       │   ├── usuarios/
│       │   ├── oficios/
│       │   ├── servicios/
│       │   └── trabajos/
│       └── perfil/
├── chat/
│   ├── page.tsx (listado)
│   └── [chatId]/
├── payment/
│   ├── success/
│   ├── failure/
│   └── pending/
└── components/
    ├── ui/ (shadcn)
    └── custom/
        ├── StarRating.tsx
        ├── OfertaCard.tsx
        ├── TrabajoCard.tsx
        ├── ProfessionalCard.tsx
        ├── PortfolioGallery.tsx
        └── MapSelector.tsx
```

---

## 🔌 INTEGRACIÓN CON API

### Setup de Autenticación
```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004'

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token') // o cookies
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}
```

### Hooks Personalizados Sugeridos
```typescript
// hooks/useOfertas.ts
export function useOfertas() {
  const [ofertas, setOfertas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAPI('/api/v1/cliente/ofertas')
      .then(setOfertas)
      .finally(() => setLoading(false))
  }, [])

  return { ofertas, loading }
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Módulo por Módulo

#### ✅ Autenticación (Módulo 1)
- [ ] Mejorar registro con selector de rol
- [ ] Página de perfil personal
- [ ] Cambio de contraseña
- [ ] Preferencias de notificaciones

#### 🔶 Profesionales (Módulo 2)
- [ ] Dashboard profesional
- [ ] Configuración de perfil
- [ ] Gestión de portfolio
- [ ] Verificación KYC
- [ ] Mis ofertas enviadas
- [ ] Mis trabajos

#### 🔶 Búsqueda Pública (Módulo 3)
- [ ] Página de exploración/búsqueda
- [ ] Perfil público del profesional

#### 🔶 Chat y Ofertas (Módulo 4)
- [ ] Listado de chats
- [ ] Vista de chat individual
- [ ] Envío de ofertas desde chat
- [ ] Aceptar/Rechazar ofertas desde chat

#### ✅ Pagos (Módulo 5) - Parcialmente implementado
- [ ] Página de pago exitoso
- [ ] Página de pago fallido
- [ ] Página de pago pendiente

#### ✅ Reseñas (Módulo 6) - UI implementada en trabajos
- [x] Modal de crear reseña

#### 🔶 Gamificación (Módulo 7)
- [ ] Panel de gamificación profesional

#### 🔶 Administración (Módulo 8)
- [ ] Dashboard admin con métricas
- [ ] Gestión de KYC
- [ ] Gestión de usuarios (ban/unban)
- [ ] Gestión de oficios
- [ ] Gestión de servicios instantáneos
- [ ] Monitor de trabajos

---

## 🚀 PRÓXIMOS PASOS

1. **Prioridad Alta**: Completar páginas de CLIENTE
   - ✅ Publicar proyecto
   - ✅ Ver ofertas
   - ✅ Gestionar trabajos

2. **Prioridad Alta**: Completar páginas de PROFESIONAL
   - Perfil y configuración
   - Portfolio
   - KYC

3. **Prioridad Media**: Búsqueda y perfiles públicos
   - Explorar profesionales
   - Ver perfil público

4. **Prioridad Media**: Chat
   - Implementar interfaz de chat
   - Integración con Firestore

5. **Prioridad Baja**: Admin
   - Dashboard y métricas
   - Gestión completa

---

## 📚 RECURSOS Y LIBRERÍAS RECOMENDADAS

- **UI**: shadcn/ui (ya instalado)
- **Formularios**: react-hook-form + zod
- **Mapas**: react-leaflet o @react-google-maps/api
- **Chat**: Firebase SDK
- **Paginación**: Implementación custom o use-pagination
- **Upload**: react-dropzone
- **Notificaciones**: sonner o react-hot-toast
- **Gráficos** (admin): recharts o chart.js

---

¿Quieres que continúe implementando más páginas completas? Puedo crear:
1. Más páginas de cliente
2. Todas las páginas de profesional
3. Las páginas de búsqueda/exploración
4. El sistema de chat
5. El panel de administración completo

Dime qué prefieres y seguiré implementando. 🚀
