/**
 * Chat Service - Firestore
 * Servicio para gestión de chats en tiempo real usando Firestore
 * 
 * Estructura de datos:
 * - chats/{chatId}: Metadata del chat
 * - messages/{chatId}/messages/{messageId}: Mensajes del chat
 * - user_chats/{userId}/{chatId}: Índice de chats por usuario
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  updateDoc,
  increment,
  QuerySnapshot,
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { firebaseAuthService } from './auth.service';

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

export interface Message {
  id?: string;
  senderId: string;
  senderName?: string;
  senderPhoto?: string;
  text: string;
  timestamp: Timestamp | null;
  read: boolean;
  type: 'text' | 'image' | 'file';
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface Chat {
  id?: string;
  participants: string[];
  participantsData?: {
    [userId: string]: {
      name: string;
      photo?: string;
      role: string;
    };
  };
  trabajoId?: string;
  ofertaId?: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Timestamp | null;
  };
}

export interface UserChat {
  id: string;
  chatId: string;
  lastMessage: string;
  lastMessageTime: Timestamp | null;
  unreadCount: number;
  otherUserId: string;
  otherUserName?: string;
  otherUserPhoto?: string;
  trabajoId?: string;
}

// ============================================================================
// CHAT SERVICE
// ============================================================================

class ChatService {
  /**
   * Asegura que el usuario esté autenticado en Firebase
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!firebaseAuthService.isAuthenticated()) {
      console.log('🔐 Autenticando en Firebase...');
      await firebaseAuthService.signIn();
    }
  }

  /**
   * Crear o obtener chat existente entre dos usuarios
   */
  async getOrCreateChat(
    userId1: string,
    userId2: string,
    userData1: { name: string; photo?: string; role: string },
    userData2: { name: string; photo?: string; role: string },
    trabajoId?: string,
    ofertaId?: string
  ): Promise<string> {
    // Asegurar autenticación en Firebase
    await this.ensureAuthenticated();
    
    const participants = [userId1, userId2].sort();
    
    try {
      // Buscar chat existente
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', '==', participants),
        where('trabajoId', '==', trabajoId || null)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        console.log('✅ Chat existente encontrado:', snapshot.docs[0].id);
        return snapshot.docs[0].id;
      }
      
      // Crear nuevo chat
      const chatData: Record<string, unknown> = {
        participants,
        participantsData: {
          [userId1]: userData1,
          [userId2]: userData2,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Solo agregar trabajoId y ofertaId si tienen valor
      if (trabajoId) chatData.trabajoId = trabajoId;
      if (ofertaId) chatData.ofertaId = ofertaId;
      
      const docRef = await addDoc(chatsRef, chatData);
      console.log('✅ Nuevo chat creado:', docRef.id);
      
      // Crear documentos en user_chats para ambos usuarios (con 3 segmentos)
      await Promise.all([
        setDoc(doc(db, 'user_chats', userId1, 'chats', docRef.id), {
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
          otherUserId: userId2,
          otherUserName: userData2.name,
          otherUserPhoto: userData2.photo || null,
          trabajoId: trabajoId || null,
        }),
        setDoc(doc(db, 'user_chats', userId2, 'chats', docRef.id), {
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
          otherUserId: userId1,
          otherUserName: userData1.name,
          otherUserPhoto: userData1.photo || null,
          trabajoId: trabajoId || null,
        }),
      ]);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error al crear/obtener chat:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje de texto
   */
  async sendMessage(
    chatId: string,
    senderId: string,
    text: string,
    senderName?: string,
    senderPhoto?: string,
    type: 'text' | 'image' | 'file' = 'text'
  ): Promise<string> {
    try {
      const messagesRef = collection(db, `messages/${chatId}/messages`);
      
      const messageData: Record<string, unknown> = {
        senderId,
        text,
        timestamp: serverTimestamp(),
        read: false,
        type,
      };
      
      // Solo agregar campos opcionales si tienen valor
      if (senderName) messageData.senderName = senderName;
      if (senderPhoto) messageData.senderPhoto = senderPhoto;
      
      const docRef = await addDoc(messagesRef, messageData);
      
      // Actualizar chat con último mensaje
      const chatRef = doc(db, `chats/${chatId}`);
      await updateDoc(chatRef, {
        lastMessage: {
          text,
          senderId,
          timestamp: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });
      
      // Actualizar contadores de no leídos
      const chatDoc = await getDoc(chatRef);
      const participants = chatDoc.data()?.participants || [];
      const otherUserId = participants.find((id: string) => id !== senderId);
      
      if (otherUserId) {
        await updateDoc(doc(db, 'user_chats', otherUserId, 'chats', chatId), {
          lastMessage: text,
          lastMessageTime: serverTimestamp(),
          unreadCount: increment(1),
        });
        
        await updateDoc(doc(db, 'user_chats', senderId, 'chats', chatId), {
          lastMessage: text,
          lastMessageTime: serverTimestamp(),
        });
      }
      
      console.log('✅ Mensaje enviado:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje con imagen
   */
  async sendImageMessage(
    chatId: string,
    senderId: string,
    imageUrl: string,
    caption: string = '',
    senderName?: string,
    senderPhoto?: string
  ): Promise<string> {
    try {
      const messagesRef = collection(db, `messages/${chatId}/messages`);
      
      const messageData: Record<string, unknown> = {
        senderId,
        text: caption,
        imageUrl,
        timestamp: serverTimestamp(),
        read: false,
        type: 'image',
      };
      
      // Solo agregar campos opcionales si tienen valor
      if (senderName) messageData.senderName = senderName;
      if (senderPhoto) messageData.senderPhoto = senderPhoto;
      
      const docRef = await addDoc(messagesRef, messageData);
      
      // Actualizar último mensaje del chat
      const chatRef = doc(db, `chats/${chatId}`);
      await updateDoc(chatRef, {
        lastMessage: {
          text: caption || '📷 Imagen',
          senderId,
          timestamp: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });
      
      // Actualizar user_chats
      const chatDoc = await getDoc(chatRef);
      const participants = chatDoc.data()?.participants || [];
      const otherUserId = participants.find((id: string) => id !== senderId);
      
      if (otherUserId) {
        await updateDoc(doc(db, 'user_chats', otherUserId, 'chats', chatId), {
          lastMessage: caption || '📷 Imagen',
          lastMessageTime: serverTimestamp(),
          unreadCount: increment(1),
        });
        
        await updateDoc(doc(db, 'user_chats', senderId, 'chats', chatId), {
          lastMessage: caption || '📷 Imagen',
          lastMessageTime: serverTimestamp(),
        });
      }
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error al enviar imagen:', error);
      throw error;
    }
  }

  /**
   * Escuchar mensajes en tiempo real
   */
  subscribeToMessages(
    chatId: string,
    callback: (messages: Message[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    try {
      const messagesRef = collection(db, `messages/${chatId}/messages`);
      const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));
      
      return onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const messages: Message[] = [];
          snapshot.forEach((docSnap) => {
            messages.push({ id: docSnap.id, ...docSnap.data() } as Message);
          });
          callback(messages);
        },
        (err) => {
          console.error('❌ Error al escuchar mensajes:', err);
          if (errorCallback) errorCallback(err as Error);
        }
      );
    } catch (error) {
      console.error('❌ Error al suscribirse a mensajes:', error);
      throw error;
    }
  }

  /**
   * Escuchar lista de chats del usuario en tiempo real
   */
  subscribeToUserChats(
    userId: string,
    callback: (chats: UserChat[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    // Autenticar primero (no bloquear la suscripción)
    this.ensureAuthenticated().catch(err => {
      console.error('❌ Error al autenticar para suscripción:', err);
      if (errorCallback) errorCallback(err);
    });
    
    try {
      // Corregir: usar collection con 3 segmentos (impar)
      const userChatsRef = collection(db, 'user_chats', userId, 'chats');
      const q = query(userChatsRef, orderBy('lastMessageTime', 'desc'));
      
      return onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const chats: UserChat[] = [];
          snapshot.forEach((docSnap) => {
            chats.push({ id: docSnap.id, chatId: docSnap.id, ...docSnap.data() } as UserChat);
          });
          callback(chats);
        },
        (err) => {
          console.error('❌ Error al escuchar chats:', err);
          if (errorCallback) errorCallback(err as Error);
        }
      );
    } catch (error) {
      console.error('❌ Error al suscribirse a chats:', error);
      throw error;
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const messagesRef = collection(db, `messages/${chatId}/messages`);
      const q = query(
        messagesRef,
        where('senderId', '!=', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      const updates = snapshot.docs.map((docSnap) =>
        updateDoc(docSnap.ref, { read: true })
      );
      
      await Promise.all(updates);
      
      // Resetear contador
      await updateDoc(doc(db, 'user_chats', userId, 'chats', chatId), {
        unreadCount: 0,
      });
      
      console.log('✅ Mensajes marcados como leídos');
    } catch (error) {
      console.error('❌ Error al marcar mensajes como leídos:', error);
      throw error;
    }
  }

  /**
   * Obtener información de un chat
   */
  async getChatInfo(chatId: string): Promise<Chat | null> {
    try {
      const chatDoc = await getDoc(doc(db, `chats/${chatId}`));
      
      if (chatDoc.exists()) {
        return { id: chatDoc.id, ...chatDoc.data() } as Chat;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error al obtener info del chat:', error);
      throw error;
    }
  }

  /**
   * Obtener total de mensajes no leídos del usuario
   */
  async getTotalUnreadCount(userId: string): Promise<number> {
    try {
      const userChatsRef = collection(db, 'user_chats', userId, 'chats');
      const snapshot = await getDocs(userChatsRef);
      
      let total = 0;
      snapshot.forEach((docSnap) => {
        total += docSnap.data().unreadCount || 0;
      });
      
      return total;
    } catch (error) {
      console.error('❌ Error al obtener mensajes no leídos:', error);
      return 0;
    }
  }
}

// Exportar instancia singleton
export const chatService = new ChatService();
