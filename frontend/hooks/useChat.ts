/**
 * Hook para gestionar un chat individual
 * Maneja mensajes en tiempo real con Firestore
 */

import { useState, useEffect, useCallback } from 'react';
import { chatService, Message } from '@/lib/firebase/chat.service';
import { Unsubscribe } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export interface UseChatOptions {
  chatId: string | null;
}

export const useChat = ({ chatId }: UseChatOptions) => {
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

    setIsLoading(true);
    setError(null);

    let unsubscribe: Unsubscribe | undefined;

    try {
      unsubscribe = chatService.subscribeToMessages(
        chatId,
        (msgs) => {
          setMessages(msgs);
          setIsLoading(false);
        },
        (err) => {
          setError(err.message);
          setIsLoading(false);
          toast.error('Error al cargar mensajes');
        }
      );
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatId]);

  // Enviar mensaje
  const sendMessage = useCallback(
    async (text: string) => {
      if (!user || !chatId || !text.trim()) return;

      setIsSending(true);
      try {
        await chatService.sendMessage(
          chatId,
          user.id,
          text.trim(),
          `${user.nombre} ${user.apellido}`,
          undefined
        );
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

  // Enviar mensaje con imagen
  const sendImageMessage = useCallback(
    async (imageUrl: string, caption: string = '') => {
      if (!user || !chatId) return;

      setIsSending(true);
      try {
        await chatService.sendImageMessage(
          chatId,
          user.id,
          imageUrl,
          caption,
          `${user.nombre} ${user.apellido}`,
          undefined
        );
        setError(null);
      } catch (err) {
        console.error('Error al enviar imagen:', err);
        setError('Error al enviar imagen');
        toast.error('Error al enviar imagen');
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
      await chatService.markMessagesAsRead(chatId, user.id);
    } catch (err) {
      console.error('Error al marcar mensajes como leídos:', err);
    }
  }, [user, chatId]);

  return {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    sendImageMessage,
    markAsRead,
  };
};
