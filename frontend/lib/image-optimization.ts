/**
 * Utilidades para optimización de imágenes
 */

/**
 * Genera srcset para responsive images
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
): string {
  return widths.map((width) => `${baseUrl}?w=${width} ${width}w`).join(', ');
}

/**
 * Genera sizes attribute para responsive images
 */
export function generateSizes(breakpoints: Record<string, string>): string {
  return Object.entries(breakpoints)
    .map(([bp, size]) => `${bp} ${size}`)
    .join(', ');
}

/**
 * Configuración optimizada para next/image
 */
export const imageOptimizationConfig = {
  // Tamaños predefinidos para diferentes tipos de imágenes
  sizes: {
    avatar: '(max-width: 768px) 100vw, 200px',
    card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    hero: '100vw',
    thumbnail: '(max-width: 768px) 50vw, 200px',
    gallery: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
  },

  // Calidad por tipo de imagen
  quality: {
    avatar: 85,
    card: 80,
    hero: 90,
    thumbnail: 75,
    gallery: 85,
  },

  // Placeholders
  placeholders: {
    blur: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    shimmer:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==',
  },
};

/**
 * Obtiene la calidad óptima según el tipo de imagen
 */
export function getOptimalQuality(type: keyof typeof imageOptimizationConfig.quality): number {
  return imageOptimizationConfig.quality[type] || 80;
}

/**
 * Obtiene el sizes attribute según el tipo de imagen
 */
export function getOptimalSizes(type: keyof typeof imageOptimizationConfig.sizes): string {
  return imageOptimizationConfig.sizes[type] || '100vw';
}

/**
 * Crea un placeholder blur con shimmer effect
 */
export function createShimmerPlaceholder(width: number, height: number): string {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f3f4f6"/>
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
    </svg>
  `)}`;
}

/**
 * Verifica si una URL es una imagen
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
  return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
}

/**
 * Obtiene la extensión de una imagen
 */
export function getImageExtension(url: string): string | null {
  const match = url.match(/\.([a-zA-Z]+)(\?|$)/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Convierte una URL de imagen a WebP (si está disponible)
 */
export function toWebP(url: string): string {
  if (url.includes('?')) {
    return `${url}&format=webp`;
  }
  return `${url}?format=webp`;
}

/**
 * Optimiza una URL de Cloudinary
 */
export function optimizeCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'avif';
    crop?: 'fill' | 'fit' | 'limit' | 'scale';
  } = {}
): string {
  const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options;

  if (!url.includes('cloudinary.com')) return url;

  const transformations = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (crop) transformations.push(`c_${crop}`);

  const transformString = transformations.join(',');
  return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Lazy loading de imágenes con Intersection Observer
 */
export function setupLazyImages() {
  if (typeof window === 'undefined') return;

  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px',
    }
  );

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
}
