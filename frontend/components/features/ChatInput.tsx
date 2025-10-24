/**
 * Componente ChatInput - Input para escribir mensajes
 */
'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
  isSending?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  isSending = false,
  disabled = false,
  placeholder = 'Escribe un mensaje...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage) {
      toast.error('El mensaje no puede estar vacío');
      return;
    }

    if (trimmedMessage.length > 2000) {
      toast.error('El mensaje es demasiado largo (máximo 2000 caracteres)');
      return;
    }

    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast.error('Error al enviar mensaje');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sin Shift envía el mensaje
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  return (
    <div className="flex gap-2 items-end">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isSending}
        className="min-h-[44px] max-h-[150px] resize-none"
        rows={1}
      />
      
      <Button
        onClick={handleSend}
        disabled={disabled || isSending || !message.trim()}
        size="icon"
        className="h-11 w-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 flex-shrink-0"
      >
        {isSending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
