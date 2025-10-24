/**
 * Componente de Gráfico de Ingresos para Profesionales
 * Visualización de ingresos mensuales y tendencias
 */
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface IngresoMensual {
  mes: string;
  monto: number;
}

interface GraficosIngresosProps {
  ingresosMensuales: IngresoMensual[];
  totalIngresos: number;
  comparacionMesAnterior: number; // Porcentaje de cambio
}

export function GraficosIngresos({ ingresosMensuales, totalIngresos, comparacionMesAnterior }: GraficosIngresosProps) {
  const maxMonto = Math.max(...ingresosMensuales.map(i => i.monto));
  const isPositive = comparacionMesAnterior >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Ingresos Mensuales
        </CardTitle>
        <CardDescription>
          Evolución de tus ingresos en los últimos meses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total e Indicador de Tendencia */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Ingresos Totales</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIngresos)}</p>
              <div className="flex items-center gap-2 mt-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{comparacionMesAnterior.toFixed(1)}% vs mes anterior
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-500 rounded-full">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Gráfico de Barras Simple */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
            Por Mes
          </h4>
          {ingresosMensuales.map((ingreso, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium min-w-[60px]">{ingreso.mes}</span>
                  {index === 0 && (
                    <Badge variant="outline" className="text-xs">
                      Último
                    </Badge>
                  )}
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(ingreso.monto)}
                </span>
              </div>
              {/* Barra de progreso */}
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{
                    width: `${(ingreso.monto / maxMonto) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Estadísticas Adicionales */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400">Promedio Mensual</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalIngresos / ingresosMensuales.length)}
            </p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400">Mejor Mes</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
              {ingresosMensuales.reduce((max, curr) => curr.monto > max.monto ? curr : max, ingresosMensuales[0])?.mes}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
