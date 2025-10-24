/**
 * Componente de Timeline de Actividad Reciente
 * Muestra las últimas acciones del usuario en formato cronológico
 */
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  DollarSign,
  FileText,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActividadItem {
  id: string;
  tipo: 'oferta_recibida' | 'oferta_aceptada' | 'oferta_rechazada' | 'trabajo_completado' | 'pago_realizado' | 'mensaje';
  descripcion: string;
  fecha: string | Date;
  monto?: number;
}

interface ActividadRecienteProps {
  actividades: ActividadItem[];
}

const getIconForTipo = (tipo: ActividadItem['tipo']) => {
  switch (tipo) {
    case 'oferta_recibida':
      return <FileText className="h-4 w-4 text-blue-600" />;
    case 'oferta_aceptada':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'oferta_rechazada':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'trabajo_completado':
      return <CheckCircle className="h-4 w-4 text-emerald-600" />;
    case 'pago_realizado':
      return <DollarSign className="h-4 w-4 text-orange-600" />;
    case 'mensaje':
      return <MessageCircle className="h-4 w-4 text-purple-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-slate-600" />;
  }
};

const getColorForTipo = (tipo: ActividadItem['tipo']) => {
  switch (tipo) {
    case 'oferta_recibida':
      return 'bg-blue-100 border-blue-300 dark:bg-blue-950 dark:border-blue-800';
    case 'oferta_aceptada':
      return 'bg-green-100 border-green-300 dark:bg-green-950 dark:border-green-800';
    case 'oferta_rechazada':
      return 'bg-red-100 border-red-300 dark:bg-red-950 dark:border-red-800';
    case 'trabajo_completado':
      return 'bg-emerald-100 border-emerald-300 dark:bg-emerald-950 dark:border-emerald-800';
    case 'pago_realizado':
      return 'bg-orange-100 border-orange-300 dark:bg-orange-950 dark:border-orange-800';
    case 'mensaje':
      return 'bg-purple-100 border-purple-300 dark:bg-purple-950 dark:border-purple-800';
    default:
      return 'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700';
  }
};

export function ActividadReciente({ actividades }: ActividadRecienteProps) {
  if (!actividades || actividades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-600" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay actividad reciente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          Actividad Reciente
        </CardTitle>
        <CardDescription>
          Últimos movimientos en tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Línea vertical del timeline */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

          {actividades.map((actividad) => (
            <div key={actividad.id} className="relative flex gap-4">\
              {/* Icono */}
              <div className={`
                relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2
                ${getColorForTipo(actividad.tipo)}
              `}>
                {getIconForTipo(actividad.tipo)}
              </div>

              {/* Contenido */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {actividad.descripcion}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {format(new Date(actividad.fecha), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                  {actividad.monto && (
                    <Badge variant="outline" className="text-xs">
                      ${actividad.monto.toLocaleString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón ver más si hay muchas actividades */}
        {actividades.length > 5 && (
          <div className="mt-4 pt-4 border-t text-center">
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
              Ver todas las actividades →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
