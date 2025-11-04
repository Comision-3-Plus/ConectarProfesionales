
'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, Image as ImageIcon, X, MoreVertical, Phone, Video } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { chatService } from '@/lib/firebase/chat.service';

interface ChatWindowProps {
  chatId: string;
  otherUserName: string;
  otherUserPhoto?: string;
}

export function ChatWindow({ chatId, otherUserName, otherUserPhoto }: ChatWindowProps) {
  const { user } = useAuthStore();
  const { messages, isSending, sendMessage, markAsRead } = useChat({ chatId });
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll suave solo cuando se envía un nuevo mensaje
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll inicial al cargar el chat
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [chatId]);

  // Scroll cuando se envía un mensaje nuevo (solo si el usuario está cerca del final)
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom || messages.length === 0) {
        scrollToBottom();
      }
    }
  }, [messages]);

  // Marcar como leídos al abrir el chat
  useEffect(() => {
    if (chatId && user) {
      markAsRead();
    }
  }, [chatId, user, markAsRead]);

  // Manejar selección de imagen
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setImageFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Eliminar imagen seleccionada
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Enviar imagen
  const handleSendImage = async () => {
    if (!imageFile || !user) return;

    setIsUploadingImage(true);
    try {
      // Convertir imagen a Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        await chatService.sendImageMessage(
          chatId,
          user.id.toString(),
          base64String,
          newMessage.trim() || '📷 Imagen',
          user.nombre || 'Usuario',
          user.avatar_url
        );

        // Limpiar
        setNewMessage('');
        handleRemoveImage();
        toast.success('Imagen enviada');
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error('❌ Error al enviar imagen:', error);
      toast.error('Error al enviar la imagen');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Enviar mensaje de texto
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si hay imagen, enviar imagen
    if (imagePreview) {
      await handleSendImage();
      return;
    }

    // Si no hay texto, no enviar
    if (!newMessage.trim() || isSending) return;

    await sendMessage(newMessage);
    setNewMessage('');
  };

  // Formatear timestamp con mejor lógica
  const formatTime = (timestamp: unknown) => {
    if (!timestamp) return '';
    
    try {
      const date = (timestamp as any).toDate ? (timestamp as any).toDate() : new Date(timestamp as any);
      
      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: es });
      } else if (isYesterday(date)) {
        return `Ayer ${format(date, 'HH:mm', { locale: es })}`;
      } else {
        return format(date, 'dd MMM HH:mm', { locale: es });
      }
    } catch {
      return '';
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

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Debes iniciar sesión para chatear</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      {/* Header Mejorado */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                  {getInitials(otherUserName)}
                </AvatarFallback>
              </Avatar>
              {/* Indicador online (opcional) */}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-base">{otherUserName}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Conectado
              </p>
            </div>
          </div>

          {/* Botones de acciones (opcional) */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mensajes con mejor diseño */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Send className="h-8 w-8 text-primary/60" />
            </div>
            <p className="text-muted-foreground text-sm text-center">
              No hay mensajes aún.<br />
              <span className="text-xs">¡Sé el primero en escribir!</span>
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.senderId === user.id.toString();
            const isImage = message.type === 'image';
            const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== message.senderId);

            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2 group',
                  isOwn ? 'justify-end' : 'justify-start'
                )}
              >
                {/* Avatar solo para otros usuarios y primer mensaje del grupo */}
                {!isOwn && (
                  <Avatar className={cn(
                    "h-8 w-8 mt-1 ring-2 ring-background",
                    !showAvatar && "invisible"
                  )}>
                    <AvatarImage src={message.senderPhoto} alt={message.senderName} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10">
                      {getInitials(message.senderName || 'Usuario')}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    'relative max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-2.5 shadow-sm',
                    'transition-all duration-200 hover:shadow-md',
                    isOwn
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm'
                      : 'bg-white dark:bg-muted rounded-tl-sm border border-border/50'
                  )}
                >
                  {/* Nombre del remitente (solo para mensajes de otros) */}
                  {!isOwn && showAvatar && (
                    <p className="text-xs font-semibold mb-1.5 text-primary">
                      {message.senderName}
                    </p>
                  )}
                  
                  {/* Imagen */}
                  {isImage && message.imageUrl && (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      <img 
                        src={message.imageUrl} 
                        alt="Imagen enviada" 
                        className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(message.imageUrl, '_blank')}
                      />
                    </div>
                  )}
                  
                  {/* Texto del mensaje */}
                  {message.text && (
                    <p className={cn(
                      "text-sm leading-relaxed whitespace-pre-wrap",
                      isOwn ? "text-primary-foreground" : "text-foreground"
                    )}>
                      {message.text}
                    </p>
                  )}
                  
                  {/* Timestamp y estado */}
                  <div className={cn(
                    'flex items-center gap-1.5 mt-1',
                    isOwn ? 'justify-end' : 'justify-start'
                  )}>
                    <p className={cn(
                      'text-[10px] font-medium',
                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      {formatTime(message.timestamp)}
                    </p>
                    {isOwn && (
                      <div className="flex gap-0.5">
                        <div className={cn(
                          "h-3 w-3 rounded-full flex items-center justify-center",
                          message.read ? "text-blue-400" : "text-primary-foreground/50"
                        )}>
                          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                            <path d="M12.5 3.5L5.5 10.5L2.5 7.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            {message.read && (
                              <path d="M14.5 3.5L7.5 10.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            )}
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Espaciador para mensajes propios */}
                {isOwn && <div className="w-8" />}
              </div>
            );
          })
        )}
      </div>

      {/* Input de mensaje mejorado */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <form onSubmit={handleSendMessage} className="space-y-3">
          {/* Preview de imagen con mejor diseño */}
          {imagePreview && (
            <div className="relative">
              <div className="relative inline-block group">
                <div className="relative rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-48 rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg hover:scale-110 transition-transform"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 ml-1">
                📷 Imagen lista para enviar
              </p>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Input oculto para seleccionar imagen */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Botón para adjuntar imagen */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isUploadingImage}
              title="Adjuntar imagen"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>

            {/* Input mejorado */}
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={imagePreview ? "Añade un mensaje (opcional)..." : "Escribe tu mensaje..."}
                disabled={isSending || isUploadingImage}
                className="pr-12 h-10 rounded-full border-2 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>

            {/* Botón enviar mejorado */}
            <Button 
              type="submit" 
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full shrink-0 transition-all",
                (newMessage.trim() || imagePreview) && !isSending && !isUploadingImage
                  ? "bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl hover:scale-105"
                  : "bg-muted"
              )}
              disabled={(isSending || isUploadingImage) || (!newMessage.trim() && !imagePreview)}
            >
              {(isSending || isUploadingImage) ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 ml-0.5" />
              )}
            </Button>
          </div>

          {/* Hint text */}
          <p className="text-[10px] text-muted-foreground ml-12">
            Presiona Enter para enviar • Shift + Enter para nueva línea
          </p>
        </form>
      </div>
    </div>
  );
}
