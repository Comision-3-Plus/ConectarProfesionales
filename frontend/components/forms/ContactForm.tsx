'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ContactFormProps {
  subject?: string;
  onSuccess?: () => void;
}

export function ContactForm({ subject, onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: subject || '',
    mensaje: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implementar envío real
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success('Mensaje enviado', {
        description: 'Te responderemos pronto a tu email.',
      });

      setFormData({
        nombre: '',
        email: '',
        asunto: subject || '',
        mensaje: '',
      });

      onSuccess?.();
    } catch (error) {
      toast.error('Error al enviar el mensaje', {
        description: 'Por favor intenta nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contáctanos</CardTitle>
        <CardDescription>
          Completa el formulario y te responderemos lo antes posible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Tu nombre"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asunto">Asunto</Label>
            <Input
              id="asunto"
              name="asunto"
              value={formData.asunto}
              onChange={handleChange}
              required
              placeholder="¿En qué podemos ayudarte?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensaje">Mensaje</Label>
            <Textarea
              id="mensaje"
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Describe tu consulta o problema..."
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800">
              Tiempo de respuesta estimado: 24-48 horas hábiles
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensaje
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
