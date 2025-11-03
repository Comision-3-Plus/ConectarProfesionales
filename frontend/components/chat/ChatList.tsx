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
import { MessageSquare, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ChatListProps {
  onChatSelect: (chatId: string, otherUserName: string, otherUserPhoto?: string, trabajoId?: string) => void;
  selectedChatId?: string;
}

export function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  const { chats, isLoading, error, totalUnread } = useChatList();

  const formatLastMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Ahora';
    } else if (diffInHours < 24) {
      return format(date, 'HH:mm', { locale: es });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return format(date, 'dd/MM/yy', { locale: es });
    }
  };

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

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        <p>Error al cargar chats</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No tienes chats</h3>
        <p className="text-sm text-muted-foreground">
          Los chats aparecerán aquí cuando contactes con profesionales o clientes
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header con contador de no leídos */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Mensajes</h2>
          {totalUnread > 0 && (
            <Badge variant="default" className="rounded-full">
              {totalUnread}
            </Badge>
          )}
        </div>
      </div>

      {/* Lista de chats */}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(
                chat.chatId, 
                chat.otherUserName || 'Usuario',
                chat.otherUserPhoto,
                chat.trabajoId
              )}
              className={cn(
                "w-full p-4 hover:bg-muted/50 transition-colors text-left",
                selectedChatId === chat.chatId && "bg-muted"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative">
                  <Avatar>
                    <AvatarImage 
                      src={chat.otherUserPhoto} 
                      alt={chat.otherUserName} 
                    />
                    <AvatarFallback>
                      {chat.otherUserName ? getInitials(chat.otherUserName) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  {chat.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={cn(
                      "font-semibold truncate",
                      chat.unreadCount > 0 && "text-primary"
                    )}>
                      {chat.otherUserName || 'Usuario'}
                    </h3>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {formatLastMessageTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  
                  <p className={cn(
                    "text-sm truncate",
                    chat.unreadCount > 0 
                      ? "text-foreground font-medium" 
                      : "text-muted-foreground"
                  )}>
                    {chat.lastMessage || 'No hay mensajes'}
                  </p>
                  
                  {chat.trabajoId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Trabajo #{chat.trabajoId}
                    </p>
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
