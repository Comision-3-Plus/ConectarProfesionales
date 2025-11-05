import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ofertasService } from '@/lib/services/ofertasService';
import type { CreateOfertaFormData } from '@/types/forms/ofertas';

/**
 * Hook para crear una nueva oferta (solo profesionales)
 * 
 * CARACTERÍSTICAS:
 * ✅ POST /chat_ofertas/ofertas
 * ✅ Invalida queries de ofertas (general y por chat)
 * ✅ Toast de éxito/error automático
 * ✅ Callback onSuccess opcional
 * 
 * @example
 * const { mutate: createOferta, isPending } = useCreateOferta();
 * 
 * createOferta({
 *   cliente_id: 'uuid',
 *   chat_id: 'uuid',
 *   descripcion: 'Instalación de...',
 *   precio_final: 5000,
 * });
 */
export function useCreateOferta() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data: CreateOfertaFormData) => {
      return await ofertasService.createOferta(data);
    },
    
    onSuccess: (newOferta, variables) => {
      // Invalidar queries para refrescar listas
      queryClient.invalidateQueries({ queryKey: ['ofertas'] });
      queryClient.invalidateQueries({ queryKey: ['ofertas', 'chat', variables.chat_id] });
      
      // Toast de éxito
      toast.success('¡Oferta enviada!', {
        description: 'El cliente recibirá tu propuesta en el chat',
      });
    },
    
    onError: (error: any) => {
      // Toast de error
      toast.error('Error al enviar oferta', {
        description: error.message || 'Inténtalo nuevamente',
      });
    },
  });
}
