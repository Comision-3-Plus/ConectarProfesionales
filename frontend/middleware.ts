import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de rutas protegidas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
];

// Lista de rutas de admin
const adminRoutes = [
  '/admin',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // DEBUG LOGGING
  console.log('[MIDDLEWARE]', {
    pathname,
    token,
    isProtectedRoute,
    isAdminRoute
  });

  if (isProtectedRoute && !token) {
    console.log('[MIDDLEWARE] REDIRECT to /login', { pathname });
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === '/login' || pathname === '/register') && token) {
    console.log('[MIDDLEWARE] REDIRECT to /', { pathname });
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  if (isAdminRoute) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

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
