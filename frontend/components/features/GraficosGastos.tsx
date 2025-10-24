/**
 * Componente de Gráfico Simple de Gastos
 * Visualización de distribución de gastos por categoría
 */
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface GastoData {
  categoria: string;
  monto: number;
  color: string;
  porcentaje: number;
}

interface GraficosGastosProps {
  gastos: GastoData[];
  totalGastado: number;
}

export function GraficosGastos({ gastos, totalGastado }: GraficosGastosProps) {
  const maxMonto = Math.max(...gastos.map(g => g.monto));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          Distribución de Gastos
        </CardTitle>
        <CardDescription>
          Tus gastos por categoría de servicio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total */}
        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Gastado</p>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(totalGastado)}</p>
            </div>
            <div className="p-3 bg-orange-500 rounded-full">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Barras de progreso por categoría */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
            Por Categoría
          </h4>
          {gastos.map((gasto, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: gasto.color }}
                  />
                  <span className="font-medium">{gasto.categoria}</span>
                  <Badge variant="outline" className="text-xs">
                    {gasto.porcentaje.toFixed(1)}%
                  </Badge>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(gasto.monto)}
                </span>
              </div>
              {/* Barra de progreso */}
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 ease-out rounded-full"
                  style={{
                    width: `${(gasto.monto / maxMonto) * 100}%`,
                    backgroundColor: gasto.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Resumen estadístico */}
        {gastos.length > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Categoría Principal</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                {gastos[0]?.categoria}
              </p>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Promedio por Servicio</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                {formatCurrency(totalGastado / gastos.length)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
