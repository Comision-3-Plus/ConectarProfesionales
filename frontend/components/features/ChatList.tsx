/**
 * Componente ChatList - Lista de conversaciones
 */
'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatListItem {
  chatId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  trabajoTitulo?: string;
}

interface ChatListProps {
  chats: ChatListItem[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
  isLoading?: boolean;
}

export function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  isLoading = false,
}: ChatListProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageCircle className="h-12 w-12 text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">No hay conversaciones</p>
        <p className="text-sm text-slate-400 mt-1">
          Tus chats aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {chats.map((chat) => (
          <button
            key={chat.chatId}
            onClick={() => onSelectChat(chat.chatId)}
            className={cn(
              'w-full flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left',
              selectedChatId === chat.chatId && 'bg-orange-50 hover:bg-orange-50'
            )}
          >
            {/* Avatar */}
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={chat.otherUserAvatar} alt={chat.otherUserName} />
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                {getInitials(chat.otherUserName)}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header: Name + Time */}
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-slate-900 truncate">
                  {chat.otherUserName}
                </h4>
                <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                  {formatTime(chat.lastMessageTime)}
                </span>
              </div>

              {/* Trabajo title if exists */}
              {chat.trabajoTitulo && (
                <p className="text-xs text-slate-500 mb-1 truncate">
                  📋 {chat.trabajoTitulo}
                </p>
              )}

              {/* Last message + Unread badge */}
              <div className="flex justify-between items-center gap-2">
                <p className="text-sm text-slate-600 truncate flex-1">
                  {chat.lastMessage}
                </p>
                {chat.unreadCount > 0 && (
                  <Badge className="bg-orange-500 hover:bg-orange-600 flex-shrink-0">
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
