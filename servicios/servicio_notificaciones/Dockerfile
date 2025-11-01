FROM python:3.11-slim

WORKDIR /app

COPY servicio_notificaciones/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY shared/ ./shared/
COPY servicio_notificaciones/app/ ./app/

EXPOSE 8006

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8006", "--reload"]
