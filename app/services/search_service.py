from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import and_
from geoalchemy2 import WKTElement
from geoalchemy2.functions import ST_DWithin, ST_MakePoint
from app.models.professional import Profesional
from app.models.oficio import professional_oficios
from app.models.user import Usuario
from app.models.enums import VerificationStatus
from app.schemas.search import SearchProfessionalsRequest
from app.schemas.professional import ProfessionalProfileRead


def search_professionals_by_location(
    db: Session,
    params: SearchProfessionalsRequest
) -> List[ProfessionalProfileRead]:
    """
    Busca profesionales aprobados que ofrecen el oficio solicitado
    y que cubren la ubicación del cliente según su radio de cobertura.
    
    Usa PostGIS ST_DWithin para calcular si el punto del cliente
    está dentro del radio de cobertura del profesional.
    
    Soporta filtros opcionales por nivel, acepta_instant y ordenamiento.
    """
    # Crear punto geoespacial del cliente (SRID 4326 = WGS84)
    punto_cliente = ST_MakePoint(params.lng, params.lat)
    punto_cliente = WKTElement(f'POINT({params.lng} {params.lat})', srid=4326)
    
    # Construir filtros base
    filtros = [
        # Solo profesionales aprobados
        Profesional.estado_verificacion == VerificationStatus.APROBADO,
        # Que ofrezcan el oficio solicitado
        professional_oficios.c.oficio_id == params.oficio_id,
        # Que cubran la ubicación del cliente
        # ST_DWithin usa metros, por eso multiplicamos km * 1000
        ST_DWithin(
            Profesional.base_location,
            punto_cliente,
            Profesional.radio_cobertura_km * 1000
        )
    ]
    
    # Agregar filtros opcionales dinámicamente
    if params.nivel is not None:
        filtros.append(Profesional.nivel == params.nivel)
    
    if params.acepta_instant is not None:
        filtros.append(Profesional.acepta_instant == params.acepta_instant)
    
    # Query con joins y filtros
    query = (
        db.query(Profesional)
        .join(Usuario, Profesional.usuario_id == Usuario.id)
        .join(professional_oficios, Profesional.id == professional_oficios.c.profesional_id)
        .filter(and_(*filtros))
    )
    
    # Ordenamiento dinámico
    if params.sort_by == "rating":
        # Preparado para cuando se implemente el campo rating en Módulo 6
        query = query.order_by(Profesional.rating.desc())
    else:
        # Default: ordenar por nivel (Diamante primero)
        query = query.order_by(Profesional.nivel.desc())
    
    profesionales = query.all()
    
    # Convertir a schemas Pydantic usando el helper method
    result = []
    for prof in profesionales:
        result.append(ProfessionalProfileRead.from_professional(prof))
    
    return result
