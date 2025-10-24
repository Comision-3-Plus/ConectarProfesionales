/**
 * Hook para gestionar la lista de chats de un usuario
 */

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';

interface ChatMetadata {
  cliente_id?: string;
  profesional_id?: string;
  cliente_nombre?: string;
  profesional_nombre?: string;
  last_message?: string;
  last_message_time?: number;
}

interface ChatMessage {
  sender_id: string;
  read: boolean;
}

interface ChatData {
  metadata?: ChatMetadata;
  participants?: Record<string, boolean>;
  messages?: Record<string, ChatMessage>;
}

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

    const chatsRef = ref(database, 'chats');
    
    const unsubscribe = onValue(
      chatsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const chatsList: ChatInfo[] = [];
          let unreadCount = 0;

          Object.entries(data).forEach(([chatId, chatData]) => {
            const typedChatData = chatData as ChatData;
            const metadata = typedChatData.metadata || {};
            const participants = typedChatData.participants || {};
            
            // Verificar si el usuario actual es participante
            if (participants[user.id]) {
              // Determinar el otro usuario
              const isCliente = metadata.cliente_id === user.id;
              const otherUserId = isCliente 
                ? metadata.profesional_id || ''
                : metadata.cliente_id || '';
              const otherUserName = isCliente
                ? metadata.profesional_nombre || 'Profesional'
                : metadata.cliente_nombre || 'Cliente';

              // Contar mensajes no leídos
              const messages = typedChatData.messages || {};
              const unreadMessages = Object.values(messages).filter(
                (msg) => !msg.read && msg.sender_id !== user.id
              ).length;

              chatsList.push({
                id: chatId,
                cliente_id: metadata.cliente_id || '',
                profesional_id: metadata.profesional_id || '',
                cliente_nombre: metadata.cliente_nombre || '',
                profesional_nombre: metadata.profesional_nombre || '',
                last_message: metadata.last_message || '',
                last_message_time: metadata.last_message_time || 0,
                unread_count: unreadMessages,
                other_user_name: otherUserName,
                other_user_id: otherUserId,
              });

              unreadCount += unreadMessages;
            }
          });

          // Ordenar por último mensaje (más reciente primero)
          chatsList.sort((a, b) => b.last_message_time - a.last_message_time);

          setChats(chatsList);
          setTotalUnread(unreadCount);
        } else {
          setChats([]);
          setTotalUnread(0);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error al cargar chats:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return {
    chats,
    isLoading,
    totalUnread,
  };
};
