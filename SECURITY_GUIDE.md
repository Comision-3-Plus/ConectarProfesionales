# 🔐 Guía de Seguridad - ConectarProfesionales

## Índice
1. [Resumen de Seguridad](#resumen-de-seguridad)
2. [Frontend - Next.js](#frontend---nextjs)
3. [Backend - FastAPI](#backend---fastapi)
4. [Configuración HTTPS](#configuración-https)
5. [Variables de Entorno](#variables-de-entorno)
6. [Checklist de Seguridad](#checklist-de-seguridad)
7. [Monitoreo y Logs](#monitoreo-y-logs)

---

## Resumen de Seguridad

### ✅ Medidas Implementadas

#### Frontend (Next.js)
- ✅ **CSP (Content Security Policy)**: Previene XSS
- ✅ **CORS**: Restricción de orígenes
- ✅ **HSTS**: Fuerza HTTPS
- ✅ **X-Frame-Options**: Previene clickjacking
- ✅ **Middleware de autenticación**: Protección de rutas
- ✅ **Rate limiting cliente**: Previene spam
- ✅ **Sanitización de inputs**: Validación segura

#### Backend (FastAPI)
- ✅ **Rate Limiting (SlowAPI)**: 10 req/min en endpoints críticos
- ✅ **CORS restrictivo**: Solo dominios autorizados
- ✅ **TrustedHost Middleware**: Previene host header attacks
- ✅ **GZip Compression**: Optimización segura
- ✅ **Security Headers**: X-Content-Type-Options, etc.
- ✅ **JWT Authentication**: Tokens seguros
- ✅ **Password Hashing**: bcrypt con salt
- ✅ **SQL Injection Protection**: SQLAlchemy ORM
- ✅ **Request Logging**: Auditoría completa

---

## Frontend - Next.js

### 1. Content Security Policy (CSP)

**Ubicación**: `frontend/next.config.ts`

```typescript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' https: data:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://www.google-analytics.com",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
}
```

**Qué previene**:
- ✅ Inyección de scripts maliciosos (XSS)
- ✅ Carga de recursos de dominios no autorizados
- ✅ Clickjacking mediante iframes

**Cómo modificar**:
Si necesitas agregar un nuevo dominio externo:

```typescript
// Ejemplo: agregar cdn.example.com para imágenes
"img-src 'self' https: data: https://cdn.example.com"
```

### 2. Middleware de Autenticación

**Ubicación**: `frontend/middleware.ts`

**Rutas protegidas**:
```typescript
const protectedRoutes = [
  '/dashboard',
  '/perfil',
  '/configuracion',
];

const adminRoutes = [
  '/admin',
];
```

**Funcionalidad**:
- Verifica token de autenticación en cookies
- Redirige a `/login` si no hay token
- Redirige a `/dashboard` si ya está autenticado
- Headers adicionales para rutas de admin

**Agregar nueva ruta protegida**:
```typescript
const protectedRoutes = [
  '/dashboard',
  '/perfil',
  '/configuracion',
  '/mis-trabajos', // ← Nueva ruta
];
```

### 3. Utilidades de Seguridad

**Ubicación**: `frontend/lib/security.ts`

#### Sanitización HTML
```typescript
import { sanitizeHtml } from '@/lib/security';

const userInput = '<script>alert("XSS")</script>';
const safe = sanitizeHtml(userInput);
// → '&lt;script&gt;alert("XSS")&lt;/script&gt;'
```

#### Validación de Email
```typescript
import { isValidEmail } from '@/lib/security';

isValidEmail('user@example.com'); // true
isValidEmail('invalid-email'); // false
```

#### Validación de Contraseña Segura
```typescript
import { isStrongPassword } from '@/lib/security';

const result = isStrongPassword('weak');
/*
{
  isValid: false,
  errors: [
    'La contraseña debe tener al menos 8 caracteres',
    'Debe contener al menos una letra mayúscula',
    // ...
  ]
}
*/
```

#### Rate Limiting Cliente
```typescript
import { ClientRateLimiter } from '@/lib/security';

const limiter = new ClientRateLimiter('login', 5, 60000); // 5 intentos por minuto

if (limiter.canProceed()) {
  // Proceder con login
} else {
  const remainingMs = limiter.getRemainingTime();
  console.log(`Espera ${remainingMs}ms antes de reintentar`);
}
```

---

## Backend - FastAPI

### 1. Rate Limiting

**Ubicación**: `app/main.py`

**Configuración actual**:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/")
@limiter.limit("10/minute")
async def root():
    return {"status": "ok"}
```

**Modificar límites**:
```python
# Diferentes límites por endpoint
@app.post("/api/v1/login")
@limiter.limit("5/minute")  # Más restrictivo para login
async def login():
    pass

@app.get("/api/v1/data")
@limiter.limit("100/minute")  # Más permisivo para lectura
async def get_data():
    pass
```

**Límites recomendados**:
- Login/Register: `5/minute`
- Búsquedas: `30/minute`
- Creación de contenido: `10/minute`
- Lectura de datos: `100/minute`

### 2. CORS Configuration

**Ubicación**: `app/main.py`

**Configuración actual**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://conectarprofesionales.com",
        "https://www.conectarprofesionales.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)
```

**⚠️ IMPORTANTE**: En producción, nunca usar:
```python
allow_origins=["*"]  # ❌ PELIGROSO
```

**Agregar nuevo dominio**:
```python
allow_origins=[
    "http://localhost:3000",
    "https://conectarprofesionales.com",
    "https://app.conectarprofesionales.com",  # ← Nuevo subdominio
],
```

### 3. Trusted Host Middleware

**Ubicación**: `app/main.py`

```python
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "conectarprofesionales.com",
            "www.conectarprofesionales.com",
            "api.conectarprofesionales.com"
        ]
    )
```

**Qué previene**: Host Header Injection attacks

### 4. Security Headers Middleware

**Ubicación**: `app/main.py`

```python
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response
```

### 5. JWT Authentication

**Ubicación**: `app/core/security.py`

**Configuración**:
```python
SECRET_KEY = os.getenv("SECRET_KEY")  # Debe ser aleatorio y secreto
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

**⚠️ CRÍTICO**: 
- `SECRET_KEY` debe ser un string aleatorio de 64+ caracteres
- Nunca commitear en Git
- Rotar periódicamente (cada 90 días)

**Generar SECRET_KEY seguro**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## Configuración HTTPS

### Opción 1: Nginx + Let's Encrypt (Recomendado)

#### Paso 1: Instalar Certbot
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Windows (WSL requerido)
wsl --install Ubuntu
```

#### Paso 2: Configurar Nginx

**Archivo**: `/etc/nginx/sites-available/conectarprofesionales`

```nginx
server {
    listen 80;
    server_name conectarprofesionales.com www.conectarprofesionales.com;
    
    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name conectarprofesionales.com www.conectarprofesionales.com;

    # Certificados SSL (Let's Encrypt los generará)
    ssl_certificate /etc/letsencrypt/live/conectarprofesionales.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/conectarprofesionales.com/privkey.pem;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend FastAPI
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Paso 3: Obtener Certificado
```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/conectarprofesionales /etc/nginx/sites-enabled/

# Test configuración
sudo nginx -t

# Obtener certificado
sudo certbot --nginx -d conectarprofesionales.com -d www.conectarprofesionales.com

# Auto-renovación (certbot lo configura automáticamente)
sudo certbot renew --dry-run
```

### Opción 2: Cloudflare (Más fácil)

1. Agregar dominio a Cloudflare
2. Actualizar nameservers del registrador
3. En Cloudflare Dashboard:
   - SSL/TLS → Full (strict)
   - Edge Certificates → Always Use HTTPS: ON
   - Edge Certificates → Automatic HTTPS Rewrites: ON
   - Edge Certificates → Minimum TLS Version: 1.2

### Opción 3: Desarrollo Local (Auto-firmado)

```bash
# Generar certificado auto-firmado
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout key.pem -out cert.pem -days 365 \
  -subj "/CN=localhost"

# Next.js con HTTPS
# package.json
"dev": "next dev --experimental-https --experimental-https-key ./key.pem --experimental-https-cert ./cert.pem"
```

---

## Variables de Entorno

### Frontend - `.env.local`

```bash
# API URL
NEXT_PUBLIC_API_URL=https://api.conectarprofesionales.com

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=conectar-pro.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=conectar-pro

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Mercado Pago
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxx

# Entorno
NODE_ENV=production
```

### Backend - `.env`

```bash
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/conectar_pro

# Seguridad
SECRET_KEY=tu-secret-key-super-seguro-de-64-caracteres-minimo
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Firebase Admin
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=conectar-pro
FIREBASE_PRIVATE_KEY_ID=xxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@conectar-pro.iam.gserviceaccount.com

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx

# CORS
ALLOWED_ORIGINS=https://conectarprofesionales.com,https://www.conectarprofesionales.com

# Entorno
DEBUG=False
ENVIRONMENT=production
```

### 🔒 Seguridad de Variables de Entorno

**NUNCA**:
- ❌ Commitear `.env` en Git
- ❌ Compartir SECRET_KEY
- ❌ Usar valores de desarrollo en producción

**SIEMPRE**:
- ✅ Agregar `.env` al `.gitignore`
- ✅ Usar diferentes secrets por entorno
- ✅ Rotar credenciales regularmente
- ✅ Usar gestores de secrets (AWS Secrets Manager, Azure Key Vault)

**Generar secrets seguros**:
```bash
# SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Database password
python -c "import secrets; import string; print(''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32)))"
```

---

## Checklist de Seguridad

### 🚀 Pre-Deploy

- [ ] Todas las variables de entorno configuradas
- [ ] SECRET_KEY generado aleatoriamente
- [ ] DEBUG=False en backend
- [ ] NODE_ENV=production en frontend
- [ ] CORS configurado con dominios específicos
- [ ] HTTPS configurado y funcionando
- [ ] Certificados SSL válidos
- [ ] Rate limiting activado
- [ ] CSP configurado correctamente
- [ ] `.env` en `.gitignore`
- [ ] Dependencias actualizadas
- [ ] Logs configurados

### 🔄 Post-Deploy

- [ ] Probar login/logout
- [ ] Verificar HTTPS redirect
- [ ] Comprobar headers de seguridad
- [ ] Testear rate limiting
- [ ] Revisar logs por errores
- [ ] Monitorear tráfico sospechoso
- [ ] Backup de base de datos configurado

### 📅 Mantenimiento Regular

**Semanal**:
- [ ] Revisar logs de errores
- [ ] Monitorear intentos de login fallidos
- [ ] Verificar uso de API

**Mensual**:
- [ ] Actualizar dependencias
- [ ] Revisar políticas de seguridad
- [ ] Auditar accesos de usuarios

**Trimestral**:
- [ ] Rotar SECRET_KEY
- [ ] Renovar certificados SSL (si no es automático)
- [ ] Auditoría de seguridad completa
- [ ] Revisar y actualizar CSP

---

## Monitoreo y Logs

### Backend - Logging

**Ubicación**: `app/main.py`

```python
import logging

# Configurar logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Middleware de logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    logger.info(
        f"{request.method} {request.url.path} "
        f"completed in {process_time:.3f}s "
        f"with status {response.status_code}"
    )
    
    return response
```

### Monitorear Logs

```bash
# Ver logs en tiempo real
tail -f app.log

# Filtrar errores
grep "ERROR" app.log

# Contar requests por IP
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head -10

# Detectar intentos de login fallidos
grep "401" app.log | grep "/api/v1/login"
```

### Alertas Recomendadas

**Configurar alertas para**:
- ❗ Más de 10 errores 500 por minuto
- ❗ Más de 20 intentos de login fallidos desde misma IP
- ❗ Rate limit excedido > 100 veces por hora
- ❗ Uso de disco > 90%
- ❗ Tiempo de respuesta > 5 segundos

---

## 🆘 Respuesta a Incidentes

### Si detectas actividad sospechosa:

1. **Bloquear IP**:
```bash
# Nginx
sudo ufw deny from <IP_ADDRESS>

# iptables
sudo iptables -A INPUT -s <IP_ADDRESS> -j DROP
```

2. **Rotar credenciales**:
```bash
# Generar nuevo SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Actualizar .env
# Reiniciar servicios
```

3. **Revisar logs**:
```bash
# Últimas 1000 líneas
tail -n 1000 app.log

# Buscar IP sospechosa
grep "<IP_ADDRESS>" app.log
```

4. **Notificar**:
- Equipo de desarrollo
- Usuarios afectados (si aplica)
- Servicios de terceros comprometidos

---

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)

---

## ✅ Resumen Ejecutivo

**Tu aplicación ahora tiene**:
- 🛡️ Protección contra XSS, CSRF, Clickjacking
- 🚦 Rate limiting en backend y cliente
- 🔐 Autenticación JWT segura
- 🌐 CORS restrictivo
- 📝 Logging completo
- 🔒 Headers de seguridad modernos
- ✨ Middleware de protección de rutas

**Próximos pasos para producción**:
1. Configurar HTTPS con Let's Encrypt
2. Configurar variables de entorno de producción
3. Activar modo producción (DEBUG=False)
4. Configurar backups automáticos
5. Implementar monitoreo de logs

**¿Necesitas ayuda?** Consulta cada sección para instrucciones detalladas.
