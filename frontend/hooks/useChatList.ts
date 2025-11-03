/**
 * Hook para gestionar la lista de chats de un usuario
 * Actualizado para usar Firestore
 */

import { useState, useEffect } from 'react';
import { chatService, UserChat } from '@/lib/firebase/chat.service';
import { Unsubscribe } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';

// Mantener interfaz existente para compatibilidad
export interface ChatInfo {
  id: string;
  cliente_id: string;
  profesional_id: string;
  cliente_nombre: string;
  profesional_nombre: string;
  last_message: string;
  last_message_time: number;
  unread_count: number;
  other_user_name: string;
  other_user_id: string;
  chatId: string; // Agregado para compatibilidad
  otherUserName?: string; // Agregado para compatibilidad
  otherUserPhoto?: string; // Agregado para compatibilidad
  otherUserId?: string; // Agregado para compatibilidad
  trabajoId?: string; // Agregado para compatibilidad
  lastMessage?: string; // Agregado para compatibilidad
  lastMessageTime?: any; // Agregado para compatibilidad
  unreadCount?: number; // Agregado para compatibilidad
}

export const useChatList = () => {
  const { user } = useAuthStore();
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    let unsubscribe: Unsubscribe | undefined;

    try {
      unsubscribe = chatService.subscribeToUserChats(
        user.id,
        (userChats: UserChat[]) => {
          // Convertir UserChat[] a ChatInfo[] para mantener compatibilidad
          const chatsList: ChatInfo[] = userChats.map((chat) => ({
            id: chat.id,
            chatId: chat.chatId || chat.id,
            cliente_id: '',
            profesional_id: '',
            cliente_nombre: '',
            profesional_nombre: '',
            last_message: chat.lastMessage || '',
            last_message_time: chat.lastMessageTime?.seconds || 0,
            unread_count: chat.unreadCount || 0,
            other_user_name: chat.otherUserName || 'Usuario',
            other_user_id: chat.otherUserId || '',
            // Campos adicionales para nueva interfaz
            otherUserName: chat.otherUserName,
            otherUserPhoto: chat.otherUserPhoto,
            otherUserId: chat.otherUserId,
            trabajoId: chat.trabajoId,
            lastMessage: chat.lastMessage,
            lastMessageTime: chat.lastMessageTime,
            unreadCount: chat.unreadCount,
          }));
          
          setChats(chatsList);
          
          // Calcular total de mensajes no leídos
          const unreadCount = chatsList.reduce(
            (acc, chat) => acc + (chat.unread_count || 0),
            0
          );
          setTotalUnread(unreadCount);
          
          setIsLoading(false);
        },
        (err) => {
          console.error('Error al cargar chats:', err);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error('Error al suscribirse a chats:', err);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return {
    chats,
    isLoading,
    totalUnread,
  };
};
