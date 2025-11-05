'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Users, TrendingUp, Activity } from 'lucide-react';
import { useAdminPaymentStats } from '@/hooks/payments/useAdminPaymentStats';

/**
 * Componente: métricas del dashboard admin
 * 
 * Features:
 * - KPI cards reutilizando hooks existentes
 * - Stats de pagos, usuarios, actividad
 * - Loading states
 */
export function DashboardMetrics() {
  const { data: paymentStats, isLoading } = useAdminPaymentStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!paymentStats) {
    return null;
  }

  const metrics = [
    {
      title: 'Ingresos Totales',
      value: `$${paymentStats.total_monto_procesado.toLocaleString()}`,
      description: 'Total procesado',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Transacciones',
      value: paymentStats.total_transacciones,
      description: 'Total de operaciones',
      icon: Activity,
      color: 'text-blue-600',
    },
    {
      title: 'Pendientes',
      value: paymentStats.pagos_pendientes + paymentStats.retiros_pendientes,
      description: 'Pagos y retiros',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
    {
      title: 'Comisiones',
      value: `$${paymentStats.total_comisiones.toLocaleString()}`,
      description: 'Generadas',
      icon: DollarSign,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {metrics.map((metric) => {
        const IconComponent = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <IconComponent className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
