# 🚀 MVP READY - GUÍA RÁPIDA
## ConectarProfesionales - Producto Mínimo Viable

**Fecha**: 4 de Noviembre 2025  
**Estado**: ✅ **MVP LISTO PARA USAR**

---

## 🎯 FLUJOS IMPLEMENTADOS

### 👤 COMO CLIENTE

#### 1. Registro y Login
1. Ve a `/register` o haz clic en "Registrarse" en el navbar
2. Completa el formulario con:
   - Nombre y apellido
   - Email
   - Contraseña
   - **Rol: CLIENTE**
3. Recibes email de confirmación (opcional activar)
4. Ya puedes iniciar sesión

#### 2. Buscar Profesionales
1. Desde la home, haz clic en **"Explorar Profesionales"**
2. O ve directo a `/explorar`
3. Usa los filtros:
   - 🔍 Búsqueda por palabra clave (ej: "plomero")
   - 📍 Filtro por oficio específico
   - 📏 Radio de búsqueda (5-100 km)
   - 📌 Ubicación (lat/lon opcional)
4. Haz clic en **"Buscar"**
5. Verás tarjetas con:
   - Foto del profesional
   - ⭐ Rating y cantidad de reseñas
   - 💰 Tarifa por hora
   - 🏷️ Oficios (badges)
   - 📍 Distancia (si configuraste ubicación)
   - ✓ Badge de verificado (si tiene KYC aprobado)

#### 3. Ver Perfil del Profesional
1. Haz clic en cualquier tarjeta de profesional
2. Verás su perfil completo con:
   - Información básica (nombre, foto, biografía)
   - Descripción detallada
   - Años de experiencia
   - Tarifa por hora
   - Habilidades
   - Certificaciones
   - 📸 Galería de trabajos realizados
   - ⭐ Reseñas de otros clientes
   - 📊 Estadísticas (trabajos completados, rating promedio)

#### 4. Iniciar Chat
1. Desde el perfil del profesional, haz clic en **"Enviar Mensaje"** o **"Contactar"**
2. Se abre una ventana de chat en tiempo real
3. Escribe tu mensaje y presiona Enter o haz clic en ➤
4. El profesional recibirá notificación instantánea
5. Puedes negociar precio, plazo, detalles del proyecto

#### 5. Contratar (Sistema de Ofertas)
1. Durante el chat, el profesional puede enviarte una **Oferta Formal**
2. Verás la oferta con:
   - 💰 Monto propuesto
   - 📅 Fecha de inicio
   - 📅 Fecha estimada de finalización
   - 📝 Descripción del trabajo
3. Puedes **Aceptar** o **Rechazar** la oferta
4. Al aceptar:
   - Se crea un **Trabajo** con estado `PENDIENTE`
   - Se te redirige al **Sistema de Pagos** (MercadoPago)
   - Realizas el pago → dinero va a **ESCROW** (retenido)

#### 6. Pago Seguro (Escrow)
1. Pagas con MercadoPago (tarjeta, débito, efectivo)
2. El dinero se **retiene en escrow** hasta que apruebes el trabajo
3. El profesional ve que el pago está confirmado
4. Puede empezar a trabajar con seguridad

#### 7. Seguimiento del Trabajo
1. Ve a `/trabajos` o "Mis Trabajos" en el menú
2. Verás todos tus trabajos con estados:
   - 🟡 **PENDIENTE**: Esperando pago o aprobación
   - 🔵 **EN_PROGRESO**: Profesional trabajando
   - 🟢 **COMPLETADO**: Profesional marcó como completo
   - ✅ **APROBADO**: Tú aprobaste y liberaste el pago
   - ❌ **CANCELADO**: Trabajo cancelado
3. Puedes chatear con el profesional durante todo el proceso
4. Recibe actualizaciones en tiempo real

#### 8. Aprobar Trabajo y Liberar Pago
1. Cuando el profesional termine, marca el trabajo como **COMPLETADO**
2. Recibes notificación
3. Revisas el trabajo realizado
4. Si estás satisfecho:
   - Haz clic en **"Aprobar Trabajo"**
   - El dinero del escrow se **libera al profesional**
   - Se descuenta la comisión de la plataforma (8-15% según nivel)
5. Si NO estás satisfecho:
   - Puedes solicitar **correcciones**
   - O pedir **reembolso** (requiere revisión admin)

#### 9. Dejar Reseña
1. Después de aprobar el trabajo, puedes dejar una **reseña**
2. Califica de 1 a 5 estrellas ⭐⭐⭐⭐⭐
3. Escribe un comentario sobre tu experiencia
4. La reseña aparece en el perfil del profesional
5. El profesional puede **responder** a tu reseña

---

### 👷 COMO PROFESIONAL

#### 1. Registro como Profesional
1. Ve a `/register`
2. Completa el formulario seleccionando:
   - **Rol: PROFESIONAL**
3. Activa tu cuenta por email
4. Inicia sesión

#### 2. Completar Perfil Profesional
1. Ve a `/perfil/editar` o haz clic en tu avatar → "Editar Perfil"
2. Completa tu información:

**Información Básica:**
- ✏️ Nombre y apellido
- 📝 Biografía corta (ej: "Plomero con 10 años de experiencia")
- 📄 Descripción detallada (hasta 1000 caracteres)
- 📅 Años de experiencia
- 💰 Tarifa por hora (ARS)

**Ubicación y Cobertura:**
- 📍 Ubicación base (lat/lon)
  - Usa el botón **"Usar mi ubicación"** para autodetectar
- 📏 Radio de cobertura (1-100 km)

**Habilidades:**
- Agrega palabras clave (ej: "Instalaciones eléctricas", "Cableado", "Domótica")
- Aparecerán como badges en tu perfil

**Certificaciones:**
- Agrega tus credenciales (ej: "Matrícula ENRE 2023")
- Da más confianza a los clientes

**Galería de Trabajos:**
- Sube URLs de imágenes de tus trabajos
- **Tip**: Usa [Imgur](https://imgur.com) o similar
- Muestra tu mejor trabajo!

**Disponibilidad:**
- Activa/desactiva tu disponibilidad
- Cuando está OFF, no apareces en búsquedas

3. Haz clic en **"Guardar Cambios"**

#### 3. Agregar Oficios
1. En tu perfil, ve a la sección "Oficios"
2. O usa el servicio `oficiosService.addOficio()`
3. Puedes tener múltiples oficios (ej: Plomero + Gasista)
4. Los oficios aparecen en tu perfil y en búsquedas

#### 4. Subir Documentos KYC (Verificación)
> ⚠️ **Importante**: Los profesionales verificados tienen más confianza y aparecen primero

1. Ve a `/dashboard/profesional/verificacion` (o similar)
2. Sube documentos:
   - 🆔 DNI/Pasaporte (frente y dorso)
   - 📄 Certificados profesionales
   - 📜 Matrículas (si aplica)
3. Espera revisión del administrador
4. Estados:
   - 🟡 **PENDIENTE**: En revisión
   - 🟢 **APROBADO**: ✓ Verificado (badge azul en perfil)
   - 🔴 **RECHAZADO**: Documentos no válidos

#### 5. Recibir Mensajes de Clientes
1. Ve a `/chat` o haz clic en "Mensajes" en el navbar
2. Verás lista de conversaciones
3. Cuando un cliente te escribe, aparece notificación
4. Haz clic en la conversación para abrir el chat
5. Responde en tiempo real

#### 6. Enviar Oferta Formal
1. Durante el chat con un cliente, cuando acuerden detalles:
2. Usa el botón **"Enviar Oferta"** (en el chat)
3. Completa el formulario de oferta:
   - 💰 Monto (ej: 15000 ARS)
   - 📅 Fecha de inicio
   - 📅 Fecha de finalización estimada
   - 📝 Descripción del trabajo
4. Envía la oferta
5. El cliente la verá en el chat y puede aceptar/rechazar

#### 7. Trabajar en el Proyecto
1. Cuando el cliente acepta y paga:
   - Recibes notificación
   - El trabajo aparece en `/trabajos` como **EN_PROGRESO**
   - El dinero está en **ESCROW** (seguro para ti)
2. Realiza el trabajo acordado
3. Mantén comunicación con el cliente por chat
4. Puedes enviar fotos del progreso

#### 8. Marcar como Completado
1. Cuando termines el trabajo:
2. Ve a `/trabajos` → Selecciona el trabajo
3. Haz clic en **"Marcar como Completado"**
4. El cliente recibe notificación
5. Cliente revisa y aprueba
6. ¡Recibes el pago! 💰

#### 9. Recibir Pagos y Retirar Fondos
1. Cuando el cliente aprueba:
   - El dinero se libera del escrow
   - Se descuenta la comisión (8-15% según tu nivel)
   - El saldo aparece en tu **Balance Disponible**

2. Ve a `/dashboard/profesional/pagos` (o similar)
3. Verás tu balance:
   - 💰 **Disponible**: Puedes retirar
   - ⏳ **Pendiente**: En escrow (trabajos en progreso)
   - 📊 **Total ganado**: Histórico

4. **Retirar Fondos**:
   - Configura tu cuenta bancaria (CBU/Alias)
   - Solicita retiro (mínimo $1,000)
   - Espera aprobación del admin
   - Recibes transferencia en 24-48hs

#### 10. Sistema de Gamificación 🎮

**Niveles y Comisiones:**
- 🥉 **Bronce** (0-999 pts): 15% comisión
- 🥈 **Plata** (1,000-4,999 pts): 12% comisión
- 🥇 **Oro** (5,000-9,999 pts): 10% comisión
- 💎 **Diamante** (10,000+ pts): 8% comisión

**Cómo Ganar Puntos:**
- ✅ Completar trabajo: +100 pts
- ⭐ Recibir reseña 5 estrellas: +50 pts
- ⭐ Recibir reseña 4 estrellas: +30 pts
- 📅 Completar a tiempo: +20 pts bonus

**Beneficios por Nivel:**
- 🔝 Prioridad en búsquedas
- 💰 Menor comisión
- 💎 Badge exclusivo en perfil
- 🏆 Aparecer en leaderboard
- ⚡ Retiros más rápidos (Diamante)

---

## 🔥 FUNCIONALIDADES CLAVE DEL MVP

### ✅ Sistema de Usuarios
- [x] Registro con rol (CLIENTE/PROFESIONAL)
- [x] Login con JWT (60 min expiration)
- [x] Perfil editable
- [x] Avatar (Dicebear fallback)
- [x] Autenticación con middleware

### ✅ Búsqueda de Profesionales
- [x] Búsqueda por keyword
- [x] Filtro por oficio
- [x] Filtro geográfico (radio + lat/lon)
- [x] Ordenamiento por rating
- [x] Tarjetas con info clave
- [x] Badge de verificado

### ✅ Perfiles Profesionales
- [x] Biografía + descripción
- [x] Tarifa por hora
- [x] Años de experiencia
- [x] Habilidades (tags)
- [x] Certificaciones
- [x] Galería de trabajos
- [x] Reseñas y rating
- [x] Ubicación y radio de cobertura

### ✅ Chat en Tiempo Real
- [x] Firebase Firestore
- [x] Mensajes instantáneos
- [x] Lista de conversaciones
- [x] Timestamps
- [x] Indicador de lectura
- [x] Notificaciones

### ✅ Sistema de Ofertas
- [x] Crear oferta desde chat
- [x] Monto, fechas, descripción
- [x] Aceptar/rechazar oferta
- [x] Estados de oferta

### ✅ Trabajos
- [x] Estados: PENDIENTE, EN_PROGRESO, COMPLETADO, APROBADO, CANCELADO
- [x] Seguimiento en tiempo real
- [x] Chat integrado por trabajo
- [x] Aprobar/rechazar completitud

### ✅ Pagos Seguros (Escrow)
- [x] Integración MercadoPago
- [x] Sistema de escrow (retención de fondos)
- [x] Estados: PENDIENTE, DEPOSITADO, LIBERADO, REEMBOLSADO
- [x] Comisiones por nivel de gamificación
- [x] Balance disponible/pendiente
- [x] Retiros de fondos
- [x] Cuenta bancaria (CBU/Alias)
- [x] Dashboard financiero

### ✅ Reseñas
- [x] Calificación 1-5 estrellas
- [x] Comentarios
- [x] Solo si completaste trabajo
- [x] Respuesta del profesional
- [x] Distribución de ratings
- [x] Promedio visible en perfil

### ✅ Verificación KYC
- [x] Upload de documentos
- [x] Revisión por admin
- [x] Estados: PENDIENTE, APROBADO, RECHAZADO
- [x] Badge de verificado en perfil

### ✅ Gamificación
- [x] 4 niveles (Bronce, Plata, Oro, Diamante)
- [x] Sistema de puntos
- [x] Comisiones diferenciadas
- [x] Leaderboard
- [x] Badges por nivel
- [x] Beneficios progresivos

### ✅ Notificaciones
- [x] Email (SendGrid)
- [x] Push notifications (configurables)
- [x] Notificaciones in-app
- [x] Centro de notificaciones

---

## 📋 CHECKLIST PRE-LANZAMIENTO

### Backend
- [ ] Todos los microservicios corriendo (8000-8006)
- [ ] PostgreSQL operativo
- [ ] Firestore configurado
- [ ] MercadoPago credentials (sandbox/prod)
- [ ] SendGrid API key
- [ ] Variables de entorno configuradas
- [ ] Migraciones de DB aplicadas
- [ ] Seed de oficios cargado

### Frontend
- [ ] Build sin errores (`npm run build`)
- [ ] Todas las rutas accesibles
- [ ] Chat funcionando (Firebase)
- [ ] Imágenes cargando correctamente
- [ ] Responsive en móvil/tablet/desktop
- [ ] SEO básico (meta tags)
- [ ] Analytics configurado (opcional)

### Testing Manual
- [ ] Registro de cliente exitoso
- [ ] Registro de profesional exitoso
- [ ] Login funcional
- [ ] Búsqueda devuelve resultados
- [ ] Perfil profesional visible
- [ ] Chat envía/recibe mensajes
- [ ] Oferta se crea y acepta
- [ ] Pago con MercadoPago funciona
- [ ] Trabajo cambia de estado
- [ ] Reseña se puede dejar
- [ ] Notificaciones se reciben

---

## 🚀 CÓMO INICIAR EL MVP

### Opción 1: Docker (Recomendado)

```powershell
# Desde la raíz del proyecto
docker-compose up -d

# Verificar que todos los servicios estén corriendo
docker-compose ps

# Ver logs
docker-compose logs -f
```

**Servicios disponibles:**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000
- Servicio Auth: http://localhost:8001
- Servicio Usuarios: http://localhost:8002
- Servicio Profesionales: http://localhost:8003
- Servicio Chat/Ofertas: http://localhost:8004
- Servicio Pagos: http://localhost:8005
- Servicio Notificaciones: http://localhost:8006
- PostgreSQL: localhost:5432
- Adminer (DB UI): http://localhost:8080

### Opción 2: Manual

**Backend:**
```powershell
# Activar entorno virtual (si usas venv)
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Iniciar cada microservicio en terminales separadas
cd servicios/puerta_enlace; uvicorn app.main:app --reload --port 8000
cd servicios/servicio_autenticacion; uvicorn app.main:app --reload --port 8001
cd servicios/servicio_usuarios; uvicorn app.main:app --reload --port 8002
cd servicios/servicio_profesionales; uvicorn app.main:app --reload --port 8003
cd servicios/servicio_chat_ofertas; uvicorn app.main:app --reload --port 8004
cd servicios/servicio_pagos; uvicorn app.main:app --reload --port 8005
cd servicios/servicio_notificaciones; uvicorn app.main:app --reload --port 8006
```

**Frontend:**
```powershell
cd frontend
npm install
npm run dev
# Abre http://localhost:3000
```

---

## 🧪 DATOS DE PRUEBA

### Usuario Cliente
```
Email: cliente@test.com
Password: Test123!
Rol: CLIENTE
```

### Usuario Profesional
```
Email: profesional@test.com
Password: Test123!
Rol: PROFESIONAL
```

### Crear usuarios de prueba (script)
```powershell
# Desde la raíz
.\create-admin.ps1 cliente@test.com CLIENTE
.\create-admin.ps1 profesional@test.com PROFESIONAL
```

---

## 📱 RUTAS PRINCIPALES

### Públicas
- `/` - Home con call-to-actions
- `/explorar` - Buscar profesionales
- `/profesional/[id]` - Perfil público de profesional
- `/login` - Iniciar sesión
- `/register` - Registrarse

### Autenticadas - Cliente
- `/dashboard` - Dashboard general
- `/trabajos` - Mis trabajos contratados
- `/chat` - Mensajes
- `/perfil` - Mi perfil
- `/payment/[id]` - Pagar un trabajo

### Autenticadas - Profesional
- `/dashboard/profesional` - Dashboard profesional
- `/perfil/editar` - Editar perfil profesional
- `/trabajos` - Trabajos asignados
- `/chat` - Mensajes
- `/dashboard/profesional/pagos` - Balance y retiros
- `/dashboard/profesional/verificacion` - Subir KYC

### Admin
- `/admin/dashboard` - Panel de administración
- `/admin/usuarios` - Gestión de usuarios
- `/admin/pagos` - Aprobar retiros
- `/admin/kyc` - Revisar verificaciones

---

## 🐛 TROUBLESHOOTING

### "No se encuentran profesionales"
- ✅ Verifica que haya profesionales registrados
- ✅ Revisa que tengan `disponible: true`
- ✅ Asegúrate de que tengan al menos un oficio asignado
- ✅ Si usas filtro geográfico, verifica lat/lon

### "Chat no envía mensajes"
- ✅ Verifica Firebase credentials en `.env`
- ✅ Revisa console del navegador (F12)
- ✅ Confirma que el servicio de chat esté corriendo (puerto 8004)

### "Pago con MercadoPago no funciona"
- ✅ Usa credenciales de **TEST** en desarrollo
- ✅ Verifica `.env` tenga `MERCADOPAGO_ACCESS_TOKEN`
- ✅ Usa tarjetas de prueba de MercadoPago
- ✅ Revisa logs del servicio de pagos (puerto 8005)

### "Error 401 Unauthorized"
- ✅ Token JWT expirado (vuelve a hacer login)
- ✅ Revisa que el header `Authorization` esté presente
- ✅ Verifica `SECRET_KEY` en backend

---

## 🎯 PRÓXIMOS PASOS POST-MVP

### Alta Prioridad
1. **Subida de archivos real** (S3, Cloudinary)
2. **Sistema de disputas** (mediación cliente-profesional)
3. **Calendario de disponibilidad** (profesional)
4. **Búsqueda avanzada** (más filtros)
5. **App móvil** (React Native / Flutter)

### Media Prioridad
6. **Marketplace de servicios** (paquetes pre-armados)
7. **Subscripciones premium** (profesionales)
8. **Sistema de referidos** (invite friends)
9. **Chat grupal** (para proyectos con varios profesionales)
10. **Videollamadas** (consultas virtuales)

### Baja Prioridad
11. **Blog integrado** (SEO content)
12. **Programa de afiliados**
13. **API pública** (para terceros)
14. **Widgets embebibles**
15. **Integración con calendarios** (Google, Outlook)

---

## 📞 SOPORTE

**Documentación Técnica:**
- `ANALISIS_BACKEND_COMPLETO.md` - Todos los endpoints
- `CAMBIOS_FRONTEND_2025-01-27.md` - Últimas actualizaciones
- `MICROSERVICES_ARCHITECTURE.md` - Arquitectura del sistema

**Reportar Bugs:**
- Crea un issue en GitHub
- O documenta en `BUGS_Y_ERRORES.md`

---

## ✅ MVP READY!

**Tu plataforma está lista para:**
1. ✅ Clientes registrados puedan buscar profesionales
2. ✅ Ver perfiles completos con fotos y reseñas
3. ✅ Chatear en tiempo real
4. ✅ Contratar mediante ofertas formales
5. ✅ Pagar de forma segura (escrow)
6. ✅ Profesionales reciban notificaciones
7. ✅ Completar trabajos y recibir pagos
8. ✅ Dejar reseñas
9. ✅ Gamificación con niveles
10. ✅ Admin gestione todo desde panel

**¡A vender! 🚀💰**
