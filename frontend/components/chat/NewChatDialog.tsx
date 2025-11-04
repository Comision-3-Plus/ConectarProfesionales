/**
 * NewChatDialog - Diálogo para iniciar un nuevo chat
 * Permite buscar usuarios y comenzar una conversación
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquarePlus, Search, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { chatService } from '@/lib/firebase/chat.service';
import { userService } from '@/lib/services';
import { toast } from 'sonner';
import type { UserRead } from '@/types';

interface NewChatDialogProps {
  onChatCreated?: (chatId: string, userName: string, userPhoto?: string) => void;
}

export function NewChatDialog({ onChatCreated }: NewChatDialogProps) {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserRead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Buscar usuarios por email (puedes agregar más filtros)
      const response = await userService.searchUsers(searchQuery);
      // Filtrar el usuario actual
      const filtered = response.filter((u: UserRead) => u.id !== user?.id);
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      toast.error('Error al buscar usuarios');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateChat = async (otherUser: UserRead) => {
    if (!user) {
      console.error('❌ No hay usuario autenticado');
      toast.error('Debes iniciar sesión');
      return;
    }

    console.log('🔄 Iniciando chat con:', {
      currentUser: { id: user.id, name: `${user.nombre} ${user.apellido}` },
      otherUser: { id: otherUser.id, name: `${otherUser.nombre} ${otherUser.apellido}` }
    });

    setIsCreating(true);
    try {
      const chatId = await chatService.getOrCreateChat(
        user.id,
        otherUser.id,
        {
          name: `${user.nombre} ${user.apellido}`,
          photo: user.avatar_url,
          role: user.rol,
        },
        {
          name: `${otherUser.nombre} ${otherUser.apellido}`,
          photo: otherUser.avatar_url,
          role: otherUser.rol,
        }
      );

      console.log('✅ Chat creado/obtenido:', chatId);
      toast.success(`Chat iniciado con ${otherUser.nombre} ${otherUser.apellido}`);
      
      if (onChatCreated) {
        console.log('📞 Llamando a onChatCreated con:', {
          chatId,
          userName: `${otherUser.nombre} ${otherUser.apellido}`,
          userPhoto: otherUser.avatar_url
        });
        onChatCreated(
          chatId,
          `${otherUser.nombre} ${otherUser.apellido}`,
          otherUser.avatar_url
        );
      } else {
        console.warn('⚠️ onChatCreated callback no está definido');
      }

      setOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('❌ Error al crear chat:', error);
      toast.error('Error al iniciar el chat');
    } finally {
      setIsCreating(false);
    }
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre[0]}${apellido[0]}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <MessageSquarePlus className="h-5 w-5" />
          Nuevo Chat
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Iniciar nueva conversación</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Buscador */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buscar
            </Button>
          </div>

          {/* Resultados */}
          {searchResults.length > 0 && (
            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="divide-y">
                {searchResults.map((otherUser) => (
                  <div
                    key={otherUser.id}
                    className="p-4 hover:bg-muted/50 flex items-center gap-3"
                  >
                    <Avatar>
                      <AvatarImage src={otherUser.avatar_url} />
                      <AvatarFallback>
                        {getInitials(otherUser.nombre, otherUser.apellido)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">
                        {otherUser.nombre} {otherUser.apellido}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {otherUser.email}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {otherUser.rol}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleCreateChat(otherUser)}
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Chatear'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Estado vacío */}
          {!isSearching && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No se encontraron usuarios</p>
              <p className="text-sm">Intenta buscar por email</p>
            </div>
          )}

          {/* Mensaje inicial */}
          {!searchQuery && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquarePlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Busca un usuario para iniciar un chat</p>
              <p className="text-sm">Escribe el email y presiona buscar</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
