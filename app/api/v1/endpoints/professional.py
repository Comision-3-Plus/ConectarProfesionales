"""
Endpoints para profesionales (protegidos).
"""
import os
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_professional
from app.core.database import get_db
from app.models.professional import Profesional
from app.models.oficio import Oficio
from app.models.servicio_instantaneo import ServicioInstantaneo
from app.models.portfolio import PortfolioItem, PortfolioImagen
from app.schemas.professional import (
    ProfessionalProfileRead, 
    ProfessionalProfileUpdate, 
    ProfessionalServiciosInstantUpdate,
    ProfessionalLocationUpdate
)
from app.schemas.oficio import ProfessionalOficiosUpdate, OficioRead
from app.schemas.servicio_instantaneo import ServicioInstantaneoRead
from app.schemas.portfolio import PortfolioItemCreate, PortfolioItemRead
from app.services import kyc_service

router = APIRouter()

PORTFOLIO_UPLOAD_DIR = "/app/uploads/portfolio"


def ensure_portfolio_dir():
    os.makedirs(PORTFOLIO_UPLOAD_DIR, exist_ok=True)


@router.get(
    "/me",
    response_model=ProfessionalProfileRead,
    summary="Obtener perfil del profesional actual"
)
def read_professional_me(
    current_professional: Profesional = Depends(get_current_professional)
):
    """
    Retorna el perfil completo del profesional autenticado.
    Incluye datos del usuario y configuración del servicio.
    """
    return ProfessionalProfileRead.from_professional(current_professional)


@router.put(
    "/profile",
    response_model=ProfessionalProfileRead,
    summary="Actualizar configuración del perfil profesional"
)
def update_professional_profile(
    profile_update: ProfessionalProfileUpdate,
    current_professional: Profesional = Depends(get_current_professional),
    db: Session = Depends(get_db),
):
    """
    Permite al profesional actualizar su configuración de servicio.
    
    Campos actualizables:
    - radio_cobertura_km: Radio de cobertura en kilómetros (1-500)
    - acepta_instant: Si acepta trabajos instantáneos
    - tarifa_por_hora: Tarifa por hora en moneda local
    
    Actualización parcial: Solo se actualizan los campos enviados (no-null).
    """
    # Obtener solo los campos que el usuario envió (exclude_unset=True)
    update_data = profile_update.model_dump(exclude_unset=True)
    
    # Actualizar solo los campos enviados
    for field, value in update_data.items():
        setattr(current_professional, field, value)
    
    # Guardar cambios
    db.add(current_professional)
    db.commit()
    db.refresh(current_professional)
    
    return ProfessionalProfileRead.from_professional(current_professional)


@router.post(
    "/kyc/upload",
    status_code=status.HTTP_200_OK,
    summary="Subir documentos KYC (solo profesionales)"
)
async def upload_kyc_documents(
    files: List[UploadFile] = File(...),
    current_professional: Profesional = Depends(get_current_professional),
    db: Session = Depends(get_db),
):
    kyc_service.save_kyc_files(db=db, professional=current_professional, files=files)
    return {"status": "ok", "message": "Archivos recibidos, en revisión."}


@router.put(
    "/profile/oficios",
    response_model=List[OficioRead],
    summary="Asignar oficios al profesional"
)
def update_professional_oficios(
    oficios_update: ProfessionalOficiosUpdate,
    current_professional: Profesional = Depends(get_current_professional),
    db: Session = Depends(get_db),
):
    """
    Permite al profesional asignarse múltiples oficios de la lista predefinida.
    
    Esta operación reemplaza completamente la lista actual de oficios del profesional.
    
    Flujo:
    1. El profesional envía una lista de UUIDs de oficios
    2. El sistema valida que todos los IDs existen
    3. Se reemplaza la lista actual de oficios por la nueva
    4. Se retorna la lista actualizada de oficios
    """
    # Validar que todos los IDs existen en la BD
    oficios = db.query(Oficio).filter(Oficio.id.in_(oficios_update.oficio_ids)).all()
    
    # Verificar que encontramos todos los oficios solicitados
    if len(oficios) != len(oficios_update.oficio_ids):
        encontrados = {o.id for o in oficios}
        solicitados = set(oficios_update.oficio_ids)
        no_encontrados = solicitados - encontrados
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Oficios no encontrados: {[str(id) for id in no_encontrados]}"
        )
    
    # Reemplazar la lista de oficios (relación M2M)
    current_professional.oficios = oficios
    
    db.add(current_professional)
    db.commit()
    db.refresh(current_professional)
    
    # Retornar la lista actualizada
    return [OficioRead.model_validate(o) for o in current_professional.oficios]


@router.put(
    "/profile/servicios-instant",
    response_model=List[ServicioInstantaneoRead],
    summary="Asignar servicios instantáneos al profesional"
)
def update_professional_servicios_instant(
    servicios_update: ProfessionalServiciosInstantUpdate,
    current_professional: Profesional = Depends(get_current_professional),
    db: Session = Depends(get_db),
):
    """
    Permite al profesional asignarse múltiples servicios instantáneos.
    
    Esta operación reemplaza completamente la lista actual de servicios del profesional.
    
    Flujo:
    1. El profesional envía una lista de UUIDs de servicios instantáneos
    2. El sistema valida que todos los IDs existen
    3. Se reemplaza la lista actual de servicios por la nueva
    4. Se retorna la lista actualizada de servicios
    """
    # Validar que todos los IDs existen en la BD
    servicios = (
        db.query(ServicioInstantaneo)
        .filter(ServicioInstantaneo.id.in_(servicios_update.servicio_ids))
        .all()
    )
    
    # Verificar que encontramos todos los servicios solicitados
    if len(servicios) != len(servicios_update.servicio_ids):
        encontrados = {s.id for s in servicios}
        solicitados = set(servicios_update.servicio_ids)
        no_encontrados = solicitados - encontrados
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Servicios no encontrados: {[str(id) for id in no_encontrados]}"
        )
    
    # Reemplazar la lista de servicios instantáneos (relación M2M)
    current_professional.servicios_instantaneos = servicios
    
    db.add(current_professional)
    db.commit()
    db.refresh(current_professional)
    
    # Retornar la lista actualizada
    return [ServicioInstantaneoRead.model_validate(s) for s in current_professional.servicios_instantaneos]


@router.put(
    "/profile/location",
    response_model=ProfessionalProfileRead,
    summary="Actualizar ubicación geográfica del profesional"
)
def update_professional_location(
    location_update: ProfessionalLocationUpdate,
    current_professional: Profesional = Depends(get_current_professional),
    db: Session = Depends(get_db),
):
    """
    Actualiza la ubicación base del profesional usando coordenadas geográficas.
    
    Parámetros:
    - latitude: Latitud en grados decimales (-90 a 90)
    - longitude: Longitud en grados decimales (-180 a 180)
    
    La ubicación se almacena como un punto geográfico (PostGIS POINT)
    en formato WKT: POINT(longitude latitude)
    """
    from geoalchemy2.elements import WKTElement
    
    # Crear punto geográfico en formato WKT
    # IMPORTANTE: PostGIS usa (longitude, latitude) no (lat, lng)
    point_wkt = f"POINT({location_update.longitude} {location_update.latitude})"
    current_professional.base_location = WKTElement(point_wkt, srid=4326)
    
    db.add(current_professional)
    db.commit()
    db.refresh(current_professional)
    
    return ProfessionalProfileRead.from_professional(current_professional)


# ==========================================
# ENDPOINTS DE PORTFOLIO
# ==========================================

@router.post(
    "/portfolio",
    response_model=PortfolioItemRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un item de portfolio"
)
def create_portfolio_item(
    item_data: PortfolioItemCreate,
    current_professional: Profesional = Depends(get_current_professional),
    db: Session = Depends(get_db),
):
    """
    Crea un nuevo item de portfolio (trabajo anterior) para el profesional.
    Solo crea el registro con título y descripción, sin imágenes.
    Las imágenes se suben posteriormente usando el endpoint de subida.
    """
    nuevo_item = PortfolioItem(
        profesional_id=current_professional.id,
        titulo=item_data.titulo,
        descripcion=item_data.descripcion
    )
    db.add(nuevo_item)
    db.commit()
    db.refresh(nuevo_item)
    
    return PortfolioItemRead.model_validate(nuevo_item)


@router.post(
    "/portfolio/{item_id}/image",
    response_model=PortfolioItemRead,
    summary="Subir imagen a un item de portfolio"
)
def upload_portfolio_image(
    item_id: UUID,
    file: UploadFile = File(...),
    current_professional: Profesional = Depends(get_current_professional),
    db: Session = Depends(get_db),
):
    """
    Sube una imagen para un item de portfolio específico.
    El profesional debe ser el dueño del item de portfolio.
    """
    # Verificar que el item existe y pertenece al profesional actual
    portfolio_item = (
        db.query(PortfolioItem)
        .filter(
            PortfolioItem.id == item_id,
            PortfolioItem.profesional_id == current_professional.id
        )
        .first()
    )
    
    if not portfolio_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item de portfolio no encontrado o no pertenece al profesional"
        )
    
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Archivo no proporcionado"
        )
    
    # Validar tipo de archivo
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato no permitido. Usa: {', '.join(allowed_extensions)}"
        )
    
    ensure_portfolio_dir()
    
    # Calcular el próximo orden
    max_orden = (
        db.query(PortfolioImagen.orden)
        .filter(PortfolioImagen.portfolio_item_id == item_id)
        .order_by(PortfolioImagen.orden.desc())
        .first()
    )
    siguiente_orden = (max_orden[0] + 1) if max_orden else 0
    
    # Nombre seguro del archivo: {portfolio_item_id}_{orden}{ext}
    safe_name = f"{item_id}_{siguiente_orden}{file_ext}"
    dest_path = os.path.join(PORTFOLIO_UPLOAD_DIR, safe_name)
    
    # Guardar archivo
    with open(dest_path, "wb") as out:
        while True:
            chunk = file.file.read(1024 * 1024)  # 1MB chunks
            if not chunk:
                break
            out.write(chunk)
    
    # Crear registro de imagen
    nueva_imagen = PortfolioImagen(
        portfolio_item_id=item_id,
        imagen_url=f"/uploads/portfolio/{safe_name}",
        orden=siguiente_orden
    )
    db.add(nueva_imagen)
    db.commit()
    db.refresh(portfolio_item)
    
    return PortfolioItemRead.model_validate(portfolio_item)


@router.delete(
    "/portfolio/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un item de portfolio"
)
def delete_portfolio_item(
    item_id: UUID,
    current_professional: Profesional = Depends(get_current_professional),
    db: Session = Depends(get_db),
):
    """
    Elimina un item de portfolio y todas sus imágenes asociadas.
    El profesional debe ser el dueño del item.
    Se eliminan los archivos físicos del storage y los registros de la BD.
    """
    # Verificar que el item existe y pertenece al profesional actual
    portfolio_item = (
        db.query(PortfolioItem)
        .filter(
            PortfolioItem.id == item_id,
            PortfolioItem.profesional_id == current_professional.id
        )
        .first()
    )
    
    if not portfolio_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item de portfolio no encontrado o no pertenece al profesional"
        )
    
    # Eliminar archivos físicos de las imágenes
    for imagen in portfolio_item.imagenes:
        # Extraer el path del filesystem de la URL
        if imagen.imagen_url.startswith("/uploads/portfolio/"):
            filename = imagen.imagen_url.split("/")[-1]
            file_path = os.path.join(PORTFOLIO_UPLOAD_DIR, filename)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    # Log el error pero continúa con la eliminación de la BD
                    print(f"Error eliminando archivo {file_path}: {e}")
    
    # Eliminar el item (CASCADE eliminará las imágenes de la BD)
    db.delete(portfolio_item)
    db.commit()
    
    return None

