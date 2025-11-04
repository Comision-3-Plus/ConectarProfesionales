/**
 * Componente: ChatList
 * Lista de chats del usuario con indicador de mensajes no leídos
 */

'use client';

import { useChatList } from '@/hooks/useChatList';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Search } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { NewChatDialog } from './NewChatDialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface ChatListProps {
  onChatSelect: (chatId: string, otherUserName: string, otherUserPhoto?: string, trabajoId?: string) => void;
  selectedChatId?: string;
}

export function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  const { chats, isLoading, totalUnread } = useChatList();
  const [searchQuery, setSearchQuery] = useState('');

  const formatLastMessageTime = (timestamp: unknown) => {
    if (!timestamp) return '';
    
    try {
      const date = (timestamp as any).toDate ? (timestamp as any).toDate() : new Date(timestamp as any);
      
      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: es });
      } else if (isYesterday(date)) {
        return 'Ayer';
      } else {
        return format(date, 'dd/MM', { locale: es });
      }
    } catch {
      return '';
    }
  };

  // Filtrar chats por búsqueda
  const filteredChats = chats.filter(chat => 
    (chat.otherUserName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header con botón nuevo chat */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-3">Mensajes</h2>
          <NewChatDialog onChatCreated={onChatSelect} />
        </div>

        {/* Estado vacío */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No tienes chats</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comienza una conversación con otros usuarios
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header mejorado */}
      <div className="p-4 border-b bg-gradient-to-r from-background via-muted/5 to-background space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Conversaciones</h2>
            {totalUnread > 0 && (
              <Badge variant="default" className="rounded-full h-6 min-w-[24px] flex items-center justify-center bg-orange-500 hover:bg-orange-600">
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            )}
          </div>
          <NewChatDialog onChatCreated={onChatSelect} />
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      {/* Lista de chats */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(
                chat.chatId, 
                chat.otherUserName || 'Usuario',
                chat.otherUserPhoto,
                chat.trabajoId
              )}
              className={cn(
                "w-full p-3 rounded-xl transition-all duration-200 text-left mb-1.5",
                "hover:bg-muted/80 hover:shadow-sm hover:scale-[1.02]",
                selectedChatId === chat.chatId 
                  ? "bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border-l-4 border-orange-500 shadow-sm" 
                  : "hover:border-l-4 hover:border-muted-foreground/20"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Avatar mejorado */}
                <div className="relative shrink-0">
                  <Avatar className={cn(
                    "h-12 w-12 ring-2 transition-all",
                    selectedChatId === chat.chatId 
                      ? "ring-orange-500/30" 
                      : "ring-border"
                  )}>
                    <AvatarImage 
                      src={chat.otherUserPhoto} 
                      alt={chat.otherUserName} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-semibold">
                      {chat.otherUserName ? getInitials(chat.otherUserName) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Badge de mensajes no leídos */}
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse ring-2 ring-background">
                      {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                    </div>
                  )}

                  {/* Indicador de online (opcional) */}
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-0.5 gap-2">
                    <h3 className={cn(
                      "font-semibold truncate text-sm",
                      chat.unreadCount && chat.unreadCount > 0 && "text-foreground",
                      selectedChatId === chat.chatId && "text-orange-600"
                    )}>
                      {chat.otherUserName || 'Usuario'}
                    </h3>
                    <span className={cn(
                      "text-[10px] shrink-0 font-medium",
                      chat.unreadCount && chat.unreadCount > 0 ? "text-orange-600" : "text-muted-foreground"
                    )}>
                      {formatLastMessageTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  
                  <p className={cn(
                    "text-xs truncate leading-tight",
                    chat.unreadCount && chat.unreadCount > 0
                      ? "text-foreground font-medium" 
                      : "text-muted-foreground"
                  )}>
                    {chat.lastMessage ? (
                      chat.lastMessage.startsWith('📷') 
                        ? '📷 Imagen' 
                        : chat.lastMessage
                    ) : 'No hay mensajes'}
                  </p>
                  
                  {chat.trabajoId && (
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                        🛠️ Trabajo #{chat.trabajoId}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
