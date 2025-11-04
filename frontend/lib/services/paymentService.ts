/**
 * Servicio de Pagos y Transacciones
 */

import api from '../api';

export interface Transaction {
  id: string;
  trabajo_id: string;
  cliente_id: string;
  profesional_id: string;
  monto: number;
  estado: 'pendiente' | 'completado' | 'cancelado' | 'en_disputa' | 'reembolsado';
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
}

export interface PaymentIntent {
  preference_id: string;
  init_point: string;
  transaction_id: string;
}

class PaymentService {
  /**
   * Crear intención de pago con MercadoPago
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
   * Obtener detalles de una transacción
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    const response = await api.get(`/pagos/transacciones/${transactionId}`);
    return response.data;
  }

  /**
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
   * Liberar pago al profesional (cliente confirma trabajo completo)
   */
  async releasePayment(transactionId: string): Promise<Transaction> {
    const response = await api.post(`/pagos/transacciones/${transactionId}/liberar`);
    return response.data;
  }

  /**
   * Solicitar reembolso
   */
  async requestRefund(transactionId: string, motivo: string): Promise<Transaction> {
    const response = await api.post(`/pagos/transacciones/${transactionId}/reembolso`, {
      motivo,
    });
    return response.data;
  }

  /**
   * Webhook de MercadoPago (solo backend)
   */
  async handleMercadoPagoWebhook(paymentId: string): Promise<void> {
    await api.post('/pagos/webhook/mercadopago', { payment_id: paymentId });
  }

  /**
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
   * Solicitar retiro de fondos
   */
  async requestWithdrawal(amount: number): Promise<void> {
    await api.post('/pagos/retiros', { monto: amount });
  }

  /**
   * Obtener balance disponible
   */
  async getBalance(): Promise<{
    disponible: number;
    pendiente: number;
    total_ganado: number;
  }> {
    const response = await api.get('/pagos/balance');
    return response.data;
  }
}

export const paymentService = new PaymentService();

