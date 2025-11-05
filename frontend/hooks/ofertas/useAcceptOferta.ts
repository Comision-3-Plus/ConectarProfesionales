import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ofertasService } from '@/lib/services/ofertasService';

/**
 * Hook para aceptar una oferta (solo clientes)
 * 
 * CARACTERÍSTICAS:
 * ✅ PUT /chat_ofertas/ofertas/:id/accept
 * ✅ Invalida queries de ofertas
 * ✅ Redirección automática a MercadoPago (payment_url)
 * ✅ Toast con información de pago
 * 
 * FLUJO:
 * 1. Cliente acepta oferta
 * 2. Backend crea Trabajo + Preference de MercadoPago
 * 3. Frontend recibe payment_url
 * 4. Redirección a MercadoPago después de 2 segundos
 * 
 * @example
 * const { mutate: acceptOferta, isPending } = useAcceptOferta();
 * 
 * acceptOferta(ofertaId);
 */
export function useAcceptOferta() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ofertaId: string) => {
      return await ofertasService.acceptOferta(ofertaId);
    },
    
    onSuccess: (response) => {
      // Invalidar queries para refrescar listas
      queryClient.invalidateQueries({ queryKey: ['ofertas'] });
      
      // Toast con información
      toast.success('¡Oferta aceptada!', {
        description: 'Redirigiendo a MercadoPago para el pago...',
        duration: 2000,
      });
      
      // Redirigir a MercadoPago después de 2 segundos
      if (response.payment_url) {
        setTimeout(() => {
          window.location.href = response.payment_url;
        }, 2000);
      }
    },
    
    onError: (error: any) => {
      toast.error('Error al aceptar oferta', {
        description: error.message || 'Inténtalo nuevamente',
      });
    },
  });
}
