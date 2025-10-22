import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar modo experimental de optimización
  reactStrictMode: true,
  
  // Configuración para acceso en red local
  // Esto permite que los estilos y assets funcionen correctamente
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
  // Optimización de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  // Comprimir respuestas
  compress: true,

  // Headers de seguridad - SIMPLIFICADOS PARA DESARROLLO
  async headers() {
    // En desarrollo, usar CSP más permisivo
    const isDev = process.env.NODE_ENV !== 'production';
    
    return [
      {
        source: '/:path*',
        headers: [
          // Content Security Policy - Permisivo en desarrollo
          {
            key: 'Content-Security-Policy',
            value: isDev 
              ? [
                  "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
                  "script-src * 'unsafe-inline' 'unsafe-eval'",
                  "style-src * 'unsafe-inline'",
                  "font-src * data:",
                  "img-src * data: blob:",
                  "connect-src *",
                ].join('; ')
              : [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                  "font-src 'self' https://fonts.gstatic.com data:",
                  "img-src 'self' data: https: blob:",
                  "connect-src 'self' http://localhost:8004",
                  "frame-ancestors 'none'",
                ].join('; '),
          },
          // Prevenir clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prevenir MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // Headers específicos para API routes
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },

  // Redirects de seguridad
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      // Redirigir .env y archivos sensibles
      {
        source: '/.env',
        destination: '/404',
        permanent: false,
      },
      {
        source: '/.git/:path*',
        destination: '/404',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

