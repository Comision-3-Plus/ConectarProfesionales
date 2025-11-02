-- Eliminar y recrear la tabla oficios con el esquema correcto

DROP TABLE IF EXISTS oficios CASCADE;

CREATE TABLE oficios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion VARCHAR(500),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX ix_oficios_nombre ON oficios(nombre);

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
  ('Reparación de electrodomésticos', 'Reparación de heladeras, lavarropas, etc.');
