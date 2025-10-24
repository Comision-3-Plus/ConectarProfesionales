/**
 * Hook para gestionar un chat individual
 * Maneja mensajes en tiempo real con Firebase Realtime Database
 */

import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, push, set, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export interface Message {
  id: string;
  sender_id: string;
  sender_nombre: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface UseChatOptions {
  chatId: string;
  limit?: number;
}

export const useChat = ({ chatId, limit = 50 }: UseChatOptions) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escuchar mensajes en tiempo real
  useEffect(() => {
    if (!chatId) {
      setIsLoading(false);
      return;
    }

    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const messagesQuery = query(
      messagesRef,
      orderByChild('timestamp'),
      limitToLast(limit)
    );

    const unsubscribe = onValue(
      messagesQuery,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messagesList: Message[] = Object.entries(data).map(
            ([id, msg]) => ({
              id,
              ...(msg as Omit<Message, 'id'>),
            })
          );
          // Ordenar por timestamp ascendente
          messagesList.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(messagesList);
        } else {
          setMessages([]);
        }
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error al escuchar mensajes:', err);
        setError('Error al cargar mensajes');
        setIsLoading(false);
        toast.error('Error al cargar mensajes');
      }
    );

    return () => unsubscribe();
  }, [chatId, limit]);

  // Enviar mensaje
  const sendMessage = useCallback(
    async (text: string) => {
      if (!user || !chatId || !text.trim()) return;

      setIsSending(true);
      try {
        const messagesRef = ref(database, `chats/${chatId}/messages`);
        const newMessageRef = push(messagesRef);
        
        const messageData: Omit<Message, 'id'> = {
          sender_id: user.id,
          sender_nombre: `${user.nombre} ${user.apellido}`,
          text: text.trim(),
          timestamp: Date.now(),
          read: false,
        };

        await set(newMessageRef, messageData);

        // Actualizar metadata del chat
        const metadataRef = ref(database, `chats/${chatId}/metadata`);
        const metadataUpdate = {
          last_message: text.trim().substring(0, 100),
          last_message_time: Date.now(),
        };
        await set(metadataRef, metadataUpdate);

        setError(null);
      } catch (err) {
        console.error('Error al enviar mensaje:', err);
        setError('Error al enviar mensaje');
        toast.error('Error al enviar mensaje');
      } finally {
        setIsSending(false);
      }
    },
    [user, chatId]
  );

  // Marcar mensajes como leídos
  const markAsRead = useCallback(async () => {
    if (!user || !chatId) return;

    try {
      const unreadMessages = messages.filter(
        (msg) => !msg.read && msg.sender_id !== user.id
      );

      for (const msg of unreadMessages) {
        const messageRef = ref(database, `chats/${chatId}/messages/${msg.id}`);
        await set(messageRef, { ...msg, read: true });
      }
    } catch (err) {
      console.error('Error al marcar mensajes como leídos:', err);
    }
  }, [user, chatId, messages]);

  return {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    markAsRead,
  };
};
