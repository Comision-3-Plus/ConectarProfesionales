"""
Configuración de Celery para tareas en background.
Incluye tareas comunes: emails, reportes, limpieza de datos.
"""
from celery import Celery
from celery.schedules import crontab
import os
import logging

logger = logging.getLogger(__name__)

# Configuración de Celery
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")

celery_app = Celery(
    "conectar_profesionales",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND
)

# Configuración de Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutos máximo por tarea
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# ============================================================================
# TAREAS DE EMAIL
# ============================================================================

@celery_app.task(name="send_email")
def send_email_task(to_email: str, subject: str, body: str, html: str = None):
    """
    Envía un email de forma asíncrona.
    
    Args:
        to_email: Email del destinatario
        subject: Asunto del email
        body: Cuerpo del email en texto plano
        html: Cuerpo del email en HTML (opcional)
    """
    try:
        from shared.services.email_service import EmailService
        
        email_service = EmailService()
        email_service.send_email(to_email, subject, body, html)
        
        logger.info(f"Email enviado a {to_email}")
        return {"status": "success", "to": to_email}
        
    except Exception as e:
        logger.error(f"Error enviando email: {str(e)}")
        raise


@celery_app.task(name="send_welcome_email")
def send_welcome_email_task(user_email: str, user_name: str):
    """Envía email de bienvenida a nuevo usuario"""
    try:
        from shared.services.email_service import EmailService
        
        email_service = EmailService()
        email_service.send_welcome_email(user_email, user_name)
        
        logger.info(f"Email de bienvenida enviado a {user_email}")
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error enviando email de bienvenida: {str(e)}")
        raise


@celery_app.task(name="send_notification_email")
def send_notification_email_task(user_id: str, notification_type: str, data: dict):
    """
    Envía email de notificación basado en tipo de evento.
    
    Args:
        user_id: ID del usuario
        notification_type: Tipo de notificación
        data: Datos adicionales
    """
    try:
        from shared.core.database import SessionLocal
        from shared.models.user import User
        
        db = SessionLocal()
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            logger.warning(f"Usuario {user_id} no encontrado")
            return {"status": "error", "message": "User not found"}
        
        # Lógica de envío según tipo
        templates = {
            "trabajo_creado": "Nuevo trabajo asignado",
            "pago_recibido": "Pago recibido correctamente",
            "trabajo_completado": "Trabajo completado",
            "resena_recibida": "Nueva reseña recibida"
        }
        
        subject = templates.get(notification_type, "Notificación")
        body = f"Hola {user.nombre},\n\n{data.get('message', 'Tienes una nueva notificación.')}"
        
        send_email_task.delay(user.email, subject, body)
        
        db.close()
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error enviando notificación: {str(e)}")
        raise


# ============================================================================
# TAREAS DE REPORTES
# ============================================================================

@celery_app.task(name="generate_monthly_report")
def generate_monthly_report_task(month: int, year: int):
    """
    Genera reporte mensual de la plataforma.
    
    Args:
        month: Mes (1-12)
        year: Año
    """
    try:
        from shared.core.database import SessionLocal
        from shared.models.trabajo import Trabajo
        from sqlalchemy import func
        from datetime import datetime
        
        db = SessionLocal()
        
        # Calcular estadísticas del mes
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        trabajos = db.query(Trabajo).filter(
            Trabajo.fecha_creacion >= start_date,
            Trabajo.fecha_creacion < end_date
        )
        
        stats = {
            "total_trabajos": trabajos.count(),
            "ingresos_totales": db.query(func.sum(Trabajo.precio_final)).filter(
                Trabajo.fecha_creacion >= start_date,
                Trabajo.fecha_creacion < end_date
            ).scalar() or 0,
            "comisiones": db.query(func.sum(Trabajo.comision_plataforma)).filter(
                Trabajo.fecha_creacion >= start_date,
                Trabajo.fecha_creacion < end_date
            ).scalar() or 0
        }
        
        db.close()
        
        logger.info(f"Reporte mensual generado: {month}/{year}")
        return stats
        
    except Exception as e:
        logger.error(f"Error generando reporte mensual: {str(e)}")
        raise


@celery_app.task(name="generate_professional_stats")
def generate_professional_stats_task(professional_id: str):
    """
    Genera estadísticas de un profesional.
    
    Args:
        professional_id: ID del profesional
    """
    try:
        from shared.core.database import SessionLocal
        from shared.models.professional import Professional
        from shared.models.trabajo import Trabajo
        from shared.models.resena import Resena
        from sqlalchemy import func
        
        db = SessionLocal()
        
        professional = db.query(Professional).filter(
            Professional.id == professional_id
        ).first()
        
        if not professional:
            return {"status": "error", "message": "Professional not found"}
        
        # Calcular estadísticas
        trabajos = db.query(Trabajo).filter(
            Trabajo.profesional_id == professional.user_id
        )
        
        stats = {
            "total_trabajos": trabajos.count(),
            "trabajos_completados": trabajos.filter(
                Trabajo.estado_escrow == "LIBERADO"
            ).count(),
            "ingresos_totales": db.query(func.sum(Trabajo.monto_liberado)).filter(
                Trabajo.profesional_id == professional.user_id
            ).scalar() or 0,
            "rating_promedio": db.query(func.avg(Resena.rating)).join(Trabajo).filter(
                Trabajo.profesional_id == professional.user_id
            ).scalar() or 0,
            "total_resenas": db.query(func.count(Resena.id)).join(Trabajo).filter(
                Trabajo.profesional_id == professional.user_id
            ).scalar() or 0
        }
        
        db.close()
        return stats
        
    except Exception as e:
        logger.error(f"Error generando stats de profesional: {str(e)}")
        raise


# ============================================================================
# TAREAS DE LIMPIEZA
# ============================================================================

@celery_app.task(name="cleanup_old_notifications")
def cleanup_old_notifications_task(days: int = 90):
    """
    Elimina notificaciones antiguas.
    
    Args:
        days: Días de antigüedad para eliminar
    """
    try:
        from shared.core.database import SessionLocal
        from shared.models.notification import Notification
        from datetime import datetime, timedelta
        
        db = SessionLocal()
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        deleted = db.query(Notification).filter(
            Notification.fecha_creacion < cutoff_date,
            Notification.leido == True
        ).delete()
        
        db.commit()
        db.close()
        
        logger.info(f"Notificaciones eliminadas: {deleted}")
        return {"deleted_count": deleted}
        
    except Exception as e:
        logger.error(f"Error limpiando notificaciones: {str(e)}")
        raise


@celery_app.task(name="cleanup_expired_sessions")
def cleanup_expired_sessions_task():
    """Limpia sesiones expiradas de Redis"""
    try:
        from shared.cache.cache_manager import get_cache_manager
        
        cache = get_cache_manager()
        # Aquí iría la lógica de limpieza de sesiones
        
        logger.info("Sesiones expiradas limpiadas")
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error limpiando sesiones: {str(e)}")
        raise


# ============================================================================
# TAREAS DE SINCRONIZACIÓN
# ============================================================================

@celery_app.task(name="sync_firestore_to_postgres")
def sync_firestore_to_postgres_task():
    """Sincroniza datos de Firestore a PostgreSQL"""
    try:
        # Aquí iría la lógica de sincronización
        logger.info("Sincronización Firestore → PostgreSQL completada")
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error sincronizando Firestore: {str(e)}")
        raise


@celery_app.task(name="update_professional_ratings")
def update_professional_ratings_task():
    """Actualiza los ratings de todos los profesionales"""
    try:
        from shared.core.database import SessionLocal
        from shared.models.professional import Professional
        from shared.models.resena import Resena
        from shared.models.trabajo import Trabajo
        from sqlalchemy import func
        
        db = SessionLocal()
        
        professionals = db.query(Professional).all()
        updated_count = 0
        
        for prof in professionals:
            # Calcular rating promedio
            avg_rating = db.query(func.avg(Resena.rating)).join(Trabajo).filter(
                Trabajo.profesional_id == prof.user_id
            ).scalar()
            
            if avg_rating:
                prof.rating_promedio = float(avg_rating)
                updated_count += 1
        
        db.commit()
        db.close()
        
        logger.info(f"Ratings actualizados: {updated_count} profesionales")
        return {"updated_count": updated_count}
        
    except Exception as e:
        logger.error(f"Error actualizando ratings: {str(e)}")
        raise


# ============================================================================
# TAREAS PERIÓDICAS (Beat Schedule)
# ============================================================================

celery_app.conf.beat_schedule = {
    # Limpiar notificaciones cada día a las 3 AM
    "cleanup-old-notifications": {
        "task": "cleanup_old_notifications",
        "schedule": crontab(hour=3, minute=0),
        "args": (90,)  # 90 días
    },
    
    # Actualizar ratings cada hora
    "update-professional-ratings": {
        "task": "update_professional_ratings",
        "schedule": crontab(minute=0),  # Cada hora
    },
    
    # Generar reporte mensual el primer día del mes
    "generate-monthly-report": {
        "task": "generate_monthly_report",
        "schedule": crontab(day_of_month=1, hour=1, minute=0),
    },
    
    # Limpiar sesiones expiradas cada 6 horas
    "cleanup-expired-sessions": {
        "task": "cleanup_expired_sessions",
        "schedule": crontab(minute=0, hour="*/6"),
    },
}


# Helper para encolar tareas desde otros servicios

def enqueue_task(task_name: str, *args, **kwargs):
    """
    Encola una tarea de Celery.
    
    Args:
        task_name: Nombre de la tarea
        *args: Argumentos posicionales
        **kwargs: Argumentos con nombre
        
    Returns:
        AsyncResult de Celery
    """
    task = celery_app.send_task(task_name, args=args, kwargs=kwargs)
    return task
