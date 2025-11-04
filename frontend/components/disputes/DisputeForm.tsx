'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { disputeService } from '@/lib/services/disputeService';

interface DisputeFormProps {
  trabajoId: string;
  onSuccess?: () => void;
}

export function DisputeForm({ trabajoId, onSuccess }: DisputeFormProps) {
  const [formData, setFormData] = useState({
    tipo: 'otro' as 'reembolso' | 'calidad' | 'cancelacion' | 'otro',
    descripcion: '',
    evidencias: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descripcion.trim() || formData.descripcion.length < 20) {
      toast.error('La descripción debe tener al menos 20 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      await disputeService.createDispute({
        trabajo_id: trabajoId,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        evidencias: formData.evidencias,
      });

      toast.success('Disputa creada correctamente', {
        description: 'Un administrador la revisará pronto',
      });

      onSuccess?.();
    } catch {
      toast.error('Error al crear la disputa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEvidence = (url: string) => {
    if (!url.trim()) return;
    setFormData((prev) => ({
      ...prev,
      evidencias: [...prev.evidencias, url],
    }));
  };

  const handleRemoveEvidence = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      evidencias: prev.evidencias.filter((_, i) => i !== index),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Abrir Disputa</CardTitle>
        <CardDescription>
          Describe el problema y proporciona evidencias si es posible
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Antes de continuar</p>
              <p>
                Las disputas son revisadas por administradores. Intenta resolver el problema
                directamente con la otra parte primero.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Disputa</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reembolso">Solicitud de Reembolso</SelectItem>
                <SelectItem value="calidad">Problema de Calidad</SelectItem>
                <SelectItem value="cancelacion">Cancelación de Servicio</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción del Problema</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describe detalladamente el problema..."
              rows={6}
              required
            />
            <p className="text-xs text-slate-500">
              {formData.descripcion.length}/2000 caracteres (mínimo 20)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Evidencias (opcional)</Label>
            <div className="space-y-2">
              {formData.evidencias.map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                  <span className="flex-1 text-sm truncate">{url}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEvidence(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = prompt('Ingresa la URL de la evidencia (imagen, documento, etc.)');
                  if (url) handleAddEvidence(url);
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                Agregar Evidencia
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Fotos, capturas de pantalla, documentos que respalden tu reclamo
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando Disputa...
              </>
            ) : (
              'Crear Disputa'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
