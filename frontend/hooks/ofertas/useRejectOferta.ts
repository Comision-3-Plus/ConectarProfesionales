import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ofertasService } from '@/lib/services/ofertasService';

/**
 * Hook para rechazar una oferta (solo clientes)
 * 
 * CARACTERÍSTICAS:
 * ✅ POST /chat_ofertas/ofertas/:id/reject
 * ✅ Invalida queries de ofertas
 * ✅ Toast de confirmación
 * ✅ Callback onSuccess opcional
 * 
 * @example
 * const { mutate: rejectOferta, isPending } = useRejectOferta();
 * 
 * rejectOferta(ofertaId);
 */
export function useRejectOferta() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ofertaId: string) => {
      return await ofertasService.rejectOferta(ofertaId);
    },
    
    onSuccess: () => {
      // Invalidar queries para refrescar listas
      queryClient.invalidateQueries({ queryKey: ['ofertas'] });
      
      // Toast de confirmación
      toast.info('Oferta rechazada', {
        description: 'El profesional ha sido notificado',
      });
    },
    
    onError: (error: any) => {
      toast.error('Error al rechazar oferta', {
        description: error.message || 'Inténtalo nuevamente',
      });
    },
  });
}
