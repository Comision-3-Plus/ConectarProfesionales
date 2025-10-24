"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Loader2,
  Save,
  Camera,
  PlusCircle,
  Edit,
  Trash2,
  ImageUp
} from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "@/hooks/useTheme"
import { userService } from "@/lib/services/userService"
import { portfolioService } from "@/lib/services/portfolioService"
import { type PortfolioItem, type PortfolioItemCreate, type PortfolioItemUpdate } from "@/types/portfolio"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ConfiguracionPage() {
  const { user, refreshUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const queryClient = useQueryClient()

  // Estado para datos del perfil
  const [profileData, setProfileData] = useState({
    nombre: user?.nombre || "",
    apellido: user?.apellido || "",
    email: user?.email || "",
  })

  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  // Estado para notificaciones
  const [notifications, setNotifications] = useState({
    email_ofertas: true,
    email_mensajes: true,
    email_trabajos: true,
    push_enabled: false,
  })

  const { data: portfolioItems, refetch: refetchPortfolio } = useQuery({
    queryKey: ["portfolio", user?.id],
    queryFn: () => portfolioService.getMyPortfolio(),
    enabled: !!user?.es_profesional,
  });

  const [isPortfolioDialogOpen, setPortfolioDialogOpen] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);

  const createPortfolioMutation = useMutation({
    mutationFn: (data: PortfolioItemCreate) => portfolioService.createPortfolioItem(data),
    onSuccess: () => {
      toast.success("Proyecto del portfolio creado con éxito");
      refetchPortfolio();
      setPortfolioDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Error al crear el proyecto del portfolio");
    },
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PortfolioItemUpdate }) => portfolioService.updatePortfolioItem(id, data),
    onSuccess: () => {
      toast.success("Proyecto del portfolio actualizado con éxito");
      refetchPortfolio();
      setPortfolioDialogOpen(false);
      setSelectedPortfolioItem(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Error al actualizar el proyecto del portfolio");
    },
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: (id: string) => portfolioService.deletePortfolioItem(id),
    onSuccess: () => {
      toast.success("Proyecto del portfolio eliminado con éxito");
      refetchPortfolio();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Error al eliminar el proyecto del portfolio");
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ id, image }: { id: string; image: File }) => portfolioService.uploadPortfolioImage(id, image),
    onSuccess: () => {
      toast.success("Imagen subida con éxito");
      refetchPortfolio();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Error al subir la imagen");
    },
  });

  const handlePortfolioSubmit = (data: PortfolioItemCreate | PortfolioItemUpdate) => {
    if (selectedPortfolioItem) {
      updatePortfolioMutation.mutate({ id: selectedPortfolioItem.id, data });
    } else {
      createPortfolioMutation.mutate(data as PortfolioItemCreate);
    }
  };

  const openPortfolioDialog = (item: PortfolioItem | null = null) => {
    setSelectedPortfolioItem(item);
    setPortfolioDialogOpen(true);
  };

  // Mutation para actualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: (data: { nombre?: string; apellido?: string }) => 
      userService.updateMe(data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      refreshUser?.()
      toast.success("Perfil actualizado correctamente")
      setProfileData({
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        email: updatedUser.email,
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Error al actualizar el perfil")
    },
  })

  // Mutation para cambiar contraseña
  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      userService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success("Contraseña actualizada correctamente")
      setPasswordData({ current: "", new: "", confirm: "" })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Error al cambiar la contraseña")
    },
  })

  const handleNotificationUpdate = async () => {
    // TODO: Implementar actualización de notificaciones cuando el backend esté listo
    toast.success("Preferencias de notificaciones actualizadas")
  }

  const isLoading = updateProfileMutation.isPending || changePasswordMutation.isPending

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 ring-2 ring-orange-500/20">
                <AvatarImage src={user?.avatar_url} alt={user?.nombre} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-2xl font-semibold">
                  {user?.nombre?.[0]}{user?.apellido?.[0]}
                </AvatarFallback>
              </Avatar>
              <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {user?.nombre} {user?.apellido}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex gap-2 mt-2">
                {user?.es_admin && (
                  <Badge variant="destructive">
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                )}
                {user?.es_profesional && (
                  <Badge variant="outline" className="border-orange-500 text-orange-600">
                    Profesional
                  </Badge>
                )}
                {user?.es_cliente && (
                  <Badge variant="outline" className="border-blue-500 text-blue-600">
                    Cliente
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Configuración */}
      <Tabs defaultValue="account" className="w-full">
      <TabsList className={`grid w-full ${user?.es_profesional ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Cuenta
          </TabsTrigger>
          {user?.es_profesional && (
            <TabsTrigger value="portfolio">
              <PlusCircle className="h-4 w-4 mr-2" />
              Portfolio
            </TabsTrigger>
          )}
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Apariencia
          </TabsTrigger>
        </TabsList>

        {/* Tab: Cuenta */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Cuenta</CardTitle>
              <CardDescription>
                Actualiza tu información personal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={profileData.nombre}
                    onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={profileData.apellido}
                    onChange={(e) => setProfileData({ ...profileData, apellido: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El email no se puede cambiar. Contacta a soporte si necesitas modificarlo.
                </p>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleProfileUpdate} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Seguridad */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>
                Cambia tu contraseña y gestiona la seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña Actual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handlePasswordChange} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Cambiar Contraseña
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Notificaciones */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura cómo y cuándo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-ofertas">Ofertas por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones cuando recibas una nueva oferta
                  </p>
                </div>
                <Switch
                  id="email-ofertas"
                  checked={notifications.email_ofertas}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_ofertas: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-mensajes">Mensajes por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones de nuevos mensajes
                  </p>
                </div>
                <Switch
                  id="email-mensajes"
                  checked={notifications.email_mensajes}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_mensajes: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-trabajos">Actualizaciones de Trabajos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones sobre el estado de tus trabajos
                  </p>
                </div>
                <Switch
                  id="email-trabajos"
                  checked={notifications.email_trabajos}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_trabajos: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="push">Notificaciones Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones en el navegador
                  </p>
                </div>
                <Switch
                  id="push"
                  checked={notifications.push_enabled}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, push_enabled: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleNotificationUpdate} disabled={isLoading}>
                  {isLoading ? (
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Apariencia */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>
                Personaliza cómo se ve la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Tema</Label>
                  <p className="text-sm text-muted-foreground">
                    Elige entre tema claro u oscuro
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => theme !== "light" && toggleTheme()}
                  >
                    Claro
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => theme !== "dark" && toggleTheme()}
                  >
                    Oscuro
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  💡 Más opciones de personalización estarán disponibles próximamente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.es_profesional && (
          <TabsContent value="portfolio">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Mi Portfolio</CardTitle>
                  <CardDescription>
                    Muestra tus mejores trabajos a los clientes.
                  </CardDescription>
                </div>
                <Button onClick={() => openPortfolioDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Proyecto
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioItems?.map((item) => (
                    <div key={item.id} className="border p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{item.titulo}</h3>
                          <p className="text-sm text-muted-foreground">{item.descripcion}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => openPortfolioDialog(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => deletePortfolioMutation.mutate(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label>Imágenes</Label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          {item.imagenes.map(img => (
                            <div key={img.id} className="relative">
                              <img src={img.imagen_url} alt={item.titulo} className="rounded-md object-cover w-full h-32" />
                            </div>
                          ))}
                          <div className="relative flex items-center justify-center border-2 border-dashed rounded-md h-32">
                            <label htmlFor={`upload-${item.id}`} className="cursor-pointer">
                              <ImageUp className="h-8 w-8 text-muted-foreground" />
                              <input id={`upload-${item.id}`} type="file" className="hidden" onChange={(e) => e.target.files && uploadImageMutation.mutate({ id: item.id, image: e.target.files[0] })} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {portfolioItems?.length === 0 && (
                    <p className="text-muted-foreground text-center">Aún no has añadido ningún proyecto a tu portfolio.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isPortfolioDialogOpen} onOpenChange={setPortfolioDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPortfolioItem ? "Editar" : "Añadir"} Proyecto al Portfolio</DialogTitle>
            <DialogDescription>
              {selectedPortfolioItem ? "Edita los detalles de tu proyecto." : "Añade un nuevo proyecto para que los clientes vean tu trabajo."}
            </DialogDescription>
          </DialogHeader>
          <PortfolioForm
            item={selectedPortfolioItem}
            onSubmit={handlePortfolioSubmit}
            isLoading={createPortfolioMutation.isPending || updatePortfolioMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PortfolioFormProps {
  item: PortfolioItem | null;
  onSubmit: (data: PortfolioItemCreate | PortfolioItemUpdate) => void;
  isLoading: boolean;
}

function PortfolioForm({ item, onSubmit, isLoading }: PortfolioFormProps) {
  const [data, setData] = useState({
    titulo: item?.titulo || "",
    descripcion: item?.descripcion || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="titulo">Título del Proyecto</Label>
        <Input
          id="titulo"
          value={data.titulo}
          onChange={(e) => setData({ ...data, titulo: e.target.value })}
          placeholder="Ej: Diseño de logo para startup"
          required
        />
      </div>
      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Input
          id="descripcion"
          value={data.descripcion}
          onChange={(e) => setData({ ...data, descripcion: e.target.value })}
          placeholder="Describe el trabajo que realizaste"
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {item ? "Guardar Cambios" : "Crear Proyecto"}
        </Button>
      </DialogFooter>
    </form>
  );
}
