"""
Configuración de base de datos compartida
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
import os

# URL de conexión a la base de datos - usar conexión directa no pooler
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres.juhdzcctbpmtzvpntjpk:SanLorenzomuertos@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
)

# Crear engine con configuración mejorada para Supabase
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # Usar NullPool para evitar problemas de conexión con Supabase Pooler
    connect_args={
        "sslmode": "require",
        "connect_timeout": 10,
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()

# Dependency para FastAPI
def get_db():
    """Obtiene sesión de base de datos"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
