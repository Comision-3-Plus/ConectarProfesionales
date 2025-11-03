'use client';

import { useState, useEffect, useRef } from 'react';
import { chatService, ChatMessage } from '@/lib/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Send, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  chatId: string;
  otherUserId: string;
  otherUserName: string;
  canSendOffers?: boolean;
}

export function ChatWindow({ chatId, otherUserId, otherUserName, canSendOffers = false }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [offerForm, setOfferForm] = useState({
    descripcion: '',
    precio_final: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = chatService.subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
    });

    // Marcar como leídos al abrir
    if (user) {
      chatService.markAsRead(chatId, user.id);
    }

    return () => {
      unsubscribe();
    };
  }, [chatId, user]);

  // Enviar mensaje de texto
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      await chatService.sendMessage(chatId, user.id, user.nombre, newMessage);
      setNewMessage('');
    } catch (error) {
      toast.error('Error al enviar mensaje');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  // Enviar oferta formal
  const handleSendOffer = async () => {
    if (!offerForm.descripcion.trim() || !offerForm.precio_final || !user) {
      toast.error('Completa todos los campos de la oferta');
      return;
    }

    const precio = parseFloat(offerForm.precio_final);
    if (isNaN(precio) || precio <= 0) {
      toast.error('Precio inválido');
      return;
    }

    setSending(true);
    try {
      await chatService.sendOfferMessage(chatId, user.id, user.nombre, {
        descripcion: offerForm.descripcion,
        precio_final: precio,
        cliente_id: otherUserId,
      });

      toast.success('✅ Oferta enviada correctamente');
      setShowOfferDialog(false);
      setOfferForm({ descripcion: '', precio_final: '' });
    } catch (error) {
      toast.error('Error al enviar oferta');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  // Formatear timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Debes iniciar sesión para chatear</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{otherUserName}</h3>
          <p className="text-sm text-muted-foreground">Chat en vivo</p>
        </div>
        {canSendOffers && (
          <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <DollarSign className="mr-2 h-4 w-4" />
                Enviar Oferta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Oferta Formal</DialogTitle>
                <DialogDescription>
                  Envía una propuesta económica formal al cliente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción del servicio</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe qué harás y qué incluye..."
                    value={offerForm.descripcion}
                    onChange={(e) => setOfferForm({ ...offerForm, descripcion: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio Final ($)</Label>
                  <Input
                    id="precio"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="5000"
                    value={offerForm.precio_final}
                    onChange={(e) => setOfferForm({ ...offerForm, precio_final: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowOfferDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSendOffer} disabled={sending}>
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Enviar Oferta
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              No hay mensajes aún. Inicia la conversación!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === user.id;
            const isOffer = message.type === 'offer';

            return (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  isOwn ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg p-3',
                    isOffer
                      ? 'bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300'
                      : isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1">{message.senderName}</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                  <p className={cn(
                    'text-xs mt-1',
                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
