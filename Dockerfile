# Dockerfile para FastAPI con Python 3.11
FROM python:3.11-slim

# Establecer el directorio de trabajo
WORKDIR /code

# Variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/code

# Instalar dependencias del sistema necesarias para PostGIS y psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias de Python
COPY requirements.txt /code/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY ./app /code/app
COPY ./alembic.ini /code/
COPY ./migrations /code/migrations

# Exponer el puerto 8000
EXPOSE 8000

# Comando para iniciar la aplicación con hot-reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
