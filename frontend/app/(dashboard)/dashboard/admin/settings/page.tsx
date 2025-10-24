'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  DollarSign,
  Shield,
  Bell,
  Mail,
  Zap,
  Globe,
  Lock,
  Save,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  // Estado de configuración general
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'ConectarProfesionales',
    siteDescription: 'Plataforma de conexión entre clientes y profesionales',
    supportEmail: 'soporte@conectarprofesionales.com',
    maintenanceMode: false,
  });

  // Estado de configuración de pagos
  const [paymentSettings, setPaymentSettings] = useState({
    commissionRate: 15,
    minTransactionAmount: 1000,
    maxTransactionAmount: 1000000,
    autoReleaseEscrow: false,
    autoReleaseDays: 7,
  });

  // Estado de configuración de notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    newUserAlerts: true,
    paymentAlerts: true,
  });

  // Estado de configuración de seguridad
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    requirePhoneVerification: false,
    enableTwoFactor: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
  });

  const handleSave = async (section: string) => {
    setSaving(true);
    
    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.success(`Configuración de ${section} guardada exitosamente`);
    setSaving(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configuración del Sistema</h1>
        <p className="text-muted-foreground">
          Administra las configuraciones globales de la plataforma
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Pagos</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Información del Sitio
              </CardTitle>
              <CardDescription>
                Configura la información básica de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nombre del Sitio</Label>
                <Input
                  id="siteName"
                  value={generalSettings.siteName}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Descripción</Label>
                <Textarea
                  id="siteDescription"
                  rows={3}
                  value={generalSettings.siteDescription}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Email de Soporte</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={generalSettings.supportEmail}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance">Modo Mantenimiento</Label>
                  <p className="text-sm text-muted-foreground">
                    Desactiva temporalmente el acceso al sitio
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setGeneralSettings({ ...generalSettings, maintenanceMode: checked })
                  }
                />
              </div>

              <Button
                onClick={() => handleSave('General')}
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                Configuración de Pagos y Comisiones
              </CardTitle>
              <CardDescription>
                Administra las tasas de comisión y límites de transacciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commission">Tasa de Comisión (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={paymentSettings.commissionRate}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      commissionRate: parseFloat(e.target.value),
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Comisión actual: {paymentSettings.commissionRate}% por transacción
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Monto Mínimo</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    min="0"
                    step="100"
                    value={paymentSettings.minTransactionAmount}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        minTransactionAmount: parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(paymentSettings.minTransactionAmount)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Monto Máximo</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    min="0"
                    step="1000"
                    value={paymentSettings.maxTransactionAmount}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        maxTransactionAmount: parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(paymentSettings.maxTransactionAmount)}
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoRelease">Liberación Automática de Escrow</Label>
                    <p className="text-sm text-muted-foreground">
                      Libera fondos automáticamente después de un período
                    </p>
                  </div>
                  <Switch
                    id="autoRelease"
                    checked={paymentSettings.autoReleaseEscrow}
                    onCheckedChange={(checked) =>
                      setPaymentSettings({ ...paymentSettings, autoReleaseEscrow: checked })
                    }
                  />
                </div>

                {paymentSettings.autoReleaseEscrow && (
                  <div className="space-y-2">
                    <Label htmlFor="releaseDays">Días para Liberación</Label>
                    <Select
                      value={paymentSettings.autoReleaseDays.toString()}
                      onValueChange={(value) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          autoReleaseDays: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 días</SelectItem>
                        <SelectItem value="5">5 días</SelectItem>
                        <SelectItem value="7">7 días</SelectItem>
                        <SelectItem value="14">14 días</SelectItem>
                        <SelectItem value="30">30 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleSave('Pagos')}
                disabled={saving}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>
                Administra los canales y tipos de notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="space-y-0.5">
                      <Label>Notificaciones por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar notificaciones vía correo electrónico
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <div className="space-y-0.5">
                      <Label>Notificaciones Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar notificaciones push del navegador
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        pushNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <div className="space-y-0.5">
                      <Label>Notificaciones SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar notificaciones por mensaje de texto
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        smsNotifications: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-4 border-t dark:border-gray-700">
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Alertas Administrativas
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Reportes Semanales</Label>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          weeklyReports: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Alertas de Nuevos Usuarios</Label>
                    <Switch
                      checked={notificationSettings.newUserAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          newUserAlerts: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label>Alertas de Pagos</Label>
                    <Switch
                      checked={notificationSettings.paymentAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          paymentAlerts: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleSave('Notificaciones')}
                disabled={saving}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
                Configuración de Seguridad
              </CardTitle>
              <CardDescription>
                Administra las políticas de seguridad y autenticación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Verificación de Email Obligatoria</Label>
                    <p className="text-sm text-muted-foreground">
                      Los usuarios deben verificar su email al registrarse
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        requireEmailVerification: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Verificación de Teléfono Obligatoria</Label>
                    <p className="text-sm text-muted-foreground">
                      Los usuarios deben verificar su número de teléfono
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.requirePhoneVerification}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        requirePhoneVerification: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar 2FA para mayor seguridad
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.enableTwoFactor}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, enableTwoFactor: checked })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Timeout de Sesión (min)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="1440"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Intentos Máximos de Login</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        maxLoginAttempts: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordLength">Long. Mínima Contraseña</Label>
                  <Input
                    id="passwordLength"
                    type="number"
                    min="6"
                    max="20"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        passwordMinLength: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('Seguridad')}
                disabled={saving}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
