# 💡 Ejemplos Prácticos de Uso - Seguridad

## Índice
1. [Formularios Seguros](#formularios-seguros)
2. [Autenticación](#autenticación)
3. [Rate Limiting](#rate-limiting)
4. [Validaciones](#validaciones)
5. [Headers de Seguridad](#headers-de-seguridad)

---

## 1. Formularios Seguros

### Ejemplo: Formulario de Contacto con Validación

```typescript
'use client';

import { useState } from 'react';
import { sanitizeHtml, validateInput, isValidEmail } from '@/lib/security';
import { ClientRateLimiter } from '@/lib/security';

// Rate limiter para formulario de contacto (3 envíos por minuto)
const contactLimiter = new ClientRateLimiter('contact-form', 3, 60000);

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    // Verificar rate limiting
    if (!contactLimiter.canProceed()) {
      const remainingMs = contactLimiter.getRemainingTime();
      const seconds = Math.ceil(remainingMs / 1000);
      alert(`Por favor espera ${seconds} segundos antes de enviar otro mensaje.`);
      return;
    }

    // Validar nombre
    if (!validateInput(formData.name, 100)) {
      newErrors.push('Nombre inválido o muy largo');
    }

    // Validar email
    if (!isValidEmail(formData.email)) {
      newErrors.push('Email inválido');
    }

    // Validar mensaje
    if (!validateInput(formData.message, 1000)) {
      newErrors.push('Mensaje inválido o muy largo');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Sanitizar antes de enviar
    const sanitizedData = {
      name: sanitizeHtml(formData.name),
      email: formData.email, // Email ya fue validado
      message: sanitizeHtml(formData.message),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData),
      });

      if (response.ok) {
        alert('Mensaje enviado correctamente');
        setFormData({ name: '', email: '', message: '' });
      } else {
        alert('Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Nombre</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          maxLength={100}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="message">Mensaje</label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          maxLength={1000}
          rows={5}
          required
        />
      </div>

      {errors.length > 0 && (
        <div className="text-red-500">
          {errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}

      <button type="submit">Enviar</button>
    </form>
  );
}
```

---

## 2. Autenticación

### Ejemplo: Login con Rate Limiting

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isValidEmail, isStrongPassword } from '@/lib/security';
import { ClientRateLimiter } from '@/lib/security';

// Rate limiter para login (5 intentos por minuto)
const loginLimiter = new ClientRateLimiter('login', 5, 60000);

export default function LoginForm() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verificar rate limiting
    if (!loginLimiter.canProceed()) {
      const remainingMs = loginLimiter.getRemainingTime();
      const seconds = Math.ceil(remainingMs / 1000);
      setError(`Demasiados intentos. Espera ${seconds} segundos.`);
      return;
    }

    // Validar email
    if (!isValidEmail(credentials.email)) {
      setError('Email inválido');
      return;
    }

    try {
      const response = await fetch('/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include', // Importante para cookies
      });

      if (response.ok) {
        const data = await response.json();
        // Token se guarda automáticamente en cookie httpOnly
        router.push('/dashboard');
      } else if (response.status === 401) {
        setError('Credenciales incorrectas');
      } else if (response.status === 429) {
        setError('Demasiados intentos. Intenta más tarde.');
      } else {
        setError('Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Error de conexión');
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          required
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button type="submit">Iniciar Sesión</button>
    </form>
  );
}
```

### Ejemplo: Registro con Validación de Contraseña

```typescript
'use client';

import { useState } from 'react';
import { isValidEmail, isStrongPassword, sanitizeHtml } from '@/lib/security';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    
    // Validar contraseña en tiempo real
    const validation = isStrongPassword(password);
    setPasswordErrors(validation.errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!isValidEmail(formData.email)) {
      setError('Email inválido');
      return;
    }

    const passwordValidation = isStrongPassword(formData.password);
    if (!passwordValidation.isValid) {
      setError('La contraseña no cumple los requisitos de seguridad');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Sanitizar nombre
    const sanitizedNombre = sanitizeHtml(formData.nombre);

    try {
      const response = await fetch('/api/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nombre: sanitizedNombre,
        }),
      });

      if (response.ok) {
        alert('Registro exitoso. Por favor inicia sesión.');
        window.location.href = '/login';
      } else {
        const data = await response.json();
        setError(data.detail || 'Error al registrarse');
      }
    } catch (error) {
      console.error('Register error:', error);
      setError('Error de conexión');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre">Nombre</label>
        <input
          type="text"
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          required
        />
        {passwordErrors.length > 0 && (
          <div className="text-sm text-yellow-600 mt-1">
            {passwordErrors.map((err, i) => (
              <p key={i}>• {err}</p>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button 
        type="submit"
        disabled={passwordErrors.length > 0}
      >
        Registrarse
      </button>
    </form>
  );
}
```

---

## 3. Rate Limiting

### Backend - Rate Limiting por Endpoint

```python
from fastapi import APIRouter, Depends
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Login - muy restrictivo
@router.post("/login")
@limiter.limit("5/minute")
async def login(credentials: LoginSchema):
    # 5 intentos de login por minuto
    pass

# Búsquedas - permisivo
@router.get("/search")
@limiter.limit("30/minute")
async def search(query: str):
    # 30 búsquedas por minuto
    pass

# Creación de contenido - moderado
@router.post("/ofertas")
@limiter.limit("10/minute")
async def create_oferta(oferta: OfertaCreate):
    # 10 ofertas creadas por minuto
    pass

# Lectura de datos - muy permisivo
@router.get("/ofertas")
@limiter.limit("100/minute")
async def get_ofertas():
    # 100 consultas por minuto
    pass

# Rate limiting por usuario autenticado (en lugar de IP)
from fastapi import Request

def get_user_id(request: Request) -> str:
    # Obtener user_id del token JWT
    token = request.headers.get("Authorization")
    if token:
        user = decode_token(token)
        return user.get("user_id", get_remote_address(request))
    return get_remote_address(request)

limiter_user = Limiter(key_func=get_user_id)

@router.post("/mensajes")
@limiter_user.limit("20/minute")  # 20 mensajes por minuto por usuario
async def send_message(message: MessageCreate, current_user: User = Depends(get_current_user)):
    pass
```

### Frontend - Rate Limiting Personalizado

```typescript
import { ClientRateLimiter } from '@/lib/security';

// Diferentes limiters para diferentes acciones
const limiters = {
  search: new ClientRateLimiter('search', 30, 60000),      // 30/min
  message: new ClientRateLimiter('message', 20, 60000),    // 20/min
  upload: new ClientRateLimiter('upload', 5, 60000),       // 5/min
  favorite: new ClientRateLimiter('favorite', 50, 60000),  // 50/min
};

// Usar en componentes
function SearchComponent() {
  const handleSearch = async (query: string) => {
    if (!limiters.search.canProceed()) {
      const seconds = Math.ceil(limiters.search.getRemainingTime() / 1000);
      alert(`Espera ${seconds}s antes de buscar de nuevo`);
      return;
    }

    // Realizar búsqueda
    const results = await fetch(`/api/search?q=${query}`);
  };

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

---

## 4. Validaciones

### Validación de Inputs Complejos

```typescript
import { validateInput, sanitizeHtml, sanitizeUrl } from '@/lib/security';

// Validar descripción de oferta
function validateOfertaDescription(description: string): boolean {
  // Longitud máxima 2000 caracteres
  if (!validateInput(description, 2000)) {
    return false;
  }

  // No permitir URLs sospechosas
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = description.match(urlPattern) || [];
  
  for (const url of urls) {
    if (!sanitizeUrl(url)) {
      console.warn('URL sospechosa detectada:', url);
      return false;
    }
  }

  return true;
}

// Validar número de teléfono
function validatePhone(phone: string): boolean {
  // Solo números, espacios, + y -
  const phonePattern = /^[\d\s\+\-()]+$/;
  return phonePattern.test(phone) && phone.length >= 7 && phone.length <= 20;
}

// Validar precio
function validatePrice(price: number): boolean {
  return price > 0 && price < 1000000 && Number.isFinite(price);
}

// Uso en formulario
function OfertaForm() {
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (data: OfertaFormData) => {
    const newErrors: string[] = [];

    if (!validateOfertaDescription(data.description)) {
      newErrors.push('Descripción inválida');
    }

    if (!validatePhone(data.phone)) {
      newErrors.push('Teléfono inválido');
    }

    if (!validatePrice(data.price)) {
      newErrors.push('Precio inválido');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Enviar formulario
    submitOferta(data);
  };
}
```

---

## 5. Headers de Seguridad

### Verificar Headers en Producción

```bash
# Verificar todos los headers de seguridad
curl -I https://tu-dominio.com

# Verificar header específico
curl -I https://tu-dominio.com | grep -i "strict-transport-security"

# Verificar CSP
curl -I https://tu-dominio.com | grep -i "content-security-policy"
```

### Personalizar Headers por Ruta (Next.js)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Headers base (todas las rutas)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Headers específicos para rutas de admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

  // Headers específicos para API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Content-Type', 'application/json');
  }

  // Headers específicos para archivos estáticos
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|ico|svg)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return response;
}
```

### Backend - Headers Personalizados

```python
from fastapi import FastAPI, Response

app = FastAPI()

@app.middleware("http")
async def add_custom_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Headers base
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    
    # Headers solo para HTML
    if "text/html" in response.headers.get("content-type", ""):
        response.headers["Content-Security-Policy"] = "default-src 'self'"
    
    # Headers solo para API
    if request.url.path.startswith("/api/"):
        response.headers["X-API-Version"] = "1.0"
    
    return response

# Header personalizado en endpoint específico
@app.get("/special-endpoint")
async def special_endpoint(response: Response):
    response.headers["X-Special-Header"] = "custom-value"
    return {"data": "something"}
```

---

## 6. Protección de Rutas

### Frontend - Proteger Rutas con Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/perfil', '/configuracion'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  // Rutas solo para usuarios NO autenticados
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  // Redirigir a login si intenta acceder a ruta protegida sin token
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirigir a dashboard si está autenticado e intenta ir a login/register
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### Backend - Proteger Endpoints

```python
from fastapi import Depends, HTTPException, status
from app.api.dependencies import get_current_user, get_current_admin

# Endpoint protegido (solo usuarios autenticados)
@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

# Endpoint de admin (solo admins)
@router.get("/admin/users")
async def get_all_users(current_admin: User = Depends(get_current_admin)):
    # Solo admins pueden acceder
    return {"users": [...]}

# Endpoint con permisos específicos
@router.delete("/ofertas/{oferta_id}")
async def delete_oferta(
    oferta_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    oferta = db.query(Oferta).filter(Oferta.id == oferta_id).first()
    
    # Verificar que el usuario es el dueño o es admin
    if oferta.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar esta oferta"
        )
    
    db.delete(oferta)
    db.commit()
    return {"message": "Oferta eliminada"}
```

---

## 7. Logging Seguro

### Backend - No Logear Datos Sensibles

```python
import logging

logger = logging.getLogger(__name__)

# ❌ MAL - Loggea contraseña
@app.post("/login")
async def login(credentials: LoginSchema):
    logger.info(f"Login attempt: {credentials.email} with password {credentials.password}")
    # NUNCA logear contraseñas

# ✅ BIEN - Solo loggea datos no sensibles
@app.post("/login")
async def login(credentials: LoginSchema):
    logger.info(f"Login attempt for user: {credentials.email}")
    # Logear solo email, no contraseña

# ❌ MAL - Loggea token completo
@app.get("/protected")
async def protected(token: str = Depends(oauth2_scheme)):
    logger.info(f"Access with token: {token}")

# ✅ BIEN - Loggea solo parte del token (últimos 4 chars)
@app.get("/protected")
async def protected(token: str = Depends(oauth2_scheme)):
    logger.info(f"Access with token ending in: ...{token[-4:]}")
```

### Frontend - Logging sin Datos Sensibles

```typescript
// ❌ MAL
console.log('Login data:', { email, password });

// ✅ BIEN
console.log('Login attempt for:', email);

// ❌ MAL
console.error('API Error:', error.response.data);

// ✅ BIEN
console.error('API Error:', {
  status: error.response.status,
  message: error.response.data.message
  // No logear todo el response que puede tener datos sensibles
});
```

---

## 🎯 Resumen de Mejores Prácticas

1. **Siempre sanitizar inputs del usuario**
2. **Validar en cliente Y servidor**
3. **Usar rate limiting en acciones críticas**
4. **Nunca logear datos sensibles**
5. **Verificar permisos en cada endpoint**
6. **Usar HTTPS en producción**
7. **Mantener dependencias actualizadas**
8. **Implementar logging de seguridad**
9. **Probar regularmente los controles de seguridad**
10. **Educar al equipo sobre seguridad**
