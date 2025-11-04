# 🎯 GUÍA PASO A PASO - PRIMEROS USUARIOS

## 👤 COMO USUARIO (CLIENTE) - Contratar un Profesional

### Paso 1: Registro
```
1. Abre http://localhost:3000
2. Click en "Registrarse" (esquina superior derecha)
3. Completa el formulario:
   ✏️ Nombre: Juan
   ✏️ Apellido: Pérez
   ✏️ Email: juan@cliente.com
   ✏️ Contraseña: MiPass123!
   ✏️ ROL: CLIENTE ← ¡Importante!
4. Click "Registrarse"
5. Ya estás logueado ✅
```

### Paso 2: Buscar Profesionales
```
1. En la home, click en "Explorar Profesionales"
   O ve directo a http://localhost:3000/explorar

2. Verás el buscador con filtros:
   🔍 Palabra clave: "plomero" o "electricista"
   🏷️ Oficio: Selecciona de la lista (opcional)
   📏 Radio: 10 km, 20 km, 50 km...
   📍 Ubicación: Deja vacío o ingresa lat/lon

3. Click "Buscar"
```

### Paso 3: Ver Resultados
```
Verás tarjetas de profesionales con:
📸 Foto de perfil
👤 Nombre completo
⭐ Rating (4.8) y (12 reseñas)
💰 Tarifa: $5,000/hora
🏷️ Oficios: [Plomería] [Gasista]
📍 Distancia: 3.2 km
✓ Badge azul = Verificado
```

### Paso 4: Ver Perfil Completo
```
1. Click en cualquier tarjeta

Verás:
📋 Información básica
   - Nombre, foto, biografía
   - Rating detallado ⭐⭐⭐⭐⭐
   - Nivel de gamificación (Bronce/Plata/Oro/Diamante)
   - Trabajos completados

📝 Descripción detallada
   - Experiencia en años
   - Especialidades
   - Forma de trabajar

🎨 Portfolio
   - Fotos de trabajos anteriores
   - Títulos y descripciones

⭐ Reseñas
   - Comentarios de otros clientes
   - Calificaciones
   - Respuestas del profesional

💰 Tarifa y cobertura
   - Precio por hora
   - Radio de cobertura
   - Ubicación base

🔘 Botón "Iniciar Chat" o "Contactar Profesional"
```

### Paso 5: Iniciar Chat
```
1. Click en "Iniciar Chat" (botón naranja)

2. Se abre la ventana de chat:
   💬 Campo de texto abajo
   ➤ Botón enviar
   
3. Escribe tu mensaje:
   "Hola! Necesito reparar una fuga en el baño.
    ¿Cuánto me costaría?"

4. Presiona Enter o click en ➤

5. El mensaje se envía INSTANTÁNEAMENTE ⚡
   - Aparece en tu pantalla
   - El profesional lo recibe en tiempo real
```

### Paso 6: Negociar y Recibir Oferta
```
1. El profesional te responde:
   "Hola Juan! Claro, puedo ayudarte.
    Necesitaría ver fotos para darte un presupuesto.
    Pero normalmente este tipo de trabajo cuesta
    entre $8,000 y $12,000"

2. Envías fotos (por ahora solo texto):
   "Te paso las fotos por WhatsApp: +54..."

3. Profesional analiza y envía OFERTA FORMAL:
   
   📋 OFERTA #001
   💰 Monto: $10,000
   📅 Inicio: 5 de Nov, 9:00 AM
   📅 Fin estimado: 5 de Nov, 2:00 PM
   📝 Descripción:
      "Reparación de fuga en caño del inodoro.
       Incluye materiales (flotante, sellos).
       Garantía 6 meses."
   
   [Aceptar] [Rechazar]
```

### Paso 7: Aceptar Oferta y Pagar
```
1. Revisas la oferta
2. Si estás de acuerdo, click "Aceptar"

3. Te redirige a página de pago:
   🎯 Trabajo: Reparación de fuga
   👷 Profesional: Pedro López (⭐ 4.9)
   💰 Monto total: $10,000
   
   [Pagar con MercadoPago]

4. Click "Pagar con MercadoPago"

5. Se abre MercadoPago:
   - Tarjeta de crédito
   - Tarjeta de débito
   - Efectivo (Rapipago, PagoFácil)
   
6. Completas el pago

7. ✅ PAGO CONFIRMADO
   
   ⚠️ IMPORTANTE:
   El dinero NO va directo al profesional.
   Se guarda en ESCROW (custodia)
   hasta que TÚ apruebes el trabajo.
```

### Paso 8: Seguimiento del Trabajo
```
1. Ve a "Mis Trabajos" en el menú
   O http://localhost:3000/trabajos

2. Verás tu trabajo:
   
   🟢 EN_PROGRESO
   Reparación de fuga
   Profesional: Pedro López
   Monto: $10,000 (en escrow 🔒)
   Fecha: 5 de Nov, 9:00 AM
   
   [Ver Detalles] [Chat]

3. Puedes seguir chateando con el profesional
4. Recibe actualizaciones en tiempo real
5. Te notifican cuando el profesional termine
```

### Paso 9: Aprobar Trabajo Completado
```
1. El profesional marca el trabajo como "COMPLETADO"

2. Recibes notificación:
   🔔 "Pedro López ha completado el trabajo"

3. Revisas el trabajo realizado:
   - ¿Quedó bien?
   - ¿Funciona correctamente?
   - ¿Estás satisfecho?

4. Si TODO está OK:
   Click "Aprobar Trabajo"

5. ✅ DINERO LIBERADO
   - Se descuenta comisión (8-15%)
   - Profesional recibe el pago
   - Trabajo marcado como APROBADO

6. Si NO estás satisfecho:
   - Puedes pedir correcciones
   - O solicitar reembolso
   - (requiere revisión de admin)
```

### Paso 10: Dejar Reseña
```
1. Después de aprobar, aparece formulario:

   ¿Cómo fue tu experiencia?
   
   ⭐⭐⭐⭐⭐ (Click en las estrellas)
   
   Comentario (opcional):
   ┌─────────────────────────────────┐
   │ "Excelente trabajo! Llegó      │
   │  puntual, muy prolijo y el     │
   │  precio fue justo. 100%        │
   │  recomendado!"                 │
   └─────────────────────────────────┘
   
   [Enviar Reseña]

2. La reseña aparece en el perfil del profesional
3. Ayuda a otros clientes a elegir
4. El profesional puede responder
```

---

## 👷 COMO PROFESIONAL - Recibir Trabajos

### Paso 1: Registro
```
1. Abre http://localhost:3000
2. Click "Registrarse"
3. Completa:
   ✏️ Nombre: Pedro
   ✏️ Apellido: López
   ✏️ Email: pedro@profesional.com
   ✏️ Contraseña: MiPass123!
   ✏️ ROL: PROFESIONAL ← ¡Importante!
4. Registrarse
```

### Paso 2: Completar Perfil (¡CRÍTICO!)
```
1. Te redirige automáticamente a:
   http://localhost:3000/perfil/editar

2. Completa TODA la información:

📋 Información Básica:
   Biografía: "Plomero con 10 años de experiencia"
   Descripción: "Especializado en instalaciones
                 sanitarias, gas, calefacción.
                 Trabajo con garantía de 6 meses.
                 Atiendo emergencias 24/7."
   Años experiencia: 10
   Tarifa/hora: 5000 (ARS)

📍 Ubicación:
   Click "Usar mi ubicación" (autocompleta)
   O ingresa manualmente:
   Latitud: -34.6037
   Longitud: -58.3816
   Radio cobertura: 20 km

⭐ Habilidades:
   + Instalaciones sanitarias
   + Reparación de fugas
   + Destapaciones
   + Gas natural
   + Calefacción
   + Termotanques
   [Agregar más...]

🏆 Certificaciones:
   + Matrícula ENRE 2023
   + Gasista Matriculado CAT. II
   + Curso de instalaciones domiciliarias
   [Agregar más...]

📸 Imágenes de Trabajos:
   (Por ahora, URLs de Imgur)
   + https://i.imgur.com/abc123.jpg
   + https://i.imgur.com/def456.jpg
   + https://i.imgur.com/ghi789.jpg

✅ Disponibilidad:
   ON ← Importante! Si está OFF, no apareces en búsquedas

3. Click "Guardar Cambios"
```

### Paso 3: Agregar Oficios
```
1. En tu perfil, sección "Oficios"

2. Busca y agrega:
   + Plomería ✓
   + Gasista ✓
   
3. Aparecen en tu perfil público
4. Los clientes te encuentran al buscar "plomero"
```

### Paso 4: Subir Portfolio (Opcional pero Recomendado)
```
1. Ve a "Portfolio" en el menú

2. Click "Agregar Trabajo"

3. Completa:
   Título: "Instalación de baño completo"
   Descripción: "Baño completo en depto. CABA"
   Imágenes: [URLs de tus fotos]

4. Guardar

5. Repite para más trabajos
6. ¡Muestra tu mejor trabajo!
```

### Paso 5: Esperar Mensajes
```
1. Los clientes te contactan desde tu perfil público

2. Recibes NOTIFICACIÓN:
   🔔 "Juan Pérez te ha enviado un mensaje"

3. Ve a "Mensajes" en el menú
   O http://localhost:3000/chat

4. Verás la lista de conversaciones:
   
   💬 Juan Pérez
      "Hola! Necesito reparar una fuga..."
      Hace 2 minutos

5. Click en la conversación
```

### Paso 6: Chatear y Negociar
```
1. Lee el mensaje del cliente
2. Responde:
   
   "Hola Juan! Claro, puedo ayudarte.
    ¿Me pasas fotos de la fuga?
    ¿Cuándo necesitas que vaya?"

3. Cliente responde con detalles
4. Negocias precio, horario, etc.
```

### Paso 7: Enviar Oferta Formal
```
1. Cuando acuerden todo, click "Enviar Oferta"

2. Completa el formulario:
   
   💰 Monto Total: 10000
   📅 Fecha Inicio: 5 de Nov, 9:00 AM
   📅 Fecha Fin: 5 de Nov, 2:00 PM
   📝 Descripción:
      "Reparación de fuga en caño del inodoro.
       Incluye materiales (flotante, sellos).
       Garantía 6 meses."
   
   [Enviar Oferta]

3. El cliente recibe la oferta EN EL CHAT
4. Puede aceptar o rechazar
```

### Paso 8: Cliente Acepta y Paga
```
1. Cliente acepta tu oferta ✅
2. Paga con MercadoPago
3. Recibes NOTIFICACIÓN:
   
   🔔 "Juan Pérez ha pagado $10,000"
   
4. El dinero está en ESCROW (custodia)
   - No lo tienes todavía
   - Pero está ASEGURADO
   - Lo recibirás cuando completes

5. El trabajo aparece en "Mis Trabajos":
   
   🟢 EN_PROGRESO
   Reparación de fuga
   Cliente: Juan Pérez
   Monto: $10,000 (en escrow 🔒)
   Fecha: 5 de Nov, 9:00 AM
```

### Paso 9: Realizar el Trabajo
```
1. Vas a la dirección del cliente
2. Realizas el trabajo acordado
3. Mantienes comunicación por chat:
   
   "Hola Juan, ya llegué.
    Estoy revisando el problema..."
   
   "Encontré el problema, es el flotante.
    Voy a reemplazarlo..."
   
   "Listo! Ya quedó arreglado.
    Te dejé todo limpio y ordenado."

4. Cliente ve los mensajes en tiempo real
```

### Paso 10: Marcar como Completado
```
1. Cuando termines TODO el trabajo

2. Ve a "Mis Trabajos"

3. Click en el trabajo

4. Click "Marcar como Completado"

5. El cliente recibe notificación:
   🔔 "Pedro López ha completado el trabajo"

6. Cliente revisa y aprueba

7. ¡DINERO LIBERADO! 💰
   - Se descuenta comisión (15% Bronce)
   - Recibes: $8,500
   - Plataforma: $1,500
```

### Paso 11: Recibir el Pago
```
1. El dinero va a tu "Balance Disponible"

2. Ve a "Pagos" o "Dashboard Financiero"

3. Verás:
   💰 Balance Disponible: $8,500
   ⏳ Pendiente (escrow): $0
   📊 Total Ganado: $8,500

4. Puedes solicitar RETIRO cuando quieras
```

### Paso 12: Configurar Cuenta Bancaria
```
1. En "Pagos" → "Configurar Cuenta"

2. Completa:
   Tipo: CBU o Alias
   CBU: 0000003100012345678901
   Titular: Pedro López
   Banco: Banco Nación

3. Guardar

4. ✅ Cuenta configurada
```

### Paso 13: Solicitar Retiro
```
1. En "Pagos" → "Solicitar Retiro"

2. Monto: 8500 (mínimo $1,000)

3. Confirmar

4. Estado: PENDIENTE (admin debe aprobar)

5. Admin aprueba ✅

6. Recibes transferencia en 24-48hs

7. ¡DINERO EN TU CUENTA! 🎉
```

### Paso 14: Subir de Nivel (Gamificación)
```
Al completar trabajos, ganas PUNTOS:
✅ Trabajo completado: +100 pts
⭐ Reseña 5 estrellas: +50 pts

Niveles:
🥉 Bronce (0-999): 15% comisión
🥈 Plata (1,000-4,999): 12% comisión
🥇 Oro (5,000-9,999): 10% comisión
💎 Diamante (10,000+): 8% comisión

¡Entre mejor trabajes, menos pagas de comisión!
```

---

## 🎯 CONSEJOS PARA TENER ÉXITO

### Para Clientes:
✅ Lee las reseñas antes de contratar
✅ Chatea con varios profesionales
✅ Compara precios y tiempos
✅ Pide fotos de trabajos anteriores
✅ Deja reseñas honestas

### Para Profesionales:
✅ Completa TODO tu perfil (100%)
✅ Sube fotos de tus MEJORES trabajos
✅ Responde RÁPIDO a los mensajes
✅ Sé CLARO en tus ofertas
✅ Cumple con los PLAZOS prometidos
✅ Trabaja con CALIDAD
✅ Pide RESEÑAS a clientes satisfechos
✅ Verifica tu cuenta (KYC) cuanto antes

---

## 📱 ATAJOS ÚTILES

### URLs Rápidas:
- 🏠 Home: http://localhost:3000
- 🔍 Buscar: http://localhost:3000/explorar
- 💬 Chat: http://localhost:3000/chat
- 🔨 Trabajos: http://localhost:3000/trabajos
- 👤 Perfil: http://localhost:3000/perfil
- ✏️ Editar: http://localhost:3000/perfil/editar
- 💰 Pagos: http://localhost:3000/dashboard/profesional/pagos

### Comandos Docker:
```powershell
# Ver servicios corriendo
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar todo
docker-compose restart

# Detener todo
docker-compose down

# Iniciar todo de nuevo
docker-compose up -d
```

---

## 🆘 PROBLEMAS COMUNES

### "No veo profesionales en la búsqueda"
✅ Verifica que:
   - Haya al menos 1 profesional registrado
   - Tenga `disponible: true`
   - Tenga al menos 1 oficio asignado
   - Esté dentro del radio de búsqueda (o busca sin filtro geo)

### "El chat no envía mensajes"
✅ Verifica:
   - Firebase credentials en `.env`
   - Console del navegador (F12) para errores
   - Servicio de chat corriendo (puerto 8004)

### "No puedo pagar con MercadoPago"
✅ Verifica:
   - Estás usando credenciales de TEST
   - Usa tarjetas de prueba de MercadoPago
   - Servicio de pagos corriendo (puerto 8005)

### "Error 401 - Unauthorized"
✅ Token JWT expirado, vuelve a hacer login

---

## 🎉 ¡FELICITACIONES!

Ya sabes usar la plataforma de principio a fin.

**Como Cliente**: Encontrar, contratar y pagar profesionales
**Como Profesional**: Recibir trabajos y cobrar de forma segura

¡Ahora a conseguir los primeros usuarios reales! 🚀
