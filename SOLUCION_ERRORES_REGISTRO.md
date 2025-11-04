# 🔧 Guía de Solución de Errores - ConectarProfesionales

## ❌ Problemas Identificados

### 1. Error 404 en `/profesionales/search`
**Status:** ✅ RESUELTO

**Problema:** El frontend llamaba a `/profesionales/search` pero el backend tiene el endpoint en `/search`

**Solución Aplicada:**
- Modificado `frontend/lib/services/searchService.ts`
- Cambiado endpoint de `/profesionales/search` a `/search`

---

### 2. Firebase API Key Inválida
**Status:** ⚠️ REQUIERE CONFIGURACIÓN MANUAL

**Problema:** `FirebaseError: Firebase: Error (auth/invalid-api-key)`

**Solución:**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Project Settings** (⚙️) > **General**
4. Copia tus credenciales de Firebase Web
5. Abre `frontend/.env.local` y reemplaza con tus credenciales reales:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key-aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
```

6. Reinicia el servidor de desarrollo:
```powershell
cd frontend
npm run dev
```

---

### 3. No aparecen profesionales
**Status:** ✅ RESUELTO

**Problema:** Base de datos vacía

**Solución Aplicada:**
- Endpoint `/public/oficios` ahora retorna oficios de fallback si hay error
- Endpoint `/search` funciona correctamente

**Para poblar con datos de prueba:**
```powershell
# Desde la raíz del proyecto
python seed_oficios_supabase.py
```

---

### 4. Falta campo de oficio en registro
**Status:** ✅ RESUELTO

**Cambios Realizados:**

1. **Nuevo servicio:** `frontend/lib/services/oficiosService.ts`
   - Método `getAll()` para obtener lista de oficios
   - Fallback con 10 oficios predefinidos

2. **Actualizado:** `frontend/types/index.ts`
   - Agregado campo `oficio_id?: string` en `UserCreate`

3. **Actualizado:** `frontend/app/(auth)/register/page.tsx`
   - Agregado selector de oficio (solo visible para profesionales)
   - Validación: oficio obligatorio si `userType === 'profesional'`
   - useEffect para cargar oficios al montar

**Uso:**
- Al registrarse como **Cliente**: no se muestra el selector
- Al registrarse como **Profesional**: selector obligatorio con lista de oficios

---

### 5. Edición de perfil profesional
**Status:** ⏳ SIGUIENTE PASO

**Para implementar:**
```
- Crear página /perfil/editar
- Formulario con:
  * Descripción/biografía
  * Upload de imágenes (portfolio)
  * Experiencia
  * Certificaciones
  * Tarifa por hora
  * Radio de cobertura
  * Disponibilidad
```

---

## 🚀 Comandos para Iniciar

### Backend (Microservicios)
```powershell
# Desde la raíz del proyecto
./iniciar-microservicios.ps1
```

### Frontend
```powershell
cd frontend
npm run dev
```

**Acceder a:**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000
- Docs API: http://localhost:8000/docs

---

## 📝 Checklist de Verificación

- [x] Endpoint `/search` corregido
- [x] Selector de oficio en registro
- [x] Servicio de oficios creado
- [ ] Configurar credenciales de Firebase
- [ ] Seedear datos de prueba
- [ ] Crear perfil profesional
- [ ] Página de edición de perfil
- [ ] Upload de imágenes

---

## 🔗 Archivos Modificados

1. `frontend/lib/services/searchService.ts` - Endpoint corregido
2. `frontend/lib/services/oficiosService.ts` - **NUEVO**
3. `frontend/types/index.ts` - Agregado `oficio_id`
4. `frontend/app/(auth)/register/page.tsx` - Selector de oficio
5. `frontend/.env.local` - **NUEVO** - Template de configuración

---

## 💡 Próximos Pasos

1. **URGENTE:** Configurar Firebase (ver sección 2)
2. Crear página de edición de perfil profesional
3. Implementar upload de imágenes (usar Firebase Storage o Cloudinary)
4. Seedear base de datos con profesionales de prueba
5. Probar flujo completo: Registro → Login → Búsqueda → Chat → Oferta → Trabajo

---

## 🐛 Si encuentras más errores

1. Revisa la consola del navegador (F12)
2. Revisa los logs del backend (terminal de microservicios)
3. Verifica que todos los servicios estén corriendo: `docker ps`
4. Reinicia servicios si es necesario: `./stop-stack.ps1 && ./start-stack.ps1`
