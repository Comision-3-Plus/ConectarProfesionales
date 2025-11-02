"""Módulo de tareas en background con Celery"""
from .celery_config import (
    celery_app,
    send_email_task,
    send_welcome_email_task,
    send_notification_email_task,
    generate_monthly_report_task,
    generate_professional_stats_task,
    cleanup_old_notifications_task,
    cleanup_expired_sessions_task,
    sync_firestore_to_postgres_task,
    update_professional_ratings_task,
    enqueue_task
)

__all__ = [
    "celery_app",
    "send_email_task",
    "send_welcome_email_task",
    "send_notification_email_task",
    "generate_monthly_report_task",
    "generate_professional_stats_task",
    "cleanup_old_notifications_task",
    "cleanup_expired_sessions_task",
    "sync_firestore_to_postgres_task",
    "update_professional_ratings_task",
    "enqueue_task"
]
