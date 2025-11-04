"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import type { OficioRead } from "@/types"
import { 
  MapPin, 
  DollarSign, 
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Zap,
  Upload,
  FileText
} from "lucide-react"
import { professionalService } from "@/lib/services/professionalService"
import { publicService } from "@/lib/services/publicService"
import { toast } from "sonner"

export default function PerfilProfesionalPage() {
  const queryClient = useQueryClient()
  
  // Estados del formulario
  const [selectedOficios, setSelectedOficios] = useState<string[]>([])
  const [tarifa, setTarifa] = useState("")
  const [radio, setRadio] = useState("")
  const [latitud, setLatitud] = useState("")
  const [longitud, setLongitud] = useState("")
  const [payoutAccount, setPayoutAccount] = useState("")
  const [aceptaInmediato, setAceptaInmediato] = useState(false)
  
  // Queries
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['professional-profile'],
    queryFn: professionalService.getMe,
    staleTime: 30000,
  })

  const { data: oficios, isLoading: loadingOficios } = useQuery({
    queryKey: ['oficios'],
    queryFn: publicService.getOficios,
    staleTime: 300000,
  })

  // Inicializar estados con los valores del perfil
  useEffect(() => {
    if (profile) {
      setAceptaInmediato(profile.acepta_instant || false)
      // Si el profesional ya tiene oficios, pre-seleccionarlos
      // TODO: El backend debe devolver los oficios actuales del profesional
    }
  }, [profile])

  // Mutations
  const updateTarifaMutation = useMutation({
    mutationFn: (tarifa: number) => 
      professionalService.updateProfile({ tarifa_por_hora: tarifa }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success('Tarifa actualizada correctamente')
      setTarifa("")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al actualizar tarifa')
    },
  })

  const updateRadioMutation = useMutation({
    mutationFn: (radio: number) => 
      professionalService.updateProfile({ radio_cobertura_km: radio }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success('Radio de cobertura actualizado')
      setRadio("")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al actualizar radio')
    },
  })

  const updateLocationMutation = useMutation({
    mutationFn: (data: { latitude: number; longitude: number }) => 
      professionalService.updateLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success('Ubicación actualizada')
      setLatitud("")
      setLongitud("")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al actualizar ubicación')
    },
  })

  const updateOficiosMutation = useMutation({
    mutationFn: (oficio_ids: string[]) => 
      professionalService.updateOficios({ oficio_ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success('Oficios actualizados correctamente')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al actualizar oficios')
    },
  })

  const updatePayoutMutation = useMutation({
    mutationFn: (payout_account: string) => 
      professionalService.updatePayoutInfo({ payout_account }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success('Información de pago actualizada')
      setPayoutAccount("")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al actualizar datos de pago')
    },
  })

  const updateAceptaInmediatoMutation = useMutation({
    mutationFn: (acepta: boolean) => 
      professionalService.updateProfile({ acepta_instant: acepta }),
    onSuccess: (_data: unknown, variables: boolean) => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success(variables ? 'Ahora aceptas trabajos inmediatos' : 'Ya no aceptas trabajos inmediatos')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al actualizar configuración')
      // Revertir el switch
      setAceptaInmediato(prev => !prev)
    },
  })

  const toggleOficio = (oficioId: string) => {
    setSelectedOficios(prev =>
      prev.includes(oficioId)
        ? prev.filter(id => id !== oficioId)
        : [...prev, oficioId]
    )
  }

  const handleObtenerUbicacion = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización')
      return
    }

    toast.info('Obteniendo ubicación...')
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitud(position.coords.latitude.toFixed(6))
        setLongitud(position.coords.longitude.toFixed(6))
        toast.success('Ubicación obtenida correctamente')
      },
      (error) => {
        toast.error('No se pudo obtener la ubicación: ' + error.message)
      }
    )
  }

  if (loadingProfile || loadingOficios) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configurar Perfil Profesional</h1>
        <p className="text-muted-foreground">
          Personaliza tu perfil para atraer más clientes
        </p>
      </div>

      {/* Estado KYC */}
      {profile && (
        <Card className={`border-l-4 ${
          profile.estado_verificacion === 'APROBADO' ? 'border-green-500' : 
          profile.estado_verificacion === 'EN_REVISION' ? 'border-yellow-500' : 
          profile.estado_verificacion === 'RECHAZADO' ? 'border-red-500' : 
          'border-gray-500'
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {profile.estado_verificacion === 'APROBADO' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <CardTitle className="text-lg">Estado de Verificación</CardTitle>
              </div>
              <Badge variant={
                profile.estado_verificacion === 'APROBADO' ? 'default' :
                profile.estado_verificacion === 'EN_REVISION' ? 'secondary' :
                'destructive'
              }>
                {profile.estado_verificacion}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {profile.estado_verificacion === 'APROBADO' && '✅ Tu cuenta está verificada. Puedes recibir trabajos.'}
              {profile.estado_verificacion === 'EN_REVISION' && '⏳ Tu documentación está en revisión. Te notificaremos pronto.'}
              {profile.estado_verificacion === 'RECHAZADO' && '❌ Tu documentación fue rechazada. Por favor, vuelve a subir tus documentos.'}
              {profile.estado_verificacion === 'PENDIENTE' && '📝 Sube tu documentación KYC para verificar tu cuenta.'}
            </p>
            {profile.estado_verificacion !== 'APROBADO' && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.href = '/dashboard/profesional/verificacion'}
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir Documentos KYC
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info del Nivel */}
      {profile && (
        <Card className="bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Nivel {profile.nivel}</CardTitle>
                <CardDescription>
                  Comisión actual: {profile.tasa_comision_actual}%
                </CardDescription>
              </div>
              <Badge className="text-lg px-4 py-2">
                {profile.rating_promedio || 0} ⭐
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{profile.total_resenas || 0}</p>
                <p className="text-sm text-muted-foreground">Reseñas</p>
              </div>
              <div>
                <p className="text-2xl font-bold">${profile.tarifa_por_hora || 0}</p>
                <p className="text-sm text-muted-foreground">Tarifa/hora</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profile.radio_cobertura_km || 0} km</p>
                <p className="text-sm text-muted-foreground">Radio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trabajos Inmediatos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Trabajos Inmediatos
          </CardTitle>
          <CardDescription>
            Activa esta opción para aparecer en búsquedas de "disponible ahora"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="acepta-inmediato">Acepto trabajos inmediatos</Label>
              <p className="text-sm text-muted-foreground">
                Los clientes podrán contratarte sin agendamiento previo
              </p>
            </div>
            <Switch
              id="acepta-inmediato"
              checked={aceptaInmediato}
              onCheckedChange={(checked) => {
                setAceptaInmediato(checked)
                updateAceptaInmediatoMutation.mutate(checked)
              }}
              disabled={updateAceptaInmediatoMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Oficios */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Oficios</CardTitle>
          <CardDescription>
            Selecciona los servicios que ofreces (puedes elegir varios)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {oficios?.map((oficio: OficioRead) => (
              <div key={oficio.id} className="flex items-center space-x-2 p-2 rounded hover:bg-accent">
                <Checkbox
                  id={`oficio-${oficio.id}`}
                  checked={selectedOficios.includes(oficio.id)}
                  onCheckedChange={() => toggleOficio(oficio.id)}
                />
                <label
                  htmlFor={`oficio-${oficio.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                >
                  {oficio.nombre}
                </label>
              </div>
            ))}
          </div>
          <Button 
            onClick={() => updateOficiosMutation.mutate(selectedOficios)} 
            disabled={updateOficiosMutation.isPending || selectedOficios.length === 0}
            className="w-full"
          >
            {updateOficiosMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Guardar Oficios ({selectedOficios.length} seleccionados)</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Tarifa y Radio juntos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Tarifa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tarifa por Hora
            </CardTitle>
            <CardDescription>Define tu precio por hora de trabajo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tarifa">Tarifa (ARS/hora)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="tarifa"
                    type="number"
                    min="0"
                    step="100"
                    placeholder={profile?.tarifa_por_hora?.toString() || "2500"}
                    value={tarifa}
                    onChange={(e) => setTarifa(e.target.value)}
                    className="pl-7"
                  />
                </div>
                <Button 
                  onClick={() => {
                    const val = Number(tarifa)
                    if (val > 0) updateTarifaMutation.mutate(val)
                    else toast.error('Ingresa una tarifa válida')
                  }} 
                  disabled={updateTarifaMutation.isPending || !tarifa}
                >
                  {updateTarifaMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {profile?.tarifa_por_hora && (
                <p className="text-xs text-muted-foreground">
                  Tarifa actual: ${profile.tarifa_por_hora}/hora
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Radio de Cobertura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Radio de Cobertura
            </CardTitle>
            <CardDescription>Hasta dónde estás dispuesto a viajar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="radio">Radio en KM</Label>
              <div className="flex gap-2">
                <Input
                  id="radio"
                  type="number"
                  min="1"
                  max="100"
                  placeholder={profile?.radio_cobertura_km?.toString() || "10"}
                  value={radio}
                  onChange={(e) => setRadio(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => {
                    const val = Number(radio)
                    if (val > 0 && val <= 100) updateRadioMutation.mutate(val)
                    else toast.error('Ingresa un radio entre 1 y 100 km')
                  }} 
                  disabled={updateRadioMutation.isPending || !radio}
                >
                  {updateRadioMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {profile?.radio_cobertura_km && (
                <p className="text-xs text-muted-foreground">
                  Radio actual: {profile.radio_cobertura_km} km
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ubicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicación Geográfica
          </CardTitle>
          <CardDescription>
            Tu ubicación base (los clientes te encontrarán desde aquí)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitud">Latitud</Label>
              <Input
                id="latitud"
                type="number"
                step="0.000001"
                placeholder="-34.603722"
                value={latitud}
                onChange={(e) => setLatitud(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitud">Longitud</Label>
              <Input
                id="longitud"
                type="number"
                step="0.000001"
                placeholder="-58.381592"
                value={longitud}
                onChange={(e) => setLongitud(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleObtenerUbicacion}
              className="flex-1"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Usar mi ubicación actual
            </Button>
            <Button 
              onClick={() => {
                const lat = Number(latitud)
                const lng = Number(longitud)
                if (lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                  updateLocationMutation.mutate({ latitude: lat, longitude: lng })
                } else {
                  toast.error('Ingresa coordenadas válidas')
                }
              }} 
              disabled={updateLocationMutation.isPending || !latitud || !longitud}
              className="flex-1"
            >
              {updateLocationMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Guardar Ubicación</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Datos de Pago */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Datos de Pago
          </CardTitle>
          <CardDescription>
            CVU, CBU o Alias de Mercado Pago para recibir tus pagos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payout">CVU / CBU / Alias</Label>
            <Input
              id="payout"
              placeholder="mi.alias.mp o 0000003100010917273641"
              value={payoutAccount}
              onChange={(e) => setPayoutAccount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Asegúrate de que la cuenta esté a tu nombre y verificada en Mercado Pago
            </p>
          </div>
          <Button 
            onClick={() => {
              if (payoutAccount.trim().length < 5) {
                toast.error('Ingresa un CVU/CBU/Alias válido')
                return
              }
              updatePayoutMutation.mutate(payoutAccount)
            }} 
            disabled={updatePayoutMutation.isPending || !payoutAccount}
            className="w-full"
          >
            {updatePayoutMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Guardar Datos de Pago</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Información adicional */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">💡 Consejos para aumentar tus contrataciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm">Completa tu perfil al 100% (foto, oficios, portafolio)</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm">Verifica tu cuenta con documentos KYC</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm">Mantén precios competitivos en tu zona</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm">Acepta trabajos inmediatos para más visibilidad</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm">Completa trabajos y pide reseñas a tus clientes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
