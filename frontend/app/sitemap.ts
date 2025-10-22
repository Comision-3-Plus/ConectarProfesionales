import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://conectarprofesionales.com'; // Cambiar por tu dominio real

  // Páginas estáticas
  const staticPages = [
    '',
    '/login',
    '/register',
    '/browse',
    '/como-funciona',
    '/garantias',
    '/sobre-nosotros',
    '/blog',
    '/ayuda',
    '/contacto',
    '/herramientas',
    '/recursos',
    '/privacidad',
    '/terminos',
    '/cookies',
    '/licencias',
  ];

  const sitemap: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route.includes('login') || route.includes('register') ? 0.9 : 0.7,
  }));

  return sitemap;
}
