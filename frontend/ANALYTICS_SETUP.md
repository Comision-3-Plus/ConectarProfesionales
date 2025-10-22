# Archivo de configuración para Google Analytics 4 y otros servicios de tracking

## Instrucciones de configuración:

### 1. Google Analytics 4
1. Ve a [Google Analytics](https://analytics.google.com/)
2. Crea una nueva propiedad (o usa una existente)
3. Obtén tu ID de medición (formato: G-XXXXXXXXXX)
4. Agrégalo a `.env.local` como `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`

### 2. Google Search Console
1. Ve a [Google Search Console](https://search.google.com/search-console)
2. Agrega tu propiedad
3. Elige "Verificación de etiqueta HTML"
4. Copia el código de verificación
5. Pégalo en `lib/seo.ts` → `verification.google`

### 3. Facebook Pixel (Opcional)
1. Ve a [Facebook Business Manager](https://business.facebook.com/)
2. Crea un nuevo Pixel
3. Obtén tu Pixel ID
4. Agrégalo a `.env.local` como `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`

### 4. Microsoft Clarity (Opcional - Heatmaps gratis)
1. Ve a [Microsoft Clarity](https://clarity.microsoft.com/)
2. Crea un nuevo proyecto
3. Obtén tu código de tracking
4. Agrégalo en el `layout.tsx`

## Implementación

Una vez configuradas las variables de entorno, el tracking estará activo automáticamente en producción.

## Nota de Privacidad

Asegúrate de:
- ✅ Tener una política de privacidad actualizada
- ✅ Implementar cookie consent banner
- ✅ Cumplir con GDPR/CCPA si aplica
- ✅ Permitir que los usuarios opten por no ser rastreados
