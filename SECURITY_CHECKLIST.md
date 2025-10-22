# 🔒 Checklist Rápido de Seguridad

## ✅ Pre-Deploy a Producción

### Backend
- [ ] **SECRET_KEY generado**  
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(64))"
  ```
  
- [ ] **DEBUG=False en .env**
  ```bash
  DEBUG=False
  ENVIRONMENT=production
  ```

- [ ] **CORS configurado con dominios específicos**
  ```python
  # app/main.py
  allow_origins=[
      "https://conectarprofesionales.com",
      "https://www.conectarprofesionales.com"
  ]
  ```

- [ ] **Instalar dependencias de seguridad**
  ```bash
  pip install slowapi==0.1.9 cryptography==41.0.7
  ```

- [ ] **Rate limiting activado**
  - ✅ Ya configurado en app/main.py

- [ ] **Database URL segura**
  - ✅ No usar localhost en producción
  - ✅ Credenciales fuertes

### Frontend
- [ ] **NODE_ENV=production**
  ```bash
  NODE_ENV=production
  ```

- [ ] **API URL de producción**
  ```bash
  NEXT_PUBLIC_API_URL=https://api.conectarprofesionales.com
  ```

- [ ] **Firebase config de producción**
  - ✅ API keys correctos
  - ✅ Domain autorizado en Firebase Console

- [ ] **CSP configurado**
  - ✅ Ya implementado en next.config.ts

### HTTPS
- [ ] **Certificado SSL instalado**
  - Opción 1: Let's Encrypt (gratis)
  - Opción 2: Cloudflare (fácil)
  - Opción 3: Comprar certificado

- [ ] **Redirect HTTP → HTTPS**
  ```nginx
  # Nginx
  return 301 https://$server_name$request_uri;
  ```

- [ ] **HSTS habilitado**
  - ✅ Ya configurado en headers

### Archivos Sensibles
- [ ] **.env en .gitignore**
  ```bash
  # Verificar
  cat .gitignore | grep .env
  ```

- [ ] **No hay secrets en código**
  ```bash
  # Buscar API keys expuestas
  git grep -i "api_key\|secret\|password" --untracked
  ```

### Base de Datos
- [ ] **Backup automático configurado**
  ```bash
  # Cron job para backup diario
  0 2 * * * pg_dump conectar_pro > /backups/db_$(date +\%Y\%m\%d).sql
  ```

- [ ] **Credenciales rotadas**
  - Usuario diferente al default
  - Password fuerte (32+ chars)

## 🚀 Comandos de Deploy

### 1. Backend
```bash
# Actualizar código
git pull origin main

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones
alembic upgrade head

# Reiniciar servicio
sudo systemctl restart conectar-api
```

### 2. Frontend
```bash
# Actualizar código
git pull origin main

# Instalar dependencias
cd frontend
npm install

# Build
npm run build

# Reiniciar
pm2 restart conectar-frontend
```

### 3. Nginx
```bash
# Test configuración
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

## 🔍 Verificaciones Post-Deploy

### Headers de Seguridad
```bash
curl -I https://conectarprofesionales.com

# Debes ver:
# Strict-Transport-Security: max-age=31536000
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Content-Security-Policy: ...
```

### HTTPS Funcionando
```bash
# Debe redirigir a HTTPS
curl -I http://conectarprofesionales.com

# Debe retornar 200
curl -I https://conectarprofesionales.com
```

### Rate Limiting
```bash
# Enviar 15 requests rápidos (debe bloquear después de 10)
for i in {1..15}; do curl https://api.conectarprofesionales.com/; done
```

### API Accessible
```bash
curl https://api.conectarprofesionales.com/
# Debe retornar: {"status":"ok"}
```

## ⚠️ Errores Comunes

### 1. "Mixed Content" en navegador
**Problema**: API en HTTP, frontend en HTTPS  
**Solución**: Asegurar que API también use HTTPS

### 2. CORS Error
**Problema**: Dominio no en allow_origins  
**Solución**: Agregar dominio a app/main.py

### 3. 429 Too Many Requests
**Problema**: Rate limit muy bajo  
**Solución**: Ajustar límites en app/main.py

### 4. Certificate Invalid
**Problema**: Certificado SSL expirado  
**Solución**: Renovar con certbot renew

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs: `tail -f app.log`
2. Verificar headers: `curl -I tu-dominio.com`
3. Consultar SECURITY_GUIDE.md para detalles
