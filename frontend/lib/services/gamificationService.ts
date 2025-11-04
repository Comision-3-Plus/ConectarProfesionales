/**
 * Servicio de Gamificación
 * Endpoints: /api/v1/gamification/*
 */

import { api } from '../api';

export interface LeaderboardEntry {
  posicion: number;
  nombre: string;
  puntos: number;
  nivel: string;
  rating: number;
  trabajos_completados: number;
}

export interface GamificationStats {
  nivel_actual: string;
  puntos_experiencia: number;
  proximo_nivel: string;
  puntos_para_proximo_nivel: number;
  trabajos_completados: number;
  rating_promedio: number;
  total_resenas: number;
  comision_actual: number;
}

export interface GamificationEvent {
  user_id: string;
  event_type: 'trabajo_completado' | 'resena_recibida' | 'nivel_subido';
  metadata?: Record<string, any>;
}

export const gamificationService = {
  /**
   * GET /api/v1/gamification/leaderboard
   * Obtener el ranking de profesionales por puntos
   */
  getLeaderboard: async (limit: number = 10): Promise<LeaderboardEntry[]> => {
    const response = await api.get<LeaderboardEntry[]>('/gamification/leaderboard', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * GET /api/v1/gamification/user/{user_id}
   * Obtener estadísticas de gamificación de un usuario
   */
  getUserStats: async (userId: string): Promise<GamificationStats> => {
    const response = await api.get<GamificationStats>(`/gamification/user/${userId}`);
    return response.data;
  },

  /**
   * POST /api/v1/gamification/event
   * Procesar un evento de gamificación (interno/sistema)
   */
  processEvent: async (event: GamificationEvent): Promise<any> => {
    const response = await api.post('/gamification/event', event);
    return response.data;
  },

  /**
   * Helper: Calcular porcentaje de progreso al próximo nivel
   */
  calculateLevelProgress: (stats: GamificationStats): number => {
    if (stats.proximo_nivel === 'Máximo') return 100;

    const levels: { [key: string]: number } = {
      Bronce: 0,
      Plata: 1000,
      Oro: 5000,
      Diamante: 10000,
    };

    const currentLevelPoints = levels[stats.nivel_actual] || 0;
    const nextLevelPoints = levels[stats.proximo_nivel] || 10000;
    const range = nextLevelPoints - currentLevelPoints;
    const progress = stats.puntos_experiencia - currentLevelPoints;

    return Math.min(100, Math.max(0, (progress / range) * 100));
  },

  /**
   * Helper: Obtener color del nivel
   */
  getLevelColor: (nivel: string): string => {
    const colors: { [key: string]: string } = {
      Bronce: '#CD7F32',
      Plata: '#C0C0C0',
      Oro: '#FFD700',
      Diamante: '#B9F2FF',
    };
    return colors[nivel] || '#808080';
  },

  /**
   * Helper: Obtener emoji del nivel
   */
  getLevelEmoji: (nivel: string): string => {
    const emojis: { [key: string]: string } = {
      Bronce: '🥉',
      Plata: '🥈',
      Oro: '🥇',
      Diamante: '💎',
    };
    return emojis[nivel] || '⭐';
  },

  /**
   * Helper: Calcular comisión según nivel
   */
  getCommissionByLevel: (nivel: string): number => {
    const commissions: { [key: string]: number } = {
      Bronce: 0.15, // 15%
      Plata: 0.12, // 12%
      Oro: 0.10, // 10%
      Diamante: 0.08, // 8%
    };
    return commissions[nivel] || 0.15;
  },

  /**
   * Helper: Obtener beneficios del nivel
   */
  getLevelBenefits: (nivel: string): string[] => {
    const benefits: { [key: string]: string[] } = {
      Bronce: [
        'Acceso básico al marketplace',
        'Comisión: 15%',
        'Soporte por email',
      ],
      Plata: [
        'Prioridad en búsquedas',
        'Comisión reducida: 12%',
        'Badge de plata en perfil',
        'Soporte prioritario',
      ],
      Oro: [
        'Máxima prioridad en búsquedas',
        'Comisión reducida: 10%',
        'Badge de oro en perfil',
        'Destacado en leaderboard',
        'Soporte 24/7',
      ],
      Diamante: [
        'Prioridad exclusiva',
        'Menor comisión: 8%',
        'Badge de diamante en perfil',
        'Acceso a funciones premium',
        'Account manager dedicado',
        'Retiros instantáneos',
      ],
    };
    return benefits[nivel] || [];
  },
};
