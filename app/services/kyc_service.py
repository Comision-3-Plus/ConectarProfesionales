"""
Servicio KYC: manejo de subida de documentos para verificación.
"""
import os
from typing import List
from uuid import UUID
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.professional import Profesional
from app.models.enums import VerificationStatus

UPLOAD_DIR = "/app/uploads"


def ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def _safe_filename(professional_id: UUID, original_name: str) -> str:
    # Evita path traversal y espacios raros; conserva extensión
    base = os.path.basename(original_name).replace(" ", "_")
    return f"{professional_id}_{base}"


def save_kyc_files(db: Session, professional: Profesional, files: List[UploadFile]) -> bool:
    """
    Guarda archivos de KYC en almacenamiento persistente y marca el perfil en revisión.
    """
    ensure_upload_dir()

    for f in files:
        if not f or not f.filename:
            # Ignora archivos vacíos
            continue
        filename = _safe_filename(professional.id, f.filename)
        dest_path = os.path.join(UPLOAD_DIR, filename)
        # Guardado por chunks para evitar cargar todo en memoria
        with open(dest_path, "wb") as out:
            while True:
                chunk = f.file.read(1024 * 1024)
                if not chunk:
                    break
                out.write(chunk)

    # Cambiar estado a EN_REVISION
    professional.estado_verificacion = VerificationStatus.EN_REVISION
    db.add(professional)
    db.commit()

    return True
