# Conectar Profesionales - Frontend

Frontend moderno y profesional para la plataforma "Conectar Profesionales", construido con Next.js 15, TypeScript, Tailwind CSS y las mejores prácticas de desarrollo.

## 🚀 Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript (modo estricto)
- **Estilos:** Tailwind CSS v4
- **Componentes UI:** shadcn/ui
- **Manejo de Estado del Servidor:** TanStack Query (React Query) v5
- **Manejo de Estado Global:** Zustand
- **Formularios:** React Hook Form + Zod
- **Iconografía:** Lucide React
- **Animaciones:** Framer Motion
- **Notificaciones:** Sonner
- **Backend Communication:** Axios
- **Real-time Chat:** Firebase

## 🔧 Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 4. Build para Producción

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
frontend/
├── app/
│   ├── (public)/              # Rutas públicas
│   │   ├── page.tsx           # Homepage
│   │   ├── browse/            # Explorar profesionales
│   │   └── profile/[id]/      # Perfil público del profesional
│   ├── (auth)/                # Autenticación
│   │   ├── login/             # Inicio de sesión
│   │   └── register/          # Registro
│   ├── (dashboard)/           # Rutas protegidas
│   │   └── dashboard/
│   │       ├── cliente/       # Panel del cliente
│   │       └── profesional/   # Panel del profesional
│   └── payment/               # Callbacks de pago
├── components/
│   ├── ui/                    # Componentes base de shadcn/ui
│   ├── layout/                # Navbar, Footer
│   └── features/              # Componentes de funcionalidades
├── lib/
│   ├── api.ts                 # Cliente API centralizado
│   └── firebase.ts            # Configuración de Firebase
├── hooks/
│   └── useAuth.ts             # Hook de autenticación
├── store/
│   └── authStore.ts           # Store de autenticación (Zustand)
└── types/
    └── index.ts               # Tipos TypeScript
```

## 🎨 Guía de Diseño

### Paleta de Colores

- **Primary:** `#1E293B` (Azul oscuro para textos principales)
- **Accent:** `#F97316` (Naranja vibrante para CTAs)
- **Background:** `#FFFFFF` / `#F8FAFC` (Blanco/gris sutil)
- **Border:** `#E2E8F0` (Gris claro para bordes)

### Tipografía

- **Fuente:** Inter (Google Fonts)
- Mobile-First, Minimalista, Accesible

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)

---

**Desarrollado con ❤️ usando las últimas tecnologías web**
