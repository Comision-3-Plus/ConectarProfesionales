// Firebase Cloud Messaging Service Worker
// Este archivo maneja las notificaciones push cuando la app está en background

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Configuración de Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBwmhxN2Jw693drSLGv_YYNNM-rngcgw5k",
  authDomain: "conectar-profesionales.firebaseapp.com",
  projectId: "conectar-profesionales",
  storageBucket: "conectar-profesionales.firebasestorage.app",
  messagingSenderId: "488751111545",
  appId: "1:488751111545:web:3fc61477916a8d8c6e63a8",
  measurementId: "G-1FQ5WP0T11"
});

// Inicializar Firebase Messaging
const messaging = firebase.messaging();

// Manejar notificaciones en background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'Conectar Profesionales';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: payload.data?.chatId || 'default',
    data: payload.data,
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Ver',
      },
      {
        action: 'close',
        title: 'Cerrar',
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Abrir la app o navegar al chat
  const urlToOpen = event.notification.data?.chatId
    ? `/chat/${event.notification.data.chatId}`
    : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUnmatched: true }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url === self.location.origin + urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir una nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
