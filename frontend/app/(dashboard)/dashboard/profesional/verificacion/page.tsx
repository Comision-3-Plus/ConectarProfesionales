"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type KYCEstado = "PENDIENTE" | "EN_REVISION" | "APROBADO" | "RECHAZADO"

interface KYCData {
  estado: KYCEstado
  documentos: {
    dniFrente?: string
    dniDorso?: string
    comprobanteDomicilio?: string
  }
  comentariosRechazo?: string
  fechaAprobacion?: string
}

const mockKYC: KYCData = {
  estado: "PENDIENTE",
  documentos: {}
}

const estadoInfo = {
  PENDIENTE: {
    icon: Clock,
    color: "bg-gray-500",
    title: "Verificación Pendiente",
    description: "Debes subir tus documentos para completar la verificación"
  },
  EN_REVISION: {
    icon: AlertCircle,
    color: "bg-blue-500",
    title: "Documentos en Revisión",
    description: "Nuestro equipo está revisando tus documentos. Te notificaremos pronto."
  },
  APROBADO: {
    icon: CheckCircle2,
    color: "bg-green-500",
    title: "Verificación Aprobada",
    description: "¡Tu cuenta está verificada! Ya puedes recibir pagos."
  },
  RECHAZADO: {
    icon: XCircle,
    color: "bg-red-500",
    title: "Verificación Rechazada",
    description: "Hubo un problema con tus documentos. Por favor, revisa los comentarios y vuelve a intentarlo."
  }
}

export default function VerificacionKYCPage() {
  const { toast } = useToast()
  const [kyc, setKyc] = useState<KYCData>(mockKYC)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Cargar estado KYC
    // fetchAPI('/api/v1/professional/me').then(data => {
    //   setKyc({
    //     estado: data.kyc_estado,
    //     documentos: {
    //       dniFrente: data.dni_frente_url,
    //       dniDorso: data.dni_dorso_url,
    //       comprobanteDomicilio: data.comprobante_domicilio_url
    //     },
    //     comentariosRechazo: data.kyc_comentarios,
    //     fechaAprobacion: data.kyc_fecha_aprobacion
    //   })
    // }).finally(() => setLoading(false))
  }, [])

  const handleUpload = async (tipo: string, file: File) => {
    setUploading(tipo)
    try {
      // TODO: Subir documento
      // const formData = new FormData()
      // formData.append('file', file)
      // formData.append('tipo', tipo)
      
      // const response = await fetchAPI('/api/v1/professional/kyc/upload', {
      //   method: 'POST',
      //   body: formData,
      //   headers: {} // No Content-Type para FormData
      // })

      // Mock: simular URL
      const mockUrl = `/kyc/${tipo}-${Date.now()}.jpg`
      
      setKyc({
        ...kyc,
        documentos: {
          ...kyc.documentos,
          [tipo]: mockUrl
        },
        estado: "EN_REVISION"
      })

      toast({
        title: "✅ Documento subido",
        description: "Tu documento se subió correctamente",
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo subir el documento",
        variant: "destructive"
      })
    } finally {
      setUploading(null)
    }
  }

  const handleFileChange = (tipo: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "❌ Archivo muy grande",
        description: "El archivo debe ser menor a 5MB",
        variant: "destructive"
      })
      return
    }

    // Validar formato
    if (!file.type.startsWith("image/")) {
      toast({
        title: "❌ Formato inválido",
        description: "Solo se aceptan imágenes (JPG, PNG)",
        variant: "destructive"
      })
      return
    }

    handleUpload(tipo, file)
  }

  const info = estadoInfo[kyc.estado]
  const Icon = info.icon

  const puedeSubirDocumentos = kyc.estado === "PENDIENTE" || kyc.estado === "RECHAZADO"

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verificación de Identidad (KYC)</h1>
        <p className="text-muted-foreground">
          Verifica tu identidad para recibir pagos de forma segura
        </p>
      </div>

      {/* Estado actual */}
      <Alert className={`border-2 ${info.color === "bg-green-500" ? "border-green-500 bg-green-50" : info.color === "bg-red-500" ? "border-red-500 bg-red-50" : info.color === "bg-blue-500" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}>
        <Icon className="h-5 w-5" />
        <AlertTitle className="flex items-center gap-2">
          {info.title}
          <Badge className={info.color}>{kyc.estado}</Badge>
        </AlertTitle>
        <AlertDescription>{info.description}</AlertDescription>
      </Alert>

      {/* Comentarios de rechazo */}
      {kyc.estado === "RECHAZADO" && kyc.comentariosRechazo && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-700">Motivo del Rechazo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{kyc.comentariosRechazo}</p>
          </CardContent>
        </Card>
      )}

      {/* Fecha de aprobación */}
      {kyc.estado === "APROBADO" && kyc.fechaAprobacion && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Verificado el {new Date(kyc.fechaAprobacion).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tu cuenta está completamente verificada. Puedes recibir pagos sin restricciones.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instrucciones */}
      {puedeSubirDocumentos && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Requisitos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">DNI Frente y Dorso</p>
                <p className="text-sm text-muted-foreground">
                  Fotos claras de ambos lados de tu documento de identidad
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Comprobante de Domicilio</p>
                <p className="text-sm text-muted-foreground">
                  Servicio (luz, gas, agua) o estado de cuenta bancario con tu dirección
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Formato</p>
                <p className="text-sm text-muted-foreground">
                  JPG o PNG, máximo 5MB por archivo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subir documentos */}
      <div className="space-y-4">
        {/* DNI Frente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              DNI - Frente
              {kyc.documentos.dniFrente && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </CardTitle>
            <CardDescription>
              Foto del frente de tu DNI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {kyc.documentos.dniFrente && (
              <div className="border rounded-lg p-2">
                <img
                  src={kyc.documentos.dniFrente}
                  alt="DNI Frente"
                  className="max-h-48 mx-auto"
                />
              </div>
            )}
            {puedeSubirDocumentos && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("dniFrente", e)}
                  className="hidden"
                  id="dni-frente"
                  disabled={uploading === "dniFrente"}
                />
                <label htmlFor="dni-frente">
                  <Button variant="outline" className="w-full" asChild disabled={uploading === "dniFrente"}>
                    <span>
                      {uploading === "dniFrente" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {kyc.documentos.dniFrente ? "Cambiar" : "Subir"} Documento
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* DNI Dorso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              DNI - Dorso
              {kyc.documentos.dniDorso && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </CardTitle>
            <CardDescription>
              Foto del dorso de tu DNI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {kyc.documentos.dniDorso && (
              <div className="border rounded-lg p-2">
                <img
                  src={kyc.documentos.dniDorso}
                  alt="DNI Dorso"
                  className="max-h-48 mx-auto"
                />
              </div>
            )}
            {puedeSubirDocumentos && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("dniDorso", e)}
                  className="hidden"
                  id="dni-dorso"
                  disabled={uploading === "dniDorso"}
                />
                <label htmlFor="dni-dorso">
                  <Button variant="outline" className="w-full" asChild disabled={uploading === "dniDorso"}>
                    <span>
                      {uploading === "dniDorso" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {kyc.documentos.dniDorso ? "Cambiar" : "Subir"} Documento
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comprobante Domicilio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Comprobante de Domicilio
              {kyc.documentos.comprobanteDomicilio && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </CardTitle>
            <CardDescription>
              Servicio (luz, gas, agua) o extracto bancario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {kyc.documentos.comprobanteDomicilio && (
              <div className="border rounded-lg p-2">
                <img
                  src={kyc.documentos.comprobanteDomicilio}
                  alt="Comprobante Domicilio"
                  className="max-h-48 mx-auto"
                />
              </div>
            )}
            {puedeSubirDocumentos && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("comprobanteDomicilio", e)}
                  className="hidden"
                  id="comprobante-domicilio"
                  disabled={uploading === "comprobanteDomicilio"}
                />
                <label htmlFor="comprobante-domicilio">
                  <Button variant="outline" className="w-full" asChild disabled={uploading === "comprobanteDomicilio"}>
                    <span>
                      {uploading === "comprobanteDomicilio" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {kyc.documentos.comprobanteDomicilio ? "Cambiar" : "Subir"} Documento
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Botón de envío */}
      {puedeSubirDocumentos && 
        kyc.documentos.dniFrente && 
        kyc.documentos.dniDorso && 
        kyc.documentos.comprobanteDomicilio && (
        <Card className="bg-green-50 border-green-500">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">Todos los documentos subidos</h3>
                <p className="text-sm text-muted-foreground">
                  Tu verificación está en proceso. Te notificaremos cuando sea revisada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
