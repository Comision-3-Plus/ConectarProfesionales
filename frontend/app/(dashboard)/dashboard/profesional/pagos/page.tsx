import { BalanceCard, PaymentHistoryList } from '@/components/features/payments';

/**
 * Página de Historial de Pagos (Profesionales)
 * 
 * LIMPIA Y SIMPLE (patrón Golden Path):
 * - Solo 2 componentes inteligentes
 * - 0 useState/useEffect
 * - Toda la lógica en los componentes Feature
 * 
 * @example
 * Esta página muestra:
 * 1. Balance del profesional (disponible, pendiente, comisiones)
 * 2. Historial completo de movimientos con filtros
 */
export default function PagosPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Pagos y Balance</h1>
        <p className="text-muted-foreground">
          Gestiona tus finanzas, consulta tu balance y revisa el historial de transacciones
        </p>
      </div>

      {/* Balance Card */}
      <BalanceCard />

      {/* Historial */}
      <PaymentHistoryList />
    </div>
  );
}
