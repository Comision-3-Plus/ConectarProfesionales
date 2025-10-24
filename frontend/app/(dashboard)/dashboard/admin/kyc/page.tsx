'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/services/adminService';
import { ProfessionalPendingReview } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Shield,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export default function KYCVerificationPage() {
  const queryClient = useQueryClient();
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
    professional: ProfessionalPendingReview | null;
  }>({
    open: false,
    action: null,
    professional: null,
  });

  // Query para obtener profesionales pendientes
  const {
    data: pendingProfessionals,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['pendingKYC'],
    queryFn: adminService.listPendingKYC,
    staleTime: 30000,
  });

  // Mutación para aprobar profesional
  const approveMutation = useMutation({
    mutationFn: (professionalId: string) =>
      adminService.approveKYC(professionalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingKYC'] });
      queryClient.invalidateQueries({ queryKey: ['userMetrics'] });
      toast.success('Profesional aprobado exitosamente', {
        description: 'El profesional ya puede ofrecer servicios en la plataforma.',
      });
      setActionDialog({ open: false, action: null, professional: null });
    },
    onError: (error: Error) => {
      toast.error('Error al aprobar profesional', {
        description: error.message || 'Intenta nuevamente más tarde.',
      });
    },
  });

  // Mutación para rechazar profesional
  const rejectMutation = useMutation({
    mutationFn: (professionalId: string) =>
      adminService.rejectKYC(professionalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingKYC'] });
      queryClient.invalidateQueries({ queryKey: ['userMetrics'] });
      toast.success('Profesional rechazado', {
        description: 'El profesional ha sido notificado del rechazo.',
      });
      setActionDialog({ open: false, action: null, professional: null });
    },
    onError: (error: Error) => {
      toast.error('Error al rechazar profesional', {
        description: error.message || 'Intenta nuevamente más tarde.',
      });
    },
  });

  const handleApprove = (professional: ProfessionalPendingReview) => {
    setActionDialog({
      open: true,
      action: 'approve',
      professional,
    });
  };

  const handleReject = (professional: ProfessionalPendingReview) => {
    setActionDialog({
      open: true,
      action: 'reject',
      professional,
    });
  };

  const confirmAction = () => {
    if (!actionDialog.professional) return;

    if (actionDialog.action === 'approve') {
      approveMutation.mutate(actionDialog.professional.id);
    } else if (actionDialog.action === 'reject') {
      rejectMutation.mutate(actionDialog.professional.id);
    }
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Verificación KYC
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Error cargando profesionales pendientes
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los profesionales pendientes. Por favor, intenta
            recargar la página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalPending = pendingProfessionals?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Verificación KYC
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Revisa y aprueba profesionales para la plataforma
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {totalPending > 0 ? (
            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white text-base px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              {totalPending} Pendiente{totalPending !== 1 ? 's' : ''}
            </Badge>
          ) : (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-base px-4 py-2">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Al día
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-yellow-500 dark:border-l-yellow-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              En Revisión
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {isLoading ? '-' : totalPending}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Profesionales esperando aprobación
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 dark:border-l-green-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Aprobados Hoy
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              0
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Verificados en las últimas 24h
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 dark:border-l-red-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Rechazados Hoy
            </CardTitle>
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              0
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Denegados en las últimas 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Profesionales Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-slate-900 dark:text-white">
            <Shield className="h-5 w-5 mr-2 text-yellow-500" />
            Profesionales Pendientes de Verificación
          </CardTitle>
          <CardDescription className="dark:text-slate-400">
            Revisa la información y documentos de cada profesional antes de aprobar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              ))}
            </div>
          ) : totalPending === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                ¡Todo al día!
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                No hay profesionales pendientes de verificación en este momento.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-slate-800">
                    <TableHead className="dark:text-slate-400">Profesional</TableHead>
                    <TableHead className="dark:text-slate-400">Email</TableHead>
                    <TableHead className="dark:text-slate-400">Fecha Registro</TableHead>
                    <TableHead className="dark:text-slate-400">Estado</TableHead>
                    <TableHead className="text-right dark:text-slate-400">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingProfessionals?.map((professional) => (
                    <TableRow 
                      key={professional.id} 
                      className="dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src="" alt={professional.nombre} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs font-semibold">
                              {professional.nombre?.[0]}{professional.apellido?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {professional.nombre} {professional.apellido}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              ID: {professional.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span>{professional.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>
                            {new Date(professional.fecha_creacion).toLocaleDateString(
                              'es-ES',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400">
                          <Clock className="h-3 w-3 mr-1" />
                          En Revisión
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-500 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30"
                            onClick={() => handleApprove(professional)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950/30"
                            onClick={() => handleReject(professional)}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmación */}
      <AlertDialog
        open={actionDialog.open}
        onOpenChange={(open) =>
          !open && setActionDialog({ open, action: null, professional: null })
        }
      >
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              {actionDialog.action === 'approve'
                ? '¿Aprobar Profesional?'
                : '¿Rechazar Profesional?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-400">
              {actionDialog.action === 'approve' ? (
                <>
                  Estás a punto de aprobar a{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {actionDialog.professional?.nombre}{' '}
                    {actionDialog.professional?.apellido}
                  </span>
                  . El profesional podrá ofrecer servicios en la plataforma.
                </>
              ) : (
                <>
                  Estás a punto de rechazar a{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {actionDialog.professional?.nombre}{' '}
                    {actionDialog.professional?.apellido}
                  </span>
                  . El profesional será notificado del rechazo.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionDialog.action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {approveMutation.isPending || rejectMutation.isPending
                ? 'Procesando...'
                : actionDialog.action === 'approve'
                ? 'Aprobar'
                : 'Rechazar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
