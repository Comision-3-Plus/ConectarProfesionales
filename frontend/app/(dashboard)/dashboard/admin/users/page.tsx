'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/services/adminService';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { MoreHorizontal, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { UserSearchResult } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type ActionType = 'ban' | 'unban' | 'changeRole';

interface ActionDialogState {
  open: boolean;
  type: ActionType | null;
  user: UserSearchResult | null;
  newRole?: string;
}

export default function AllUsersPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    open: false,
    type: null,
    user: null,
  });

  // Query para obtener usuarios paginados
  const {
    data: usersData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['allUsers', currentPage, pageLimit],
    queryFn: () => adminService.listAllUsers(currentPage, pageLimit),
    staleTime: 30000, // 30 segundos
  });

  // Mutación para banear usuario
  const banMutation = useMutation({
    mutationFn: (userId: string) => adminService.banUser(userId),
    onSuccess: (data) => {
      toast.success('Usuario baneado exitosamente', {
        description: `${data.email} ha sido desactivado.`,
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setActionDialog({ open: false, type: null, user: null });
    },
    onError: (error: Error) => {
      toast.error('Error al banear usuario', {
        description: error.message || 'Intenta nuevamente más tarde.',
      });
    },
  });

  // Mutación para desbanear usuario
  const unbanMutation = useMutation({
    mutationFn: (userId: string) => adminService.unbanUser(userId),
    onSuccess: (data) => {
      toast.success('Usuario desbaneado exitosamente', {
        description: `${data.email} ha sido reactivado.`,
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setActionDialog({ open: false, type: null, user: null });
    },
    onError: (error: Error) => {
      toast.error('Error al desbanear usuario', {
        description: error.message || 'Intenta nuevamente más tarde.',
      });
    },
  });

  const handleActionConfirm = () => {
    if (!actionDialog.user) return;

    switch (actionDialog.type) {
      case 'ban':
        banMutation.mutate(actionDialog.user.id);
        break;
      case 'unban':
        unbanMutation.mutate(actionDialog.user.id);
        break;
      // Aquí se podría agregar la lógica de cambio de rol cuando el backend lo soporte
      default:
        break;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'PROFESIONAL':
        return 'default';
      case 'CLIENTE':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Activo
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        Baneado
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Render de estados de carga y error
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-2">
            Administra todos los usuarios de la plataforma
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-2">
            Administra todos los usuarios de la plataforma
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar usuarios</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los usuarios. Por favor, intenta de nuevo más tarde.
            {error instanceof Error && (
              <p className="mt-2 text-sm">{error.message}</p>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { users = [], total = 0, totalPages = 1 } = usersData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-2">
            Administra todos los usuarios de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            Total de usuarios: <strong>{total}</strong>
          </span>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>
            Lista completa de usuarios - Página {currentPage} de {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay usuarios registrados</h3>
              <p className="text-muted-foreground">
                Aún no hay usuarios en la plataforma.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      {/* Usuario */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url || undefined} alt={user.nombre} />
                            <AvatarFallback>{getInitials(user.nombre)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.nombre} {user.apellido}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Rol */}
                      <TableCell>
                        <Badge variant={getRoleBadgeColor(user.rol)}>
                          {user.rol}
                        </Badge>
                      </TableCell>

                      {/* Estado */}
                      <TableCell>{getStatusBadge(user.is_active)}</TableCell>

                      {/* Fecha de Registro */}
                      <TableCell>
                        <span className="text-sm">{formatDate(user.fecha_creacion)}</span>
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                setActionDialog({
                                  open: true,
                                  type: 'changeRole',
                                  user,
                                })
                              }
                            >
                              Cambiar Rol
                            </DropdownMenuItem>
                            {user.is_active ? (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  setActionDialog({
                                    open: true,
                                    type: 'ban',
                                    user,
                                  })
                                }
                              >
                                Banear Usuario
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() =>
                                  setActionDialog({
                                    open: true,
                                    type: 'unban',
                                    user,
                                  })
                                }
                              >
                                Desbanear Usuario
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>

                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        // Mostrar solo algunas páginas alrededor de la actual
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                          }
                          className={
                            currentPage === totalPages
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación de acciones */}
      <AlertDialog
        open={actionDialog.open}
        onOpenChange={(open: boolean) => !open && setActionDialog({ open: false, type: null, user: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.type === 'ban' && '¿Banear usuario?'}
              {actionDialog.type === 'unban' && '¿Desbanear usuario?'}
              {actionDialog.type === 'changeRole' && 'Cambiar rol de usuario'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.type === 'ban' && (
                <>
                  ¿Estás seguro de que deseas banear a{' '}
                  <strong>{actionDialog.user?.nombre}</strong>? El usuario no podrá
                  acceder a su cuenta.
                </>
              )}
              {actionDialog.type === 'unban' && (
                <>
                  ¿Estás seguro de que deseas desbanear a{' '}
                  <strong>{actionDialog.user?.nombre}</strong>? El usuario podrá volver a
                  acceder a su cuenta.
                </>
              )}
              {actionDialog.type === 'changeRole' && (
                <div className="space-y-4 pt-4">
                  <p>
                    Selecciona el nuevo rol para{' '}
                    <strong>{actionDialog.user?.nombre}</strong>:
                  </p>
                  <Select
                    defaultValue={actionDialog.user?.rol}
                    onValueChange={(value) =>
                      setActionDialog((prev) => ({ ...prev, newRole: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENTE">Cliente</SelectItem>
                      <SelectItem value="PROFESIONAL">Profesional</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Nota: La funcionalidad de cambio de rol estará disponible próximamente.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActionConfirm}
              disabled={actionDialog.type === 'changeRole'}
              className={
                actionDialog.type === 'ban'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : ''
              }
            >
              {actionDialog.type === 'ban' && 'Banear'}
              {actionDialog.type === 'unban' && 'Desbanear'}
              {actionDialog.type === 'changeRole' && 'Cambiar Rol (Próximamente)'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
