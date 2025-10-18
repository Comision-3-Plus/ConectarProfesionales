"""
Configuración de la base de datos con SQLAlchemy.
Incluye soporte para PostGIS mediante GeoAlchemy2.
"""
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Crear el engine de SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verifica la conexión antes de usarla
    echo=settings.DEBUG,  # Log de queries SQL en modo debug
)

# Habilitar la extensión PostGIS automáticamente
@event.listens_for(engine, "connect")
def enable_postgis(dbapi_conn, connection_record):
    """Asegura que PostGIS esté habilitado en la base de datos"""
    cursor = dbapi_conn.cursor()
    cursor.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
    cursor.close()
    dbapi_conn.commit()

# Session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()


def get_db():
    """
    Dependency para obtener una sesión de base de datos.
    Se usa en los endpoints de FastAPI.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
