'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, DollarSign } from 'lucide-react';
import { useCreateOferta } from '@/hooks/ofertas';
import {
  createOfertaSchema,
  defaultCreateOferta,
  type CreateOfertaFormData,
} from '@/types/forms/ofertas';

interface CreateOfertaDialogProps {
  /**
   * ID del chat donde se enviará la oferta
   */
  chatId: string;
  
  /**
   * ID del cliente que recibirá la oferta
   */
  clienteId: string;
  
  /**
   * Estado de apertura del dialog
   */
  open: boolean;
  
  /**
   * Callback para cerrar el dialog
   */
  onOpenChange: (open: boolean) => void;
  
  /**
   * Callback opcional después de crear la oferta
   */
  onSuccess?: () => void;
}

/**
 * Dialog para crear una nueva oferta (solo profesionales)
 * 
 * CARACTERÍSTICAS:
 * ✅ Formulario con react-hook-form + Zod
 * ✅ Validación de descripción (10-500 chars) y precio (> 0)
 * ✅ Usa useCreateOferta hook
 * ✅ Cierre automático después de crear
 * ✅ Loading state mientras crea
 * 
 * @example
 * <CreateOfertaDialog
 *   chatId={chatId}
 *   clienteId={clienteId}
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 * />
 */
export function CreateOfertaDialog({
  chatId,
  clienteId,
  open,
  onOpenChange,
  onSuccess,
}: CreateOfertaDialogProps) {
  // 🔧 Hook de mutation
  const { mutate: createOferta, isPending } = useCreateOferta();
  
  // 📝 Form con react-hook-form + Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOfertaFormData>({
    resolver: zodResolver(createOfertaSchema) as any,
    defaultValues: {
      ...defaultCreateOferta,
      chat_id: chatId,
      cliente_id: clienteId,
    },
  });
  
  // 🎯 Handler de submit
  const onSubmit = (data: CreateOfertaFormData) => {
    createOferta(
      {
        ...data,
        chat_id: chatId,
        cliente_id: clienteId,
      },
      {
        onSuccess: () => {
          // Resetear form
          reset();
          // Cerrar dialog
          onOpenChange(false);
          // Callback opcional
          onSuccess?.();
        },
      }
    );
  };
  
  // Handler de cancelación
  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Oferta</DialogTitle>
          <DialogDescription>
            Describe el servicio que ofrecerás y establece un precio final.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción del servicio *
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Ej: Instalación de sistema eléctrico completo, incluye materiales..."
              rows={4}
              {...register('descripcion')}
              disabled={isPending}
            />
            {errors.descripcion && (
              <p className="text-xs text-red-500">
                {errors.descripcion.message as string}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Mínimo 10 caracteres, máximo 500
            </p>
          </div>
          
          {/* Precio */}
          <div className="space-y-2">
            <Label htmlFor="precio_final">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Precio final *
            </Label>
            <Input
              id="precio_final"
              type="number"
              step="0.01"
              min="0"
              placeholder="5000"
              {...register('precio_final', { valueAsNumber: true })}
              disabled={isPending}
            />
            {errors.precio_final && (
              <p className="text-xs text-red-500">
                {errors.precio_final.message as string}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Precio total por el servicio (en pesos argentinos)
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Oferta'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
