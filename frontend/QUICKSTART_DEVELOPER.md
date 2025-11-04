# 🚀 Quick Start Guide - Conectar Profesionales Frontend

## Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Git

## Instalación Rápida

```bash
# 1. Clonar repositorio (si no lo tienes)
git clone <repo-url>
cd ConectarProfesionales/frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# 4. Ejecutar en desarrollo
npm run dev

# Abrir http://localhost:3000
```

## Variables de Entorno Requeridas

Crear archivo `.env.local`:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase (Chat)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# MercadoPago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_public_key

# Push Notifications (opcional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_key
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo

# Build
npm run build           # Build de producción
npm start               # Ejecutar build de producción

# Linting y Formato
npm run lint            # ESLint
npm run lint:fix        # Fix automático
npm run format          # Prettier

# Testing
npm run test            # Unit tests (si configurado)
npm run test:e2e        # Cypress E2E tests
npm run cypress:open    # Abrir Cypress UI

# Análisis
npm run analyze         # Bundle analyzer
```

## Estructura del Proyecto

```
frontend/
├── app/              # Next.js App Router (páginas)
├── components/       # Componentes React
├── hooks/            # Custom hooks
├── lib/              # Utilidades y servicios
├── public/           # Assets estáticos
├── store/            # Zustand stores
└── types/            # TypeScript types
```

## Flujo de Desarrollo

1. **Crear rama de feature**
```bash
git checkout -b feature/nombre-feature
```

2. **Desarrollar feature**
```bash
npm run dev  # Desarrollo con hot reload
```

3. **Verificar código**
```bash
npm run lint          # Verificar linting
npm run type-check    # Verificar TypeScript
npm run test          # Ejecutar tests
```

4. **Commit y push**
```bash
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/nombre-feature
```

5. **Crear Pull Request**

## Testing

### E2E Tests con Cypress

```bash
# Abrir Cypress UI
npm run cypress:open

# Ejecutar tests en headless
npm run test:e2e

# Ejecutar test específico
npx cypress run --spec "cypress/e2e/login.cy.ts"
```

### Unit Tests (Jest)

```bash
# Ejecutar todos los tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Deployment

### Vercel (Recomendado)

1. Conectar repositorio en Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### Manual Build

```bash
# Build de producción
npm run build

# Verificar build localmente
npm start

# Build estático (si aplica)
npm run export
```

## Troubleshooting

### Error: Module not found

```bash
# Limpiar cache y reinstalar
rm -rf node_modules .next
npm install
```

### Error: Port already in use

```bash
# Cambiar puerto
npm run dev -- -p 3001
```

### Error: TypeScript errors

```bash
# Verificar tipos
npm run type-check

# Regenerar tipos
npm run postinstall
```

## Recursos

- [Documentación Next.js](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)

## Contacto

Para dudas o problemas, crear un issue en GitHub.

---

**Estado:** ✅ Producción Ready  
**Última Actualización:** Noviembre 2025
