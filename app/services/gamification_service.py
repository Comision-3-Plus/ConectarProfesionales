"""
Servicio de Gamificación - Gestión de niveles y comisiones del profesional.
"""
from decimal import Decimal
from app.models.professional import Profesional
from app.models.enums import ProfessionalLevel


# ==========================================
# CONFIGURACIÓN DE NIVELES
# ==========================================
# Formato: "NIVEL": (puntos_minimos, tasa_comision)
NIVELES = {
    ProfessionalLevel.BRONCE: (0, Decimal("0.20")),      # 0+ puntos → 20% comisión
    ProfessionalLevel.PLATA: (1000, Decimal("0.18")),    # 1000+ puntos → 18% comisión
    ProfessionalLevel.ORO: (5000, Decimal("0.15")),      # 5000+ puntos → 15% comisión
    ProfessionalLevel.DIAMANTE: (15000, Decimal("0.10")) # 15000+ puntos → 10% comisión
}


def check_for_level_up(profesional: Profesional) -> bool:
    """
    Verifica si el profesional alcanzó un nuevo nivel y actualiza su nivel y comisión.
    
    **Esta es la función CORE del sistema de gamificación (Módulo 7).**
    
    Flujo:
    1. Obtiene los puntos actuales del profesional
    2. Determina el nivel más alto que puede alcanzar con esos puntos
    3. Si es diferente al nivel actual:
       - Actualiza profesional.nivel
       - Actualiza profesional.tasa_comision_actual
       - Retorna True (indicando que subió de nivel)
    4. Si no cambió de nivel, retorna False
    
    **IMPORTANTE:**
    - Esta función NO hace commit a la base de datos
    - Solo modifica el objeto profesional en memoria
    - El commit debe hacerse en el endpoint que la llama (atomicidad)
    
    Args:
        profesional: Objeto Profesional a evaluar
        
    Returns:
        bool: True si el profesional subió de nivel, False si no
        
    Example:
        >>> profesional.puntos_experiencia = 1500
        >>> profesional.nivel = ProfessionalLevel.BRONCE
        >>> subio = check_for_level_up(profesional)
        >>> print(subio)  # True
        >>> print(profesional.nivel)  # ProfessionalLevel.PLATA
        >>> print(profesional.tasa_comision_actual)  # 0.18
    """
    current_points = profesional.puntos_experiencia
    current_level = profesional.nivel
    
    # Determinar el nuevo nivel (iterar de mayor a menor)
    new_level = ProfessionalLevel.BRONCE  # Por defecto es BRONCE
    new_comision = NIVELES[ProfessionalLevel.BRONCE][1]
    
    # Ordenar niveles por puntos requeridos (de mayor a menor)
    niveles_ordenados = sorted(
        NIVELES.items(),
        key=lambda x: x[1][0],  # Ordenar por puntos_minimos
        reverse=True
    )
    
    # Encontrar el nivel más alto que el profesional puede alcanzar
    for nivel, (puntos_minimos, tasa_comision) in niveles_ordenados:
        if current_points >= puntos_minimos:
            new_level = nivel
            new_comision = tasa_comision
            break
    
    # Verificar si hubo cambio de nivel
    if new_level != current_level:
        # ¡SUBIDA DE NIVEL!
        print("=" * 60)
        print("🎉 ¡SUBIDA DE NIVEL!")
        print(f"   Nivel Anterior: {current_level.value}")
        print(f"   Nivel Nuevo: {new_level.value}")
        print(f"   Puntos Actuales: {current_points}")
        print(f"   Comisión Anterior: {float(profesional.tasa_comision_actual) * 100}%")
        print(f"   Comisión Nueva: {float(new_comision) * 100}%")
        print("=" * 60)
        
        # Actualizar el profesional (en memoria, sin commit)
        profesional.nivel = new_level
        profesional.tasa_comision_actual = new_comision
        
        return True
    
    # No hubo cambio de nivel
    return False


def get_next_level_info(profesional: Profesional) -> dict:
    """
    Obtiene información sobre el siguiente nivel que puede alcanzar el profesional.
    
    Útil para mostrar en el frontend:
    - Cuántos puntos faltan para el siguiente nivel
    - Cuál será la próxima comisión
    - Porcentaje de progreso
    
    Args:
        profesional: Objeto Profesional a evaluar
        
    Returns:
        dict con:
            - next_level: Nombre del siguiente nivel (o None si ya está en DIAMANTE)
            - points_needed: Puntos que faltan para el siguiente nivel
            - next_commission: Tasa de comisión del siguiente nivel
            - progress_percentage: Porcentaje de progreso hacia el siguiente nivel
            
    Example:
        >>> profesional.puntos_experiencia = 500
        >>> info = get_next_level_info(profesional)
        >>> print(info)
        {
            "next_level": "PLATA",
            "points_needed": 500,
            "next_commission": 0.18,
            "progress_percentage": 50.0
        }
    """
    current_points = profesional.puntos_experiencia
    current_level = profesional.nivel
    
    # Ordenar niveles por puntos requeridos (de menor a mayor)
    niveles_ordenados = sorted(
        NIVELES.items(),
        key=lambda x: x[1][0]  # Ordenar por puntos_minimos
    )
    
    # Encontrar el siguiente nivel
    next_level = None
    next_level_points = None
    next_commission = None
    current_level_points = NIVELES[current_level][0]
    
    for nivel, (puntos_minimos, tasa_comision) in niveles_ordenados:
        if puntos_minimos > current_points:
            next_level = nivel
            next_level_points = puntos_minimos
            next_commission = tasa_comision
            break
    
    if next_level is None:
        # Ya está en el nivel máximo (DIAMANTE)
        return {
            "next_level": None,
            "points_needed": 0,
            "next_commission": None,
            "progress_percentage": 100.0
        }
    
    # Calcular puntos que faltan
    points_needed = next_level_points - current_points
    
    # Calcular porcentaje de progreso
    points_range = next_level_points - current_level_points
    points_progress = current_points - current_level_points
    progress_percentage = (points_progress / points_range * 100) if points_range > 0 else 0
    
    return {
        "next_level": next_level.value,
        "points_needed": points_needed,
        "next_commission": float(next_commission),
        "progress_percentage": round(progress_percentage, 2)
    }


def get_all_levels_info() -> list:
    """
    Retorna información de todos los niveles disponibles.
    
    Útil para mostrar en el frontend la tabla completa de niveles.
    
    Returns:
        list de dict con info de cada nivel:
            - nivel: Nombre del nivel
            - puntos_minimos: Puntos requeridos
            - comision: Tasa de comisión (como porcentaje)
    """
    niveles_ordenados = sorted(
        NIVELES.items(),
        key=lambda x: x[1][0]  # Ordenar por puntos_minimos
    )
    
    return [
        {
            "nivel": nivel.value,
            "puntos_minimos": puntos_minimos,
            "comision": float(tasa_comision) * 100  # Convertir a porcentaje
        }
        for nivel, (puntos_minimos, tasa_comision) in niveles_ordenados
    ]
