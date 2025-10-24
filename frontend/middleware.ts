import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de rutas protegidas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/configuracion',
];

// Lista de rutas de admin
const adminRoutes = [
  '/admin',
];

// Lista de rutas públicas que no requieren autenticación
const publicRoutes = [
  '/login',
  '/register',
  '/ayuda',
  '/sobre-nosotros',
  '/blog',
  '/como-funciona',
  '/garantias',
  '/contacto',
  '/privacidad',
  '/terminos',
  '/cookies',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener token de autenticación
  const token = request.cookies.get('access_token')?.value;
  
  // Verificar si la ruta es protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  // Redirigir a login si intenta acceder a ruta protegida sin token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirigir a dashboard si ya está autenticado e intenta ir a login/register
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Headers de seguridad adicionales para rutas específicas
  const response = NextResponse.next();
  
  // Seguridad adicional para rutas de admin
  if (isAdminRoute) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  
  // Prevenir iframes en rutas sensibles
  if (isProtectedRoute || isAdminRoute) {
    response.headers.set('X-Frame-Options', 'DENY');
  }
  
  return response;
}

// Configurar qué rutas ejecutan el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
