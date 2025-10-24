/**
 * Componente ChatWindow - Ventana principal del chat
 */
'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { Loader2, MessageCircle, ArrowLeft } from 'lucide-react';

interface ChatWindowProps {
  chatId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  onBack?: () => void;
}

export function ChatWindow({
  chatId,
  otherUserName,
  otherUserAvatar,
  onBack,
}: ChatWindowProps) {
  const { messages, isLoading, isSending, sendMessage, markAsRead } = useChat({
    chatId,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Marcar como leídos cuando se abre el chat
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages, markAsRead]);

  const handleSendMessage = async (text: string) => {
    await sendMessage(text);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-muted-foreground">Cargando chat...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUserAvatar} alt={otherUserName} />
            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              {getInitials(otherUserName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="font-semibold">{otherUserName}</h3>
          </div>

          <Badge variant="outline" className="hidden sm:flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {messages.length} mensajes
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="font-semibold mb-2">No hay mensajes aún</h4>
              <p className="text-sm text-muted-foreground">
                Envía el primer mensaje para comenzar la conversación
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <Separator />

      {/* Input Area */}
      <div className="p-4">
        <ChatInput
          onSendMessage={handleSendMessage}
          isSending={isSending}
          disabled={isSending}
        />
      </div>
    </Card>
  );
}
