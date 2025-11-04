'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  MessageSquare,
  DollarSign,
  Star,
  AlertCircle,
  Info,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { notificationService } from '@/lib/services';
import type { Notification as NotifData } from '@/lib/services/notificationService';

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  mensaje: MessageSquare,
  pago: DollarSign,
  resena: Star,
  alerta: AlertCircle,
  info: Info,
  default: Bell,
};

const notificationColors: Record<string, string> = {
  mensaje: 'text-blue-600',
  pago: 'text-green-600',
  resena: 'text-orange-600',
  alerta: 'text-red-600',
  info: 'text-slate-600',
  default: 'text-slate-600',
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Obtener notificaciones
  const { data: notificaciones = [] } = useQuery<NotifData[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationService.getNotifications();
      return response.notificaciones || [];
    },
    refetchInterval: 30000, // Refetch cada 30 segundos
    staleTime: 10000,
  });

  // Contar no leídas
  const unreadCount = notificaciones.filter((n) => !n.leida).length;

  // Marcar como leída
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Todas las notificaciones fueron marcadas como leídas');
    },
  });

  // Eliminar notificación
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => 
      notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificación eliminada');
    },
  });

  // Reproducir sonido para nuevas notificaciones
  const playNotificationSound = useCallback(() => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Ignorar errores si el audio no se puede reproducir
    });
  }, []);

  // Detectar nuevas notificaciones
  useEffect(() => {
    const previousCount = queryClient.getQueryData<NotifData[]>(['notifications'])?.length || 0;
    const currentCount = notificaciones.length;

    if (currentCount > previousCount) {
      playNotificationSound();
      // Mostrar toast para la notificación más reciente
      const latestNotification = notificaciones[0];
      if (latestNotification && !latestNotification.leida) {
        toast.info(latestNotification.titulo, {
          description: latestNotification.mensaje,
        });
      }
    }
  }, [notificaciones, queryClient, playNotificationSound]);

    const handleNotificationClick = async (notification: NotifData) => {
    if (!notification.leida) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navegar según el tipo de notificación
    if (notification.metadata?.url) {
      window.location.href = notification.metadata.url as string;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notificaciones</h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <ScrollArea className="h-[400px]">
          {notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Bell className="h-12 w-12 mb-3 text-slate-300" />
              <p className="text-sm">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {notificaciones.map((notification) => {
                const Icon = notificationIcons[notification.tipo] || notificationIcons.default;
                const iconColor = notificationColors[notification.tipo] || notificationColors.default;

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                      !notification.leida ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className={`shrink-0 ${iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`font-medium text-sm ${!notification.leida ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notification.titulo}
                          </p>
                          {!notification.leida && (
                            <div className="shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                          {notification.mensaje}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(notification.fecha_creacion), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                          <div className="flex gap-1">
                            {!notification.leida && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsReadMutation.mutate(notification.id);
                                }}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Marcar leída
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notificaciones.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setOpen(false);
                  window.location.href = '/dashboard/notificaciones';
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Hook para solicitar permisos de notificaciones del navegador
 */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  return {
    permission,
    requestPermission,
    isSupported: 'Notification' in window,
  };
}

/**
 * Hook para mostrar notificaciones del navegador
 */
export function useBrowserNotification() {
  const { permission, requestPermission } = useNotificationPermission();

  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (permission !== 'granted') {
        const result = await requestPermission();
        if (result !== 'granted') {
          return null;
        }
      }

      return new Notification(title, {
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        ...options,
      });
    },
    [permission, requestPermission]
  );

  return {
    showNotification,
    permission,
    requestPermission,
  };
}

