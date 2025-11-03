/**
 * Componente: ChatWindow
 * Ventana de chat en tiempo real con Firestore
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { storageService } from '@/lib/firebase/storage.service';
import { analyticsService } from '@/lib/firebase/analytics.service';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatWindowProps {
  chatId: string;
  otherUserName: string;
  otherUserPhoto?: string;
  trabajoId?: string;
}

export function ChatWindow({ 
  chatId, 
  otherUserName, 
  otherUserPhoto,
  trabajoId 
}: ChatWindowProps) {
  const { user } = useAuthStore();
  const { messages, isLoading, sendMessage, sendImageMessage, markAsRead } = useChat({ 
    chatId 
  });
  
  const [inputText, setInputText] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Marcar mensajes como leídos cuando se abre el chat
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      markAsRead();
    }
  }, [isLoading, messages.length, markAsRead]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    try {
      await sendMessage(inputText);
      setInputText('');
      
      // Track en Analytics
      analyticsService.trackMessageSend(chatId, 'text');
    } catch (error) {
      toast.error('Error al enviar mensaje');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validar imagen
    const validation = storageService.validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);

    try {
      // Comprimir imagen
      const compressedFile = await storageService.compressImage(file);
      
      // Subir a Firebase Storage
      const imageUrl = await storageService.uploadChatImage(
        chatId,
        compressedFile,
        (progress) => {
          setUploadProgress(progress.progress);
        }
      );

      // Enviar mensaje con imagen
      await sendImageMessage(imageUrl, '');
      
      // Track en Analytics
      analyticsService.trackMessageSend(chatId, 'image');
      
      toast.success('Imagen enviada');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      toast.error('Error al enviar imagen');
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm', { locale: es });
    } else {
      return format(date, 'dd/MM/yy HH:mm', { locale: es });
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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-muted/50">
        <Avatar>
          <AvatarImage src={otherUserPhoto} alt={otherUserName} />
          <AvatarFallback>{getInitials(otherUserName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{otherUserName}</h3>
          {trabajoId && (
            <p className="text-xs text-muted-foreground">Trabajo #{trabajoId}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No hay mensajes aún</p>
              <p className="text-sm">Envía el primer mensaje para iniciar la conversación</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === user?.id;
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.senderPhoto} alt={msg.senderName} />
                      <AvatarFallback>
                        {msg.senderName ? getInitials(msg.senderName) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      {!isOwn && (
                        <span className="text-xs text-muted-foreground mb-1">
                          {msg.senderName}
                        </span>
                      )}
                      
                      <div
                        className={`rounded-lg p-3 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.type === 'image' && msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="Imagen compartida"
                            className="rounded-md mb-2 max-w-full h-auto"
                            loading="lazy"
                          />
                        )}
                        
                        {msg.text && (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs opacity-70">
                            {formatMessageTime(msg.timestamp)}
                          </span>
                          {isOwn && msg.read && (
                            <span className="text-xs opacity-70">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Upload Progress */}
      {uploadingImage && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <div className="flex-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(uploadProgress)}%
            </span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          size="icon"
          variant="ghost"
          disabled={uploadingImage}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribe un mensaje..."
          disabled={uploadingImage}
          className="flex-1"
        />
        
        <Button 
          onClick={handleSend} 
          size="icon"
          disabled={!inputText.trim() || uploadingImage}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
