/**
 * Página de Documentación del Panel de Administración
 * Guías y ayuda para usar cada sección del admin panel
 */
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  BookOpen,
  Users,
  Briefcase,
  Wrench,
  Shield,
  TrendingUp,
  DollarSign,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  FileText,
} from 'lucide-react';

export default function DocumentacionAdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Documentación del Panel de Admin
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Guía completa para administrar la plataforma
          </p>
        </div>
      </div>

      {/* Quick Tips Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>💡 Consejo Rápido</AlertTitle>
        <AlertDescription>
          Esta documentación cubre todas las funcionalidades del panel de administración. 
          Usa las pestañas para navegar entre secciones.
        </AlertDescription>
      </Alert>

      {/* Tabs de Documentación */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="finances">Finanzas</TabsTrigger>
        </TabsList>

        {/* TAB: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Panel de Control Principal
              </CardTitle>
              <CardDescription>
                Vista general de métricas y estado de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Métricas Principales
                </h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <div>
                      <strong>Usuarios Totales:</strong> Suma de clientes y profesionales activos en la plataforma
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <div>
                      <strong>Trabajos Activos:</strong> Proyectos en curso que requieren monitoreo
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <div>
                      <strong>Ingresos Mensuales:</strong> Comisiones generadas por la plataforma
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <div>
                      <strong>Tasa de Conversión:</strong> % de ofertas que se convierten en trabajos
                    </div>
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  Acciones Rápidas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <strong className="text-orange-600">KYC Pendientes</strong>
                    <p className="text-slate-600 dark:text-slate-400">
                      Verifica profesionales que esperan aprobación de documentos
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <strong className="text-blue-600">Reportes</strong>
                    <p className="text-slate-600 dark:text-slate-400">
                      Revisa incidentes y conflictos que requieren mediación
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Navegación del Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge className="bg-blue-500">Users</Badge>
                  <div className="flex-1">
                    <strong className="text-sm">Gestión de Usuarios</strong>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Administra cuentas de clientes y profesionales, suspende usuarios problemáticos
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Badge className="bg-green-500">Oficios</Badge>
                  <div className="flex-1">
                    <strong className="text-sm">Catálogo de Oficios</strong>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Crea y edita categorías de servicios disponibles en la plataforma
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Badge className="bg-purple-500">Servicios</Badge>
                  <div className="flex-1">
                    <strong className="text-sm">Servicios Instantáneos</strong>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Servicios rápidos con precio fijo que los clientes pueden contratar directamente
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Badge className="bg-orange-500">Trabajos</Badge>
                  <div className="flex-1">
                    <strong className="text-sm">Monitor de Trabajos</strong>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Supervisa proyectos activos, resuelve disputas, gestiona escrow
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Badge className="bg-red-500">KYC</Badge>
                  <div className="flex-1">
                    <strong className="text-sm">Verificaciones</strong>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Aprueba o rechaza documentación de profesionales
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Usuarios */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>
                Cómo administrar cuentas de clientes y profesionales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold">📋 Listado de Usuarios</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-6">
                  <li><strong>Filtrar:</strong> Usa el selector de roles para ver solo Clientes, Profesionales o Admins</li>
                  <li><strong>Buscar:</strong> Encuentra usuarios por email, nombre o ID</li>
                  <li><strong>Paginación:</strong> Navega entre páginas para ver todos los usuarios</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">🔍 Detalles de Usuario</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-6">
                  <li><strong>Badge de Rol:</strong> Identifica rápidamente si es Cliente, Profesional o Admin</li>
                  <li><strong>Estado KYC:</strong> Para profesionales, indica si están verificados</li>
                  <li><strong>Estado de Cuenta:</strong> Activo/Suspendido/Baneado</li>
                  <li><strong>Fecha de Registro:</strong> Cuándo se unió a la plataforma</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold text-orange-600">⚠️ Acciones Administrativas</h4>
                <div className="space-y-3">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Suspender Usuario</AlertTitle>
                    <AlertDescription>
                      Desactiva temporalmente la cuenta. El usuario no podrá iniciar sesión pero sus datos se conservan.
                      <br />
                      <strong>Usar cuando:</strong> Incumplimiento leve, comportamiento sospechoso, investigaciones en curso
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Banear Usuario</AlertTitle>
                    <AlertDescription>
                      Suspensión permanente. El usuario pierde acceso total a la plataforma.
                      <br />
                      <strong>Usar cuando:</strong> Fraude confirmado, violaciones graves de términos de servicio
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Reactivar Usuario</AlertTitle>
                    <AlertDescription>
                      Restaura el acceso de un usuario suspendido después de resolver el problema.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verificación KYC (Know Your Customer)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Los profesionales deben verificar su identidad antes de poder recibir pagos.
              </p>

              <div className="space-y-3">
                <h4 className="font-semibold">✅ Proceso de Aprobación</h4>
                <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-6 list-decimal">
                  <li>Revisar documentos subidos (DNI, certificados, etc.)</li>
                  <li>Verificar que los datos coincidan con el perfil</li>
                  <li>Aprobar si todo está correcto</li>
                  <li>Rechazar con motivo si hay inconsistencias</li>
                </ol>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tiempo recomendado:</strong> Procesar verificaciones dentro de 24-48 horas para mantener la confianza de los profesionales
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Contenido */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Gestión de Oficios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">📝 Crear Nuevo Oficio</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-6">
                  <li><strong>Nombre:</strong> Corto y descriptivo (ej: "Plomería", "Electricidad")</li>
                  <li><strong>Descripción:</strong> Detalla qué servicios incluye</li>
                  <li><strong>Categoría:</strong> Agrupa oficios similares</li>
                  <li><strong>Icono:</strong> Emoji o código de icono</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">✏️ Editar Oficios</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-6">
                  <li>Actualiza nombres y descripciones cuando sea necesario</li>
                  <li>Fusiona oficios duplicados</li>
                  <li>Desactiva oficios obsoletos (no eliminar, afecta historial)</li>
                </ul>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>⚠️ No Eliminar Oficios con Historial</AlertTitle>
                <AlertDescription>
                  Si un oficio tiene profesionales asociados o trabajos realizados, márcalo como inactivo en lugar de eliminarlo
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Servicios Instantáneos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Servicios con precio fijo que los clientes pueden contratar sin negociar.
              </p>

              <div className="space-y-3">
                <h4 className="font-semibold">✅ Aprobar Servicios</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-6">
                  <li>Verifica que la descripción sea clara y completa</li>
                  <li>Revisa que el precio sea razonable</li>
                  <li>Confirma que el tiempo estimado sea realista</li>
                  <li>Asegúrate que no haya contenido inapropiado</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">❌ Rechazar Servicios</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-6">
                  <li>Descripción vaga o engañosa</li>
                  <li>Precios inflados injustificadamente</li>
                  <li>Servicios duplicados</li>
                  <li>Contenido que viola políticas</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Monitor de Trabajos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">🔄 Estados de Trabajo</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">PENDING</Badge>
                    <span className="text-sm">Esperando pago del cliente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500">IN_ESCROW</Badge>
                    <span className="text-sm">Dinero en custodia, trabajo en progreso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">COMPLETED</Badge>
                    <span className="text-sm">Finalizado, fondos liberados al profesional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500">CANCELLED</Badge>
                    <span className="text-sm">Cancelado, reembolso procesado</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold text-orange-600">⚖️ Resolver Disputas</h4>
                <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-6 list-decimal">
                  <li>Revisa el chat entre cliente y profesional</li>
                  <li>Examina evidencias (fotos, documentos)</li>
                  <li>Contacta a ambas partes si es necesario</li>
                  <li>Toma una decisión justa:
                    <ul className="ml-4 mt-1 list-disc">
                      <li>Liberar fondos al profesional si completó el trabajo</li>
                      <li>Reembolsar al cliente si hay incumplimiento</li>
                      <li>División parcial en casos complejos</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Finanzas */}
        <TabsContent value="finances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Sistema de Comisiones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                La plataforma cobra una comisión sobre cada trabajo completado.
              </p>

              <div className="space-y-3">
                <h4 className="font-semibold">💰 Estructura de Comisiones</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <span><strong>Nivel Bronce</strong></span>
                    <Badge>15%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-200 dark:bg-slate-800 rounded-lg">
                    <span><strong>Nivel Plata</strong> (10+ trabajos)</span>
                    <Badge>12%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <span><strong>Nivel Oro</strong> (50+ trabajos)</span>
                    <Badge>10%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span><strong>Nivel Diamante</strong> (200+ trabajos)</span>
                    <Badge>8%</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">📊 Métricas Financieras</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-6">
                  <li><strong>Ingresos Totales:</strong> Suma de todas las comisiones cobradas</li>
                  <li><strong>Volumen en Escrow:</strong> Dinero actualmente en custodia</li>
                  <li><strong>Pagos Procesados:</strong> Total liberado a profesionales</li>
                  <li><strong>Reembolsos:</strong> Dinero devuelto a clientes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reportes y Análisis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">📈 Gráficos Disponibles</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-6">
                  <li><strong>Crecimiento de Usuarios:</strong> Nuevos registros por mes</li>
                  <li><strong>Trabajos Completados:</strong> Tendencia de actividad</li>
                  <li><strong>Ingresos Mensuales:</strong> Evolución de comisiones</li>
                  <li><strong>Oficios Populares:</strong> Cuáles tienen más demanda</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">🎯 KPIs Clave</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <strong className="text-sm">Tasa de Conversión</strong>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      % de ofertas que se convierten en trabajos pagados
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <strong className="text-sm">Valor Promedio</strong>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Monto promedio por trabajo completado
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                    <strong className="text-sm">Tasa de Disputa</strong>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      % de trabajos que requieren mediación
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                    <strong className="text-sm">Tiempo de Resolución</strong>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Promedio de días para completar trabajos
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="text-orange-600 dark:text-orange-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Buenas Prácticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Revisar KYC diariamente:</strong> Mantén el flujo de nuevos profesionales</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Monitorear disputas activas:</strong> Resuelve conflictos rápidamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Analizar métricas semanalmente:</strong> Identifica tendencias y problemas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Mantener oficios actualizados:</strong> Refleja la demanda del mercado</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Documentar decisiones importantes:</strong> Especialmente en disputas complejas</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
