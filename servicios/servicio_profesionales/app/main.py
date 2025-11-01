"""
Servicio de Profesionales
Gestión de profesionales, KYC, búsqueda geoespacial, portfolio y oficios
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../shared'))

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime
from geoalchemy2.functions import ST_DWithin, ST_MakePoint
from geoalchemy2.elements import WKTElement

from shared.core.database import get_db
from shared.core.security import get_current_user, get_current_active_user
from shared.models.user import User
from shared.models.professional import Professional
from shared.models.oficio import Oficio
from shared.models.portfolio import PortfolioItem
from shared.models.enums import KYCStatus, UserRole
from shared.schemas.professional import (
    ProfessionalCreate, ProfessionalUpdate, ProfessionalResponse,
    KYCSubmitRequest, KYCStatusResponse
)
from shared.schemas.search import SearchRequest, SearchResponse, ProfessionalSearchResult
from shared.schemas.oficio import OficioCreate, OficioResponse
from shared.schemas.portfolio import PortfolioCreate, PortfolioResponse
from shared.schemas.admin import KYCApproveRequest, UserBanRequest

app = FastAPI(
    title="Servicio de Profesionales",
    version="1.0.0",
    description="Gestión de profesionales, KYC, búsqueda geoespacial con PostGIS, portfolio y oficios"
)

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "servicio": "profesionales"}

# ============================================================================
# PROFESSIONAL PROFILE ENDPOINTS
# ============================================================================

@app.get("/professional/me", response_model=ProfessionalResponse)
async def get_my_professional_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene el perfil profesional del usuario autenticado"""
    if current_user.role != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden acceder a este endpoint"
        )
    
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    return professional

@app.put("/professional/me", response_model=ProfessionalResponse)
async def update_my_professional_profile(
    profile_data: ProfessionalUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualiza el perfil profesional del usuario autenticado"""
    if current_user.role != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden actualizar su perfil"
        )
    
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
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
    return professional

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
    if current_user.role != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden enviar KYC"
        )
    
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    # Actualizar documentos KYC
    professional.kyc_document_front = kyc_data.document_front_url
    professional.kyc_document_back = kyc_data.document_back_url
    professional.kyc_selfie = kyc_data.selfie_url
    professional.kyc_status = KYCStatus.PENDIENTE
    professional.kyc_submitted_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "KYC enviado correctamente",
        "status": professional.kyc_status
    }

@app.get("/professional/kyc/status", response_model=KYCStatusResponse)
async def get_kyc_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene el estado actual del KYC"""
    if current_user.role != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden ver su estado KYC"
        )
    
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    return {
        "status": professional.kyc_status,
        "submitted_at": professional.kyc_submitted_at,
        "reviewed_at": professional.kyc_reviewed_at,
        "rejection_reason": professional.kyc_rejection_reason
    }

# ============================================================================
# PORTFOLIO ENDPOINTS
# ============================================================================

@app.get("/professional/portfolio", response_model=List[PortfolioResponse])
async def get_my_portfolio(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene el portfolio del profesional autenticado"""
    if current_user.role != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales tienen portfolio"
        )
    
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    portfolio_items = db.query(PortfolioItem).filter(
        PortfolioItem.professional_id == professional.id
    ).all()
    
    return portfolio_items

@app.post("/professional/portfolio", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def add_portfolio_item(
    item_data: PortfolioCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Agrega un item al portfolio"""
    if current_user.role != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden agregar items al portfolio"
        )
    
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    new_item = PortfolioItem(
        professional_id=professional.id,
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
    if current_user.role != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden eliminar items de su portfolio"
        )
    
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    item = db.query(PortfolioItem).filter(
        PortfolioItem.id == item_id,
        PortfolioItem.professional_id == professional.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado"
        )
    
    db.delete(item)
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
    if current_user.role != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales tienen oficios"
        )
    
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    oficios = db.query(Oficio).filter(
        Oficio.professional_id == professional.id
    ).all()
    
    return oficios

@app.post("/professional/oficios", response_model=OficioResponse, status_code=status.HTTP_201_CREATED)
async def add_oficio(
    oficio_data: OficioCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Agrega un nuevo oficio al profesional"""
    if current_user.role != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden agregar oficios"
        )
    
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    new_oficio = Oficio(
        professional_id=professional.id,
        **oficio_data.dict()
    )
    
    db.add(new_oficio)
    db.commit()
    db.refresh(new_oficio)
    
    return new_oficio

@app.delete("/professional/oficios/{oficio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_oficio(
    oficio_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Elimina un oficio del profesional"""
    if current_user.role != UserRole.PROFESIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesionales pueden eliminar oficios"
        )
    
    professional = db.query(Professional).filter(
        Professional.user_id == current_user.id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil profesional no encontrado"
        )
    
    oficio = db.query(Oficio).filter(
        Oficio.id == oficio_id,
        Oficio.professional_id == professional.id
    ).first()
    
    if not oficio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oficio no encontrado"
        )
    
    db.delete(oficio)
    db.commit()

# ============================================================================
# SEARCH ENDPOINTS (PostGIS)
# ============================================================================

@app.post("/search", response_model=SearchResponse)
async def search_professionals(
    search_params: SearchRequest,
    db: Session = Depends(get_db)
):
    """Búsqueda geoespacial de profesionales con PostGIS"""
    
    query = db.query(Professional).join(User).filter(
        User.is_active == True,
        User.role == UserRole.PROFESIONAL,
        Professional.kyc_status == KYCStatus.APROBADO
    )
    
    # Filtro geoespacial si se proporciona ubicación
    if search_params.latitude and search_params.longitude:
        point = WKTElement(f'POINT({search_params.longitude} {search_params.latitude})', srid=4326)
        radius_meters = search_params.radio_km * 1000
        
        query = query.filter(
            ST_DWithin(
                Professional.ubicacion,
                point,
                radius_meters
            )
        )
    
    # Filtro por oficio
    if search_params.oficio:
        query = query.join(Oficio).filter(
            func.lower(Oficio.nombre).contains(search_params.oficio.lower())
        )
    
    # Filtro por habilidades
    if search_params.habilidades:
        query = query.filter(
            or_(*[
                Professional.habilidades.contains([skill])
                for skill in search_params.habilidades
            ])
        )
    
    # Filtro por rating mínimo
    if search_params.rating_minimo:
        query = query.filter(
            Professional.rating_promedio >= search_params.rating_minimo
        )
    
    # Ordenamiento
    if search_params.ordenar_por == "rating":
        query = query.order_by(Professional.rating_promedio.desc())
    elif search_params.ordenar_por == "precio":
        query = query.order_by(Professional.tarifa_por_hora.asc())
    elif search_params.ordenar_por == "distancia" and search_params.latitude and search_params.longitude:
        # Ordenar por distancia
        point = WKTElement(f'POINT({search_params.longitude} {search_params.latitude})', srid=4326)
        query = query.order_by(
            func.ST_Distance(Professional.ubicacion, point)
        )
    
    # Paginación
    total = query.count()
    professionals = query.offset(search_params.skip).limit(search_params.limit).all()
    
    # Formatear resultados
    results = []
    for prof in professionals:
        distance_km = None
        if search_params.latitude and search_params.longitude:
            point = WKTElement(f'POINT({search_params.longitude} {search_params.latitude})', srid=4326)
            distance = db.query(
                func.ST_Distance(Professional.ubicacion, point)
            ).filter(Professional.id == prof.id).scalar()
            distance_km = distance / 1000 if distance else None
        
        results.append(ProfessionalSearchResult(
            id=prof.id,
            user_id=prof.user_id,
            nombre_completo=prof.nombre_completo,
            biografia=prof.biografia,
            rating_promedio=prof.rating_promedio,
            total_resenas=prof.total_resenas,
            tarifa_por_hora=prof.tarifa_por_hora,
            foto_perfil=prof.foto_perfil,
            distancia_km=distance_km,
            habilidades=prof.habilidades or [],
            oficios=[{"id": o.id, "nombre": o.nombre} for o in prof.oficios]
        ))
    
    return SearchResponse(
        total=total,
        resultados=results,
        pagina=search_params.skip // search_params.limit + 1,
        total_paginas=(total + search_params.limit - 1) // search_params.limit
    )

# ============================================================================
# PUBLIC ENDPOINTS
# ============================================================================

@app.get("/public/professional/{prof_id}", response_model=ProfessionalResponse)
async def get_public_professional_profile(
    prof_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene el perfil público de un profesional"""
    professional = db.query(Professional).filter(
        Professional.id == prof_id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    # Verificar que el usuario esté activo y el KYC aprobado
    user = db.query(User).filter(User.id == professional.user_id).first()
    if not user or not user.is_active or professional.kyc_status != KYCStatus.APROBADO:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no disponible"
        )
    
    return professional

@app.get("/public/professional/{prof_id}/portfolio", response_model=List[PortfolioResponse])
async def get_public_portfolio(
    prof_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene el portfolio público de un profesional"""
    professional = db.query(Professional).filter(
        Professional.id == prof_id
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

@app.get("/public/oficios", response_model=List[str])
async def get_all_oficios(
    db: Session = Depends(get_db)
):
    """Obtiene lista de todos los oficios disponibles (únicos)"""
    oficios = db.query(Oficio.nombre).distinct().all()
    return [oficio[0] for oficio in oficios]

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@app.get("/admin/kyc/pending")
async def get_pending_kyc(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene lista de KYCs pendientes de revisión (solo admin)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden acceder a este endpoint"
        )
    
    pending_kycs = db.query(Professional).filter(
        Professional.kyc_status == KYCStatus.PENDIENTE
    ).all()
    
    return pending_kycs

@app.put("/admin/kyc/{prof_id}/approve")
async def approve_kyc(
    prof_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Aprueba el KYC de un profesional (solo admin)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden aprobar KYC"
        )
    
    professional = db.query(Professional).filter(
        Professional.id == prof_id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    professional.kyc_status = KYCStatus.APROBADO
    professional.kyc_reviewed_at = datetime.utcnow()
    professional.kyc_rejection_reason = None
    
    db.commit()
    
    return {"message": "KYC aprobado correctamente"}

@app.put("/admin/kyc/{prof_id}/reject")
async def reject_kyc(
    prof_id: int,
    request: KYCApproveRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Rechaza el KYC de un profesional (solo admin)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden rechazar KYC"
        )
    
    professional = db.query(Professional).filter(
        Professional.id == prof_id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado"
        )
    
    professional.kyc_status = KYCStatus.RECHAZADO
    professional.kyc_reviewed_at = datetime.utcnow()
    professional.kyc_rejection_reason = request.reason
    
    db.commit()
    
    return {"message": "KYC rechazado", "reason": request.reason}

@app.put("/admin/users/{user_id}/ban")
async def ban_user(
    user_id: int,
    request: UserBanRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Banea un usuario (solo admin)"""
    if current_user.role != UserRole.ADMIN:
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
    
    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se puede banear a un administrador"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": f"Usuario {user.email} baneado correctamente", "reason": request.reason}

@app.put("/admin/users/{user_id}/unban")
async def unban_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Desbanea un usuario (solo admin)"""
    if current_user.role != UserRole.ADMIN:
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
