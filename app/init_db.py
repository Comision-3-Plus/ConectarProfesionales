"""
Script de inicialización de la base de datos.
Se asegura de que PostGIS esté habilitado antes de correr migraciones.
"""
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings


def init_db():
    """
    Inicializa la base de datos:
    1. Habilita la extensión PostGIS
    2. Verifica que esté funcionando correctamente
    """
    print("🗄️  Iniciando configuración de la base de datos...")
    
    try:
        # Crear engine de SQLAlchemy
        engine = create_engine(settings.DATABASE_URL)
        
        with engine.connect() as conn:
            # Habilitar PostGIS
            print("📍 Habilitando extensión PostGIS...")
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            conn.commit()
            
            # Verificar versión de PostGIS
            result = conn.execute(text("SELECT PostGIS_Version();"))
            postgis_version = result.scalar()
            print(f"✅ PostGIS habilitado correctamente. Versión: {postgis_version}")
            
            # Verificar que podamos crear puntos geográficos
            test_query = text("""
                SELECT ST_AsText(
                    ST_SetSRID(ST_MakePoint(-58.3816, -34.6037), 4326)
                ) as punto;
            """)
            result = conn.execute(test_query)
            punto = result.scalar()
            print(f"✅ Test de geolocalización exitoso: {punto}")
            
        print("🎉 Base de datos inicializada correctamente!")
        return True
        
    except Exception as e:
        print(f"❌ Error al inicializar la base de datos: {str(e)}")
        return False


if __name__ == "__main__":
    success = init_db()
    sys.exit(0 if success else 1)
