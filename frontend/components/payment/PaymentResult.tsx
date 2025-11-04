'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Home } from 'lucide-react';
import Link from 'next/link';

interface PaymentResultProps {
  status: 'success' | 'failure' | 'pending';
  trabajoId?: string;
  trabajoTitulo?: string;
  amount?: number;
  paymentId?: string;
  errorMessage?: string;
}

export function PaymentSuccess({ trabajoId, trabajoTitulo, amount, paymentId }: Omit<PaymentResultProps, 'status'>) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          {/* Icono de éxito */}
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              ¡Pago Exitoso!
            </h1>
            <p className="text-slate-600">
              Tu pago ha sido procesado correctamente
            </p>
          </div>

          {/* Detalles */}
          <div className="space-y-3 p-6 bg-slate-50 rounded-lg text-left">
            {trabajoTitulo && (
              <div className="flex justify-between">
                <span className="text-slate-600">Trabajo:</span>
                <span className="font-medium">{trabajoTitulo}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between">
                <span className="text-slate-600">Monto:</span>
                <span className="font-bold text-green-600">
                  ${amount.toLocaleString('es-AR')}
                </span>
              </div>
            )}
            {paymentId && (
              <div className="flex justify-between">
                <span className="text-slate-600">ID de transacción:</span>
                <span className="font-mono text-sm">{paymentId}</span>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-left">
            <p className="text-blue-800">
              <strong>🔒 Pago en garantía:</strong> Tu dinero está protegido y será liberado
              al profesional una vez que confirmes que el trabajo ha sido completado satisfactoriamente.
            </p>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link href={trabajoId ? `/trabajos/${trabajoId}` : '/dashboard'}>
                Ver Trabajo
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard/transacciones">
                Ver Transacciones
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PaymentFailure({ errorMessage }: Pick<PaymentResultProps, 'errorMessage'>) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          {/* Icono de error */}
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Pago Fallido
            </h1>
            <p className="text-slate-600">
              No pudimos procesar tu pago
            </p>
          </div>

          {/* Mensaje de error */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          {/* Razones comunes */}
          <div className="text-left space-y-2 p-4 bg-slate-50 rounded-lg">
            <p className="font-medium text-sm text-slate-900">Razones comunes:</p>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>Fondos insuficientes</li>
              <li>Datos de tarjeta incorrectos</li>
              <li>Límite de compra excedido</li>
              <li>Transacción rechazada por el banco</li>
            </ul>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                Intentar Nuevamente
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/ayuda">
                Contactar Soporte
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PaymentPending({ trabajoId }: Pick<PaymentResultProps, 'trabajoId'>) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          {/* Icono de pendiente */}
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center">
              <div className="h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Pago Pendiente
            </h1>
            <p className="text-slate-600">
              Tu pago está siendo procesado
            </p>
          </div>

          {/* Información */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-left">
            <p className="text-orange-800">
              Estamos procesando tu pago. Esto puede tomar unos minutos. Te notificaremos
              por email cuando se complete la transacción.
            </p>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link href={trabajoId ? `/trabajos/${trabajoId}` : '/dashboard'}>
                Ver Trabajo
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Ir al Inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
