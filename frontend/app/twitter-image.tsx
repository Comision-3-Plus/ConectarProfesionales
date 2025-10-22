import { ImageResponse } from 'next/og';

// Configuración de la imagen para Twitter
export const runtime = 'edge';
export const alt = 'ConectarPro - Marketplace de Profesionales';
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = 'image/png';

// Generar imagen Twitter Card dinámica
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '60px',
          }}
        >
          <div
            style={{
              fontSize: 70,
              fontWeight: 900,
              color: 'white',
              marginBottom: 15,
              textShadow: '0 4px 30px rgba(0,0,0,0.3)',
            }}
          >
            ConectarPro
          </div>
          <div
            style={{
              fontSize: 35,
              color: 'rgba(255,255,255,0.95)',
              maxWidth: 800,
              lineHeight: 1.3,
              textShadow: '0 2px 20px rgba(0,0,0,0.2)',
            }}
          >
            Encuentra Profesionales Verificados
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
