/**
 * Página de Chat para Clientes
 * Permite comunicarse con profesionales sobre trabajos
 */
'use client';

import { useState } from 'react';
import { useChatList } from '@/hooks/useChatList';
import { ChatList } from '@/components/features/ChatList';
import { ChatWindow } from '@/components/features/ChatWindow';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export default function ClienteChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const { chats, isLoading: chatsLoading } = useChatList();

  // Datos del chat seleccionado
  const selectedChat = chats.find(c => c.id === selectedChatId);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Mensajes
        </h1>
        <p className="text-slate-600">
          Comunícate con profesionales sobre tus trabajos
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-250px)]">
          {/* Lista de chats - Sidebar */}
          <div className="border-r border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversaciones
              </h2>
            </div>
            
            <ChatList
              chats={chats.map(chat => ({
                chatId: chat.id,
                otherUserName: chat.profesional_nombre || 'Profesional',
                otherUserAvatar: undefined, // Agregar cuando tengamos avatares
                lastMessage: chat.last_message || '',
                lastMessageTime: new Date(chat.last_message_time),
                unreadCount: chat.unread_count || 0,
                trabajoTitulo: undefined, // Agregar cuando tengamos trabajo asociado
              }))}
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
              isLoading={chatsLoading}
            />
          </div>

          {/* Ventana de chat */}
          <div className="col-span-2">
            {selectedChatId && selectedChat ? (
              <ChatWindow
                chatId={selectedChatId}
                otherUserName={selectedChat.profesional_nombre || 'Profesional'}
                otherUserAvatar={undefined}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageCircle className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-slate-500">
                  Elige un chat de la lista para comenzar a conversar
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
