'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Clock, Award, Loader2 } from 'lucide-react';
import { useBalance } from '@/hooks/payments';
import { formatCurrency } from '@/types/forms/payments';

/**
 * BalanceCard
 * 
 * Componente inteligente que muestra el balance financiero del profesional.
 * Usa el hook useBalance para obtener datos en tiempo real.
 * 
 * Solo para usuarios PROFESIONAL.
 * 
 * @example
 * ```tsx
 * <BalanceCard />
 * ```
 */
export function BalanceCard() {
  const { data: balance, isLoading, error } = useBalance();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-6">
          <p className="text-red-800 text-sm">
            Error al cargar el balance. Intenta nuevamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  const stats = [
    {
      title: 'Disponible',
      value: balance.disponible,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Listo para retirar',
    },
    {
      title: 'Pendiente',
      value: balance.pendiente,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'En trabajos activos',
    },
    {
      title: 'Total Ganado',
      value: balance.total_ganado,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Histórico total',
    },
    {
      title: 'Trabajos Completados',
      value: balance.trabajos_completados,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Proyectos finalizados',
      isCount: true,
    },
  ];

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tu Balance</CardTitle>
          <CardDescription>
            Resumen financiero de tu actividad profesional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <div className="mt-2">
                        <h3 className={`text-2xl font-bold ${stat.color}`}>
                          {stat.isCount
                            ? stat.value
                            : formatCurrency(stat.value)}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                    <div className={`rounded-full p-2 ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comisiones */}
          {balance.total_comisiones > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Total pagado en comisiones de plataforma:
                </span>
                <span className="font-semibold">
                  {formatCurrency(balance.total_comisiones)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
