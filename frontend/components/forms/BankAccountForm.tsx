'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { bankAccountSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface BankAccountFormProps {
  onSuccess?: (data: BankAccountData) => void;
  initialData?: Partial<BankAccountData>;
}

interface BankAccountData {
  tipo_cuenta: 'cbu' | 'alias';
  cbu?: string;
  alias?: string;
  titular: string;
  banco: string;
}

export function BankAccountForm({ onSuccess, initialData }: BankAccountFormProps) {
  const [formData, setFormData] = useState<BankAccountData>({
    tipo_cuenta: 'cbu',
    titular: '',
    banco: '',
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validar con Zod
      const validatedData = bankAccountSchema.parse(formData);

      setIsSubmitting(true);

      // TODO: Enviar al backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Cuenta bancaria guardada correctamente');
      onSuccess?.(validatedData);
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        toast.error('Error al guardar cuenta bancaria');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cuenta Bancaria</CardTitle>
        <CardDescription>
          Configura tu cuenta para recibir pagos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo_cuenta">Tipo de Cuenta</Label>
            <Select
              value={formData.tipo_cuenta}
              onValueChange={(value: 'cbu' | 'alias') =>
                handleChange('tipo_cuenta', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cbu">CBU</SelectItem>
                <SelectItem value="alias">Alias</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo_cuenta && (
              <p className="text-sm text-red-600">{errors.tipo_cuenta}</p>
            )}
          </div>

          {formData.tipo_cuenta === 'cbu' ? (
            <div className="space-y-2">
              <Label htmlFor="cbu">CBU (22 dígitos)</Label>
              <Input
                id="cbu"
                value={formData.cbu || ''}
                onChange={(e) => handleChange('cbu', e.target.value)}
                placeholder="0000000000000000000000"
                maxLength={22}
              />
              {errors.cbu && <p className="text-sm text-red-600">{errors.cbu}</p>}
              <p className="text-xs text-slate-500">
                22 dígitos sin espacios ni guiones
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="alias">Alias CBU</Label>
              <Input
                id="alias"
                value={formData.alias || ''}
                onChange={(e) => handleChange('alias', e.target.value)}
                placeholder="mi.alias.cbu"
              />
              {errors.alias && <p className="text-sm text-red-600">{errors.alias}</p>}
              <p className="text-xs text-slate-500">
                Letras minúsculas, números y puntos
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="titular">Titular de la Cuenta</Label>
            <Input
              id="titular"
              value={formData.titular}
              onChange={(e) => handleChange('titular', e.target.value)}
              placeholder="Nombre completo"
            />
            {errors.titular && (
              <p className="text-sm text-red-600">{errors.titular}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="banco">Banco</Label>
            <Input
              id="banco"
              value={formData.banco}
              onChange={(e) => handleChange('banco', e.target.value)}
              placeholder="Nombre del banco"
            />
            {errors.banco && <p className="text-sm text-red-600">{errors.banco}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cuenta'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
