/**
 * Firebase Configuration
 * Configuración central de Firebase para Conectar-Profesionales
 * 
 * Servicios habilitados:
 * - Firestore: Chat en tiempo real
 * - Storage: Almacenamiento de imágenes
 * - Messaging: Notificaciones push (FCM)
 * - Analytics: Tracking de eventos
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Verificar que todas las variables de entorno están presentes
if (!firebaseConfig.apiKey) {
  console.error('❌ Firebase API Key no encontrada. Verifica tu archivo .env.local');
}

// Inicializar Firebase (evitar re-inicialización)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase inicializado correctamente');
} else {
  app = getApps()[0];
}

// Inicializar servicios
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Analytics (solo en cliente y después del montaje)
let analyticsInstance: Analytics | null = null;
export const getAnalyticsInstance = (): Analytics | null => {
  if (typeof window !== 'undefined' && !analyticsInstance) {
    analyticsInstance = getAnalytics(app);
  }
  return analyticsInstance;
};

// Messaging (solo si está soportado)
let messagingInstance: Messaging | null = null;
export const getMessagingInstance = async (): Promise<Messaging | null> => {
  if (typeof window !== 'undefined' && !messagingInstance) {
    const supported = await isSupported();
    if (supported) {
      messagingInstance = getMessaging(app);
    }
  }
  return messagingInstance;
};

export default app;
