"""
Configuración de la aplicación usando Pydantic Settings.
Todas las variables de entorno se cargan desde .env
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuración de la aplicación"""
    
    # Información de la aplicación
    APP_NAME: str = "Marketplace de Profesionales"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    
    # Configuración de la base de datos
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    
    # Security / Auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Webhook Security (para Cloud Function)
    WEBHOOK_API_KEY: str
    
    # MercadoPago
    MERCADOPAGO_ACCESS_TOKEN: Optional[str] = "TEST-token-not-configured"
    MERCADOPAGO_PUBLIC_KEY: Optional[str] = None
    
    # URLs para callbacks de MercadoPago
    MP_SUCCESS_URL: str = "http://localhost:3000/payment/success"
    MP_FAILURE_URL: str = "http://localhost:3000/payment/failure"
    MP_PENDING_URL: str = "http://localhost:3000/payment/pending"
    MP_NOTIFICATION_URL: str = "http://localhost:8000/api/v1/webhook/mercadopago"
    
    # Gamificación - Sistema de Puntos
    PUNTOS_POR_TRABAJO: int = 100
    PUNTOS_REVIEW_5_ESTRELLAS: int = 50
    PUNTOS_REVIEW_4_ESTRELLAS: int = 10
    
    @property
    def DATABASE_URL(self) -> str:
        """Construye la URL de conexión a PostgreSQL"""
        base_url = (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
        # Si conecta a Supabase (o cualquier host remoto que no sea 'db' o 'localhost'), usar SSL
        if self.POSTGRES_HOST not in ("db", "localhost", "127.0.0.1"):
            base_url += "?sslmode=require"
        return base_url
    
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """URL para conexión asíncrona (si se necesita en el futuro)"""
        base_url = (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
        # Si conecta a Supabase (o cualquier host remoto que no sea 'db' o 'localhost'), usar SSL
        if self.POSTGRES_HOST not in ("db", "localhost", "127.0.0.1"):
            base_url += "?ssl=require"
        return base_url
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instancia global de configuración
settings = Settings()
