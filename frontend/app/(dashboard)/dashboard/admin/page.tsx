'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/services/adminService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import {
  Users,
  DollarSign,
  Briefcase,
  TrendingUp,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
  UserCheck,
  ArrowUpRight,
  Activity,
  Zap,
  Wrench,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Datos de ejemplo para gráficos (en producción vendrían del backend)
const revenueData = [
  { mes: 'Ene', ingresos: 12000, trabajos: 45 },
  { mes: 'Feb', ingresos: 15000, trabajos: 52 },
  { mes: 'Mar', ingresos: 18000, trabajos: 61 },
  { mes: 'Abr', ingresos: 22000, trabajos: 73 },
  { mes: 'May', ingresos: 25000, trabajos: 82 },
  { mes: 'Jun', ingresos: 28000, trabajos: 91 },
];

const userGrowthData = [
  { mes: 'Ene', clientes: 120, profesionales: 45 },
  { mes: 'Feb', clientes: 145, profesionales: 52 },
  { mes: 'Mar', clientes: 178, profesionales: 61 },
  { mes: 'Abr', clientes: 203, profesionales: 73 },
  { mes: 'May', clientes: 231, profesionales: 82 },
  { mes: 'Jun', clientes: 267, profesionales: 91 },
];

// Helper para formatear moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper para formatear números
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-AR').format(value);
};

export default function AdminDashboardPage() {
  // Queries para métricas
  const {
    data: financialMetrics,
    isLoading: isLoadingFinancial,
    error: financialError,
  } = useQuery({
    queryKey: ['financialMetrics'],
    queryFn: adminService.getFinancialMetrics,
    staleTime: 60000,
  });

  const {
    data: userMetrics,
    isLoading: isLoadingUsers,
    error: userError,
  } = useQuery({
    queryKey: ['userMetrics'],
    queryFn: adminService.getUserMetrics,
    staleTime: 60000,
  });

  const isLoading = isLoadingFinancial || isLoadingUsers;
  const hasError = financialError || userError;

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard de Administración
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Error cargando las métricas del sistema
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar las métricas. Por favor, intenta recargar la
            página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard de Administración
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Visión general del sistema
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalUsuarios =
    userMetrics!.total_profesionales + userMetrics!.total_clientes;
  const montoPromedio =
    financialMetrics!.trabajos_completados > 0
      ? financialMetrics!.total_facturado /
        financialMetrics!.trabajos_completados
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Dashboard de Administración
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Gestión completa de la plataforma ConectarPro
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
            <Activity className="h-4 w-4 mr-1.5" />
            Sistema Activo
          </div>
        </div>
      </div>

      {/* Métricas Principales - Financial */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          💰 Métricas Financieras
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-green-500 dark:border-l-green-400 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Comisiones Ganadas
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(financialMetrics!.comision_total)}
              </div>
              <div className="flex items-center mt-2 text-xs text-slate-500 dark:text-slate-400">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-400 font-semibold mr-1">
                  +12%
                </span>
                vs mes anterior
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Volumen Total
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(financialMetrics!.total_facturado)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Facturación total de trabajos
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 dark:border-l-purple-400 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Trabajos Completados
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {formatNumber(financialMetrics!.trabajos_completados)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Trabajos liberados exitosamente
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 dark:border-l-orange-400 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Ticket Promedio
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(montoPromedio)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Promedio por trabajo completado
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas de Usuarios */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          👥 Métricas de Usuarios
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-slate-500 dark:border-l-slate-400 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Usuarios
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatNumber(totalUsuarios)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Usuarios registrados en la plataforma
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 dark:border-l-orange-400 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Profesionales
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {formatNumber(userMetrics!.total_profesionales)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {userMetrics!.total_pro_aprobados} aprobados
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Clientes
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(userMetrics!.total_clientes)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Clientes activos
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 dark:border-l-yellow-400 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                KYC Pendientes
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatNumber(userMetrics!.total_pro_pendientes_kyc)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Esperando revisión
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Ingresos */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              📈 Tendencia de Ingresos
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Ingresos mensuales de los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                  <XAxis 
                    dataKey="mes" 
                    className="text-xs" 
                    stroke="#94a3b8"
                  />
                  <YAxis 
                    className="text-xs" 
                    stroke="#94a3b8"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorIngresos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Crecimiento de Usuarios */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              👥 Crecimiento de Usuarios
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Clientes vs Profesionales por mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                  <XAxis 
                    dataKey="mes" 
                    className="text-xs" 
                    stroke="#94a3b8"
                  />
                  <YAxis 
                    className="text-xs" 
                    stroke="#94a3b8"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="clientes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="profesionales" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          🚀 Accesos Rápidos
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/admin/users"
            className="group"
          >
            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Gestión de Usuarios
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Ver y moderar usuarios
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/dashboard/admin/kyc"
            className="group"
          >
            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-yellow-500 dark:hover:border-yellow-400">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Verificación KYC
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Aprobar profesionales
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/dashboard/admin/trabajos"
            className="group"
          >
            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Trabajos
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Gestionar trabajos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/dashboard/admin/oficios"
            className="group"
          >
            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-orange-500 dark:hover:border-orange-400">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wrench className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Oficios
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Gestionar categorías
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/dashboard/admin/servicios"
            className="group"
          >
            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-green-500 dark:hover:border-green-400">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Servicios Instantáneos
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Servicios rápidos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/dashboard/admin/metrics"
            className="group"
          >
            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-red-500 dark:hover:border-red-400">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Métricas Detalladas
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Análisis completo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Estado del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-slate-900 dark:text-white">
            <Activity className="h-5 w-5 mr-2 text-green-500" />
            Estado del Sistema
          </CardTitle>
          <CardDescription className="dark:text-slate-400">
            Monitoreo de servicios y componentes críticos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    API Backend
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Operativo
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Base de Datos
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Conectada
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Frontend
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    En línea
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
