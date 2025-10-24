'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { adminService } from '@/lib/services/adminService';
import { useState } from 'react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function MetricsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Queries para métricas reales
  const { data: financialMetrics } = useQuery({
    queryKey: ['financial-metrics'],
    queryFn: () => adminService.getFinancialMetrics(),
  });

  const { data: userMetrics } = useQuery({
    queryKey: ['user-metrics'],
    queryFn: () => adminService.getUserMetrics(),
  });

  // Datos de ejemplo para gráficos (reemplazar con datos reales del backend)
  const revenueByMonth = [
    { mes: 'Ene', comisiones: 45000, volumen: 300000, trabajos: 45 },
    { mes: 'Feb', comisiones: 52000, volumen: 346000, trabajos: 52 },
    { mes: 'Mar', comisiones: 48000, volumen: 320000, trabajos: 48 },
    { mes: 'Abr', comisiones: 61000, volumen: 406000, trabajos: 61 },
    { mes: 'May', comisiones: 55000, volumen: 366000, trabajos: 58 },
    { mes: 'Jun', comisiones: 67000, volumen: 446000, trabajos: 72 },
  ];

  const userGrowthData = [
    { mes: 'Ene', profesionales: 120, clientes: 450, total: 570 },
    { mes: 'Feb', profesionales: 145, clientes: 523, total: 668 },
    { mes: 'Mar', profesionales: 168, clientes: 612, total: 780 },
    { mes: 'Abr', profesionales: 192, clientes: 701, total: 893 },
    { mes: 'May', profesionales: 218, clientes: 798, total: 1016 },
    { mes: 'Jun', profesionales: 245, clientes: 902, total: 1147 },
  ];

  const trabajosByStatus = [
    { name: 'Completados', value: 245, color: COLORS[1] },
    { name: 'En Progreso', value: 89, color: COLORS[0] },
    { name: 'Pendiente Pago', value: 34, color: COLORS[2] },
    { name: 'Cancelados', value: 18, color: COLORS[3] },
  ];

  const oficiosPopulares = [
    { oficio: 'Plomería', trabajos: 89, revenue: 445000 },
    { oficio: 'Electricidad', trabajos: 76, revenue: 380000 },
    { oficio: 'Carpintería', trabajos: 65, revenue: 325000 },
    { oficio: 'Pintura', trabajos: 54, revenue: 270000 },
    { oficio: 'Jardinería', trabajos: 42, revenue: 210000 },
  ];

  const conversionRates = [
    { semana: 'Sem 1', visitas: 1200, registros: 156, conversion: 13 },
    { semana: 'Sem 2', visitas: 1350, registros: 189, conversion: 14 },
    { semana: 'Sem 3', visitas: 1180, registros: 165, conversion: 14 },
    { semana: 'Sem 4', visitas: 1420, registros: 227, conversion: 16 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(num);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Métricas y Analytics</h1>
          <p className="text-muted-foreground">
            Análisis detallado del rendimiento de la plataforma
          </p>
        </div>

        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as '7d' | '30d' | '90d' | '1y')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="90d">Últimos 90 días</SelectItem>
            <SelectItem value="1y">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-green-500 dark:border-green-400">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue Total
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(financialMetrics?.comision_total || 328000)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                +12.5%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500 dark:border-blue-400">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Usuarios Activos
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber((userMetrics?.total_clientes || 0) + (userMetrics?.total_profesionales || 0))}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">+8.3%</span>
              <span className="text-xs text-muted-foreground ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500 dark:border-purple-400">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Trabajos Completados
              </CardTitle>
              <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">245</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                +15.2%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500 dark:border-orange-400">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasa de Conversión
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">14.2%</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                +2.1%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              Revenue y Volumen de Transacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueByMonth}>
                <defs>
                  <linearGradient id="colorComisiones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVolumen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="comisiones"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorComisiones)"
                  name="Comisiones"
                />
                <Area
                  type="monotone"
                  dataKey="volumen"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorVolumen)"
                  name="Volumen Total"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Crecimiento de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Bar dataKey="profesionales" fill="#8b5cf6" name="Profesionales" />
                <Bar dataKey="clientes" fill="#3b82f6" name="Clientes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trabajos by Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Distribución de Trabajos por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trabajosByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: { name?: string; value?: number }) => `${entry.name} ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trabajosByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Tasa de Conversión Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversionRates}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="semana" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="conversion"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Conversión %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Oficios Populares Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Oficios Más Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Oficio
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Trabajos
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Revenue
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Promedio
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Tendencia
                  </th>
                </tr>
              </thead>
              <tbody>
                {oficiosPopulares.map((oficio, index) => (
                  <tr
                    key={index}
                    className="border-b dark:border-gray-800 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-medium text-foreground">{oficio.oficio}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-foreground">{oficio.trabajos}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(oficio.revenue)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-muted-foreground">
                        {formatCurrency(oficio.revenue / oficio.trabajos)}
                      </span>
                    </td>
                    <td className="p-4">
                      {index < 2 ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">+{12 - index * 2}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-sm font-medium">-{index * 2}%</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
