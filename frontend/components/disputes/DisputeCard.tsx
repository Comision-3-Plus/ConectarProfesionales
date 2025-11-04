'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MessageSquare, FileText, Calendar, User, CheckCircle2, XCircle } from 'lucide-react';
import { Dispute } from '@/lib/services/disputeService';
import { cn } from '@/lib/utils';

interface DisputeCardProps {
  dispute: Dispute;
  onViewDetails?: () => void;
}

const disputeTypeLabels = {
  reembolso: 'Reembolso',
  calidad: 'Calidad',
  cancelacion: 'Cancelación',
  otro: 'Otro',
};

const disputeStatusConfig = {
  abierta: {
    label: 'Abierta',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: AlertTriangle,
  },
  en_revision: {
    label: 'En Revisión',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: FileText,
  },
  resuelta: {
    label: 'Resuelta',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle2,
  },
  rechazada: {
    label: 'Rechazada',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircle,
  },
};

export function DisputeCard({ dispute, onViewDetails }: DisputeCardProps) {
  const statusConfig = disputeStatusConfig[dispute.estado];
  const StatusIcon = statusConfig.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{disputeTypeLabels[dispute.tipo]}</Badge>
              <Badge className={cn('border', statusConfig.color)}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg">{dispute.trabajo_titulo}</h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600 line-clamp-2">{dispute.descripcion}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <User className="h-4 w-4" />
            <span className="truncate">Cliente: {dispute.cliente_nombre}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <User className="h-4 w-4" />
            <span className="truncate">Profesional: {dispute.profesional_nombre}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            Creada: {new Date(dispute.fecha_creacion).toLocaleDateString('es-AR')}
          </span>
        </div>

        {dispute.evidencias && dispute.evidencias.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <FileText className="h-3.5 w-3.5" />
            <span>{dispute.evidencias.length} evidencia(s) adjunta(s)</span>
          </div>
        )}

        {dispute.resolucion && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg border">
            <p className="text-xs font-semibold text-slate-700 mb-1">Resolución:</p>
            <p className="text-sm text-slate-600">{dispute.resolucion}</p>
            {dispute.fecha_resolucion && (
              <p className="text-xs text-slate-500 mt-1">
                {new Date(dispute.fecha_resolucion).toLocaleDateString('es-AR')}
              </p>
            )}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={onViewDetails}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Ver Detalles y Mensajes
        </Button>
      </CardContent>
    </Card>
  );
}
