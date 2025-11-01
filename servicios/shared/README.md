# Código Compartido entre Microservicios

Esta carpeta contiene todo el código que es compartido entre los microservicios.

## Estructura

```
shared/
├── core/           # Configuración, database, security
├── models/         # Modelos SQLAlchemy
├── schemas/        # Schemas Pydantic
├── services/       # Lógica de negocio compartida
├── migrations/     # Migraciones de Alembic
└── alembic.ini    # Configuración de Alembic
```

## Uso

Los microservicios importan desde esta carpeta:

```python
# En cualquier microservicio
from shared.models.user import Usuario
from shared.schemas.user import UserRead
from shared.core.database import get_db
from shared.core.security import verify_password
```

## Instalación en cada servicio

Agregar al `requirements.txt` de cada servicio:

```
-e ../shared
```

O copiar los archivos necesarios a cada servicio.
