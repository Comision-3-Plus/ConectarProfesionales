'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {  Loader2, ArrowUpRight, ArrowDownRight, Percent, Calendar } from 'lucide-react';
import { usePaymentHistory } from '@/hooks/payments';
import { formatCurrency, estadoTransaccionConfig, TipoMovimiento } from '@/types/forms/payments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * PaymentHistoryList
 * 
 * Componente inteligente que muestra el historial completo de movimientos.
 * Incluye filtros por tipo (ingreso/egreso/comisión) y paginación.
 * 
 * @example
 * ```tsx
 * <PaymentHistoryList />
 * ```
 */
export function PaymentHistoryList() {
  const [tipo, setTipo] = React.useState<'todos' | TipoMovimiento>('todos');
  const [page, setPage] = React.useState(1);
  const limit = 20;

  const { data, isLoading, error } = usePaymentHistory({
    tipo: tipo === 'todos' ? undefined : tipo,
    page,
    limit,
  });

  const tipoIcons = {
    ingreso: ArrowDownRight,
    egreso: ArrowUpRight,
    comision: Percent,
  };

  const tipoColors = {
    ingreso: 'text-green-600 bg-green-100',
    egreso: 'text-red-600 bg-red-100',
    comision: 'text-orange-600 bg-orange-100',
  };

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
            Error al cargar el historial. Intenta nuevamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  const movimientos = data?.movimientos || [];
  const total = data?.total || 0;
  const resumen = data?.resumen;

  const hasNextPage = page * limit < total;
  const hasPrevPage = page > 1;

  return (
    <div className="space-y-6">
      {/* Resumen */}
      {resumen && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-3">
                  <ArrowDownRight className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Ingresos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(resumen.total_ingresos)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-3">
                  <ArrowUpRight className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Egresos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(resumen.total_egresos)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-3">
                  <Percent className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comisiones</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(resumen.total_comisiones)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Historial */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>
                {total} {total === 1 ? 'transacción' : 'transacciones'} encontradas
              </CardDescription>
            </div>

            {/* Filtro por tipo */}
            <Select value={tipo} onValueChange={(value: any) => { setTipo(value); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ingreso">Ingresos</SelectItem>
                <SelectItem value="egreso">Egresos</SelectItem>
                <SelectItem value="comision">Comisiones</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {movimientos.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay movimientos</h3>
              <p className="text-muted-foreground">
                {tipo !== 'todos'
                  ? `No tienes movimientos de tipo "${tipo}"`
                  : 'Aún no tienes transacciones en tu historial'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {movimientos.map((movimiento: any) => {
                const config = movimiento.estado ? estadoTransaccionConfig[movimiento.estado as keyof typeof estadoTransaccionConfig] : undefined;
                const Icon = config?.icon;
                
                // Determinar el tipo de movimiento (ingreso/egreso/comisión)
                const tipoMov = movimiento.tipo || 'ingreso'; // Asumiendo que existe el campo tipo
                const TipoIcon = tipoIcons[tipoMov as keyof typeof tipoIcons] || ArrowDownRight;
                const tipoColor = tipoColors[tipoMov as keyof typeof tipoColors];

                return (
                  <div
                    key={movimiento.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icono de tipo */}
                      <div className={`rounded-full p-2 ${tipoColor}`}>
                        <TipoIcon className="h-5 w-5" />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{movimiento.descripcion}</h4>
                          {config && (
                            <Badge className={config.color}>
                              {Icon && <Icon className="h-3 w-3 mr-1" />}
                              {config.label}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>
                            {format(new Date(movimiento.fecha_creacion), "d 'de' MMMM, yyyy", {
                              locale: es,
                            })}
                          </span>
                          {movimiento.cliente_nombre && (
                            <span>• Cliente: {movimiento.cliente_nombre}</span>
                          )}
                          {movimiento.profesional_nombre && (
                            <span>• Profesional: {movimiento.profesional_nombre}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Monto */}
                    <div className="text-right">
                      <p
                        className={`text-xl font-bold ${
                          tipoMov === 'ingreso'
                            ? 'text-green-600'
                            : tipoMov === 'egreso'
                            ? 'text-red-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {tipoMov === 'egreso' ? '-' : ''}
                        {formatCurrency(movimiento.monto)}
                      </p>
                      {movimiento.comision_plataforma && (
                        <p className="text-xs text-muted-foreground">
                          Comisión: {formatCurrency(movimiento.comision_plataforma)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {total > limit && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!hasPrevPage}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNextPage}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
