/**
 * Página de Configuración de Usuario
 * Permite gestionar cuenta, seguridad, notificaciones y privacidad
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/lib/services';
import { toast } from 'sonner';
import {
  User,
  Lock,
  Bell,
  Shield,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Settings,
  LogOut,
} from 'lucide-react';

export default function ConfiguracionPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados para información personal
  const [personalData, setPersonalData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
  });

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Estados para notificaciones
  const [notifications, setNotifications] = useState({
    emailNuevosTrabajo: true,
    emailOfertas: true,
    emailMensajes: true,
    pushNuevosMensajes: true,
    pushActualizaciones: false,
    smsImportante: false,
  });

  // Estados para privacidad
  const [privacy, setPrivacy] = useState({
    perfilPublico: true,
    mostrarTelefono: false,
    mostrarEmail: false,
    permitirMensajes: true,
  });

  const handleSavePersonalData = async () => {
    setIsLoading(true);
    try {
      await userService.updateMe(personalData);
      toast.success('Información actualizada correctamente');
    } catch {
      toast.error('Error al actualizar la información');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implementar endpoint de cambio de contraseña
      // await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Contraseña actualizada correctamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.'
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      // TODO: Implementar endpoint de eliminación de cuenta
      toast.success('Cuenta eliminada correctamente');
      logout();
      router.push('/');
    } catch {
      toast.error('Error al eliminar la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string, lastname: string) => {
    return `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Configuración
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gestiona tu cuenta y preferencias
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="perfil" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="privacidad" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacidad</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB: Perfil */}
        <TabsContent value="perfil" className="space-y-6">
          {/* Avatar y Rol */}
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>
                Actualiza tu imagen de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-2xl font-bold">
                    {user && getInitials(user.nombre, user.apellido)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {user?.rol?.toLowerCase()}
                    </Badge>
                    {user?.kyc_verificado && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Cambiar Foto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información básica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={personalData.nombre}
                    onChange={(e) =>
                      setPersonalData({ ...personalData, nombre: e.target.value })
                    }
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={personalData.apellido}
                    onChange={(e) =>
                      setPersonalData({ ...personalData, apellido: e.target.value })
                    }
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={personalData.email}
                  onChange={(e) =>
                    setPersonalData({ ...personalData, email: e.target.value })
                  }
                  placeholder="tu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={personalData.telefono}
                  onChange={(e) =>
                    setPersonalData({ ...personalData, telefono: e.target.value })
                  }
                  placeholder="+54 9 11 1234-5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  value={personalData.direccion}
                  onChange={(e) =>
                    setPersonalData({ ...personalData, direccion: e.target.value })
                  }
                  placeholder="Tu dirección"
                />
              </div>

              <Button
                onClick={handleSavePersonalData}
                disabled={isLoading}
                className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Seguridad */}
        <TabsContent value="seguridad" className="space-y-6">
          {/* Cambiar Contraseña */}
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener tu cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
                <p className="text-xs text-slate-500">
                  Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Lock className="h-4 w-4 mr-2" />
                {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
            </CardContent>
          </Card>

          {/* Zona de Peligro */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Zona de Peligro
              </CardTitle>
              <CardDescription>
                Acciones irreversibles que afectan tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-900">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  Eliminar Cuenta
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Una vez eliminada tu cuenta, no podrás recuperar tus datos. Esta acción es
                  permanente.
                </p>
                <Button
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar Mi Cuenta
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Notificaciones */}
        <TabsContent value="notificaciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>
                Configura cómo y cuándo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Notificaciones por Email
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNuevosTrabajo">Nuevos Trabajos</Label>
                      <p className="text-sm text-slate-500">
                        Recibe avisos cuando hay nuevas oportunidades
                      </p>
                    </div>
                    <Switch
                      id="emailNuevosTrabajo"
                      checked={notifications.emailNuevosTrabajo}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailNuevosTrabajo: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailOfertas">Ofertas Recibidas</Label>
                      <p className="text-sm text-slate-500">
                        Notificación cuando recibes ofertas de profesionales
                      </p>
                    </div>
                    <Switch
                      id="emailOfertas"
                      checked={notifications.emailOfertas}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailOfertas: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailMensajes">Nuevos Mensajes</Label>
                      <p className="text-sm text-slate-500">
                        Aviso cuando recibes mensajes en el chat
                      </p>
                    </div>
                    <Switch
                      id="emailMensajes"
                      checked={notifications.emailMensajes}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailMensajes: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Push */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificaciones Push
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pushNuevosMensajes">Mensajes Instantáneos</Label>
                      <p className="text-sm text-slate-500">
                        Notificaciones en tiempo real de mensajes
                      </p>
                    </div>
                    <Switch
                      id="pushNuevosMensajes"
                      checked={notifications.pushNuevosMensajes}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, pushNuevosMensajes: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pushActualizaciones">Actualizaciones del Sistema</Label>
                      <p className="text-sm text-slate-500">
                        Información sobre nuevas funciones y mejoras
                      </p>
                    </div>
                    <Switch
                      id="pushActualizaciones"
                      checked={notifications.pushActualizaciones}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, pushActualizaciones: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <Save className="h-4 w-4 mr-2" />
                Guardar Preferencias
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Privacidad */}
        <TabsContent value="privacidad" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Privacidad</CardTitle>
              <CardDescription>
                Controla qué información compartes y quién puede verla
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="perfilPublico">Perfil Público</Label>
                    <p className="text-sm text-slate-500">
                      Permite que otros usuarios vean tu perfil
                    </p>
                  </div>
                  <Switch
                    id="perfilPublico"
                    checked={privacy.perfilPublico}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, perfilPublico: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mostrarTelefono">Mostrar Teléfono</Label>
                    <p className="text-sm text-slate-500">
                      Tu número será visible en tu perfil público
                    </p>
                  </div>
                  <Switch
                    id="mostrarTelefono"
                    checked={privacy.mostrarTelefono}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, mostrarTelefono: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mostrarEmail">Mostrar Email</Label>
                    <p className="text-sm text-slate-500">
                      Tu email será visible en tu perfil público
                    </p>
                  </div>
                  <Switch
                    id="mostrarEmail"
                    checked={privacy.mostrarEmail}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, mostrarEmail: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="permitirMensajes">Permitir Mensajes Directos</Label>
                    <p className="text-sm text-slate-500">
                      Otros usuarios podrán enviarte mensajes privados
                    </p>
                  </div>
                  <Switch
                    id="permitirMensajes"
                    checked={privacy.permitirMensajes}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, permitirMensajes: checked })
                    }
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-900">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Tus Datos Están Seguros
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Toda tu información está protegida y nunca será compartida con terceros sin tu
                  consentimiento explícito.
                </p>
              </div>

              <Button className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cerrar Sesión */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Cerrar Sesión</h4>
              <p className="text-sm text-slate-500">
                Sal de tu cuenta en este dispositivo
              </p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
