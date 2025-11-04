/**
 * Servicio de Pagos y Transacciones
 * Endpoints: /api/v1/pagos/* (12 endpoints completos)
 */

import api from '../api';

export interface Transaction {
  id: string;
  trabajo_id: string;
  cliente_id: string;
  profesional_id: string;
  monto: number;
  estado: 'pendiente' | 'completado' | 'cancelado' | 'en_disputa' | 'reembolsado';
  estado_escrow: 'PENDIENTE' | 'DEPOSITADO' | 'LIBERADO' | 'REEMBOLSADO';
  metodo_pago: 'mercadopago' | 'transferencia' | 'efectivo';
  mercadopago_preference_id?: string;
  mercadopago_payment_id?: string;
  fecha_creacion: string;
  fecha_liberacion?: string;
  descripcion: string;
  cliente_nombre: string;
  profesional_nombre: string;
  puede_liberar: boolean;
  puede_solicitar_reembolso: boolean;
  comision_plataforma?: number;
  monto_neto_profesional?: number;
}

export interface PaymentIntent {
  preference_id: string;
  init_point: string;
  transaction_id: string;
  sandbox_init_point?: string;
}

export interface BalanceInfo {
  disponible: number;
  pendiente: number;
  total_ganado: number;
  total_comisiones: number;
  trabajos_completados: number;
}

export interface WithdrawalRequest {
  id: string;
  usuario_id: string;
  monto: number;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'PROCESADO';
  fecha_solicitud: string;
  fecha_procesado?: string;
  cuenta_destino: string;
}

class PaymentService {
  /**
   * POST /api/v1/pagos/crear-pago
   * Crear intención de pago con MercadoPago (Escrow)
   */
  async createPaymentIntent(trabajoId: string, amount: number, description: string): Promise<PaymentIntent> {
    const response = await api.post('/pagos/crear-pago', {
      trabajo_id: trabajoId,
      monto: amount,
      descripcion: description,
      metodo_pago: 'mercadopago',
    });
    return response.data;
  }

  /**
   * GET /api/v1/pagos/transacciones/{transaction_id}
   * Obtener detalles de una transacción
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    const response = await api.get(`/pagos/transacciones/${transactionId}`);
    return response.data;
  }

  /**
   * GET /api/v1/pagos/mis-transacciones
   * Obtener transacciones del usuario
   */
  async getMyTransactions(params?: {
    estado?: string;
    page?: number;
    limit?: number;
  }): Promise<{ transacciones: Transaction[]; total: number }> {
    const response = await api.get('/pagos/mis-transacciones', { params });
    return response.data;
  }

  /**
   * POST /api/v1/pagos/transacciones/{transaction_id}/liberar
   * Liberar pago al profesional (cliente confirma trabajo completo)
   */
  async releasePayment(transactionId: string): Promise<Transaction> {
    const response = await api.post(`/pagos/transacciones/${transactionId}/liberar`);
    return response.data;
  }

  /**
   * POST /api/v1/pagos/transacciones/{transaction_id}/reembolso
   * Solicitar reembolso
   */
  async requestRefund(transactionId: string, motivo: string): Promise<Transaction> {
    const response = await api.post(`/pagos/transacciones/${transactionId}/reembolso`, {
      motivo,
    });
    return response.data;
  }

  /**
   * POST /api/v1/pagos/webhook/mercadopago
   * Webhook de MercadoPago (solo backend/sistema)
   */
  async handleMercadoPagoWebhook(paymentId: string): Promise<void> {
    await api.post('/pagos/webhook/mercadopago', { payment_id: paymentId });
  }

  /**
   * POST /api/v1/pagos/cuenta-bancaria
   * Configurar cuenta bancaria para recibir pagos
   */
  async setupBankAccount(data: {
    tipo_cuenta: 'cbu' | 'alias';
    cbu?: string;
    alias?: string;
    titular: string;
    banco: string;
  }): Promise<void> {
    await api.post('/pagos/cuenta-bancaria', data);
  }

  /**
   * GET /api/v1/pagos/cuenta-bancaria
   * Obtener cuenta bancaria configurada
   */
  async getBankAccount(): Promise<{
    tipo_cuenta: 'cbu' | 'alias';
    cbu_oculto?: string;
    alias?: string;
    titular: string;
    banco: string;
  } | null> {
    const response = await api.get('/pagos/cuenta-bancaria');
    return response.data;
  }

  /**
   * POST /api/v1/pagos/retiros
   * Solicitar retiro de fondos
   */
  async requestWithdrawal(amount: number): Promise<WithdrawalRequest> {
    const response = await api.post('/pagos/retiros', { monto: amount });
    return response.data;
  }

  /**
   * GET /api/v1/pagos/balance
   * Obtener balance disponible del profesional
   */
  async getBalance(): Promise<BalanceInfo> {
    const response = await api.get('/pagos/balance');
    return response.data;
  }

  /**
   * GET /api/v1/pagos/historial
   * Obtener historial completo de movimientos
   */
  async getPaymentHistory(params?: {
    tipo?: 'ingreso' | 'egreso' | 'comision';
    desde?: string; // fecha ISO
    hasta?: string; // fecha ISO
    page?: number;
    limit?: number;
  }): Promise<{
    movimientos: Transaction[];
    total: number;
    resumen: {
      total_ingresos: number;
      total_egresos: number;
      total_comisiones: number;
    };
  }> {
    const response = await api.get('/pagos/historial', { params });
    return response.data;
  }

  /**
   * GET /api/v1/pagos/dashboard
   * Dashboard financiero (profesional)
   */
  async getFinancialDashboard(): Promise<{
    ingresos_mes_actual: number;
    ingresos_mes_anterior: number;
    trabajos_completados_mes: number;
    promedio_por_trabajo: number;
    proximos_pagos: Transaction[];
    retiros_pendientes: WithdrawalRequest[];
    comisiones_pagadas: number;
  }> {
    const response = await api.get('/pagos/dashboard');
    return response.data;
  }

  // ========== ADMIN ENDPOINTS ==========

  /**
   * GET /api/v1/admin/pagos/dashboard
   * Dashboard financiero admin
   */
  async adminGetDashboard(): Promise<{
    total_transacciones: number;
    total_monto_procesado: number;
    total_comisiones: number;
    pagos_pendientes: number;
    retiros_pendientes: number;
    ingresos_ultimo_mes: number;
  }> {
    const response = await api.get('/admin/pagos/dashboard');
    return response.data;
  }

  /**
   * GET /api/v1/admin/pagos/retiros
   * Listar retiros pendientes (admin)
   */
  async adminListWithdrawals(estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'): Promise<WithdrawalRequest[]> {
    const response = await api.get('/admin/pagos/retiros', {
      params: { estado },
    });
    return response.data;
  }

  /**
   * POST /api/v1/admin/pagos/retiros/{retiro_id}/aprobar
   * Aprobar retiro (admin)
   */
  async adminApproveWithdrawal(retiroId: string): Promise<WithdrawalRequest> {
    const response = await api.post(`/admin/pagos/retiros/${retiroId}/aprobar`);
    return response.data;
  }

  /**
   * POST /api/v1/admin/pagos/retiros/{retiro_id}/rechazar
   * Rechazar retiro (admin)
   */
  async adminRejectWithdrawal(retiroId: string, motivo: string): Promise<WithdrawalRequest> {
    const response = await api.post(`/admin/pagos/retiros/${retiroId}/rechazar`, { motivo });
    return response.data;
  }

  // ========== HELPERS ==========

  /**
   * Helper: Calcular comisión de la plataforma
   */
  calculatePlatformCommission(amount: number, levelCommissionRate: number = 0.15): number {
    return amount * levelCommissionRate;
  }

  /**
   * Helper: Calcular monto neto para el profesional
   */
  calculateNetAmount(amount: number, levelCommissionRate: number = 0.15): number {
    return amount - this.calculatePlatformCommission(amount, levelCommissionRate);
  }

  /**
   * Helper: Formatear monto en pesos argentinos
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  }

  /**
   * Helper: Verificar si puedo solicitar retiro
   */
  async canRequestWithdrawal(amount: number): Promise<{ can: boolean; reason?: string }> {
    try {
      const balance = await this.getBalance();

      if (balance.disponible < amount) {
        return {
          can: false,
          reason: `Balance insuficiente. Disponible: ${this.formatCurrency(balance.disponible)}`,
        };
      }

      if (amount < 1000) {
        return {
          can: false,
          reason: 'El monto mínimo de retiro es $1,000',
        };
      }

      const bankAccount = await this.getBankAccount();
      if (!bankAccount) {
        return {
          can: false,
          reason: 'Debes configurar una cuenta bancaria primero',
        };
      }

      return { can: true };
    } catch (error) {
      return { can: false, reason: 'Error al verificar condiciones' };
    }
  }
}

export const paymentService = new PaymentService();

