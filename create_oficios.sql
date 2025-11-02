-- Script para crear la tabla de oficios y datos iniciales

-- Crear tabla oficios si no existe
CREATE TABLE IF NOT EXISTS oficios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice en nombre
CREATE INDEX IF NOT EXISTS ix_oficios_nombre ON oficios(nombre);

-- Insertar oficios iniciales
INSERT INTO oficios (nombre, descripcion) 
VALUES 
  ('Plomería', 'Instalación y reparación de sistemas de agua y gas'),
  ('Electricidad', 'Instalaciones eléctricas y reparaciones'),
  ('Carpintería', 'Trabajos en madera, muebles y estructuras'),
  ('Pintura', 'Pintura de interiores y exteriores'),
  ('Albañilería', 'Construcción y reparación de estructuras'),
  ('Jardinería', 'Mantenimiento y diseño de jardines'),
  ('Limpieza', 'Servicios de limpieza profesional'),
  ('Cerrajería', 'Instalación y reparación de cerraduras'),
  ('Climatización', 'Instalación y mantenimiento de aire acondicionado'),
  ('Reparación de electrodomésticos', 'Reparación de heladeras, lavarropas, etc.')
ON CONFLICT (nombre) DO NOTHING;
