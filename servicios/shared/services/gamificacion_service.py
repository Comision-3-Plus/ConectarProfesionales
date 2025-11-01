"""
Servicio de gamificación para profesionales.
Maneja puntos, niveles y recompensas.
"""
from decimal import Decimal
from sqlalchemy.orm import Session
from shared.models.professional import Profesional
from shared.models.enums import ProfessionalLevel
from shared.core.config import settings
import logging

logger = logging.getLogger(__name__)


class GamificacionService:
    """Servicio para gestionar la gamificación de profesionales"""
    
    # Umbrales de puntos para cada nivel
    NIVEL_UMBRALES = {
        ProfessionalLevel.BRONCE: 0,
        ProfessionalLevel.PLATA: 500,
        ProfessionalLevel.ORO: 2000,
        ProfessionalLevel.DIAMANTE: 5000,
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    def calcular_nivel(self, puntos: int) -> ProfessionalLevel:
        """Calcula el nivel basado en los puntos acumulados"""
        if puntos >= self.NIVEL_UMBRALES[ProfessionalLevel.DIAMANTE]:
            return ProfessionalLevel.DIAMANTE
        elif puntos >= self.NIVEL_UMBRALES[ProfessionalLevel.ORO]:
            return ProfessionalLevel.ORO
        elif puntos >= self.NIVEL_UMBRALES[ProfessionalLevel.PLATA]:
            return ProfessionalLevel.PLATA
        else:
            return ProfessionalLevel.BRONCE
    
    def agregar_puntos_trabajo(self, profesional: Profesional, monto_trabajo: Decimal) -> int:
        """
        Agrega puntos al profesional por completar un trabajo.
        
        Args:
            profesional: El profesional al que agregar puntos
            monto_trabajo: El monto del trabajo completado
            
        Returns:
            Cantidad de puntos agregados
        """
        puntos_agregados = settings.PUNTOS_POR_TRABAJO
        profesional.puntos_totales += puntos_agregados
        
        # Actualizar nivel si es necesario
        nuevo_nivel = self.calcular_nivel(profesional.puntos_totales)
        if nuevo_nivel != profesional.nivel_gamificacion:
            profesional.nivel_gamificacion = nuevo_nivel
            logger.info(f"Profesional {profesional.id} subió a nivel {nuevo_nivel}")
        
        self.db.commit()
        return puntos_agregados
    
    def agregar_puntos_resena(self, profesional: Profesional, calificacion: int) -> int:
        """
        Agrega puntos al profesional por recibir una reseña.
        
        Args:
            profesional: El profesional al que agregar puntos
            calificacion: Calificación recibida (1-5)
            
        Returns:
            Cantidad de puntos agregados
        """
        if calificacion == 5:
            puntos_agregados = settings.PUNTOS_REVIEW_5_ESTRELLAS
        elif calificacion == 4:
            puntos_agregados = settings.PUNTOS_REVIEW_4_ESTRELLAS
        else:
            puntos_agregados = 0
        
        if puntos_agregados > 0:
            profesional.puntos_totales += puntos_agregados
            
            # Actualizar nivel si es necesario
            nuevo_nivel = self.calcular_nivel(profesional.puntos_totales)
            if nuevo_nivel != profesional.nivel_gamificacion:
                profesional.nivel_gamificacion = nuevo_nivel
                logger.info(f"Profesional {profesional.id} subió a nivel {nuevo_nivel}")
            
            self.db.commit()
        
        return puntos_agregados
    
    def obtener_progreso_nivel(self, profesional: Profesional) -> dict:
        """
        Obtiene información sobre el progreso del profesional hacia el siguiente nivel.
        
        Returns:
            Dict con información de progreso
        """
        nivel_actual = profesional.nivel_gamificacion
        puntos_actuales = profesional.puntos_totales
        
        # Encontrar el siguiente nivel
        niveles_ordenados = [
            ProfessionalLevel.BRONCE,
            ProfessionalLevel.PLATA,
            ProfessionalLevel.ORO,
            ProfessionalLevel.DIAMANTE
        ]
        
        idx_actual = niveles_ordenados.index(nivel_actual)
        if idx_actual < len(niveles_ordenados) - 1:
            nivel_siguiente = niveles_ordenados[idx_actual + 1]
            puntos_necesarios = self.NIVEL_UMBRALES[nivel_siguiente]
            puntos_para_siguiente = puntos_necesarios - puntos_actuales
            progreso_porcentaje = (puntos_actuales / puntos_necesarios) * 100
        else:
            # Ya está en el nivel máximo
            nivel_siguiente = None
            puntos_necesarios = None
            puntos_para_siguiente = 0
            progreso_porcentaje = 100.0
        
        return {
            "nivel_actual": nivel_actual,
            "puntos_actuales": puntos_actuales,
            "nivel_siguiente": nivel_siguiente,
            "puntos_necesarios": puntos_necesarios,
            "puntos_para_siguiente": puntos_para_siguiente,
            "progreso_porcentaje": round(progreso_porcentaje, 2)
        }


# Función auxiliar para obtener una instancia del servicio
def get_gamificacion_service(db: Session) -> GamificacionService:
    """Factory function para obtener el servicio de gamificación"""
    return GamificacionService(db)
