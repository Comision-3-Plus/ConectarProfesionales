# 🐛 BUGS Y ERRORES IDENTIFICADOS - 24 Oct 2025

## Proyecto: ConectarProfesionales

---

## 🔴 ERRORES CRÍTICOS (Bloquean funcionalidad)

### 1. Sistema de Chat No Existe
**Severidad:** 🔴 CRÍTICA  
**Estado:** No implementado  
**Impacto:** Bloquea toda comunicación entre clientes y profesionales

**Descripción:**
- No existen componentes de chat
- No hay integración con Firebase Realtime Database para mensajes
- Clientes y profesionales no pueden comunicarse

**Solución Requerida:**
1. Crear componentes de chat (ChatWindow, ChatList, ChatMessage, ChatInput)
2. Implementar hooks de Firebase (useChat, useChatList)
3. Crear páginas de chat en dashboards
4. Integrar notificaciones de mensajes

**Archivos a crear:**
```
frontend/components/features/
├── ChatWindow.tsx
├── ChatMessage.tsx
├── ChatInput.tsx
└── ChatList.tsx

frontend/app/(dashboard)/dashboard/
├── cliente/chat/page.tsx
└── profesional/chat/page.tsx

frontend/hooks/
├── useChat.ts
└── useChatList.ts
```

---

### 2. Cliente No Puede Aceptar Ofertas y Pagar
**Severidad:** 🔴 CRÍTICA  
**Estado:** Implementación parcial  
**Impacto:** Bloquea el flujo principal de la plataforma

**Descripción:**
- El endpoint `clienteService.acceptOferta()` existe
- Falta UI para aceptar oferta
- Falta integración con MercadoPago
- No hay manejo de redirección después del pago

**Ubicación:** `frontend/app/(dashboard)/dashboard/cliente/page.tsx`

**Código con problema:**
```tsx
// Tab "Mis Ofertas" - Línea ~120
<TabsContent value="offers">
  {/* TODO: Implementar lista de ofertas recibidas */}
  <Card>
    <CardContent className="py-8">
      <p className="text-center text-muted-foreground">
        No tienes ofertas pendientes
      </p>
    </CardContent>
  </Card>
</TabsContent>
```

**Solución Requerida:**
1. Llamar a `clienteService.listOfertas()` para obtener ofertas
2. Mostrar lista de ofertas con detalles
3. Botón "Aceptar" que llame a `clienteService.acceptOferta(ofertaId)`
4. Redirigir al `payment_url` de MercadoPago
5. Manejar callbacks de éxito/fallo

---

### 3. Perfil Público - Tab Reseñas Vacío
**Severidad:** 🟠 ALTA  
**Estado:** TODO marcado en el código  
**Impacto:** Los perfiles no muestran credibilidad social

**Ubicación:** `frontend/app/(public)/profile/[id]/page.tsx:176`

**Código con problema:**
```tsx
<TabsContent value="reviews" className="mt-6">
  <Card>
    <CardContent className="py-8">
      {/* TODO: Fetch and display reviews */}
      <p className="text-center text-muted-foreground">
        No hay reseñas todavía
      </p>
    </CardContent>
  </Card>
</TabsContent>
```

**Solución Requerida:**
```typescript
// Agregar query
const { data: reviews } = useQuery({
  queryKey: ['professional-reviews', professionalId],
  queryFn: () => publicService.getReviews(professionalId),
});

// Renderizar reseñas
{reviews?.map((review) => (
  <ReviewCard key={review.id} review={review} />
))}
```

---

### 4. Perfil Público - Botón "Contactar" No Funciona
**Severidad:** 🟠 ALTA  
**Estado:** TODO marcado en el código  
**Impacto:** Usuarios no pueden iniciar conversación con profesionales

**Ubicación:** `frontend/app/(public)/profile/[id]/page.tsx:36`

**Código con problema:**
```tsx
<Button size="lg" className="bg-gradient-to-r...">
  <MessageCircle className="mr-2 h-5 w-5" />
  Contactar
  {/* TODO: Implementar navegación al chat */}
</Button>
```

**Solución Requerida:**
1. Verificar autenticación
2. Crear o obtener chat existente en Firebase
3. Redirigir a `/dashboard/cliente/chat?id={chatId}`

```typescript
const handleContact = async () => {
  if (!isAuthenticated) {
    router.push('/login?redirect=/profile/' + professionalId);
    return;
  }
  
  // Crear/obtener chat
  const chatId = await firebaseService.getOrCreateChat(
    userId, 
    professionalId
  );
  
  router.push(`/dashboard/cliente/chat?id=${chatId}`);
};
```

---

## 🟠 ERRORES IMPORTANTES (Reducen funcionalidad)

### 5. Dashboard Profesional - Portfolio No Funcional
**Severidad:** 🟠 IMPORTANTE  
**Estado:** UI básica, falta integración  
**Impacto:** Profesionales no pueden mostrar trabajos previos

**Ubicación:** `frontend/app/(dashboard)/dashboard/profesional/portfolio/page.tsx`

**Falta implementar:**
1. Botón "Agregar Item" → Modal con formulario
2. Upload de imágenes múltiples
3. Lista de items existentes
4. Botones de editar/eliminar

**APIs disponibles:**
- `professionalService.createPortfolioItem()`
- `professionalService.uploadPortfolioImage()`
- `professionalService.deletePortfolioItem()`
- `professionalService.listPortfolio()`

---

### 6. Dashboard Profesional - Actualizar Perfil No Funcional
**Severidad:** 🟠 IMPORTANTE  
**Estado:** Página básica sin formulario  
**Impacto:** Profesionales no pueden configurar su servicio

**Ubicación:** `frontend/app/(dashboard)/dashboard/profesional/perfil/page.tsx`

**Falta implementar:**
1. Formulario de actualización de perfil
2. Campos:
   - Tarifa por hora
   - Radio de cobertura (km)
   - Ubicación base (lat/lng)
   - Acepta trabajos inmediatos (toggle)
   - Tarifa de trabajo inmediato
   - Biografía
3. Llamar a `professionalService.updateProfile()`
4. Sección de subida de documentos KYC

---

### 7. Dashboard Cliente - Crear Reseñas No Implementado
**Severidad:** 🟠 IMPORTANTE  
**Estado:** No existe modal de reseña  
**Impacto:** No se genera credibilidad social para profesionales

**Ubicación:** `frontend/app/(dashboard)/dashboard/cliente/page.tsx`

**Falta implementar:**
1. Modal de reseña después de finalizar trabajo
2. Campos:
   - Rating (1-5 estrellas)
   - Comentario (textarea)
3. Llamar a `clienteService.crearResena(trabajoId, resenaData)`
4. Invalidar queries para actualizar rating del profesional

**Componente sugerido:**
```typescript
// components/features/ReviewModal.tsx
interface ReviewModalProps {
  trabajoId: string;
  profesionalId: string;
  isOpen: boolean;
  onClose: () => void;
}
```

---

### 8. Dashboard Profesional - Gamificación No Visible
**Severidad:** 🟠 IMPORTANTE  
**Estado:** Backend funciona, frontend no muestra datos  
**Impacto:** Profesionales no ven su progreso

**Ubicación:** `frontend/app/(dashboard)/dashboard/profesional/page.tsx`

**Datos disponibles en el perfil:**
```typescript
interface ProfessionalProfileRead {
  // ... otros campos
  nivel_profesional: "BRONCE" | "PLATA" | "ORO" | "DIAMANTE";
  puntos_experiencia: number;
  comision_plataforma_porcentaje: number;
  trabajos_completados: number;
}
```

**Falta implementar:**
1. Tarjetas de métricas de gamificación
2. Barra de progreso al siguiente nivel
3. Tabla de niveles y beneficios
4. Indicador de comisión actual

---

## 🟡 ERRORES MENORES (No bloquean funcionalidad)

### 9. Páginas de Callback de Pago Vacías
**Severidad:** 🟡 MEDIA  
**Estado:** Páginas existen pero sin lógica  
**Impacto:** Mala UX después del pago

**Archivos:**
- `frontend/app/(public)/payment/success/page.tsx`
- `frontend/app/(public)/payment/failure/page.tsx`

**Falta implementar:**
1. Parsear query params (?payment_id=xxx&trabajo_id=xxx)
2. Mostrar información del pago
3. Botones de navegación
4. Página `/payment/pending` (no existe)

---

### 10. Búsqueda - Filtros Geográficos Limitados
**Severidad:** 🟡 MEDIA  
**Estado:** Búsqueda básica funciona  
**Impacto:** Experiencia de búsqueda mejorable

**Ubicación:** `frontend/app/(public)/browse/page.tsx`

**Falta implementar:**
1. Input de ubicación con autocompletado (Google Places)
2. Selector de radio en km
3. Toggle "Incluir fuera de radio"
4. Filtro de rango de precio (slider)
5. Ordenamiento (distancia, rating, precio)
6. Paginación o infinite scroll

---

### 11. Notificaciones No Existen
**Severidad:** 🟡 MEDIA  
**Estado:** No implementado  
**Impacto:** Usuarios no reciben alertas

**Solución Sugerida:**
1. Componente `NotificationBell` en Navbar
2. Firebase Realtime Database para almacenar notificaciones
3. Hook `useNotifications` para obtener y marcar como leídas

---

## 🟢 WARNINGS Y OPTIMIZACIONES

### 12. 157 Errores de Lint de Tailwind CSS
**Severidad:** 🟢 BAJA  
**Estado:** Warnings, no errores  
**Impacto:** Ninguno funcional

**Ejemplos:**
```tsx
// Sugerencias de sintaxis más nueva
bg-gradient-to-r → bg-linear-to-r
flex-shrink-0 → shrink-0
```

**Solución:**
- Ignorar por ahora
- Corregir en fase de optimización con buscar/reemplazar global

---

### 13. Variable `publicRoutes` No Usada en Middleware
**Severidad:** 🟢 BAJA  
**Estado:** Declarada pero no usada  
**Impacto:** Ninguno

**Ubicación:** `frontend/middleware.ts:16`

**Solución:**
```typescript
// Opción 1: Eliminar
// const publicRoutes = [...]

// Opción 2: Usar en lógica futura
const isPublicRoute = publicRoutes.some(route => 
  pathname.startsWith(route)
);
```

---

### 14. Tipos `any` en Algunos Archivos
**Severidad:** 🟢 BAJA  
**Estado:** Parcialmente corregido  
**Impacto:** Reduce seguridad de tipos

**Estado:**
- ✅ Corregido en `profesional/trabajos/page.tsx`
- ⚠️ Revisar otros archivos

**Comando para buscar:**
```bash
cd frontend
grep -r "any" app/
```

---

## 📊 RESUMEN DE ERRORES

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| 🔴 Críticos | 4 | ⚠️ Requieren atención inmediata |
| 🟠 Importantes | 4 | ⚠️ Implementar esta semana |
| 🟡 Medios | 3 | 📅 Implementar próxima semana |
| 🟢 Menores | 3 | 📝 Backlog |

---

## 🎯 PRIORIDAD DE CORRECCIÓN

### Día 1-2: Críticos
1. ✅ URL del backend corregida (YA HECHO)
2. ❌ Sistema de chat
3. ❌ Cliente aceptar ofertas + pago

### Día 3-4: Importantes
4. ❌ Perfil público - tab reseñas
5. ❌ Perfil público - botón contactar
6. ❌ Dashboard profesional - portfolio
7. ❌ Dashboard profesional - actualizar perfil

### Día 5+: Resto
8. ❌ Sistema de reseñas (cliente)
9. ❌ Gamificación visible
10. ❌ Callbacks de pago
11. ❌ Mejoras en búsqueda
12. ❌ Sistema de notificaciones

---

## 🛠️ HERRAMIENTAS DE DEBUGGING

### Verificar Estado del Backend
```bash
# Health check
curl http://localhost:8000/

# Verificar endpoints disponibles
curl http://localhost:8000/docs
```

### Verificar Estado del Frontend
```javascript
// En consola del navegador

// Verificar token
localStorage.getItem('access_token')

// Verificar usuario actual
JSON.parse(localStorage.getItem('auth-storage'))

// Verificar Firebase
import { getDatabase } from 'firebase/database';
console.log(getDatabase());
```

### Logs Útiles
```typescript
// En cualquier componente
console.log('[DEBUG] Component rendered', { props, state });

// En servicios API
console.log('[API] Request:', { endpoint, data });
console.log('[API] Response:', { status, data });
```

---

## 📞 AYUDA

Si encuentras más errores, documenta:
1. **Archivo:** Ruta completa
2. **Línea:** Número de línea
3. **Descripción:** Qué hace (o debería hacer)
4. **Error:** Mensaje de error (si aplica)
5. **Solución propuesta:** Cómo arreglarlo

---

**📅 Última actualización:** 24 de Octubre 2025  
**✅ Errores corregidos:** 2/14  
**⚠️ Errores pendientes:** 12/14  
**🎯 Próximo foco:** Sistema de chat (Error #2)
