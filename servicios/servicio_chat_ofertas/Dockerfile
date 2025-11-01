FROM python:3.11-slim

WORKDIR /app

COPY servicio_chat_ofertas/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY shared/ ./shared/
COPY servicio_chat_ofertas/app/ ./app/

EXPOSE 8004

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004", "--reload"]
