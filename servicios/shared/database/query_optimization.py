"""
Helpers para optimización de queries SQLAlchemy.
Incluye patrones para evitar N+1 queries y eager loading.
"""
from sqlalchemy.orm import joinedload, selectinload, subqueryload, contains_eager
from typing import Any, List
from sqlalchemy.orm import Query

# ============================================================================
# EAGER LOADING HELPERS
# ============================================================================

class QueryOptimizer:
    """
    Helper class para optimizar queries SQLAlchemy.
    Provee métodos comunes para evitar N+1 queries.
    """
    
    @staticmethod
    def trabajos_with_relations(query: Query) -> Query:
        """
        Optimiza query de trabajos con eager loading de relaciones.
        
        Usado en: Listado de trabajos de cliente/profesional
        
        Args:
            query: Query base de Trabajo
            
        Returns:
            Query optimizado con joinedload
            
        Usage:
            trabajos = QueryOptimizer.trabajos_with_relations(
                db.query(Trabajo).filter(Trabajo.cliente_id == user_id)
            ).all()
        """
        return query.options(
            joinedload("profesional").joinedload("user"),
            joinedload("cliente"),
            joinedload("oferta"),
            selectinload("resena")
        )
    
    @staticmethod
    def ofertas_with_relations(query: Query) -> Query:
        """
        Optimiza query de ofertas con eager loading de relaciones.
        
        Usado en: Listado de ofertas de cliente/profesional
        """
        return query.options(
            joinedload("profesional").joinedload("user"),
            joinedload("cliente")
        )
    
    @staticmethod
    def profesionales_with_details(query: Query) -> Query:
        """
        Optimiza query de profesionales con detalles completos.
        
        Usado en: Búsqueda de profesionales, perfil público
        """
        return query.options(
            joinedload("user"),
            joinedload("oficio_principal"),
            selectinload("portfolio_items"),
            selectinload("resenas").joinedload("trabajo").joinedload("cliente")
        )
    
    @staticmethod
    def portfolio_with_images(query: Query) -> Query:
        """
        Optimiza query de portfolio con imágenes.
        
        Usado en: Vista de portfolio
        """
        return query.options(
            selectinload("images")
        )
    
    @staticmethod
    def resenas_with_context(query: Query) -> Query:
        """
        Optimiza query de reseñas con contexto completo.
        
        Usado en: Vista pública de reseñas
        """
        return query.options(
            joinedload("trabajo"),
            joinedload("cliente"),
            joinedload("profesional").joinedload("user")
        )


# ============================================================================
# QUERY BUILDERS
# ============================================================================

def build_trabajos_query_for_cliente(db, cliente_id: str, estado: str = None):
    """
    Construye query optimizado para trabajos de un cliente.
    
    Args:
        db: Session de SQLAlchemy
        cliente_id: ID del cliente
        estado: Estado del trabajo (opcional)
        
    Returns:
        Query list optimizado
    """
    from shared.models.trabajo import Trabajo
    
    query = db.query(Trabajo).filter(Trabajo.cliente_id == cliente_id)
    
    if estado:
        query = query.filter(Trabajo.estado == estado)
    
    # Eager loading
    query = QueryOptimizer.trabajos_with_relations(query)
    
    # Ordenar por fecha descendente
    query = query.order_by(Trabajo.fecha_creacion.desc())
    
    return query.all()


def build_trabajos_query_for_profesional(db, profesional_id: str, estado: str = None):
    """
    Construye query optimizado para trabajos de un profesional.
    
    Args:
        db: Session de SQLAlchemy
        profesional_id: ID del profesional (user_id)
        estado: Estado del trabajo (opcional)
        
    Returns:
        Query list optimizado
    """
    from shared.models.trabajo import Trabajo
    
    query = db.query(Trabajo).filter(Trabajo.profesional_id == profesional_id)
    
    if estado:
        query = query.filter(Trabajo.estado == estado)
    
    # Eager loading
    query = QueryOptimizer.trabajos_with_relations(query)
    
    # Ordenar por fecha descendente
    query = query.order_by(Trabajo.fecha_creacion.desc())
    
    return query.all()


def build_profesionales_search_query(
    db,
    latitude: float,
    longitude: float,
    radio_km: int,
    oficio_id: int = None,
    rating_minimo: float = None,
    precio_maximo: float = None
):
    """
    Construye query optimizado para búsqueda de profesionales.
    
    Args:
        db: Session de SQLAlchemy
        latitude: Latitud del punto de búsqueda
        longitude: Longitud del punto de búsqueda
        radio_km: Radio de búsqueda en kilómetros
        oficio_id: ID del oficio (opcional)
        rating_minimo: Rating mínimo (opcional)
        precio_maximo: Precio máximo por hora (opcional)
        
    Returns:
        Query list optimizado
    """
    from shared.models.professional import Professional
    from shared.models.enums import KYCStatus
    from sqlalchemy import func
    from geoalchemy2 import Geography
    
    # Crear punto de búsqueda
    punto = f'SRID=4326;POINT({longitude} {latitude})'
    
    # Query base
    query = db.query(
        Professional,
        func.ST_Distance(
            Professional.ubicacion,
            func.ST_GeogFromText(punto)
        ).label('distancia')
    ).filter(
        Professional.kyc_status == KYCStatus.APROBADO,
        Professional.is_active == True,
        func.ST_DWithin(
            Professional.ubicacion,
            func.ST_GeogFromText(punto),
            radio_km * 1000  # Convertir km a metros
        )
    )
    
    # Filtros opcionales
    if oficio_id:
        query = query.filter(Professional.oficio_principal_id == oficio_id)
    
    if rating_minimo:
        query = query.filter(Professional.rating_promedio >= rating_minimo)
    
    if precio_maximo:
        query = query.filter(Professional.precio_por_hora <= precio_maximo)
    
    # Eager loading
    query = query.options(
        joinedload(Professional.user),
        joinedload(Professional.oficio_principal),
        selectinload(Professional.portfolio_items).selectinload("images")
    )
    
    # Ordenar por distancia
    query = query.order_by('distancia')
    
    return query.all()


# ============================================================================
# BATCH LOADING HELPERS
# ============================================================================

def batch_load_portfolio_images(db, portfolio_items: List[Any]):
    """
    Carga imágenes de portfolio en batch para evitar N+1.
    
    Args:
        db: Session de SQLAlchemy
        portfolio_items: Lista de PortfolioItem
    """
    from shared.models.portfolio import PortfolioImage
    
    if not portfolio_items:
        return
    
    portfolio_ids = [item.id for item in portfolio_items]
    
    images = db.query(PortfolioImage).filter(
        PortfolioImage.portfolio_item_id.in_(portfolio_ids)
    ).all()
    
    # Crear mapa de imágenes por portfolio_item_id
    images_map = {}
    for image in images:
        if image.portfolio_item_id not in images_map:
            images_map[image.portfolio_item_id] = []
        images_map[image.portfolio_item_id].append(image)
    
    # Asignar imágenes a items
    for item in portfolio_items:
        item.images = images_map.get(item.id, [])


def batch_load_resenas(db, profesionales: List[Any]):
    """
    Carga reseñas de profesionales en batch.
    
    Args:
        db: Session de SQLAlchemy
        profesionales: Lista de Professional
    """
    from shared.models.resena import Resena
    from shared.models.trabajo import Trabajo
    
    if not profesionales:
        return
    
    profesional_ids = [prof.user_id for prof in profesionales]
    
    resenas = db.query(Resena).join(Trabajo).filter(
        Trabajo.profesional_id.in_(profesional_ids)
    ).options(
        joinedload(Resena.cliente)
    ).all()
    
    # Crear mapa de reseñas por profesional_id
    resenas_map = {}
    for resena in resenas:
        prof_id = resena.trabajo.profesional_id
        if prof_id not in resenas_map:
            resenas_map[prof_id] = []
        resenas_map[prof_id].append(resena)
    
    # Asignar reseñas a profesionales
    for prof in profesionales:
        prof.resenas = resenas_map.get(prof.user_id, [])


# ============================================================================
# PAGINATION HELPERS
# ============================================================================

def paginate_query(query: Query, page: int = 1, per_page: int = 20):
    """
    Pagina una query SQLAlchemy.
    
    Args:
        query: Query a paginar
        page: Número de página (1-indexed)
        per_page: Items por página
        
    Returns:
        Dict con resultados paginados
        
    Usage:
        result = paginate_query(
            db.query(Professional),
            page=2,
            per_page=10
        )
        
        # result = {
        #     "items": [...],
        #     "total": 100,
        #     "page": 2,
        #     "per_page": 10,
        #     "pages": 10
        # }
    """
    # Contar total
    total = query.count()
    
    # Calcular offset
    offset = (page - 1) * per_page
    
    # Obtener items
    items = query.limit(per_page).offset(offset).all()
    
    # Calcular páginas totales
    pages = (total + per_page - 1) // per_page
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
        "has_next": page < pages,
        "has_prev": page > 1
    }


# ============================================================================
# AGGREGATION HELPERS
# ============================================================================

def get_profesional_stats(db, profesional_id: str):
    """
    Obtiene estadísticas de un profesional con una sola query.
    
    Args:
        db: Session de SQLAlchemy
        profesional_id: ID del profesional (user_id)
        
    Returns:
        Dict con estadísticas
    """
    from shared.models.trabajo import Trabajo
    from shared.models.resena import Resena
    from shared.models.enums import TrabajoEstado
    from sqlalchemy import func
    
    # Stats de trabajos
    trabajo_stats = db.query(
        func.count(Trabajo.id).label('total_trabajos'),
        func.count(Trabajo.id).filter(
            Trabajo.estado == TrabajoEstado.COMPLETADO
        ).label('trabajos_completados'),
        func.sum(Trabajo.monto_liberado).label('ingresos_totales'),
        func.sum(Trabajo.comision_plataforma).label('comisiones_pagadas')
    ).filter(
        Trabajo.profesional_id == profesional_id
    ).first()
    
    # Stats de reseñas
    resena_stats = db.query(
        func.count(Resena.id).label('total_resenas'),
        func.avg(Resena.rating).label('rating_promedio')
    ).join(Trabajo).filter(
        Trabajo.profesional_id == profesional_id
    ).first()
    
    return {
        "total_trabajos": trabajo_stats.total_trabajos or 0,
        "trabajos_completados": trabajo_stats.trabajos_completados or 0,
        "ingresos_totales": float(trabajo_stats.ingresos_totales or 0),
        "comisiones_pagadas": float(trabajo_stats.comisiones_pagadas or 0),
        "total_resenas": resena_stats.total_resenas or 0,
        "rating_promedio": float(resena_stats.rating_promedio or 0)
    }
