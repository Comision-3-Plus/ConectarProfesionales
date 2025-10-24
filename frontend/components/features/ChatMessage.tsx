/**
 * Componente ChatMessage - Mensaje individual del chat
 */
'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  sender_nombre: string;
  text: string;
  timestamp: number;
  read: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useAuthStore();
  const isOwnMessage = user?.id === message.sender_id;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm', { locale: es });
    } else if (diffInHours < 48) {
      return `Ayer ${format(date, 'HH:mm', { locale: es })}`;
    } else {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
    }
  };

  return (
    <div
      className={cn(
        'flex gap-2',
        isOwnMessage ? 'justify-end' : 'justify-start'
      )}
    >
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
          <AvatarFallback className="text-xs bg-slate-200 text-slate-700">
            {getInitials(message.sender_nombre)}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col',
          isOwnMessage ? 'items-end' : 'items-start'
        )}
      >
        {!isOwnMessage && (
          <span className="text-xs text-muted-foreground mb-1">
            {message.sender_nombre}
          </span>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-2 max-w-[70%] break-words',
            isOwnMessage
              ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        </div>

        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
          {isOwnMessage && (
            <span className="text-xs">
              {message.read ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <Check className="h-3 w-3 text-muted-foreground" />
              )}
            </span>
          )}
        </div>
      </div>

      {isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
          <AvatarFallback className="text-xs bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            {getInitials(message.sender_nombre)}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
