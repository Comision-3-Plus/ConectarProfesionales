"""
Alembic environment configuration.
Configurado para usar PostGIS y cargar modelos desde app.models
"""
from logging.config import fileConfig
import sys
import os
import re
from pathlib import Path

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Agregar el directorio raíz al path para poder importar app
sys.path.insert(0, str(Path(__file__).parents[1]))

# Importar la configuración de la app
from app.core.config import settings

# Importar Base y TODOS los modelos (CRÍTICO para autogenerate)
from app.models.base import Base
from app.models.user import Usuario
from app.models.professional import Profesional

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Sobrescribir sqlalchemy.url con la URL de la base de datos desde settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    def include_object(object, name, type_, reflected, compare_to):
        """
        Función para que Alembic ignore tablas específicas de PostGIS.
        Esto evita que autogenerate intente eliminar tablas del sistema.
        """
        if type_ == "table":
            # Ignorar tablas internas de PostGIS
            if name == "spatial_ref_sys":
                return False
            # Ignorar tablas de topology de PostGIS
            if name in ("layer", "topology"):
                return False
            # Ignorar todas las tablas de TIGER (datos geográficos de PostGIS)
            if re.match(r"^(tiger|geocode|loader|pagc|zip|addr|bg|county|cousub|direction|edges|faces|featnames|place|state|street|tabblock|tract|zcta|secondary).*", name):
                return False
        return True

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            # Importante para PostGIS: comparar tipos geométricos correctamente
            compare_type=True,
            # Filtrar tablas de PostGIS para que no aparezcan en autogenerate
            include_object=include_object,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
