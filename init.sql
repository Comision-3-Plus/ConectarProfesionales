-- Script de inicialización de PostgreSQL
-- Se ejecuta automáticamente cuando el contenedor se crea por primera vez

-- Crear usuario si no existe
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'conectar') THEN
      CREATE USER conectar WITH PASSWORD 'conectar123';
   END IF;
END
$$;

-- Crear base de datos si no existe
SELECT 'CREATE DATABASE conectar_profesionales OWNER conectar'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'conectar_profesionales')\gexec

-- Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE conectar_profesionales TO conectar;

-- Conectar a la base de datos y habilitar PostGIS
\c conectar_profesionales

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Otorgar permisos en el esquema public
GRANT ALL ON SCHEMA public TO conectar;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO conectar;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO conectar;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO conectar;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO conectar;
