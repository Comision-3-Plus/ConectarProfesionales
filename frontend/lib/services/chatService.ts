/**
 * Servicio de Chat con Firebase Realtime Database
 * Endpoints: Firebase Realtime + /api/v1/chat/*
 */

import { api } from '../api';
import { 
  ref, 
  push, 
  onValue, 
  off, 
  query, 
  orderByChild,
  limitToLast,
  set,
  update,
  serverTimestamp,
  get
} from 'firebase/database';
import { database } from '../firebase';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  read: boolean;
  type: 'text' | 'offer' | 'system';
  offerId?: string;
}

export interface ChatConversation {
  id: string;
  participants: {
    [userId: string]: {
      name: string;
      lastRead: number;
    };
  };
  lastMessage?: {
    text: string;
    timestamp: number;
    senderId: string;
  };
  createdAt: number;
  updatedAt: number;
  // Campos computados para UI
  otherUserName?: string;
  lastMessageTime?: number;
  unreadCount?: number;
}

export interface OfertaData {
  descripcion: string;
  precio_final: number;
  cliente_id: string;
}

export const chatService = {
  /**
   * Crear o obtener una conversación entre dos usuarios
   */
  createOrGetConversation: async (
    currentUserId: string,
    otherUserId: string,
    currentUserName: string,
    otherUserName: string
  ): Promise<string> => {
    console.log('🔍 createOrGetConversation llamado con:', {
      currentUserId,
      otherUserId,
      currentUserName,
      otherUserName,
      databaseConfigured: !!database
    })

    if (!database) {
      const error = 'Firebase no está configurado. Por favor configura las credenciales.';
      console.error('❌', error);
      throw new Error(error);
    }

    console.log('✅ Firebase database disponible, buscando conversación existente...')

    // Buscar conversación existente
    const conversationsRef = ref(database, 'conversations');
    const snapshot = await get(conversationsRef);
    
    if (snapshot.exists()) {
      console.log('📚 Encontradas conversaciones existentes, buscando match...')
      const conversations = snapshot.val();
      for (const [chatId, conv] of Object.entries(conversations as Record<string, ChatConversation>)) {
        const participants = Object.keys(conv.participants);
        if (
          participants.includes(currentUserId) &&
          participants.includes(otherUserId)
        ) {
          console.log('✅ Conversación existente encontrada:', chatId)
          return chatId;
        }
      }
      console.log('📝 No se encontró conversación existente, creando nueva...')
    } else {
      console.log('📝 No hay conversaciones, creando la primera...')
    }

    // Crear nueva conversación
    const newConvRef = push(ref(database, 'conversations'));
    const chatId = newConvRef.key!;
    
    console.log('🆕 Creando nueva conversación con ID:', chatId)

    await set(newConvRef, {
      participants: {
        [currentUserId]: {
          name: currentUserName,
          lastRead: Date.now(),
        },
        [otherUserId]: {
          name: otherUserName,
          lastRead: 0,
        },
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Conversación creada exitosamente:', chatId)

    return chatId;
  },

  /**
   * Enviar un mensaje de texto
   */
  sendMessage: async (
    chatId: string,
    senderId: string,
    senderName: string,
    text: string
  ): Promise<void> => {
    if (!database) {
      throw new Error('Firebase no está configurado. Por favor configura las credenciales.');
    }

    const messagesRef = ref(database, `messages/${chatId}`);
    const newMessageRef = push(messagesRef);

    await set(newMessageRef, {
      senderId,
      senderName,
      text,
      timestamp: serverTimestamp(),
      read: false,
      type: 'text',
    });

    // Actualizar última actividad de la conversación
    const convRef = ref(database, `conversations/${chatId}`);
    await update(convRef, {
      lastMessage: {
        text,
        timestamp: serverTimestamp(),
        senderId,
      },
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Enviar una oferta formal desde el chat
   */
  sendOfferMessage: async (
    chatId: string,
    senderId: string,
    senderName: string,
    offerData: OfertaData
  ): Promise<string> => {
    if (!database) {
      throw new Error('Firebase no está configurado. Por favor configura las credenciales.');
    }

    // Crear la oferta en el backend
    const response = await api.post<{ id: string; chat_id: string }>('/professional/ofertas', {
      chat_id: chatId,
      descripcion: offerData.descripcion,
      precio_final: offerData.precio_final,
      cliente_id: offerData.cliente_id,
    });

    const offerId = response.data.id;

    // Enviar mensaje de tipo 'offer' en Firebase
    const messagesRef = ref(database, `messages/${chatId}`);
    const newMessageRef = push(messagesRef);

    await set(newMessageRef, {
      senderId,
      senderName,
      text: `📝 Oferta formal: ${offerData.descripcion} - $${offerData.precio_final.toLocaleString('es-AR')}`,
      timestamp: serverTimestamp(),
      read: false,
      type: 'offer',
      offerId,
    });

    // Actualizar conversación
    const convRef = ref(database, `conversations/${chatId}`);
    await update(convRef, {
      lastMessage: {
        text: '📝 Nueva oferta recibida',
        timestamp: serverTimestamp(),
        senderId,
      },
      updatedAt: serverTimestamp(),
    });

    return offerId;
  },

  /**
   * Escuchar mensajes en tiempo real
   */
  subscribeToMessages: (
    chatId: string,
    callback: (messages: ChatMessage[]) => void
  ): (() => void) => {
    if (!database) {
      console.warn('Firebase no está configurado. Chat deshabilitado.');
      callback([]);
      return () => {};
    }

    const messagesRef = ref(database, `messages/${chatId}`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(50));

    onValue(messagesQuery, (snapshot) => {
      const messages: ChatMessage[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          messages.push({
            id: childSnapshot.key!,
            chatId,
            ...childSnapshot.val(),
          });
        });
      }

      callback(messages);
    });

    return () => off(messagesRef);
  },

  /**
   * Escuchar conversaciones del usuario
   */
  subscribeToConversations: (
    userId: string,
    callback: (conversations: ChatConversation[]) => void
  ): (() => void) => {
    if (!database) {
      console.warn('Firebase no está configurado. Chat deshabilitado.');
      callback([]);
      return () => {};
    }

    const conversationsRef = ref(database, 'conversations');

    onValue(conversationsRef, (snapshot) => {
      const conversations: ChatConversation[] = [];

      if (snapshot.exists()) {
        const allConversations = snapshot.val();
        
        for (const [chatId, conv] of Object.entries(allConversations as Record<string, ChatConversation>)) {
          if (conv.participants && conv.participants[userId]) {
            // Encontrar el nombre del otro usuario
            const otherUserId = Object.keys(conv.participants).find(id => id !== userId);
            const otherUserName = otherUserId ? conv.participants[otherUserId].name : 'Usuario';

            // Calcular mensajes no leídos
            const userLastRead = conv.participants[userId]?.lastRead || 0;
            const unreadCount = conv.lastMessage && conv.lastMessage.timestamp > userLastRead && conv.lastMessage.senderId !== userId ? 1 : 0;

            conversations.push({
              ...conv,
              id: chatId,
              otherUserName,
              lastMessageTime: conv.lastMessage?.timestamp || conv.updatedAt || 0,
              unreadCount,
            });
          }
        }
      }

      // Ordenar por última actividad
      conversations.sort((a, b) => {
        const timeA = a.lastMessageTime || 0;
        const timeB = b.lastMessageTime || 0;
        return timeB - timeA;
      });

      callback(conversations);
    });

    return () => off(conversationsRef);
  },

  /**
   * Marcar mensajes como leídos
   */
  markAsRead: async (chatId: string, userId: string): Promise<void> => {
    if (!database) {
      return;
    }

    const convRef = ref(database, `conversations/${chatId}/participants/${userId}`);
    await update(convRef, {
      lastRead: serverTimestamp(),
    });
  },

  /**
   * Obtener contador de mensajes no leídos
   */
  getUnreadCount: async (userId: string): Promise<number> => {
    if (!database) {
      return 0;
    }

    const conversationsRef = ref(database, 'conversations');
    const snapshot = await get(conversationsRef);

    if (!snapshot.exists()) return 0;

    let unreadCount = 0;
    const conversations = snapshot.val();

    for (const [, conv] of Object.entries(conversations as Record<string, ChatConversation>)) {
      if (!conv.participants || !conv.participants[userId]) continue;

      const userLastRead = conv.participants[userId].lastRead || 0;
      const lastMessageTime = conv.lastMessage?.timestamp || 0;
      const lastMessageSender = conv.lastMessage?.senderId;

      // Solo contar si el último mensaje no es del usuario actual
      if (lastMessageSender !== userId && lastMessageTime > userLastRead) {
        unreadCount++;
      }
    }

    return unreadCount;
  },

  /**
   * Wrapper simplificado para crear o obtener un chat room con un profesional
   * Se usa desde la página pública del perfil del profesional
   */
  getOrCreateChatRoom: async (
    profesionalId: string,
    currentUserId: string,
    currentUserName: string,
    profesionalName: string
  ): Promise<string> => {
    return chatService.createOrGetConversation(
      currentUserId,
      profesionalId,
      currentUserName,
      profesionalName
    );
  },
};
