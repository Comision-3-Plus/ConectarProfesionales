#!/usr/bin/env python3
"""
Script para insertar oficios iniciales en Supabase
"""
import sys
sys.path.insert(0, '/app/shared')

from shared.core.database import SessionLocal
from shared.models.oficio import Oficio

oficios_data = [
    ('Plomería', 'Instalación y reparación de sistemas de agua y gas'),
    ('Electricidad', 'Instalaciones eléctricas y reparaciones'),
    ('Carpintería', 'Trabajos en madera, muebles y estructuras'),
    ('Pintura', 'Pintura de interiores y exteriores'),
    ('Albañilería', 'Construcción y reparación de estructuras'),
    ('Jardinería', 'Mantenimiento y diseño de jardines'),
    ('Limpieza', 'Servicios de limpieza profesional'),
    ('Cerrajería', 'Instalación y reparación de cerraduras'),
    ('Climatización', 'Instalación y mantenimiento de aire acondicionado'),
    ('Reparación de electrodomésticos', 'Reparación de heladeras, lavarropas, etc.'),
]

db = SessionLocal()
try:
    # Verificar si ya existen oficios
    existing_count = db.query(Oficio).count()
    if existing_count > 0:
        print(f"Ya existen {existing_count} oficios en la base de datos")
    else:
        # Insertar oficios
        for nombre, descripcion in oficios_data:
            oficio = Oficio(nombre=nombre, descripcion=descripcion)
            db.add(oficio)
        
        db.commit()
        print(f"✅ {len(oficios_data)} oficios insertados correctamente")
        
        # Verificar
        count = db.query(Oficio).count()
        print(f"Total de oficios en la base de datos: {count}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
