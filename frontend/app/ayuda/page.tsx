import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MessageCircle, Mail, Phone } from 'lucide-react';

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900">Centro de Ayuda</h1>
            <p className="mt-4 text-lg text-slate-600">
              ¿Necesitas ayuda? Estamos aquí para ti
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-orange-500" />
                  Email
                </CardTitle>
                <CardDescription>Respuesta en 24 horas</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="mailto:contacto@conectarpro.com"
                  className="text-orange-500 hover:text-orange-600"
                >
                  contacto@conectarpro.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-orange-500" />
                  Teléfono
                </CardTitle>
                <CardDescription>Lun-Vie 9AM-6PM</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="tel:+5491123456789"
                  className="text-orange-500 hover:text-orange-600"
                >
                  +54 9 11 2345-6789
                </a>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
