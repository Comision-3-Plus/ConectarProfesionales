"""
Servicio de envío de correos electrónicos.
Placeholder para futuras implementaciones con SMTP, SendGrid, etc.
"""
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Servicio para enviar correos electrónicos"""
    
    def __init__(self):
        """Inicializa el servicio de email"""
        self.enabled = False  # Deshabilitado por defecto hasta configurar SMTP
        logger.info("EmailService inicializado (actualmente deshabilitado)")
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> bool:
        """
        Envía un correo electrónico.
        
        Args:
            to_email: Dirección de correo del destinatario
            subject: Asunto del correo
            body: Cuerpo del correo en texto plano
            html_body: Cuerpo del correo en HTML (opcional)
            
        Returns:
            True si se envió correctamente, False en caso contrario
        """
        if not self.enabled:
            logger.warning(f"EmailService deshabilitado. Email no enviado a {to_email}: {subject}")
            return False
        
        # TODO: Implementar envío real de correos con SMTP, SendGrid, etc.
        logger.info(f"Enviando email a {to_email}: {subject}")
        return True
    
    async def send_verification_email(self, to_email: str, verification_code: str) -> bool:
        """Envía un correo de verificación de cuenta"""
        subject = "Verifica tu cuenta"
        body = f"Tu código de verificación es: {verification_code}"
        return await self.send_email(to_email, subject, body)
    
    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        """Envía un correo para restablecer la contraseña"""
        subject = "Restablece tu contraseña"
        body = f"Usa este código para restablecer tu contraseña: {reset_token}"
        return await self.send_email(to_email, subject, body)
    
    async def send_notification_email(
        self,
        to_email: str,
        title: str,
        message: str
    ) -> bool:
        """Envía un correo de notificación genérica"""
        return await self.send_email(to_email, title, message)


# Instancia global del servicio
email_service = EmailService()
