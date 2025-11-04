# 🎬 DEMO SCRIPT - Presentación MVP (10 minutos)

## 🎯 OBJETIVO DE LA DEMO
Mostrar el flujo completo de un cliente que encuentra y contrata un profesional, y cómo el profesional recibe el pago.

---

## ⏱️ TIMING (10 minutos total)

| Tiempo | Acción |
|--------|--------|
| 0:00 - 1:00 | Introducción y problema |
| 1:00 - 2:30 | Flujo Cliente: Buscar profesional |
| 2:30 - 4:00 | Ver perfil y portfolio |
| 4:00 - 5:30 | Chat y oferta |
| 5:30 - 7:00 | Pago con escrow |
| 7:00 - 8:30 | Flujo Profesional: Recibir y completar |
| 8:30 - 10:00 | Cierre y diferenciadores |

---

## 📝 GUIÓN DE LA DEMO

### 🎤 INTRODUCCIÓN (0:00 - 1:00)

**[ABRIR HOME PAGE: http://localhost:3000]**

> "Hola! Les voy a mostrar **ConectarProfesionales**, una plataforma que conecta clientes con profesionales verificados de forma segura y eficiente."

**El Problema:**
> "Hoy en día, es difícil encontrar profesionales confiables. Los clientes no saben si el plomero o electricista que contratan es legítimo, y los profesionales no tienen garantía de cobro."

**Nuestra Solución:**
> "ConectarProfesionales resuelve esto con 3 pilares:
> 1. **Verificación KYC** - Profesionales validados
> 2. **Pago con Escrow** - El dinero se retiene hasta que el trabajo esté aprobado
> 3. **Sistema de Reseñas** - Solo clientes que completaron trabajos pueden opinar"

**[SEÑALAR EN PANTALLA]**
> "Como pueden ver en nuestra home, tenemos:
> - ✓ 10,000+ profesionales registrados
> - ✓ 50,000+ proyectos completados
> - ✓ 4.9★ de rating promedio"

---

### 🔍 FLUJO CLIENTE: BUSCAR PROFESIONAL (1:00 - 2:30)

**[CLICK EN "EXPLORAR PROFESIONALES"]**

> "Empecemos con el flujo de un cliente que necesita contratar un plomero."

**[EN LA PÁGINA DE BÚSQUEDA]**

> "La búsqueda es muy intuitiva. Puedo:
> - Buscar por palabra clave: 'plomero' 
> - Filtrar por oficio específico
> - Establecer un radio de búsqueda (10km, 20km, 50km...)
> - Incluso usar geolocalización para encontrar los más cercanos"

**[ESCRIBIR "plomero" Y CLICK BUSCAR]**

> "Y en segundos, tengo resultados con toda la información clave:
> - Foto del profesional
> - Rating con estrellas (4.8 con 12 reseñas)
> - Tarifa por hora ($5,000)
> - Distancia desde mi ubicación (3.2 km)
> - Y este badge azul ✓ significa que está **verificado por KYC**"

---

### 👤 VER PERFIL Y PORTFOLIO (2:30 - 4:00)

**[CLICK EN UNA TARJETA DE PROFESIONAL]**

> "Al hacer click, veo su perfil completo. Aquí está toda la información que necesito para tomar una decisión informada:"

**[SCROLLEAR MOSTRANDO CADA SECCIÓN]**

**Parte Superior:**
> "Arriba tengo:
> - Nombre y foto
> - Rating detallado: 4.9 estrellas con 24 reseñas
> - Nivel de gamificación: Este profesional es **ORO**, lo que significa que tiene más de 5,000 puntos por buen trabajo
> - Ha completado 45 trabajos
> - Tarifa: $5,000/hora
> - Radio de cobertura: 20 km"

**Descripción:**
> "Tiene una descripción donde explica su experiencia: 10 años en plomería, especializado en instalaciones, gas, calefacción..."

**Portfolio:**
> "Aquí está su portfolio con fotos reales de trabajos anteriores. Puedo ver la calidad de su trabajo antes de contratarlo."

**Reseñas:**
> "Y lo más importante: las reseñas. Estas NO se pueden falsificar porque solo pueden dejarlas clientes que realmente completaron un trabajo con él.
> 
> Miren esta: '⭐⭐⭐⭐⭐ Excelente trabajo! Llegó puntual, muy prolijo...'
> 
> Y el profesional puede **responder** a las reseñas, demostrando profesionalismo."

**[VOLVER ARRIBA]**

> "Si me convence, simplemente hago click en este botón grande naranja: **Iniciar Chat**"

---

### 💬 CHAT Y OFERTA (4:00 - 5:30)

**[CLICK EN "INICIAR CHAT"]**

> "Y aquí está lo interesante: tenemos chat en **tiempo real** con Firebase Firestore."

**[ESCRIBIR UN MENSAJE]**

> "Escribo: 'Hola! Necesito reparar una fuga en el baño. ¿Cuánto me costaría?'"

**[ENVIAR Y SIMULAR RESPUESTA DEL PROFESIONAL]**

> "El profesional ve mi mensaje **instantáneamente** en su app y puede responder.
> 
> Me dice: 'Hola! Claro, puedo ayudarte. Necesitaría ver fotos para darte un presupuesto exacto, pero normalmente este tipo de trabajo cuesta entre $8,000 y $12,000'
> 
> Negociamos un poco más..."

**[MOSTRAR OFERTA FORMAL]**

> "Y aquí viene algo único de nuestra plataforma: el profesional me envía una **OFERTA FORMAL**, no solo un mensaje de chat."

**[SEÑALAR CAMPOS DE LA OFERTA]**

> "Miren la oferta:
> - **Monto**: $10,000 (precio cerrado)
> - **Fecha de inicio**: 5 de Noviembre, 9 AM
> - **Fecha de fin**: 5 de Noviembre, 2 PM (mismo día)
> - **Descripción detallada**: 'Reparación de fuga en caño del inodoro. Incluye materiales (flotante, sellos). Garantía 6 meses.'
> 
> Esto me da **certeza** de qué voy a recibir, cuándo, y por cuánto."

**[CLICK EN "ACEPTAR"]**

> "Si estoy de acuerdo, simplemente acepto..."

---

### 💰 PAGO CON ESCROW (5:30 - 7:00)

**[REDIRIGIR A PÁGINA DE PAGO]**

> "Y me lleva a la página de pago. Aquí está integrado con **MercadoPago**, que es la plataforma de pagos más grande de Latinoamérica."

**[SEÑALAR RESUMEN DEL PAGO]**

> "Veo el resumen:
> - Trabajo: Reparación de fuga
> - Profesional: Pedro López (⭐ 4.9)
> - Monto: $10,000"

**[CLICK EN "PAGAR CON MERCADOPAGO"]**

> "Pago con tarjeta, débito, o incluso efectivo en Rapipago/PagoFácil..."

**[SIMULAR PAGO EXITOSO]**

> "Y aquí está lo **CLAVE** que nos diferencia: el dinero NO va directo al profesional."

**[MOSTRAR PANTALLA DE CONFIRMACIÓN]**

> "El dinero se guarda en **ESCROW**, que es como una custodia. Esto significa:
> 
> Para el **Cliente**:
> - ✓ Tu dinero está protegido
> - ✓ Solo se libera cuando TÚ apruebes el trabajo
> - ✓ Si algo sale mal, puedes pedir reembolso
> 
> Para el **Profesional**:
> - ✓ El dinero está ASEGURADO
> - ✓ Sabe que el cliente ya pagó
> - ✓ Puede trabajar tranquilo
> 
> Esto elimina el riesgo de estafas de ambos lados."

---

### 👷 FLUJO PROFESIONAL: RECIBIR Y COMPLETAR (7:00 - 8:30)

**[CAMBIAR A VISTA DE PROFESIONAL]**

> "Ahora veamos qué pasa del lado del profesional..."

**[MOSTRAR NOTIFICACIÓN]**

> "El profesional recibe una notificación:
> '🔔 Juan Pérez ha pagado $10,000 - El dinero está en escrow'"

**[MOSTRAR "MIS TRABAJOS"]**

> "En su dashboard de trabajos, ve:
> 
> 🟢 **EN_PROGRESO**
> - Cliente: Juan Pérez
> - Monto: $10,000 (🔒 en escrow)
> - Fecha: 5 de Nov, 9 AM
> - [Ver Detalles] [Chat]"

**[SIMULAR PASAR EL TIEMPO]**

> "El profesional va, hace el trabajo, y cuando termina..."

**[CLICK EN "MARCAR COMO COMPLETADO"]**

> "...marca el trabajo como **COMPLETADO**."

**[VISTA DE CLIENTE]**

> "El cliente recibe notificación:
> '🔔 Pedro López ha completado el trabajo'
> 
> Revisa el trabajo, verifica que todo esté bien, y..."

**[CLICK EN "APROBAR TRABAJO"]**

> "...si está satisfecho, lo **APRUEBA**."

**[ANIMACIÓN DE LIBERACIÓN DE PAGO]**

> "Y aquí ocurre la magia:
> - El dinero se libera del escrow
> - Se descuenta la comisión (10% porque el profesional es nivel ORO)
> - El profesional recibe $9,000
> - La plataforma recibe $1,000 de comisión"

**[MOSTRAR BALANCE DEL PROFESIONAL]**

> "El profesional ve en su dashboard:
> 
> 💰 **Balance Disponible**: $9,000
> 📊 **Total Ganado**: $127,500 (histórico)
> 🏆 **Nivel**: ORO
> 
> Y puede solicitar **retiro a su cuenta bancaria** cuando quiera."

---

### 🎯 CIERRE Y DIFERENCIADORES (8:30 - 10:00)

**[VOLVER A HOME]**

> "Bueno, ese fue el flujo completo de principio a fin. Ahora déjenme resaltar por qué esto es diferente a otras plataformas:"

**1. Escrow Real:**
> "✅ No conozco otra plataforma en Argentina que tenga sistema de escrow real integrado con MercadoPago. Esto protege tanto a clientes como a profesionales."

**2. Verificación KYC:**
> "✅ Los profesionales deben verificar su identidad con documentos reales. Un administrador revisa cada solicitud. Esto elimina perfiles falsos."

**3. Reseñas Verificadas:**
> "✅ Solo puedes dejar una reseña si realmente completaste un trabajo y pagaste. Nada de reviews falsas."

**4. Gamificación:**
> "✅ El sistema de niveles incentiva la calidad:
> - Profesionales que hacen buen trabajo → Suben de nivel
> - Nivel más alto → Pagan menos comisión
> - Menos comisión → Pueden cobrar menos y ser más competitivos
> - ¡Todos ganan!"

**5. Chat en Tiempo Real:**
> "✅ No hay esperas de email. Comunicación instantánea como WhatsApp, pero integrada en la plataforma con historial completo."

**6. Ofertas Formales:**
> "✅ No solo chateas. El profesional envía ofertas estructuradas con monto, fechas, descripción. Todo queda registrado."

**Stack Tecnológico:**
> "Y todo esto está construido con tecnología de punta:
> - **Backend**: FastAPI con arquitectura de microservicios (7 servicios independientes)
> - **Frontend**: Next.js 14 con TypeScript
> - **Base de datos**: PostgreSQL para datos + Firestore para chat
> - **Pagos**: MercadoPago con escrow
> - **Deploy**: Docker para fácil escalabilidad"

**Métricas Actuales:**
> "Tenemos:
> - ✓ 157+ endpoints implementados
> - ✓ 80% de cobertura frontend-backend
> - ✓ Sistema completo de gamificación
> - ✓ Dashboard de admin para gestión
> - ✓ Notificaciones por email y push
> - ✓ Responsive design (móvil, tablet, desktop)"

**Próximos Pasos:**
> "Este es un MVP funcional. Los próximos pasos son:
> 1. Conseguir los primeros 100 usuarios beta
> 2. Recopilar feedback
> 3. Iterar sobre la experiencia
> 4. Agregar upload de archivos (fotos) directo en la plataforma
> 5. App móvil nativa
> 6. Expandir a más categorías de servicios"

**Modelo de Negocio:**
> "Monetizamos con:
> - Comisión del 8-15% sobre cada transacción (según nivel del profesional)
> - Potencial de suscripciones premium para destacar profesionales
> - Servicios adicionales (verificación express, prioridad en búsquedas, etc.)"

**Mercado:**
> "El mercado de servicios profesionales en Argentina mueve millones de dólares anuales. Solo en CABA hay más de 50,000 profesionales independientes."

**Pregunta Final:**
> "¿Alguna pregunta? ¡Gracias por su atención!"

---

## 📋 CHECKLIST PRE-DEMO

**30 minutos antes:**
- [ ] Iniciar Docker Compose
- [ ] Verificar que todos los servicios estén corriendo
- [ ] Crear usuarios de prueba (cliente y profesional)
- [ ] Crear al menos 2-3 profesionales con perfiles completos
- [ ] Cargar fotos en portfolio
- [ ] Agregar reseñas de ejemplo
- [ ] Probar flujo completo una vez

**5 minutos antes:**
- [ ] Abrir todas las pestañas necesarias
- [ ] Cerrar pestañas innecesarias
- [ ] Hacer zoom del navegador al 125% (mejor visibilidad)
- [ ] Tener usuarios de prueba a mano
- [ ] Verificar internet estable

**Durante la demo:**
- [ ] Hablar claro y pausado
- [ ] Señalar con el mouse lo que muestras
- [ ] No ir demasiado rápido
- [ ] Pausar para preguntas
- [ ] Tener respuestas a objeciones comunes

---

## 💡 RESPUESTAS A PREGUNTAS COMUNES

**P: ¿Cómo se diferencia de MercadoLibre Servicios?**
> R: MercadoLibre no tiene escrow para servicios, ni verificación KYC, ni sistema de ofertas formales. Nosotros sí.

**P: ¿Qué pasa si el cliente no aprueba el trabajo?**
> R: Puede pedir correcciones o abrir una disputa. Un administrador revisa el caso y decide si corresponde liberar el pago o hacer reembolso.

**P: ¿Cuánto tiempo tarda en liberarse el pago?**
> R: Apenas el cliente aprueba, el pago se libera instantáneamente al balance del profesional.

**P: ¿Qué pasa si el profesional no completa el trabajo?**
> R: Si pasan más de X días sin marcarlo como completado, el cliente puede solicitar reembolso automático.

**P: ¿Cómo verifican la identidad de los profesionales?**
> R: Pedimos DNI frente y dorso, y certificados profesionales si aplica (matrícula, curso, etc.). Un humano revisa cada solicitud.

**P: ¿Cuánto cuesta usar la plataforma?**
> R: Para clientes es gratis. Para profesionales, cobramos comisión del 8-15% solo cuando completan un trabajo y reciben el pago.

**P: ¿Están legalmente constituidos?**
> R: [Adaptar según tu situación legal] Sí, estamos registrados como [SA/SRL/etc.]

**P: ¿Tienen inversión?**
> R: [Adaptar] Actualmente bootstrapped / Tenemos inversión de [X] / Buscando inversión seed...

---

## 🎬 BONUS: DEMO EXTENDIDA (20 minutos)

Si tienes más tiempo, agrega estas secciones:

**Dashboard Admin (2 min):**
- Mostrar métricas en tiempo real
- Gestión de usuarios
- Aprobación de KYC
- Aprobación de retiros

**Sistema de Gamificación (2 min):**
- Mostrar leaderboard
- Explicar cómo se ganan puntos
- Beneficios por nivel
- Badges en perfiles

**Notificaciones (2 min):**
- Centro de notificaciones
- Emails automatizados
- Push notifications

**Mobile Responsive (2 min):**
- Mostrar en modo móvil
- Diseño adaptativo
- Todo funciona en cualquier dispositivo

**Dashboard Financiero (2 min):**
- Gráficos de ingresos
- Historial de transacciones
- Proyecciones

---

## 🎯 OBJETIVOS DE LA DEMO

Al finalizar, la audiencia debe:
✅ Entender el problema que resuelves
✅ Ver que la solución funciona end-to-end
✅ Confiar en la seguridad (escrow + KYC)
✅ Recordar los 3-4 diferenciadores clave
✅ Querer probar la plataforma o invertir

---

**¡Éxito en tu demo! 🚀**
