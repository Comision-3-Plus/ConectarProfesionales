"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  MapPin,
  DollarSign,
  CreditCard,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Briefcase
} from "lucide-react"
import { professionalService } from "@/lib/services/professionalService"
import { publicService } from "@/lib/services/publicService"
import { toast } from "sonner"

export default function PerfilProfesionalPage() {
  const queryClient = useQueryClient()
  const [selectedOficios, setSelectedOficios] = useState<string[]>([])
  const [tarifa, setTarifa] = useState("")
  const [radio, setRadio] = useState("")
  const [latitud, setLatitud] = useState("")
  const [longitud, setLongitud] = useState("")
  const [cvu, setCvu] = useState("")
  const [cbu, setCbu] = useState("")
  const [alias, setAlias] = useState("")

  // Queries
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['professional-profile'],
    queryFn: professionalService.getMe,
    staleTime: 30000,
  })

  const { data: oficios, isLoading: loadingOficios } = useQuery({
    queryKey: ['oficios'],
    queryFn: publicService.getOficios,
    staleTime: 300000, // 5 min
  })

  // Mutations
  const updateTarifaMutation = useMutation({
    mutationFn: (newTarifa: number) => 
      professionalService.updateProfile({ tarifa_por_hora: newTarifa }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success('Tarifa actualizada')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al actualizar tarifa')
    },
  })

  const updateRadioMutation = useMutation({
    mutationFn: (newRadio: number) => 
      professionalService.updateProfile({ radio_cobertura_km: newRadio }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success('Radio de cobertura actualizado')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error')
    },
  })

  const updateLocationMutation = useMutation({
    mutationFn: (data: { latitud: number; longitud: number }) => 
      professionalService.updateLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success('Ubicación actualizada')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error')
    },
  })

  const updateOficiosMutation = useMutation({
    mutationFn: (oficios_ids: string[]) => 
      professionalService.updateOficios({ oficios_ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success('Oficios actualizados')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error')
    },
  })

  const updatePayoutMutation = useMutation({
    mutationFn: (data: { cvu?: string; cbu?: string; alias?: string }) => 
      professionalService.updatePayoutInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile'] })
      toast.success('Datos de pago actualizados')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error')
    },
  })

  const toggleOficio = (oficioId: string) => {
    setSelectedOficios(prev =>
      prev.includes(oficioId)
        ? prev.filter(id => id !== oficioId)
        : [...prev, oficioId]
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
      <div>
        <h1 className="text-3xl font-bold">Configurar Perfil</h1>
        <p className="text-muted-foreground">Personaliza tu perfil profesional</p>
      </div>

      {/* Estado KYC */}
      {profile?.kyc_status && (
        <Card className={`border-l-4 ${
          profile.kyc_status === 'APROBADO' ? 'border-green-500' : 
          profile.kyc_status === 'EN_REVISION' ? 'border-yellow-500' : 
          profile.kyc_status === 'RECHAZADO' ? 'border-red-500' : 
          'border-gray-500'
        }`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              {profile.kyc_status === 'APROBADO' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <CardTitle className="text-lg">Estado de Verificación</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {profile.kyc_status === 'APROBADO' && '✅ Cuenta verificada'}
              {profile.kyc_status === 'EN_REVISION' && '⏳ En revisión'}
              {profile.kyc_status === 'RECHAZADO' && '❌ Documentación rechazada'}
              {profile.kyc_status === 'PENDIENTE' && '📝 Completa tu KYC'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Oficios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Mis Oficios
          </CardTitle>
          <CardDescription>Selecciona los servicios que ofreces</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {oficios?.map((oficio) => (
              <div key={oficio.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`oficio-${oficio.id}`}
                  checked={selectedOficios.includes(oficio.id)}
                  onCheckedChange={() => toggleOficio(oficio.id)}
                />
                <label
                  htmlFor={`oficio-${oficio.id}`}
                  className="text-sm font-medium"
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
              <><Save className="h-4 w-4 mr-2" />Guardar Oficios</>
            )}
          </Button>
        </CardContent>
      </Card>

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
            <Input
              id="tarifa"
              type="number"
              placeholder={profile?.tarifa_por_hora?.toString() || "2500"}
              value={tarifa}
              onChange={(e) => setTarifa(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              const val = Number(tarifa)
              if (val > 0) updateTarifaMutation.mutate(val)
            }} 
            disabled={updateTarifaMutation.isPending || !tarifa}
            className="w-full"
          >
            {updateTarifaMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Actualizar Tarifa</>
            )}
          </Button>
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
            <Input
              id="radio"
              type="number"
              placeholder={profile?.radio_cobertura_km?.toString() || "10"}
              value={radio}
              onChange={(e) => setRadio(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              const val = Number(radio)
              if (val > 0) updateRadioMutation.mutate(val)
            }} 
            disabled={updateRadioMutation.isPending || !radio}
            className="w-full"
          >
            {updateRadioMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Actualizar Radio</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Ubicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicación
          </CardTitle>
          <CardDescription>Tu ubicación geográfica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitud">Latitud</Label>
              <Input
                id="latitud"
                type="number"
                step="0.0001"
                placeholder={profile?.latitud?.toString() || "-34.6037"}
                value={latitud}
                onChange={(e) => setLatitud(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitud">Longitud</Label>
              <Input
                id="longitud"
                type="number"
                step="0.0001"
                placeholder={profile?.longitud?.toString() || "-58.3816"}
                value={longitud}
                onChange={(e) => setLongitud(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={() => {
              const lat = Number(latitud)
              const lng = Number(longitud)
              if (lat && lng) updateLocationMutation.mutate({ latitud: lat, longitud: lng })
            }} 
            disabled={updateLocationMutation.isPending || !latitud || !longitud}
            className="w-full"
          >
            {updateLocationMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Actualizar Ubicación</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Datos de Pago */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Datos de Pago
          </CardTitle>
          <CardDescription>Información para recibir pagos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cvu">CVU</Label>
            <Input
              id="cvu"
              placeholder="0000003100010917273641"
              value={cvu}
              onChange={(e) => setCvu(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cbu">CBU</Label>
            <Input
              id="cbu"
              placeholder="0110599520000001234567"
              value={cbu}
              onChange={(e) => setCbu(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alias">Alias</Label>
            <Input
              id="alias"
              placeholder="mi.alias.mp"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => updatePayoutMutation.mutate({ 
              cvu: cvu || undefined, 
              cbu: cbu || undefined, 
              alias: alias || undefined 
            })} 
            disabled={updatePayoutMutation.isPending || (!cvu && !cbu && !alias)}
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
    </div>
  )
}
