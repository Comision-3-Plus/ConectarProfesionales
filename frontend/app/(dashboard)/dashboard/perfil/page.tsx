'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/lib/services/userService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  MessageSquareOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { UserUpdate } from '@/types';

export default function ProfilePage() {
  const { user: authUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nombre: '',
    apellido: '',
  });

  // Query para obtener datos del usuario actualizado
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: userService.getMe,
    initialData: authUser || undefined,
    retry: 2,
    staleTime: 5000,
  });

  // Mutación para actualizar perfil
  const updateMutation = useMutation({
    mutationFn: (data: UserUpdate) => userService.updateMe(data),
    onSuccess: (updatedUser) => {
      toast.success('Perfil actualizado exitosamente', {
        description: 'Tus cambios han sido guardados.',
      });
      queryClient.setQueryData(['userProfile'], updatedUser);
      useAuthStore.getState().setUser(updatedUser);
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar perfil', {
        description: error.message || 'Intenta nuevamente más tarde.',
      });
    },
  });

  const handleEdit = () => {
    if (user) {
      setEditData({
        nombre: user.nombre,
        apellido: user.apellido,
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!editData.nombre.trim() || !editData.apellido.trim()) {
      toast.error('Campos requeridos', {
        description: 'El nombre y apellido no pueden estar vacíos.',
      });
      return;
    }
    updateMutation.mutate(editData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      nombre: '',
      apellido: '',
    });
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      ADMIN: { variant: 'destructive' as const, label: 'Administrador', icon: Shield },
      PROFESIONAL: { variant: 'default' as const, label: 'Profesional', icon: User },
      CLIENTE: { variant: 'secondary' as const, label: 'Cliente', icon: User },
    };
    const badge = badges[role as keyof typeof badges] || badges.CLIENTE;
    const Icon = badge.icon;
    return (
      <Badge variant={badge.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {badge.label}
      </Badge>
    );
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre[0]}${apellido[0]}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Administra tu información personal
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Administra tu información personal
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar perfil</AlertTitle>
          <AlertDescription>
            No se pudo cargar tu información. 
            {error instanceof Error && (
              <p className="mt-2 text-sm font-mono bg-red-100 p-2 rounded">
                {error.message}
              </p>
            )}
            <div className="mt-4 space-x-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Reintentar
              </Button>
              <Button
                onClick={() => {
                  useAuthStore.getState().logout();
                  window.location.href = '/login';
                }}
                variant="destructive"
                size="sm"
              >
                Cerrar sesión e intentar de nuevo
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Administra tu información personal y configuración de cuenta
          </p>
        </div>
      </div>

      {/* Layout de Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar - Avatar y Datos Básicos */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.nombre} />
                  <AvatarFallback className="text-3xl">
                    {getInitials(user.nombre, user.apellido)}
                  </AvatarFallback>
                </Avatar>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full h-10 w-10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar foto de perfil</DialogTitle>
                      <DialogDescription>
                        Esta funcionalidad estará disponible próximamente. Por ahora, la
                        foto se genera automáticamente con tus iniciales.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Nombre */}
              <div className="text-center">
                <h2 className="text-2xl font-bold">
                  {user.nombre} {user.apellido}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              {/* Rol */}
              <div className="flex flex-col items-center gap-2 w-full">
                {getRoleBadge(user.rol)}
              </div>

              <Separator />

              {/* Estadísticas */}
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estado de cuenta</span>
                  {user.is_active ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Activa
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Suspendida
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Miembro desde</span>
                  <span className="font-medium">{formatDate(user.fecha_creacion)}</span>
                </div>

                {user.is_chat_banned && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-md text-xs">
                    <MessageSquareOff className="h-4 w-4" />
                    <span>Chat restringido ({user.infracciones_chat} infracciones)</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Información del Perfil */}
        <div className="md:col-span-2 space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Datos básicos de tu cuenta
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      disabled={updateMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      size="sm"
                      disabled={updateMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre
                </Label>
                {isEditing ? (
                  <Input
                    id="nombre"
                    value={editData.nombre}
                    onChange={(e) =>
                      setEditData({ ...editData, nombre: e.target.value })
                    }
                    placeholder="Tu nombre"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">{user.nombre}</div>
                )}
              </div>

              {/* Apellido */}
              <div className="space-y-2">
                <Label htmlFor="apellido" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Apellido
                </Label>
                {isEditing ? (
                  <Input
                    id="apellido"
                    value={editData.apellido}
                    onChange={(e) =>
                      setEditData({ ...editData, apellido: e.target.value })
                    }
                    placeholder="Tu apellido"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">{user.apellido}</div>
                )}
              </div>

              {/* Email (no editable) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Correo Electrónico
                </Label>
                <div className="p-3 bg-muted rounded-md flex items-center justify-between">
                  <span>{user.email}</span>
                  <Badge variant="outline" className="text-xs">No editable</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  El correo electrónico no se puede cambiar por seguridad
                </p>
              </div>

              {/* Fecha de Creación (no editable) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de Registro
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  {formatDate(user.fecha_creacion)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>
                Configuración de seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">Contraseña</h4>
                  <p className="text-sm text-muted-foreground">
                    Última actualización: {formatDate(user.fecha_creacion)}
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Cambiar contraseña</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar contraseña</DialogTitle>
                      <DialogDescription>
                        Esta funcionalidad estará disponible próximamente.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">Autenticación de dos factores</h4>
                  <p className="text-sm text-muted-foreground">
                    Protege tu cuenta con una capa adicional de seguridad
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Configurar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Autenticación de dos factores</DialogTitle>
                      <DialogDescription>
                        Esta funcionalidad estará disponible próximamente.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Información del Rol */}
          {user.es_admin && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <Shield className="h-5 w-5" />
                  Privilegios de Administrador
                </CardTitle>
                <CardDescription className="text-red-700">
                  Tienes acceso completo al panel de administración
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-red-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Gestión de usuarios y permisos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Revisión y aprobación de KYC
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Acceso a métricas financieras
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Gestión de oficios y servicios
                  </li>
                </ul>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <Button
                    asChild
                    className="w-full bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    <a href="/dashboard/admin/users">
                      Ir a Gestión de Usuarios
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actividad Reciente */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Tu actividad en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cuenta creada</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(user.fecha_creacion)}
                    </p>
                  </div>
                </div>

                {user.es_admin && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-md border border-red-200">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">
                        Rol de Administrador asignado
                      </p>
                      <p className="text-xs text-red-700">
                        Tienes privilegios elevados
                      </p>
                    </div>
                  </div>
                )}

                {user.infracciones_chat > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900">
                        Infracciones de chat
                      </p>
                      <p className="text-xs text-yellow-700">
                        {user.infracciones_chat} infracción(es) registrada(s)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas del Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>
                Resumen de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-900">
                    {user.es_admin ? 'ADMIN' : user.es_profesional ? 'PRO' : 'Cliente'}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">Tipo de cuenta</div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-900">
                    {user.is_active ? 'Activa' : 'Inactiva'}
                  </div>
                  <div className="text-xs text-green-700 mt-1">Estado</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-900">
                    {user.infracciones_chat}
                  </div>
                  <div className="text-xs text-purple-700 mt-1">Infracciones</div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-900">
                    {new Date().getFullYear() - new Date(user.fecha_creacion).getFullYear() || '< 1'}
                  </div>
                  <div className="text-xs text-orange-700 mt-1">Años en la plataforma</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accesos Rápidos */}
          <Card>
            <CardHeader>
              <CardTitle>Accesos Rápidos</CardTitle>
              <CardDescription>
                Enlaces útiles de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {user.es_admin && (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <a href="/dashboard/admin/users">
                      <User className="mr-2 h-4 w-4" />
                      Gestión de Usuarios
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <a href="/dashboard/admin/kyc">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Revisión KYC
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <a href="/dashboard/admin/metrics">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Métricas
                    </a>
                  </Button>
                </>
              )}

              {user.es_profesional && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <a href="/dashboard/profesional">
                    <User className="mr-2 h-4 w-4" />
                    Panel Profesional
                  </a>
                </Button>
              )}

              {user.es_cliente && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <a href="/dashboard/cliente">
                    <User className="mr-2 h-4 w-4" />
                    Panel de Cliente
                  </a>
                </Button>
              )}

              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <a href="/ayuda">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Centro de Ayuda
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
