# Limpiar Sesión - Guía de Usuario

## 🔧 Para empezar sin sesión (Primera vez)

Si actualmente tienes una sesión iniciada y quieres volver al estado inicial:

### Opción 1: Desde la Consola del Navegador (F12)
```javascript
// Ejecuta esto en la consola del navegador (F12 > Console)
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

### Opción 2: Botón de Logout
Simplemente usa el botón "Cerrar Sesión" en el navbar.

---

## ✅ Cómo Funciona Ahora

### 1. **Primera Carga (Sin sesión)**
- La aplicación inicia sin usuario autenticado
- No hay token guardado
- Muestra la pantalla de login/registro

### 2. **Después de Iniciar Sesión**
- El token y usuario se guardan en localStorage
- La sesión persiste entre recargas (F5)
- El sistema valida el token al cargar

### 3. **Validación Automática**
Cada vez que cargas la página:
```
1. Zustand carga el token guardado (si existe)
2. AuthProvider valida el token con el backend
3. Si es válido → Mantiene la sesión ✅
4. Si es inválido → Cierra sesión automáticamente ❌
```

### 4. **Tokens Expirados**
Si tu token expira:
- El sistema detecta el error 401
- Limpia automáticamente la sesión
- Te redirige al login

---

## 🔒 Seguridad Implementada

✅ **Validación al iniciar**: Verifica token con backend
✅ **Limpieza automática**: Sesiones inválidas se eliminan
✅ **Persistencia segura**: Solo tokens válidos persisten
✅ **Logout completo**: Limpia localStorage, cookies y estado

---

## 🐛 Troubleshooting

### "Sigo apareciendo con sesión iniciada"
```javascript
// Limpia todo y recarga
localStorage.clear();
location.reload();
```

### "El token no persiste después de login"
Verifica que el backend esté respondiendo correctamente a `/users/me`

### "Sesión se cierra sola"
El token puede estar expirado. El backend debe emitir tokens con tiempo de vida adecuado.

---

## 📝 Notas Técnicas

### Archivos Modificados:
1. **store/authStore.ts** - Sistema de persistencia mejorado
2. **components/providers/AuthProvider.tsx** - Validación de sesión
3. **app/providers.tsx** - Integración del AuthProvider

### Flujo de Autenticación:
```
Usuario → Login → Token guardado → F5 → Token validado → Sesión activa
                                        ↓
                                   Si inválido
                                        ↓
                                    Logout
```
