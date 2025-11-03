/**
 * Ejemplo de Página de Chat
 * Muestra cómo integrar Firebase chat en una página de Next.js
 * 
 * Ubicación sugerida: app/chat/page.tsx
 */

'use client';

import { useState, useEffect } from 'react';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useChatList } from '@/hooks/useChatList';
import { useAuthStore } from '@/store/authStore';
import { fcmService } from '@/lib/firebase/messaging.service';
import { analyticsService } from '@/lib/firebase/analytics.service';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { totalUnread } = useChatList();
  
  const [selectedChat, setSelectedChat] = useState<{
    chatId: string;
    otherUserName: string;
    otherUserPhoto?: string;
    trabajoId?: string;
  } | null>(null);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Inicializar notificaciones y Firebase Auth
  useEffect(() => {
    if (!user) return;

    const initFirebase = async () => {
      try {
        // 1. Obtener Firebase custom token del backend
        const response = await fetch('/api/v1/firebase/token', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        
        if (response.ok) {
          const { firebaseToken } = await response.json();
          
          // 2. Autenticar con Firebase
          const { signInWithCustomToken } = await import('firebase/auth');
          const { getAuth } = await import('firebase/auth');
          const auth = getAuth();
          
          await signInWithCustomToken(auth, firebaseToken);
          console.log('✅ Autenticado con Firebase');
          
          // 3. Configurar Analytics
          analyticsService.setUserId(user.id);
          analyticsService.setUserProperties({
            role: user.role,
          });
          
          // 4. Solicitar permisos de notificaciones
          const token = await fcmService.requestPermissionAndGetToken();
          
          if (token) {
            setFcmToken(token);
            setNotificationsEnabled(true);
            
            // Guardar token en backend
            await fcmService.sendTokenToBackend(
              token,
              user.id,
              process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            );
            
            // Escuchar notificaciones en foreground
            await fcmService.onForegroundMessage((payload) => {
              toast.info(payload.title || 'Nueva notificación', {
                description: payload.body,
              });
            });
            
            console.log('✅ Notificaciones habilitadas');
          }
        }
      } catch (error) {
        console.error('Error al inicializar Firebase:', error);
      }
    };

    initFirebase();
  }, [user]);

  // Manejar selección de chat
  const handleChatSelect = (
    chatId: string,
    otherUserName: string,
    otherUserPhoto?: string,
    trabajoId?: string
  ) => {
    setSelectedChat({
      chatId,
      otherUserName,
      otherUserPhoto,
      trabajoId,
    });
    
    // Track en Analytics
    analyticsService.trackChatStart(chatId, otherUserName);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Inicia sesión</h2>
          <p className="text-muted-foreground">
            Debes iniciar sesión para acceder al chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mensajes</h1>
          
          {/* Indicador de notificaciones */}
          {notificationsEnabled && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span>Notificaciones activadas</span>
            </div>
          )}
        </div>
        
        {/* Contador de no leídos */}
        {totalUnread > 0 && (
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg">
            Tienes {totalUnread} mensaje{totalUnread !== 1 ? 's' : ''} sin leer
          </div>
        )}
      </div>

      {/* Layout del chat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de chats */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden">
          <ChatList
            onChatSelect={handleChatSelect}
            selectedChatId={selectedChat?.chatId}
          />
        </div>

        {/* Ventana de chat */}
        <div className="md:col-span-2">
          {selectedChat ? (
            <ChatWindow
              chatId={selectedChat.chatId}
              otherUserName={selectedChat.otherUserName}
              otherUserPhoto={selectedChat.otherUserPhoto}
              trabajoId={selectedChat.trabajoId}
            />
          ) : (
            <div className="flex items-center justify-center h-full border rounded-lg bg-muted/30">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Selecciona un chat para comenzar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
