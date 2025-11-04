'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Shield, Clock, CheckCircle, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { paymentService } from '@/lib/services';

interface PaymentCheckoutProps {
  trabajoId: string;
  amount: number;
  description: string;
  profesionalName: string;
  onSuccess?: (paymentUrl: string) => void;
}

export function PaymentCheckout({
  trabajoId,
  amount,
  description,
  profesionalName,
  onSuccess,
}: PaymentCheckoutProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      return paymentService.createPaymentIntent(trabajoId, amount, description);
    },
    onSuccess: (data) => {
      if (data.init_point) {
        toast.success('Redirigiendo a MercadoPago...');
        onSuccess?.(data.init_point);
        window.location.href = data.init_point;
      }
    },
    onError: (error: Error) => {
      toast.error('Error al procesar el pago', {
        description: error.message,
      });
    },
  });

  const handlePayment = () => {
    if (!acceptedTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }
    createPaymentMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Resumen de pago */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-600" />
            Resumen del Pago
          </CardTitle>
          <CardDescription>
            Revisa los detalles antes de continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Trabajo:</span>
              <span className="font-medium">{description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Profesional:</span>
              <span className="font-medium">{profesionalName}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-3xl font-bold text-orange-600">
                ${amount.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de garantía */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="shrink-0">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-green-900">Pago Protegido</h3>
              <p className="text-sm text-green-800">
                Tu pago quedará en garantía hasta que confirmes que el trabajo fue completado
                satisfactoriamente. El profesional recibirá el pago solo cuando apruebes el trabajo.
              </p>
              <ul className="text-sm text-green-700 space-y-1 mt-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Dinero protegido en escrow
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Liberación bajo tu aprobación
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Reembolso disponible si no cumple
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métodos de pago */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Métodos de Pago Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center justify-center p-4 border rounded-lg bg-slate-50">
              <span className="text-sm font-medium">Tarjeta</span>
            </div>
            <div className="flex items-center justify-center p-4 border rounded-lg bg-slate-50">
              <span className="text-sm font-medium">Débito</span>
            </div>
            <div className="flex items-center justify-center p-4 border rounded-lg bg-slate-50">
              <span className="text-sm font-medium">Efectivo</span>
            </div>
            <div className="flex items-center justify-center p-4 border rounded-lg bg-slate-50">
              <span className="text-sm font-medium">Transferencia</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Procesado por MercadoPago - Pago seguro y encriptado
          </p>
        </CardContent>
      </Card>

      {/* Términos y condiciones */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
              Acepto los{' '}
              <a href="/terminos" className="text-orange-600 hover:underline">
                términos y condiciones
              </a>{' '}
              y la{' '}
              <a href="/politica-privacidad" className="text-orange-600 hover:underline">
                política de privacidad
              </a>
              . Entiendo que el pago quedará en garantía y será liberado al profesional una vez
              que confirme la finalización satisfactoria del trabajo.
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Botón de pago */}
      <div className="flex gap-3">
        <Button
          onClick={handlePayment}
          disabled={!acceptedTerms || createPaymentMutation.isPending}
          size="lg"
          className="flex-1"
        >
          {createPaymentMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-5 w-5" />
              Pagar ${amount.toLocaleString('es-AR')}
            </>
          )}
        </Button>
      </div>

      {/* Nota de seguridad */}
      <p className="text-center text-xs text-slate-500">
        🔒 Conexión segura SSL - Tus datos están protegidos
      </p>
    </div>
  );
}
