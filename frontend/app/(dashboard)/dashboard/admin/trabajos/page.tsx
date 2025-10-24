'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Ban,
} from 'lucide-react';
import { adminService } from '@/lib/services/adminService';
import { toast } from 'sonner';
import { TrabajoRead } from '@/types';

type TrabajoStatus = 'todos' | 'PENDIENTE_PAGO' | 'PAGADO_EN_ESCROW' | 'LIBERADO' | 'CANCELADO';

export default function TrabajosPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<TrabajoStatus>('todos');
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'cancel' | 'refund' | null;
    trabajo: TrabajoRead | null;
  }>({
    open: false,
    action: null,
    trabajo: null,
  });

  // Query para obtener todos los trabajos
  const {
    data: trabajos,
    isLoading,
  } = useQuery({
    queryKey: ['admin-trabajos'],
    queryFn: () => adminService.listAllTrabajos(),
  });

  // Mutation para cancelar trabajo
  const cancelMutation = useMutation({
    mutationFn: (trabajoId: string) => adminService.cancelarTrabajo(trabajoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trabajos'] });
      toast.success('Trabajo cancelado exitosamente');
      setActionDialog({ open: false, action: null, trabajo: null });
    },
    onError: (err: Error) => {
      toast.error(`Error al cancelar trabajo: ${err.message}`);
    },
  });

  // Mutation para reembolsar (usa el mismo endpoint que cancelar)
  const refundMutation = useMutation({
    mutationFn: (trabajoId: string) => adminService.cancelarTrabajo(trabajoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trabajos'] });
      toast.success('Reembolso procesado exitosamente');
      setActionDialog({ open: false, action: null, trabajo: null });
    },
    onError: (err: Error) => {
      toast.error(`Error al procesar reembolso: ${err.message}`);
    },
  });

  // Filtrar trabajos por estado
  const filteredTrabajos = trabajos?.filter((trabajo) => {
    if (statusFilter === 'todos') return true;
    return trabajo.estado === statusFilter;
  });

  // Calcular estadísticas
  const stats = {
    total: trabajos?.length || 0,
    pendiente: trabajos?.filter((t) => t.estado === 'PENDIENTE_PAGO').length || 0,
    enEscrow: trabajos?.filter((t) => t.estado === 'PAGADO_EN_ESCROW').length || 0,
    completados: trabajos?.filter((t) => t.estado === 'LIBERADO').length || 0,
    cancelados: trabajos?.filter((t) => t.estado === 'CANCELADO').length || 0,
  };

  const handleCancel = (trabajo: TrabajoRead) => {
    setActionDialog({
      open: true,
      action: 'cancel',
      trabajo,
    });
  };

  const handleRefund = (trabajo: TrabajoRead) => {
    setActionDialog({
      open: true,
      action: 'refund',
      trabajo,
    });
  };

  const confirmAction = () => {
    if (!actionDialog.trabajo) return;

    if (actionDialog.action === 'cancel') {
      cancelMutation.mutate(actionDialog.trabajo.id);
    } else if (actionDialog.action === 'refund') {
      refundMutation.mutate(actionDialog.trabajo.id);
    }
  };

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, { color: string; icon: typeof Clock; label: string }> = {
      PENDIENTE_PAGO: {
        color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400',
        icon: Clock,
        label: 'Pendiente Pago',
      },
      PAGADO_EN_ESCROW: {
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
        icon: DollarSign,
        label: 'En Escrow',
      },
      LIBERADO: {
        color: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400',
        icon: CheckCircle2,
        label: 'Completado',
      },
      CANCELADO: {
        color: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
        icon: XCircle,
        label: 'Cancelado',
      },
    };

    const variant = variants[estado] || variants.PENDIENTE_PAGO;
    const Icon = variant.icon;

    return (
      <Badge variant="outline" className={`${variant.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Trabajos</h1>
        <p className="text-muted-foreground">
          Administra todos los trabajos y transacciones de la plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-blue-500 dark:border-blue-400">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Trabajos
              </CardTitle>
              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500 dark:border-yellow-400">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes
              </CardTitle>
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.pendiente}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500 dark:border-purple-400">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En Escrow
              </CardTitle>
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.enEscrow}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500 dark:border-green-400">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completados
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.completados}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500 dark:border-red-400">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cancelados
              </CardTitle>
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.cancelados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Trabajos</CardTitle>
              <CardDescription>Filtra y gestiona los trabajos de la plataforma</CardDescription>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as TrabajoStatus)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Estados</SelectItem>
                <SelectItem value="PENDIENTE_PAGO">Pendiente Pago</SelectItem>
                <SelectItem value="PAGADO_EN_ESCROW">En Escrow</SelectItem>
                <SelectItem value="LIBERADO">Completados</SelectItem>
                <SelectItem value="CANCELADO">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTrabajos && filteredTrabajos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      ID
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Descripción
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Cliente
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Profesional
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Monto
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Estado
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Fecha
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrabajos.map((trabajo) => (
                    <tr
                      key={trabajo.id}
                      className="border-b dark:border-gray-800 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-sm font-mono text-muted-foreground">
                          #{trabajo.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-foreground truncate">
                            Trabajo #{trabajo.id.slice(0, 8)}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-foreground">{trabajo.cliente_id.slice(0, 8)}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-foreground">{trabajo.profesional_id.slice(0, 8)}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-semibold text-foreground">
                          {formatCurrency(trabajo.precio_final)}
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(trabajo.estado || trabajo.estado_escrow)}</td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(trabajo.fecha_creacion)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {trabajo.estado === 'PAGADO_EN_ESCROW' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950/30"
                                onClick={() => handleCancel(trabajo)}
                                disabled={cancelMutation.isPending}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950/30"
                                onClick={() => handleRefund(trabajo)}
                                disabled={refundMutation.isPending}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Reembolsar
                              </Button>
                            </>
                          )}
                          {(trabajo.estado === 'LIBERADO' || trabajo.estado === 'CANCELADO') && (
                            <span className="text-sm text-muted-foreground italic">
                              Sin acciones
                            </span>
                          )}
                          {trabajo.estado === 'PENDIENTE_PAGO' && (
                            <span className="text-sm text-muted-foreground italic">
                              Esperando pago
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay trabajos con este filtro
              </h3>
              <p className="text-muted-foreground">
                Intenta cambiar el filtro para ver más resultados
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, action: null, trabajo: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === 'cancel' ? '¿Cancelar Trabajo?' : '¿Procesar Reembolso?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === 'cancel' ? (
                <>
                  Estás a punto de cancelar el trabajo <strong>#{actionDialog.trabajo?.id.slice(0, 8)}</strong>.
                  Esta acción liberará el dinero del escrow y lo devolverá al cliente.
                </>
              ) : (
                <>
                  Estás a punto de procesar un reembolso para el trabajo <strong>#{actionDialog.trabajo?.id.slice(0, 8)}</strong>.
                  El monto de <strong>{formatCurrency(actionDialog.trabajo?.precio_final || 0)}</strong> será devuelto al cliente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
