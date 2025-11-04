"""
Servicio de Profesionales
Gestión de profesionales, KYC, búsqueda geoespacial, portfolio y oficios
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../shared'))

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime
from geoalchemy2.functions import ST_DWithin, ST_MakePoint
from geoalchemy2.elements import WKTElement
from uuid import UUID

from shared.core.database import get_db
from shared.core.security import get_current_user, get_current_active_user
from shared.models.user import User
from shared.models.professional import Profesional
from shared.models.oficio import Oficio
from shared.models.portfolio import PortfolioItem, PortfolioImagen
from shared.models.trabajo import Trabajo
from shared.models.oferta import Oferta
from shared.models.enums import VerificationStatus, UserRole
from shared.schemas.professional import (
    ProfessionalCreate, ProfessionalUpdate, ProfessionalResponse,
    KYCSubmitRequest, KYCStatusResponse
)
from shared.schemas.search import SearchRequest, SearchResponse, ProfessionalSearchResult
from shared.schemas.oficio import OficioCreate, OficioResponse, OficioRead
from shared.schemas.portfolio import PortfolioCreate, PortfolioResponse, PortfolioItemUpdate, PortfolioImagenRead
from shared.schemas.trabajo import TrabajoRead
from shared.schemas.oferta import OfertaRead
from shared.schemas.admin import KYCApproveRequest, UserBanRequest
from shared.middleware.error_handler import add_exception_handlers
from shared.core.health import create_health_check_routes
from shared.core.database import get_db
from shared.cache.cache_manager import cached, SearchCache, invalidate_search_cache

app = FastAPI(
    title="Servicio de Profesionales",
    version="1.0.0",
    description="Gestión de profesionales, KYC, búsqueda geoespacial con PostGIS, portfolio y oficios"
)

# Agregar exception handlers
add_exception_handlers(app)

# Agregar health checks mejorados
health_router = create_health_check_routes(
    db_dependency=Depends(get_db),
    service_name="profesionales"
)
app.include_router(health_router)

# ============================================================================
# HEALTH CHECK
# ============================================================================

# El health check básico ahora se maneja por el router de health

# ============================================================================
# PROFESSIONAL PROFILE ENDPOINTS
# ============================================================================

@app.get("/professional/me", response_model=ProfessionalResponse)
async def get_my_professional_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene el perfil profesional del usuario autenticado.
    Si no existe, lo crea automáticamente.
    """
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden acceder a este endpoint"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    # Si no existe el perfil profesional, crearlo automáticamente
    if not professional:
        print(f"📝 Creando perfil profesional para usuario {current_user.id} ({current_user.email})")
        # Crear con campos válidos según el modelo actual
        professional = Profesional(
            usuario_id=current_user.id,
            # El resto de campos usa sus defaults del modelo
        )
        db.add(professional)
        db.commit()
        db.refresh(professional)
        print("✅ Perfil profesional creado exitosamente")

    # Adaptar la respuesta al schema de lectura
    return ProfessionalResponse.from_professional(professional)

@app.post("/professional/initialize", response_model=ProfessionalResponse, status_code=status.HTTP_201_CREATED)
async def initialize_professional_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Inicializa un perfil profesional para el usuario actual.
    Útil si el perfil no fue creado automáticamente durante el registro.
    """
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden crear un perfil profesional"
        )
    
    # Verificar si ya existe
    existing = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if existing:
        return existing
    
    # Crear nuevo perfil
    professional = Profesional(
        usuario_id=current_user.id,
    )
    db.add(professional)
    db.commit()
    db.refresh(professional)

    return ProfessionalResponse.from_professional(professional)

@app.put("/professional/me", response_model=ProfessionalResponse)
async def update_my_professional_profile(
    profile_data: ProfessionalUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualiza el perfil profesional del usuario autenticado"""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden actualizar su perfil"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    # Actualizar campos
    for field, value in profile_data.dict(exclude_unset=True).items():
        setattr(professional, field, value)
    
    db.commit()
    db.refresh(professional)
    return ProfessionalResponse.from_professional(professional)

# ============================================================================
# KYC ENDPOINTS
# ============================================================================

@app.post("/professional/kyc/submit")
async def submit_kyc(
    kyc_data: KYCSubmitRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Envía documentación KYC para verificación"""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden enviar KYC"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    # Marcar el estado de verificación como en revisión
    professional.estado_verificacion = VerificationStatus.EN_REVISION
    db.commit()
    return ProfessionalResponse.from_professional(professional)

@app.get("/professional/kyc/status", response_model=KYCStatusResponse)
async def get_kyc_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene el estado actual del KYC"""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden ver su estado KYC"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    return ProfessionalResponse.from_professional(professional)

# ============================================================================
# PORTFOLIO ENDPOINTS
# ============================================================================

@app.get("/professional/portfolio", response_model=List[PortfolioResponse])
async def get_my_portfolio(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene el portfolio del profesional autenticado"""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales tienen portfolio"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    portfolio_items = db.query(PortfolioItem).filter(
        PortfolioItem.professional_id == Profesional.id
    ).all()
    
    return portfolio_items

@app.post("/professional/portfolio", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def add_portfolio_item(
    item_data: PortfolioCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Agrega un item al portfolio"""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden agregar items al portfolio"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    new_item = PortfolioItem(
        professional_id=Profesional.id,
        **item_data.dict()
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return new_item

@app.delete("/professional/portfolio/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio_item(
    item_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Elimina un item del portfolio"""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden eliminar items de su portfolio"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    item = db.query(PortfolioItem).filter(
        PortfolioItem.id == item_id,
        PortfolioItem.professional_id == Profesional.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado"
        )
    
    db.delete(item)
    db.commit()

@app.put("/professional/portfolio/{item_id}", response_model=PortfolioResponse)
async def update_portfolio_item(
    item_id: int,
    item_data: PortfolioItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualiza un item del portfolio"""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden actualizar items de su portfolio"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    item = db.query(PortfolioItem).filter(
        PortfolioItem.id == item_id,
        PortfolioItem.professional_id == Profesional.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado"
        )
    
    # Actualizar solo campos proporcionados
    update_data = item_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item

@app.post("/professional/portfolio/{item_id}/images", response_model=List[PortfolioImagenRead])
async def add_portfolio_images(
    item_id: int,
    imagen_urls: List[str],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Agrega múltiples imágenes a un item del portfolio"""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden agregar imágenes a su portfolio"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    item = db.query(PortfolioItem).filter(
        PortfolioItem.id == item_id,
        PortfolioItem.professional_id == Profesional.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado"
        )
    
    # Obtener el máximo orden actual
    max_orden = db.query(func.max(PortfolioImagen.orden)).filter(
        PortfolioImagen.portfolio_item_id == item_id
    ).scalar() or 0
    
    # Crear nuevas imágenes
    new_images = []
    for idx, url in enumerate(imagen_urls):
        new_image = PortfolioImagen(
            portfolio_item_id=item_id,
            imagen_url=url,
            orden=max_orden + idx + 1
        )
        db.add(new_image)
        new_images.append(new_image)
    
    db.commit()
    for img in new_images:
        db.refresh(img)
    
    return new_images

@app.delete("/professional/portfolio/{item_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio_image(
    item_id: int,
    image_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Elimina una imagen específica del portfolio"""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden eliminar imágenes de su portfolio"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    # Verificar que el item pertenece al profesional
    item = db.query(PortfolioItem).filter(
        PortfolioItem.id == item_id,
        PortfolioItem.professional_id == Profesional.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado"
        )
    
    # Buscar y eliminar la imagen
    image = db.query(PortfolioImagen).filter(
        PortfolioImagen.id == image_id,
        PortfolioImagen.portfolio_item_id == item_id
    ).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imagen no encontrada"
        )
    
    db.delete(image)
    db.commit()

# ============================================================================
# OFICIOS (TRADES) ENDPOINTS
# ============================================================================

@app.get("/professional/oficios", response_model=List[OficioResponse])
async def get_my_oficios(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene los oficios del profesional autenticado"""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales tienen oficios"
        )
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    # Devolver los oficios asociados (relación M2M)
    return professional.oficios

@app.post("/professional/oficios", response_model=OficioResponse, status_code=status.HTTP_201_CREATED)
async def add_oficio(
    oficio_data: OficioCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crea un nuevo oficio (uso restringido) y lo devuelve."""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden agregar oficios"
        )
    # Crear el oficio en catálogo (nota: normalmente sería admin)
    new_oficio = Oficio(nombre=oficio_data.nombre, descripcion=oficio_data.descripcion)
    db.add(new_oficio)
    db.commit()
    db.refresh(new_oficio)
    return new_oficio

@app.delete("/professional/oficios/{oficio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_oficio(
    oficio_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Desasocia un oficio del profesional (si estuviera asociado)."""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden eliminar oficios"
        )
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    oficio = db.query(Oficio).filter(Oficio.id == oficio_id).first()
    if not oficio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oficio no encontrado")
    # Quitar asociación si existe
    if oficio in professional.oficios:
        professional.oficios.remove(oficio)
        db.commit()
    return

# ============================================================================
# TRABAJOS Y OFERTAS ENDPOINTS (para profesionales)
# ============================================================================

@app.get("/professional/trabajos", response_model=List[TrabajoRead])
async def get_my_trabajos(
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene los trabajos del profesional autenticado"""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden ver sus trabajos"
        )
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    query = db.query(Trabajo).filter(Trabajo.profesional_id == current_user.id)
    if estado:
        query = query.filter(Trabajo.estado_escrow == estado)
    trabajos = query.order_by(Trabajo.fecha_creacion.desc()).all()
    return trabajos

@app.get("/professional/ofertas", response_model=List[OfertaRead])
async def get_my_ofertas(
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene las ofertas enviadas por el profesional"""
    if current_user.rol != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden ver sus ofertas"
        )
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    query = db.query(Oferta).filter(Oferta.profesional_id == current_user.id)
    if estado:
        query = query.filter(Oferta.estado == estado)
    ofertas = query.order_by(Oferta.fecha_creacion.desc()).all()
    return ofertas

# ============================================================================
# SEARCH ENDPOINTS (PostGIS)
# ============================================================================

@app.post("/search")
async def search_professionals_endpoint(
    search_params: SearchRequest,
    db: Session = Depends(get_db)
):
    """
    Búsqueda geoespacial avanzada de profesionales con PostGIS.
    
    Características:
    - Búsqueda por radio geográfico
    - Filtros por oficio, habilidades, rating
    - Ordenamiento por distancia, rating, precio
    - Paginación
    - Cache de resultados (3 minutos)
    """
    
    query = db.query(Profesional).join(User).filter(
        User.is_active == True,
        User.rol == UserRole.PROFESIONAL,
        Profesional.estado_verificacion == VerificationStatus.APROBADO
    )

    # Filtro por oficio (por nombre, parcial, case-insensitive)
    if getattr(search_params, 'oficio', None):
        query = query.join(Profesional.oficios).filter(
            func.lower(Oficio.nombre).contains(search_params.oficio.lower())
        )

    # Filtro por rating mínimo (si viene del frontend)
    if getattr(search_params, 'rating_minimo', None):
        query = query.filter(Profesional.rating_promedio >= search_params.rating_minimo)

    # Filtro por rango de precios
    if getattr(search_params, 'precio_minimo', None):
        query = query.filter(Profesional.tarifa_por_hora >= search_params.precio_minimo)
    if getattr(search_params, 'precio_maximo', None):
        query = query.filter(Profesional.tarifa_por_hora <= search_params.precio_maximo)

    # Ordenamiento
    ordenar_por = getattr(search_params, 'ordenar_por', 'rating') or 'rating'
    if ordenar_por == 'precio':
        query = query.order_by(Profesional.tarifa_por_hora.asc().nulls_last())
    else:
        # Por defecto, rating desc
        query = query.order_by(Profesional.rating_promedio.desc())

    # Paginación
    skip = getattr(search_params, 'skip', 0) or 0
    limit = getattr(search_params, 'limit', 100) or 100
    total = query.count()
    professionals = query.offset(skip).limit(limit).all()

    # Cálculo de distancia (opcional)
    lat = getattr(search_params, 'latitude', None)
    lng = getattr(search_params, 'longitude', None)
    point = None
    if lat is not None and lng is not None:
        point = WKTElement(f'POINT({lng} {lat})', srid=4326)

    resultados = []
    for prof in professionals:
        distancia_km = None
        if point is not None and prof.base_location is not None:
            distancia = db.query(
                func.ST_Distance(Profesional.base_location, point)
            ).filter(Profesional.id == prof.id).scalar()
            distancia_km = float(distancia) / 1000.0 if distancia is not None else None

        # Tomar el primer oficio como principal para mostrar
        oficio_nombre = prof.oficios[0].nombre if getattr(prof, 'oficios', []) else ''

        resultados.append({
            "id": str(prof.id),
            "nombre": prof.usuario.nombre,
            "apellido": prof.usuario.apellido,
            "oficio": oficio_nombre,
            "tarifa_por_hora": float(prof.tarifa_por_hora) if prof.tarifa_por_hora is not None else None,
            "calificacion_promedio": float(prof.rating_promedio) if prof.rating_promedio is not None else 0.0,
            "cantidad_resenas": int(prof.total_resenas) if prof.total_resenas is not None else 0,
            "distancia_km": distancia_km,
            "nivel_profesional": prof.nivel.value,
            "puntos_experiencia": int(prof.puntos_experiencia),
            "avatar_url": prof.usuario.avatar_url,
        })

    return JSONResponse(content={
        "total": total,
        "resultados": resultados,
        "pagina": (skip // limit) + 1,
        "total_paginas": (total + limit - 1) // limit,
    })

# ============================================================================
# PUBLIC ENDPOINTS
# ============================================================================

@app.get("/public/professional/{prof_id}", response_model=ProfessionalResponse)
async def get_public_professional_profile(
    prof_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene el perfil público de un profesional"""
    professional = db.query(Profesional).filter(
        Profesional.id == prof_id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    # Verificar que el usuario esté activo y el KYC aprobado
    user = professional.usuario
    if not user or not user.is_active or professional.estado_verificacion != VerificationStatus.APROBADO:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no disponible"
        )
    
    return ProfessionalResponse.from_professional(professional)

@app.get("/public/professional/{prof_id}/portfolio", response_model=List[PortfolioResponse])
async def get_public_portfolio(
    prof_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene el portfolio público de un profesional"""
    professional = db.query(Profesional).filter(
        Profesional.id == prof_id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    portfolio_items = db.query(PortfolioItem).filter(
        PortfolioItem.professional_id == prof_id
    ).all()
    
    return portfolio_items

@app.get("/public/oficios")
async def get_all_oficios(
    db: Session = Depends(get_db)
):
    """Obtiene lista de todos los oficios disponibles con sus IDs"""
    oficios = db.query(Oficio).all()
    result = []
    for oficio in oficios:
        result.append({
            "id": str(oficio.id),
            "nombre": oficio.nombre,
            "descripcion": oficio.descripcion
        })
    return result

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@app.get("/admin/kyc/pending")
async def get_pending_kyc(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene lista de KYCs pendientes de revisión (solo admin)"""
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden acceder a este endpoint"
        )
    
    pending_kycs = db.query(Profesional).filter(
        Profesional.estado_verificacion == VerificationStatus.PENDIENTE
    ).all()
    
    return pending_kycs

@app.put("/admin/kyc/{prof_id}/approve")
async def approve_kyc(
    prof_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Aprueba el KYC de un profesional (solo admin)"""
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden aprobar KYC"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.id == prof_id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    professional.estado_verificacion = VerificationStatus.APROBADO
    
    db.commit()
    
    return {"message": "KYC aprobado correctamente"}

@app.put("/admin/kyc/{prof_id}/reject")
async def reject_kyc(
    prof_id: UUID,
    request: KYCApproveRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Rechaza el KYC de un profesional (solo admin)"""
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden rechazar KYC"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.id == prof_id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    professional.estado_verificacion = VerificationStatus.RECHAZADO
    
    db.commit()
    
    return {"message": "KYC rechazado", "reason": request.razon}

@app.put("/admin/users/{user_id}/ban")
async def ban_user(
    user_id: UUID,
    request: UserBanRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Banea un usuario (solo admin)"""
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden banear usuarios"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    if user.rol == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se puede banear a un administrador"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": f"Usuario {user.email} baneado correctamente", "reason": request.reason}

@app.put("/admin/users/{user_id}/unban")
async def unban_user(
    user_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Desbanea un usuario (solo admin)"""
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden desbanear usuarios"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    user.is_active = True
    db.commit()
    
    return {"message": f"Usuario {user.email} desbaneado correctamente"}

# ============================================================================
# SERVICIOS INSTANTÁNEOS (PROYECTOS PUBLICADOS POR PROFESIONALES)
# ============================================================================

from shared.models.servicio_instantaneo import ServicioInstantaneo
from shared.schemas.servicio_instantaneo import (
    ServicioInstantaneoCreate,
    ServicioInstantaneoRead,
    ServicioInstantaneoUpdate
)

@app.post("/profesional/servicios", response_model=ServicioInstantaneoRead, status_code=status.HTTP_201_CREATED)
async def crear_servicio_publicado(
    servicio_data: ServicioInstantaneoCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Crear un nuevo servicio/proyecto publicado por el profesional.
    Solo profesionales y admins pueden crear servicios.
    """
    if current_user.rol not in [UserRole.PROFESIONAL, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden publicar servicios"
        )
    
    # Verificar que el profesional existe
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado. Debes registrarte como profesional primero."
        )
    
    # Verificar que el oficio existe
    oficio = db.query(Oficio).filter(Oficio.id == servicio_data.oficio_id).first()
    if not oficio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Oficio con ID {servicio_data.oficio_id} no encontrado"
        )
    
    # Crear el servicio
    nuevo_servicio = ServicioInstantaneo(
        nombre=servicio_data.nombre,
        descripcion=servicio_data.descripcion,
        precio_fijo=servicio_data.precio_fijo,
        oficio_id=servicio_data.oficio_id,
        profesional_id=professional.id  # Usar professional.id en lugar de Profesional.id
    )
    
    db.add(nuevo_servicio)
    db.commit()
    db.refresh(nuevo_servicio)
    
    return nuevo_servicio

@app.get("/profesional/servicios/me", response_model=List[ServicioInstantaneoRead])
async def listar_mis_servicios(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Listar todos los servicios/proyectos publicados por el profesional autenticado.
    """
    if current_user.rol not in [UserRole.PROFESIONAL, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden ver sus servicios"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    servicios = db.query(ServicioInstantaneo).filter(
        ServicioInstantaneo.profesional_id == professional.id  # Usar professional.id
    ).all()
    
    return servicios

@app.put("/profesional/servicios/{servicio_id}", response_model=ServicioInstantaneoRead)
async def actualizar_servicio(
    servicio_id: str,
    servicio_data: ServicioInstantaneoUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar un servicio/proyecto publicado.
    Solo el profesional dueño o admin puede actualizar.
    """
    if current_user.rol not in [UserRole.PROFESIONAL, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden actualizar servicios"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    servicio = db.query(ServicioInstantaneo).filter(
        ServicioInstantaneo.id == servicio_id,
        ServicioInstantaneo.profesional_id == professional.id  # Usar professional.id
    ).first()
    
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado o no tienes permiso para modificarlo"
        )
    
    # Actualizar campos
    if servicio_data.nombre is not None:
        servicio.nombre = servicio_data.nombre
    if servicio_data.descripcion is not None:
        servicio.descripcion = servicio_data.descripcion
    if servicio_data.precio_fijo is not None:
        servicio.precio_fijo = servicio_data.precio_fijo
    
    db.commit()
    db.refresh(servicio)
    
    return servicio

@app.delete("/profesional/servicios/{servicio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_servicio(
    servicio_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar un servicio/proyecto publicado.
    Solo el profesional dueño o admin puede eliminar.
    """
    if current_user.rol not in [UserRole.PROFESIONAL, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden eliminar servicios"
        )
    
    professional = db.query(Profesional).filter(
        Profesional.usuario_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    servicio = db.query(ServicioInstantaneo).filter(
        ServicioInstantaneo.id == servicio_id,
        ServicioInstantaneo.profesional_id == professional.id  # Usar professional.id
    ).first()
    
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado o no tienes permiso para eliminarlo"
        )
    
    db.delete(servicio)
    db.commit()
    
    return None

@app.get("/servicios", response_model=List[ServicioInstantaneoRead])
async def listar_servicios_publicos(
    oficio_id: Optional[str] = Query(None, description="Filtrar por oficio"),
    db: Session = Depends(get_db)
):
    """
    Listar todos los servicios/proyectos publicados (Marketplace público).
    Puede filtrar por oficio_id.
    """
    query = db.query(ServicioInstantaneo)
    
    if oficio_id:
        query = query.filter(ServicioInstantaneo.oficio_id == oficio_id)
    
    servicios = query.all()
    
    # Enriquecer con información del profesional y oficio
    resultado = []
    for servicio in servicios:
        servicio_dict = {
            "id": servicio.id,
            "nombre": servicio.nombre,
            "descripcion": servicio.descripcion,
            "precio_fijo": servicio.precio_fijo,
            "oficio_id": servicio.oficio_id,
            "profesional_id": servicio.profesional_id,
            "fecha_creacion": servicio.fecha_creacion,
            "profesional": {
                "id": servicio.profesional.id,
                "user_id": servicio.profesional.usuario_id,
                "nombre": servicio.profesional.user.full_name if servicio.profesional.user else None,
                "email": servicio.profesional.user.email if servicio.profesional.user else None,
                "nivel": servicio.profesional.nivel.value if servicio.profesional.nivel else None,
                "rating_promedio": float(servicio.profesional.rating_promedio) if servicio.profesional.rating_promedio else 0.0,
            } if servicio.profesional else None,
            "oficio": {
                "id": servicio.oficio.id,
                "nombre": servicio.oficio.nombre,
                "categoria": servicio.oficio.categoria,
            } if servicio.oficio else None,
        }
        resultado.append(servicio_dict)
    
    return resultado

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)



