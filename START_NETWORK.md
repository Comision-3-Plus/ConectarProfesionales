# 🚀 Inicio Rápido - Acceso en Red

## Problema Solucionado ✅

1. ✅ **Sin estilos en red** → Configurado Next.js para red local
2. ✅ **CORS errors** → Backend acepta conexiones desde IP de red
3. ⚠️ **"No seguro"** → Normal con HTTP (ver explicación abajo)

## Configuración Completada

### Archivos Modificados:
- ✅ `frontend/package.json` - Script dev con `-H 0.0.0.0`
- ✅ `frontend/next.config.ts` - Assets y CSP configurados
- ✅ `frontend/.env.local` - API_URL actualizada a IP de red
- ✅ `app/main.py` - CORS permite IP de red (26.224.83.238)

### Scripts Creados:
- 📜 `start-network.ps1` - Inicia frontend y backend automáticamente
- 📜 `check-network.ps1` - Verifica configuración
- 📜 `setup-firewall.ps1` - Configura firewall de Windows

## Pasos para Iniciar

### 1️⃣ Configurar Firewall (UNA VEZ)

```powershell
# Click derecho en PowerShell → Ejecutar como Administrador
.\setup-firewall.ps1
```

Esto permite conexiones en los puertos 3000 y 8000.

### 2️⃣ Iniciar Servidores

**Opción A: Script Automático (Recomendado)**
```powershell
.\start-network.ps1
```
Abrirá 2 ventanas: una para frontend y otra para backend.

**Opción B: Manual**
```powershell
# Terminal 1 - Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3️⃣ Acceder desde la Red

Abre en cualquier dispositivo conectado a tu red:
```
http://26.224.83.238:3000
```

✅ **Ahora los estilos funcionarán correctamente**

## Verificar Configuración

```powershell
.\check-network.ps1
```

Muestra:
- IP de red detectada
- Estado de puertos
- Reglas de firewall
- Configuración de archivos

## Sobre "No Seguro" 🔒

### ¿Por qué aparece?

El navegador muestra "No seguro" porque estás usando **HTTP** (no encriptado) en lugar de **HTTPS** (encriptado).

### ¿Es un problema?

**Para desarrollo local en red**: ❌ No es problema
- Los datos viajan dentro de tu red local
- Es seguro para testing interno
- Los estilos y funcionalidad trabajan perfectamente

**Para usuarios externos**: ✅ Necesitas HTTPS
- Datos viajan por internet
- Requiere certificado SSL
- Navegadores bloquean algunas funciones sin HTTPS

### Soluciones

#### 1. Aceptar HTTP en Desarrollo (Actual)
✅ Más fácil
✅ Funciona inmediatamente
❌ Aparece "No seguro"

**Usar cuando**:
- Testing interno
- Desarrollo en equipo
- Demos en red local

#### 2. HTTPS Local (Desarrollo Avanzado)

Instala mkcert para certificados locales:

```powershell
# Instalar mkcert
choco install mkcert

# Generar certificados
cd frontend
mkcert -install
mkcert localhost 26.224.83.238 127.0.0.1

# Los archivos se crean: localhost+3.pem y localhost+3-key.pem

# Actualizar package.json
"dev": "next dev --turbopack -H 0.0.0.0 --experimental-https --experimental-https-key ./localhost+3-key.pem --experimental-https-cert ./localhost+3.pem"
```

✅ Sin mensaje "No seguro"
✅ HTTPS real
❌ Más complejo

#### 3. Cloudflare Tunnel (Compartir Públicamente)

Para compartir con usuarios externos:

```powershell
# Instalar cloudflared
choco install cloudflared

# Crear túnel temporal
cloudflared tunnel --url http://localhost:3000
```

Te da una URL pública con HTTPS:
```
https://random-name.trycloudflare.com
```

✅ HTTPS gratis
✅ Accesible desde internet
✅ Fácil de usar
❌ URL cambia cada vez

#### 4. Producción Real (HTTPS Permanente)

Para deployment real, sigue `SECURITY_GUIDE.md`:
- Dominio propio
- Certificado Let's Encrypt (gratis)
- Nginx/Cloudflare
- HTTPS permanente

## Troubleshooting

### Los estilos aún no cargan

1. **Limpiar caché de Next.js**
```powershell
cd frontend
Remove-Item -Recurse -Force .next
npm run dev
```

2. **Verificar que el servidor escucha en 0.0.0.0**
```powershell
# Debe mostrar 0.0.0.0:3000, no 127.0.0.1:3000
Get-NetTCPConnection -LocalPort 3000
```

3. **Hard refresh en navegador**
- Chrome/Edge: `Ctrl + Shift + R`
- Firefox: `Ctrl + F5`

### CORS Error en consola

Verifica que el backend incluya tu IP:
```python
# app/main.py
allowed_origins = [
    "http://26.224.83.238:3000",  # ← Tu IP debe estar aquí
]
```

### No puedes acceder desde otro dispositivo

1. **Verifica que estén en la misma red WiFi**

2. **Verifica firewall**
```powershell
.\setup-firewall.ps1
```

3. **Verifica IP**
```powershell
ipconfig
# Busca IPv4 de tu adaptador WiFi/Ethernet
```

### Página carga muy lento

Desactiva temporalmente el antivirus o agrega excepción para los puertos 3000 y 8000.

## URLs de Acceso

| Servicio | URL Local | URL Red |
|----------|-----------|---------|
| Frontend | http://localhost:3000 | http://26.224.83.238:3000 |
| Backend API | http://localhost:8000 | http://26.224.83.238:8000 |
| API Docs | http://localhost:8000/docs | http://26.224.83.238:8000/docs |

## Comandos Útiles

```powershell
# Ver IP actual
ipconfig

# Ver puertos en uso
Get-NetTCPConnection -LocalPort 3000,8000

# Matar proceso en puerto 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Ver logs de firewall
Get-NetFirewallRule -DisplayName "*Dev Server*" | Format-List
```

## Siguiente Paso

Una vez que todo funcione en red:
1. ✅ Los estilos cargan correctamente
2. ✅ La app responde desde otros dispositivos
3. ⚠️ Ignora el mensaje "No seguro" (normal en desarrollo)

**Para producción**, consulta:
- `SECURITY_GUIDE.md` - Configuración HTTPS
- `SECURITY_CHECKLIST.md` - Checklist de deploy

---

**¿Todo funcionando?** 🎉
Ahora puedes compartir http://26.224.83.238:3000 con dispositivos en tu red!
