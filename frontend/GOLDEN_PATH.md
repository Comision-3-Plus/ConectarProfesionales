# 🌟 Golden Path - Patrón de Arquitectura Limpia

## 📚 Módulo de Referencia: Autenticación (Registro)

Este documento describe el **patrón estándar** que debe seguirse para refactorizar el resto de la aplicación.

---

## 🎯 Principios Fundamentales

### 1. **Separación de Responsabilidades**
- ✅ **Páginas**: Solo presentación y enrutamiento (< 30 líneas)
- ✅ **Componentes Feature**: Lógica de UI y orquestación
- ✅ **Componentes UI**: Componentes "tontos" reutilizables
- ✅ **Hooks**: Lógica de negocio y estado
- ✅ **Servicios**: Comunicación con el backend

### 2. **Stack de Estado**
- ✅ **Zustand**: Estado global persistente (auth, user, config)
- ✅ **React Query**: Estado del servidor (queries, mutations, cache)
- ❌ **NO useState** para datos de servidor
- ❌ **NO useEffect** para fetching

### 3. **Validación y Formularios**
- ✅ **react-hook-form**: Manejo de formularios
- ✅ **Zod**: Validación de schemas
- ✅ Schemas en `/types/forms`

---

## 📁 Estructura de Archivos

```
frontend/
├── app/
│   └── (auth)/
│       └── register/
│           └── page.tsx              ← 📄 PÁGINA LIMPIA (20 líneas)
│
├── components/
│   ├── features/
│   │   └── auth/
│   │       ├── index.ts              ← Barrel export
│   │       ├── RegisterForm.tsx      ← 🧠 COMPONENTE INTELIGENTE
│   │       └── AuthLayout.tsx        ← 🎨 LAYOUT REUTILIZABLE
│   │
│   └── ui/
│       ├── input-with-icon.tsx       ← 🎭 COMPONENTE TONTO
│       └── password-input.tsx        ← 🎭 COMPONENTE TONTO
│
├── hooks/
│   └── auth/
│       ├── index.ts                  ← Barrel export
│       ├── useRegister.ts            ← 🔧 MUTATION HOOK
│       └── useOficios.ts             ← 🔧 QUERY HOOK
│
├── lib/
│   └── services/
│       └── authService.ts            ← 🌐 API SERVICE
│
├── types/
│   ├── index.ts                      ← Tipos base
│   └── forms/
│       ├── index.ts                  ← Barrel export
│       └── auth.ts                   ← 📋 SCHEMAS DE FORMULARIOS
│
└── store/
    └── authStore.ts                  ← 🗄️ ZUSTAND STORE
```

---

## 🔧 Anatomía de un Módulo (Paso a Paso)

### **PASO 1: Crear los Tipos** (`/types/forms/`)

```typescript
// types/forms/auth.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  // ... más campos
}).refine(/* validaciones custom */);

export type RegisterFormData = z.infer<typeof registerSchema>;
```

**✅ Responsabilidad**: Validación y tipado
**❌ NO incluir**: Lógica de negocio, API calls

---

### **PASO 2: Crear Hooks de Negocio** (`/hooks/`)

#### **Mutation Hook** (para POST, PUT, DELETE)
```typescript
// hooks/auth/useRegister.ts
import { useMutation } from '@tanstack/react-query';

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: UserCreate) => {
      return await authService.register(data);
    },
    onSuccess: () => {
      toast.success('¡Éxito!');
      router.push('/login');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
```

#### **Query Hook** (para GET)
```typescript
// hooks/auth/useOficios.ts
import { useQuery } from '@tanstack/react-query';

export function useOficios() {
  return useQuery({
    queryKey: ['oficios'],
    queryFn: () => oficiosService.getAll(),
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}
```

**✅ Responsabilidad**: Lógica de negocio, manejo de estados
**❌ NO incluir**: JSX, estilos, componentes

---

### **PASO 3: Crear Componentes UI Tontos** (`/components/ui/`)

```typescript
// components/ui/input-with-icon.tsx
import { Input } from './input';
import type { LucideIcon } from 'lucide-react';

interface InputWithIconProps {
  icon: LucideIcon;
  error?: boolean;
  // ... más props de Input
}

export const InputWithIcon = ({ icon: Icon, error, ...props }) => {
  return (
    <div className="relative">
      <Icon className="absolute left-3 ..." />
      <Input className={error ? 'border-red-500' : ''} {...props} />
    </div>
  );
};
```

**✅ Responsabilidad**: Solo presentación visual
**❌ NO incluir**: Lógica de negocio, API calls, useState complejo

---

### **PASO 4: Crear Componente Feature Inteligente** (`/components/features/`)

```typescript
// components/features/auth/RegisterForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister, useOficios } from '@/hooks/auth';
import { registerSchema } from '@/types/forms';

export function RegisterForm() {
  // 🔧 Hooks de negocio
  const { mutate: register, isPending } = useRegister();
  const { data: oficios } = useOficios();
  
  // 📝 Form handling
  const { register: field, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  // 🎯 Handler
  const onSubmit = (data) => {
    register(data);
  };

  // 🎨 UI con componentes tontos
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputWithIcon icon={Mail} {...field('email')} error={!!errors.email} />
      <PasswordInput {...field('password')} error={!!errors.password} />
      <Button type="submit" disabled={isPending}>Registrar</Button>
    </form>
  );
}
```

**✅ Responsabilidad**: Orquestación de lógica y UI
**❌ NO incluir**: Estilos complejos inline, fetching manual

---

### **PASO 5: Crear Página Limpia** (`/app/`)

```typescript
// app/(auth)/register/page.tsx
import { AuthLayout, RegisterForm } from '@/components/features/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registro | App',
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
```

**✅ Responsabilidad**: Solo routing y metadata
**❌ NO incluir**: Lógica, hooks, estilos complejos

---

## ✅ Checklist de Refactorización

Cuando refactorices un módulo, verifica:

- [ ] **Página** tiene menos de 30 líneas
- [ ] **No hay `useState`** para datos de servidor en la página
- [ ] **No hay `useEffect`** para fetching en componentes
- [ ] **React Query** se usa para todas las queries/mutations
- [ ] **Formularios** usan react-hook-form + Zod
- [ ] **Componentes UI** son "tontos" (solo props in, JSX out)
- [ ] **Componentes Feature** orquestan hooks y UI
- [ ] **Hooks** están en carpetas por módulo (`/hooks/auth/`, `/hooks/profile/`)
- [ ] **Tipos** están centralizados en `/types/`
- [ ] **Estilos visuales** se preservan (mismo Tailwind)
- [ ] **Barrel exports** (`index.ts`) en cada carpeta

---

## 🎯 Próximos Módulos a Refactorizar

Aplica este mismo patrón a:

1. ✅ **Auth** (Login, Register) - COMPLETADO ✨
2. ✅ **Perfil** (EditarPerfil) - COMPLETADO ✨
3. ✅ **Búsqueda** (Explorar Profesionales) - COMPLETADO 🚀
4. ✅ **Ofertas** (Crear oferta, aceptar/rechazar oferta) - COMPLETADO 💰
5. ✅ **Pagos** (Historial de pagos, balance, liberar/reembolsar) - COMPLETADO 💳
6. ⏳ **Chat** (Lista de chats, ventana de chat)

---

## � Caso de Estudio: Pagos con Mutations Interactivas

El módulo de **Pagos** demuestra mutation hooks con confirmaciones y validaciones complejas.

### 📊 Estadísticas de Refactorización

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Página creada** | 0 | 31 líneas | **Nueva funcionalidad** |
| **Componentes creados** | 1 | 3 | **BalanceCard + PaymentHistoryList + TransactionCard refactorizado** |
| **Hooks creados** | 0 | 6 | **3 queries + 2 mutations + 1 admin** |
| **Componentes con lógica** | 1 (TransactionCard) | 0 | **Toda lógica en hooks** |
| **useState para fetching** | N/A | 0 | **100% React Query** |

### 🏗️ Arquitectura del Módulo

```
payments/
├── types/forms/payments.ts          ← Enums + Configs + Schemas + Helpers
├── hooks/payments/
│   ├── usePaymentHistory.ts         ← GET /pagos/historial (filtros, paginación)
│   ├── useMyTransactions.ts         ← GET /pagos/mis-transacciones
│   ├── useBalance.ts                ← GET /pagos/balance (profesional)
│   ├── useReleasePayment.ts         ← POST /transacciones/:id/liberar (cliente)
│   ├── useRequestRefund.ts          ← POST /transacciones/:id/reembolso (cliente)
│   └── useAdminPaymentStats.ts      ← GET /admin/pagos/dashboard
├── components/features/payments/
│   ├── BalanceCard.tsx              ← Balance del profesional (4 métricas)
│   ├── PaymentHistoryList.tsx       ← Historial con filtros + paginación
│   └── TransactionCard.tsx          ← Card refactorizada con mutations
└── app/dashboard/profesional/pagos/
    └── page.tsx                     ← 31 líneas (solo importa componentes)
```

### 🔑 Patrón Especial: Mutation con Confirmación en Dialog

#### Problema
Solicitar un reembolso requiere un **motivo detallado** (mínimo 20 caracteres).  
Mostrar un dialog de confirmación con validación es más user-friendly que un prompt.

#### Solución con Estado Local + Mutation Hook

```typescript
// TransactionCard.tsx (refactorizado)
export function TransactionCard({ transaction, userRole }: Props) {
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  
  // 🔧 Mutation hook
  const { mutate: requestRefund, isPending } = useRequestRefund();

  const handleRequestRefund = () => {
    if (refundReason.length < 20) return;
    
    requestRefund({
      transactionId: transaction.id,
      motivo: refundReason,
    }, {
      onSuccess: () => {
        setRefundDialogOpen(false);  // ✅ Cierra dialog
        setRefundReason('');          // ✅ Limpia formulario
      },
    });
  };

  return (
    <>
      <Card>
        {/* ... transaction info ... */}
        <Button onClick={() => setRefundDialogOpen(true)}>
          Solicitar Reembolso
        </Button>
      </Card>

      {/* Dialog controlado */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <Textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
          />
          <Button
            onClick={handleRequestRefund}
            disabled={isPending || refundReason.length < 20}
          >
            {isPending ? 'Enviando...' : 'Solicitar Reembolso'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### 📝 Técnicas Aplicadas

#### 1. **Helpers Centralizados** (DRY para formateo)

```typescript
// types/forms/payments.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
}

export function calculateCommission(amount: number, rate = 0.15): number {
  return amount * rate;
}

// Uso en componentes
import { formatCurrency, calculateCommission } from '@/types/forms/payments';

<p>{formatCurrency(balance.disponible)}</p>
<p>Comisión: {formatCurrency(calculateCommission(monto))}</p>
```

#### 2. **Configs de Estado Extensibles**

```typescript
export const estadoTransaccionConfig = {
  pendiente: {
    label: 'Pendiente de Pago',
    color: 'bg-orange-100 text-orange-800',
    icon: Clock,
    description: 'Esperando confirmación de pago',
  },
  completado: {
    label: 'Completado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Pago procesado exitosamente',
  },
  // ... más estados
};

// Uso en componentes
const config = estadoTransaccionConfig[transaction.estado];
<Badge className={config.color}>
  <Icon className="..." />
  {config.label}
</Badge>
```

#### 3. **Composición de Componentes Inteligentes**

```typescript
// page.tsx - 31 LÍNEAS TOTAL
export default function PagosPage() {
  return (
    <div>
      <BalanceCard />           {/* Hook: useBalance */}
      <PaymentHistoryList />    {/* Hook: usePaymentHistory */}
    </div>
  );
}
```

Cada componente maneja su propio estado del servidor (React Query).  
La página solo orquesta la composición visual.

#### 4. **Invalidaciones Múltiples y Sincronizadas**

```typescript
// useReleasePayment.ts
export function useReleasePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId) => paymentService.releasePayment(transactionId),
    onSuccess: () => {
      // ✅ Invalida TODAS las vistas afectadas
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
      
      toast.success('Pago liberado exitosamente');
    },
  });
}
```

**Resultado**: Cambiar estado de una transacción actualiza:
- Lista de transacciones
- Historial de pagos
- Balance disponible
- Dashboard financiero

#### 5. **Filtros con QueryKey Dinámica**

```typescript
// usePaymentHistory.ts
queryKey: ['payment-history', filters?.tipo, filters?.desde, filters?.hasta, filters?.page, filters?.limit],
```

Cada combinación de filtros genera una cache entry diferente:
- `['payment-history', 'ingreso', undefined, undefined, 1, 20]`
- `['payment-history', 'egreso', '2024-01-01', '2024-12-31', 1, 20]`

Cambiar filtros = nueva query. Volver a filtros anteriores = cache instantánea.

### 💡 Lecciones Clave

1. **Dialogs controlados**: `useState` local para UI, mutations para API.
2. **Helpers reutilizables**: Formateo y cálculos centralizados en types.
3. **Configs extensibles**: Mapeos de estado con iconos, colores, labels.
4. **Invalidaciones masivas**: Una mutation puede invalidar 4+ queries.
5. **Composición limpia**: Páginas de 30 líneas con componentes inteligentes.

---

## �🚀 Caso de Estudio: Ofertas con Redirección Externa

El módulo de **Ofertas** demuestra cómo manejar mutations con redirecciones externas (MercadoPago).

### 📊 Estadísticas de Refactorización

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Líneas de código (página)** | 211 | 170 | **19% menos** |
| **useState en página** | 1 | 1 | Sin cambio (UI state) |
| **useQuery manual** | 1 | 0 | **100% menos** |
| **Hardcoded configs** | 3 maps | 0 | Centralizado en types |
| **Componentes creados** | 0 | 1 | **CreateOfertaDialog** |
| **Hooks creados** | 0 | 5 | **2 queries + 3 mutations** |

### 🏗️ Arquitectura del Módulo

```
ofertas/
├── types/forms/ofertas.ts          ← Schemas + EstadoOferta enum + estadoOfertaConfig
├── hooks/ofertas/
│   ├── useOfertas.ts               ← GET /ofertas (todas las ofertas del usuario)
│   ├── useOfertasByChat.ts         ← GET /ofertas/chat/:chatId (ofertas de un chat)
│   ├── useCreateOferta.ts          ← POST /ofertas
│   ├── useAcceptOferta.ts          ← PUT /ofertas/:id/accept ⚡ CON REDIRECT
│   └── useRejectOferta.ts          ← POST /ofertas/:id/reject
├── components/features/ofertas/
│   └── CreateOfertaDialog.tsx      ← Dialog con form (185 líneas)
└── app/dashboard/profesional/ofertas/
    └── page.tsx                    ← 170 líneas (refactorizada)
```

### 🔑 Patrón Especial: Mutation con Redirección Externa

#### Problema
Cuando un cliente acepta una oferta, el backend crea:
1. Un **Trabajo** en la BD
2. Una **Preferencia de Pago** en MercadoPago
3. Devuelve un `payment_url` para redirigir al usuario

#### Solución con React Query

```typescript
// hooks/ofertas/useAcceptOferta.ts
export function useAcceptOferta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ofertaId: string) => {
      const response = await ofertasService.acceptOferta(ofertaId);
      return response; // { payment_url: "https://mercadopago.com/..." }
    },
    onSuccess: (data) => {
      // 1. Invalidar queries para refrescar listas
      queryClient.invalidateQueries({ queryKey: ['ofertas'] });
      queryClient.invalidateQueries({ queryKey: ['ofertas', 'chat'] });
      
      // 2. Toast informativo
      toast.success('Oferta aceptada. Redirigiendo al pago...', {
        description: 'Serás redirigido a MercadoPago para completar el pago',
      });
      
      // 3. 🔥 REDIRECCIÓN EXTERNA después de 2s
      setTimeout(() => {
        window.location.href = data.payment_url;
      }, 2000);
    },
  });
}
```

**Uso en componente**:
```typescript
const { mutate: acceptOferta, isPending } = useAcceptOferta();

<Button 
  onClick={() => acceptOferta(oferta.id)}
  disabled={isPending}
>
  {isPending ? 'Procesando...' : 'Aceptar y Pagar'}
</Button>
```

### 📝 Técnicas Aplicadas

#### 1. **Tipos Centralizados con Config** (DRY Principle)

```typescript
// types/forms/ofertas.ts
export enum EstadoOferta {
  OFERTADO = 'OFERTADO',
  ACEPTADO = 'ACEPTADO',
  RECHAZADO = 'RECHAZADO',
  EXPIRADO = 'EXPIRADO',
}

export const estadoOfertaConfig = {
  [EstadoOferta.OFERTADO]: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  [EstadoOferta.ACEPTADO]: {
    label: 'Aceptada',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
  },
  // ... otros estados
};
```

**Beneficio**: Cambiar colores/labels en UN lugar afecta toda la app.

#### 2. **Múltiples Invalidaciones de Queries**

```typescript
// Invalidar TODAS las queries de ofertas
queryClient.invalidateQueries({ queryKey: ['ofertas'] });

// Invalidar ofertas de un chat específico
queryClient.invalidateQueries({ queryKey: ['ofertas', 'chat', chatId] });
```

**Resultado**: Después de crear/aceptar/rechazar una oferta, TODAS las listas se actualizan automáticamente.

#### 3. **Dialog Controlado con Auto-close**

```typescript
// CreateOfertaDialog.tsx
const [open, setOpen] = useState(false);
const { mutate: createOferta } = useCreateOferta();

const onSubmit = (data) => {
  createOferta(data, {
    onSuccess: () => {
      setOpen(false);  // ✅ Cierra el dialog
      form.reset();     // ✅ Limpia el formulario
    },
  });
};

<Dialog open={open} onOpenChange={setOpen}>
  {/* ... form ... */}
</Dialog>
```

#### 4. **Zod Refine para Validación Dependiente**

```typescript
// updateOfertaSchema permite actualizar SOLO descripcion o precio_final
export const updateOfertaSchema = z
  .object({
    descripcion: z.string().min(10).max(500).optional(),
    precio_final: z.number().positive().optional(),
  })
  .refine((data) => data.descripcion || data.precio_final, {
    message: 'Debes actualizar al menos un campo (descripción o precio)',
  });
```

### 💡 Lecciones Clave

1. **Redirects externos**: Usa `window.location.href` después del `onSuccess` (no `router.push`).
2. **Timing**: `setTimeout` de 2s permite mostrar toast antes de redirect.
3. **Invalidaciones múltiples**: Una mutation puede invalidar varias queryKeys.
4. **Config centralizados**: Mapeos de estado (colores, iconos, labels) en `/types`.
5. **Opcional vs Requerido**: `updateSchema` permite campos opcionales con `refine()`.

---

## 🚀 Caso de Estudio: Búsqueda con Filtros Dinámicos

El módulo de **Búsqueda de Profesionales** es nuestro ejemplo más avanzado:

### 📊 Estadísticas de Refactorización

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Líneas de código (página)** | 300+ | 57 | **81% menos** |
| **useState en página** | 5+ | 1 | **80% menos** |
| **useEffect en página** | 2 | 0 | **100% menos** |
| **Componentes creados** | 0 | 2 | **Reutilizables** |
| **Hooks creados** | 0 | 2 | **Query dinámica** |

### 🏗️ Arquitectura del Módulo

```
search/
├── types/forms/search.ts           ← Schema con 13 filtros + validaciones Zod
├── hooks/
│   ├── search/
│   │   └── useSearchProfessionals  ← QueryKey DINÁMICA con 11 parámetros
│   └── common/
│       └── useOficios              ← Reutilizado desde auth
├── components/features/search/
│   ├── SearchFilters.tsx           ← Form complejo (colapsable, 13 campos)
│   └── SearchResultsList.tsx       ← Query + Estados + Paginación
└── app/(public)/explorar/
    └── page.tsx                    ← Solo 57 líneas de orquestación
```

### 🔑 Técnicas Avanzadas Aplicadas

#### 1. **QueryKey Dinámica** (El Corazón de React Query)

```typescript
// hooks/search/useSearchProfessionals.ts
queryKey: [
  'search-professionals',
  backendParams.oficio,        // Cambio en oficio → nueva cache
  backendParams.ubicacion_lat,  // Cambio en ubicación → nueva cache
  backendParams.ubicacion_lon,
  backendParams.radio_km,
  backendParams.tarifa_min,
  backendParams.tarifa_max,
  backendParams.rating_min,
  backendParams.solo_disponibles_ahora,
  backendParams.ordenar_por,
  backendParams.skip,           // Paginación: cada página diferente
  backendParams.limit,
],
```

**Resultado**: React Query cachea inteligentemente cada combinación de filtros. Si el usuario vuelve a los mismos filtros, la respuesta es **instantánea** (sin refetch).

#### 2. **Enabled Condicionalmente** (No fetch innecesarios)

```typescript
const shouldFetch = hasLocation || hasOficio;

enabled: shouldFetch,  // Solo busca si hay criterios válidos
```

#### 3. **Formulario con Estado Complejo** (react-hook-form + Zod)

```typescript
// 13 campos con validaciones:
- q (búsqueda libre)
- oficio / oficio_id
- ubicacion_lat / ubicacion_lon (con refine: deben ir juntas)
- radio_km (1-500)
- tarifa_min / tarifa_max (con refine: max >= min)
- rating_min (1-5)
- solo_disponibles_ahora (boolean)
- ordenar_por (enum)
- page / limit (paginación)
```

#### 4. **Composición de Componentes**

```typescript
// page.tsx - LA PÁGINA MÁS LIMPIA
export default function ExplorarPage() {
  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  
  return (
    <>
      <SearchFilters onFiltersChange={setActiveFilters} />
      <SearchResultsList filters={activeFilters} />
    </>
  );
}
```

**Todo el estado del servidor** (resultados, loading, error) está en `useSearchProfessionals`.  
**La página solo maneja** qué filtros están activos (UI state).

#### 5. **Paginación con Cache**

```typescript
// Cambiar de página NO recarga todos los filtros
const handlePageChange = (page: number) => {
  setActiveFilters((prev) => ({ ...prev, page }));
};

// React Query cachea CADA página por separado
// Página 1: cache['search-professionals', ...filters, skip: 0, limit: 30]
// Página 2: cache['search-professionals', ...filters, skip: 30, limit: 30]
```

### 📝 Lecciones Clave

1. **QueryKey = Cache Key**: Cada parámetro en la queryKey es importante para el cache.
2. **useState SOLO para UI**: Los filtros activos son estado de UI, no de servidor.
3. **Enabled = Lazy Queries**: No fetches innecesarios al cargar la página.
4. **Zod refine()**: Validaciones cross-field (ej: max >= min, lat con lon).
5. **Composición > Monolitos**: 2 componentes pequeños > 1 componente gigante.

---

## 💡 Tips y Mejores Prácticas

### ✅ DO (Hacer)
- Usa `useMutation` para operaciones que modifican datos
- Usa `useQuery` para leer datos
- Mantén los componentes UI tontos y reutilizables
- Usa barrel exports (`index.ts`) para importaciones limpias
- Coloca validaciones en schemas de Zod
- Usa `queryKey` descriptivos (ej: `['profile', userId]`)

### ❌ DON'T (No Hacer)
- No uses `useState` + `useEffect` para fetching
- No mezcles lógica de negocio en componentes UI
- No hagas fetch directamente en componentes
- No dupliques lógica entre páginas
- No pongas schemas en archivos de componentes
- No olvides el `staleTime` en queries que no cambian frecuentemente

---

## 📖 Recursos

- [React Query Docs](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Zustand Store](https://zustand-demo.pmnd.rs/)

---

**Creado**: Noviembre 4, 2025  
**Autor**: Frontend Senior Team  
**Versión**: 1.0 (Golden Path)
