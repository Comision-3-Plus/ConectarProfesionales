import { useQuery } from '@tanstack/react-query';
import { ofertasService } from '@/lib/services/ofertasService';

/**
 * Hook para obtener las ofertas de un chat específico
 * 
 * CARACTERÍSTICAS:
 * ✅ Filtra por chat_id
 * ✅ Enabled solo si hay chatId válido
 * ✅ staleTime de 15 segundos (en un chat las ofertas pueden cambiar rápido)
 * 
 * @param chatId - ID del chat del cual obtener ofertas
 * @param options - Opciones adicionales (enabled)
 * 
 * @example
 * const { data: ofertas, isLoading } = useOfertasByChat(chatId);
 */
export function useOfertasByChat(
  chatId: string | undefined,
  options?: { enabled?: boolean }
) {
  const shouldFetch = options?.enabled ?? !!chatId;
  
  return useQuery({
    queryKey: ['ofertas', 'chat', chatId],
    queryFn: async () => {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      return await ofertasService.getOfertasByChat(chatId);
    },
    staleTime: 15_000, // 15 segundos
    enabled: shouldFetch,
  });
}
