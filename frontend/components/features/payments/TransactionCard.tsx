'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, XCircle, DollarSign, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReleasePayment, useRequestRefund } from '@/hooks/payments';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Transaction {
  id: string;
  trabajo_id: string;
  trabajo_titulo?: string;
  descripcion?: string;
  monto: number;
  estado: 'PENDIENTE' | 'PAGADO' | 'LIBERADO' | 'REEMBOLSADO' | 'CANCELADO' | 'pendiente' | 'completado' | 'cancelado' | 'en_disputa' | 'reembolsado';
  fecha_creacion: string;
  fecha_pago?: string;
  fecha_liberacion?: string;
  mercadopago_payment_id?: string;
  profesional?: {
    nombre: string;
    apellido: string;
  };
  cliente?: {
    nombre: string;
    apellido: string;
  };
  profesional_nombre?: string;
  cliente_nombre?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  userRole: 'cliente' | 'profesional';
}

const statusConfig = {
  PENDIENTE: {
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    label: 'Pendiente de Pago',
    badgeVariant: 'secondary' as const,
  },
  pendiente: {
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    label: 'Pendiente de Pago',
    badgeVariant: 'secondary' as const,
  },
  PAGADO: {
    icon: CheckCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'Pagado (En Garantía)',
    badgeVariant: 'default' as const,
  },
  completado: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Completado',
    badgeVariant: 'default' as const,
  },
  LIBERADO: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Liberado al Profesional',
    badgeVariant: 'default' as const,
  },
  REEMBOLSADO: {
    icon: DollarSign,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    label: 'Reembolsado',
    badgeVariant: 'outline' as const,
  },
  reembolsado: {
    icon: DollarSign,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    label: 'Reembolsado',
    badgeVariant: 'outline' as const,
  },
  CANCELADO: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Cancelado',
    badgeVariant: 'destructive' as const,
  },
  cancelado: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Cancelado',
    badgeVariant: 'destructive' as const,
  },
  en_disputa: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    label: 'En Disputa',
    badgeVariant: 'secondary' as const,
  },
};

/**
 * TransactionCard (refactorizado con hooks)
 * 
 * Componente de transacción que usa mutation hooks:
 * - useReleasePayment (cliente libera pago)
 * - useRequestRefund (cliente solicita reembolso)
 * 
 * @example
 * ```tsx
 * <TransactionCard transaction={transaction} userRole="cliente" />
 * ```
 */
export function TransactionCard({
  transaction,
  userRole,
}: TransactionCardProps) {
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  
  // 🔧 Hooks de mutations
  const { mutate: releasePayment, isPending: isReleasing } = useReleasePayment();
  const { mutate: requestRefund, isPending: isRefunding } = useRequestRefund();

  const config = statusConfig[transaction.estado as keyof typeof statusConfig] || statusConfig.PENDIENTE;
  const Icon = config.icon;
  
  const counterpart = userRole === 'cliente'
    ? (transaction.profesional || { nombre: transaction.profesional_nombre || 'Profesional', apellido: '' })
    : (transaction.cliente || { nombre: transaction.cliente_nombre || 'Cliente', apellido: '' });

  const canReleasePayment = userRole === 'cliente' && (transaction.estado === 'PAGADO' || transaction.estado === 'completado');
  const canRequestRefund = userRole === 'cliente' && (transaction.estado === 'PAGADO' || transaction.estado === 'completado');

  const handleReleasePayment = () => {
    releasePayment(transaction.id);
  };

  const handleRequestRefund = () => {
    if (refundReason.length < 20) {
      return;
    }
    requestRefund({
      transactionId: transaction.id,
      motivo: refundReason,
    }, {
      onSuccess: () => {
        setRefundDialogOpen(false);
        setRefundReason('');
      },
    });
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {/* Icono de estado */}
            <div className={`shrink-0 h-12 w-12 rounded-full ${config.bg} flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${config.color}`} />
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {transaction.trabajo_titulo || transaction.descripcion || 'Transacción'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {userRole === 'cliente' ? 'Profesional' : 'Cliente'}:{' '}
                    {counterpart?.nombre} {counterpart?.apellido}
                  </p>
                </div>
                <Badge variant={config.badgeVariant}>{config.label}</Badge>
              </div>

              {/* Monto */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  ${transaction.monto.toLocaleString('es-AR')}
                </span>
                {transaction.mercadopago_payment_id && (
                  <span className="text-xs text-slate-500">
                    ID: {transaction.mercadopago_payment_id}
                  </span>
                )}
              </div>

              {/* Timeline */}
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-3 w-3" />
                  Creado {formatDistanceToNow(new Date(transaction.fecha_creacion), { addSuffix: true, locale: es })}
                </div>
                {transaction.fecha_pago && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="h-3 w-3" />
                    Pagado {formatDistanceToNow(new Date(transaction.fecha_pago), { addSuffix: true, locale: es })}
                  </div>
                )}
                {transaction.fecha_liberacion && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Liberado {formatDistanceToNow(new Date(transaction.fecha_liberacion), { addSuffix: true, locale: es })}
                  </div>
                )}
              </div>

              {/* Mensaje informativo según estado */}
              {(transaction.estado === 'PAGADO' || transaction.estado === 'completado') && userRole === 'cliente' && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-800">
                    El pago está en garantía. Libéralo cuando el trabajo esté completado o solicita
                    un reembolso si no estás satisfecho.
                  </p>
                </div>
              )}

              {(transaction.estado === 'PAGADO' || transaction.estado === 'completado') && userRole === 'profesional' && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-orange-800">
                    El cliente liberará el pago una vez que confirme que el trabajo está completo.
                  </p>
                </div>
              )}

              {(transaction.estado === 'LIBERADO') && userRole === 'profesional' && (
                <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-800">
                    El pago ha sido liberado y estará disponible en tu cuenta en 24-48 horas.
                  </p>
                </div>
              )}

              {/* Acciones */}
              {(canReleasePayment || canRequestRefund) && (
                <div className="flex gap-2 pt-2">
                  {canReleasePayment && (
                    <Button
                      onClick={handleReleasePayment}
                      size="sm"
                      variant="default"
                      disabled={isReleasing}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isReleasing ? 'Liberando...' : 'Liberar Pago'}
                    </Button>
                  )}
                  {canRequestRefund && (
                    <Button
                      onClick={() => setRefundDialogOpen(true)}
                      size="sm"
                      variant="outline"
                      disabled={isRefunding}
                    >
                      Solicitar Reembolso
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Reembolso */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Reembolso</DialogTitle>
            <DialogDescription>
              Explica por qué solicitas un reembolso. Un administrador revisará tu caso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="refund-reason">Motivo del reembolso</Label>
              <Textarea
                id="refund-reason"
                placeholder="Describe detalladamente por qué solicitas un reembolso..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={5}
                className={refundReason.length > 0 && refundReason.length < 20 ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                {refundReason.length}/500 caracteres (mínimo 20)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleRequestRefund}
              disabled={isRefunding || refundReason.length < 20}
            >
              {isRefunding ? 'Enviando...' : 'Solicitar Reembolso'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
