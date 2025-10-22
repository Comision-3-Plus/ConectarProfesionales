import { ImageResponse } from 'next/og';

// Configuración de la imagen
export const runtime = 'edge';
export const alt = 'ConectarPro - Marketplace de Profesionales';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Generar imagen Open Graph dinámica
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
            padding: '80px',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: 'white',
              marginBottom: 20,
              textShadow: '0 4px 30px rgba(0,0,0,0.3)',
            }}
          >
            ConectarPro
          </div>
          <div
            style={{
              fontSize: 40,
              color: 'rgba(255,255,255,0.95)',
              maxWidth: 900,
              lineHeight: 1.3,
              textShadow: '0 2px 20px rgba(0,0,0,0.2)',
            }}
          >
            Conecta con Profesionales Verificados
          </div>
          <div
            style={{
              fontSize: 30,
              color: 'rgba(255,255,255,0.85)',
              marginTop: 30,
              display: 'flex',
              gap: 40,
            }}
          >
            <span>✓ Pago Seguro</span>
            <span>✓ Verificados</span>
            <span>✓ 24/7</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
