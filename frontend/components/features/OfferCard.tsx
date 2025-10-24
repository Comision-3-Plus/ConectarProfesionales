'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Oferta } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteService } from '@/lib/services';
import { toast } from 'sonner';

interface OfferCardProps {
  offer: Oferta;
  isClient?: boolean;
}

export function OfferCard({ offer, isClient = false }: OfferCardProps) {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: () => clienteService.acceptOferta(offer.id.toString()),
    onSuccess: (data) => {
      toast.success('Oferta aceptada. Redirigiendo al pago...');
      // Redirect to payment
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    },
    onError: () => {
      toast.error('Error al aceptar la oferta');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => clienteService.rejectOferta(offer.id.toString()),
    onSuccess: () => {
      toast.success('Oferta rechazada');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: () => {
      toast.error('Error al rechazar la oferta');
    },
  });

  const estadoColors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    aceptada: 'bg-green-100 text-green-800',
    rechazada: 'bg-red-100 text-red-800',
    expirada: 'bg-gray-100 text-gray-800',
    OFERTADO: 'bg-yellow-100 text-yellow-800',
    ACEPTADO: 'bg-green-100 text-green-800',
    RECHAZADO: 'bg-red-100 text-red-800',
  };

  const estadoLabels: Record<string, string> = {
    pendiente: 'Pendiente',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    expirada: 'Expirada',
    OFERTADO: 'Pendiente',
    ACEPTADO: 'Aceptada',
    RECHAZADO: 'Rechazada',
  };

  const expiresAt = offer.expires_at || offer.fecha_actualizacion;
  const precio = offer.precio || offer.precio_final;
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;
  const isPending = (offer.estado === 'pendiente' || offer.estado === 'OFERTADO') && !isExpired;

  return (
    <Card className="border-2 border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="font-semibold text-slate-900">Nueva Oferta</span>
          </div>
          <Badge className={estadoColors[offer.estado]} variant="secondary">
            {estadoLabels[offer.estado]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-slate-700">{offer.descripcion}</p>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-sm text-slate-600">Precio:</span>
          <span className="text-2xl font-bold text-orange-500">${precio.toFixed(2)}</span>
        </div>

        {expiresAt && (
          <div className="text-xs text-slate-500">
            Expira:{' '}
            {new Date(expiresAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </CardContent>

      {isClient && isPending && (
        <CardFooter className="flex space-x-2 border-t border-orange-200 pt-4">
          <Button
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => rejectMutation.mutate()}
            disabled={rejectMutation.isPending}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rechazar
          </Button>
          <Button
            className="flex-1 bg-orange-500 hover:bg-orange-600"
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Aceptar y Pagar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
