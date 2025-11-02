-- Script para insertar oficios iniciales en la base de datos
-- Asegurarse de que la tabla oficios existe primero

INSERT INTO oficios (id, nombre, descripcion, created_at, updated_at) 
VALUES 
  (gen_random_uuid(), 'Plomería', 'Instalación y reparación de sistemas de agua y gas', NOW(), NOW()),
  (gen_random_uuid(), 'Electricidad', 'Instalaciones eléctricas y reparaciones', NOW(), NOW()),
  (gen_random_uuid(), 'Carpintería', 'Trabajos en madera, muebles y estructuras', NOW(), NOW()),
  (gen_random_uuid(), 'Pintura', 'Pintura de interiores y exteriores', NOW(), NOW()),
  (gen_random_uuid(), 'Albañilería', 'Construcción y reparación de estructuras', NOW(), NOW()),
  (gen_random_uuid(), 'Jardinería', 'Mantenimiento y diseño de jardines', NOW(), NOW()),
  (gen_random_uuid(), 'Limpieza', 'Servicios de limpieza profesional', NOW(), NOW()),
  (gen_random_uuid(), 'Cerrajería', 'Instalación y reparación de cerraduras', NOW(), NOW()),
  (gen_random_uuid(), 'Climatización', 'Instalación y mantenimiento de aire acondicionado', NOW(), NOW()),
  (gen_random_uuid(), 'Reparación de electrodomésticos', 'Reparación de heladeras, lavarropas, etc.', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;
