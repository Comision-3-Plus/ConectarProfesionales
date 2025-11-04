'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setShowOffline(true);
      } else {
        // Ocultar después de 2 segundos cuando vuelve la conexión
        setTimeout(() => setShowOffline(false), 2000);
      }
    };

    // Estado inicial
    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!showOffline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <Card className={`shadow-lg ${isOnline ? 'border-green-500' : 'border-orange-500'}`}>
        <CardContent className="flex items-center gap-3 p-4">
          {isOnline ? (
            <>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm text-green-900">
                  Conexión restablecida
                </p>
                <p className="text-xs text-green-700">
                  Ya puedes usar todas las funciones
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <WifiOff className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-sm text-orange-900">
                  Sin conexión
                </p>
                <p className="text-xs text-orange-700">
                  Algunas funciones no están disponibles
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true);
                setRegistration(reg);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <Card className="shadow-lg border-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Actualización disponible</CardTitle>
          <CardDescription className="text-sm">
            Hay una nueva versión de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={handleUpdate} size="sm" className="flex-1">
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpdate(false)}
          >
            Más tarde
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
