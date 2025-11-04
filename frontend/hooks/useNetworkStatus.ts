/**
 * Hook para detectar online/offline status y calidad de conexión
 */

import { useState, useEffect } from 'react';

interface NetworkInformationType extends EventTarget {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

interface UseNetworkStatusReturn {
  isOnline: boolean;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink: number | undefined;
  rtt: number | undefined;
  saveData: boolean;
  isSlowConnection: boolean;
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
    downlink: number | undefined;
    rtt: number | undefined;
    saveData: boolean;
  }>({
    effectiveType: 'unknown',
    downlink: undefined,
    rtt: undefined,
    saveData: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial online status
    setIsOnline(navigator.onLine);

    // Update online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get network information if available
    const nav = navigator as Navigator & {
      connection?: NetworkInformationType;
      mozConnection?: NetworkInformationType;
      webkitConnection?: NetworkInformationType;
    };
    
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection) {
      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData || false,
        });
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isSlowConnection =
    networkInfo.effectiveType === 'slow-2g' ||
    networkInfo.effectiveType === '2g' ||
    networkInfo.saveData;

  return {
    isOnline,
    ...networkInfo,
    isSlowConnection,
  };
}
