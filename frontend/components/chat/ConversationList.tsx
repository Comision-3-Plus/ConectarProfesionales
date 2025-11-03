'use client';

import { useState, useEffect } from 'react';
import { chatService, ChatConversation } from '@/lib/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  onSelectConversation?: (conversation: ChatConversation) => void;
  selectedChatId?: string;
}

export function ConversationList({ onSelectConversation, selectedChatId }: ConversationListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = chatService.subscribeToConversations(user.id, (newConversations) => {
      setConversations(newConversations);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Debes iniciar sesión</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No hay conversaciones</h3>
        <p className="text-sm text-muted-foreground">
          Tus chats aparecerán aquí cuando contactes a un profesional
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const isSelected = selectedChatId === conversation.id;
        const hasUnread = (conversation.unreadCount || 0) > 0;

        return (
          <Card
            key={conversation.id}
            className={cn(
              'cursor-pointer transition-colors hover:bg-accent',
              isSelected && 'bg-accent border-primary'
            )}
            onClick={() => onSelectConversation?.(conversation)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                      'font-medium truncate',
                      hasUnread && 'font-semibold'
                    )}>
                      {conversation.otherUserName}
                    </h4>
                    {hasUnread && (
                      <Badge variant="destructive" className="shrink-0">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className={cn(
                    'text-sm truncate',
                    hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}>
                    {conversation.lastMessage?.text || 'Sin mensajes'}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatTime(conversation.lastMessageTime || Date.now())}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
