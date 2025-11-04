'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Smartphone, Save, Loader2 } from 'lucide-react';
import { notificationService, NotificationPreferences } from '@/lib/services/notificationService';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function NotificationPreferencesForm() {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationService.getPreferences(),
  });

  const [formData, setFormData] = useState<NotificationPreferences>(
    preferences || {
      email_mensajes: true,
      email_ofertas: true,
      email_pagos: true,
      email_resenas: true,
      push_mensajes: true,
      push_ofertas: true,
      push_pagos: true,
      push_resenas: true,
      frecuencia_resumen: 'diario',
    }
  );

  const updateMutation = useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) =>
      notificationService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferencias guardadas correctamente');
    },
    onError: () => {
      toast.error('Error al guardar preferencias');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferencias de Notificaciones
          </CardTitle>
          <CardDescription>
            Configura cómo y cuándo quieres recibir notificaciones
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Notificaciones por Email */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Mail className="h-4 w-4" />
              <span>Notificaciones por Email</span>
            </div>

            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="email_mensajes" className="cursor-pointer">
                  Nuevos mensajes
                </Label>
                <Switch
                  id="email_mensajes"
                  checked={formData.email_mensajes}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, email_mensajes: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email_ofertas" className="cursor-pointer">
                  Ofertas de trabajo
                </Label>
                <Switch
                  id="email_ofertas"
                  checked={formData.email_ofertas}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, email_ofertas: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email_pagos" className="cursor-pointer">
                  Pagos y transacciones
                </Label>
                <Switch
                  id="email_pagos"
                  checked={formData.email_pagos}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, email_pagos: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email_resenas" className="cursor-pointer">
                  Reseñas recibidas
                </Label>
                <Switch
                  id="email_resenas"
                  checked={formData.email_resenas}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, email_resenas: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Notificaciones Push */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Smartphone className="h-4 w-4" />
              <span>Notificaciones Push</span>
            </div>

            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="push_mensajes" className="cursor-pointer">
                  Nuevos mensajes
                </Label>
                <Switch
                  id="push_mensajes"
                  checked={formData.push_mensajes}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, push_mensajes: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push_ofertas" className="cursor-pointer">
                  Ofertas de trabajo
                </Label>
                <Switch
                  id="push_ofertas"
                  checked={formData.push_ofertas}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, push_ofertas: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push_pagos" className="cursor-pointer">
                  Pagos y transacciones
                </Label>
                <Switch
                  id="push_pagos"
                  checked={formData.push_pagos}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, push_pagos: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push_resenas" className="cursor-pointer">
                  Reseñas recibidas
                </Label>
                <Switch
                  id="push_resenas"
                  checked={formData.push_resenas}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, push_resenas: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Frecuencia de Resumen */}
          <div className="space-y-2">
            <Label htmlFor="frecuencia">Resumen de Actividad</Label>
            <Select
              value={formData.frecuencia_resumen}
              onValueChange={(value: 'nunca' | 'diario' | 'semanal') =>
                setFormData({ ...formData, frecuencia_resumen: value })
              }
            >
              <SelectTrigger id="frecuencia">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nunca">Nunca</SelectItem>
                <SelectItem value="diario">Diario</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Recibe un resumen de tu actividad por email
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Preferencias
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
