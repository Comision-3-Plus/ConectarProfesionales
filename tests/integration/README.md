# Tests de Integración - ConectarProfesionales

Suite de tests de integración End-to-End para validar flujos completos del sistema.

## 📋 Requisitos

```bash
pip install pytest pytest-asyncio httpx
```

## 🚀 Ejecutar Tests

### Todos los tests de integración

```bash
# Desde la raíz del proyecto
pytest tests/integration/ -v

# Con output detallado
pytest tests/integration/ -v -s

# Solo un archivo específico
pytest tests/integration/test_professional_flow.py -v

# Solo un test específico
pytest tests/integration/test_professional_flow.py::test_professional_registration_flow -v
```

### Por categoría

```bash
# Tests de profesionales
pytest tests/integration/test_professional_flow.py -v

# Tests de pagos
pytest tests/integration/test_payment_flow.py -v
```

### Con coverage

```bash
pytest tests/integration/ --cov=servicios --cov-report=html
```

## 📁 Archivos de Tests

### `test_professional_flow.py`

Tests del flujo completo de profesionales:

- ✅ Registro de profesional
- ✅ Autenticación JWT
- ✅ Creación de perfil profesional
- ✅ CRUD de portfolio
- ✅ Búsqueda geoespacial
- ✅ Perfil público
- ✅ Estadísticas
- ✅ Verificación de cache

**Total:** ~15 tests

### `test_payment_flow.py`

Tests del flujo completo de pagos:

- ✅ Creación de ofertas
- ✅ Aceptación/Rechazo de ofertas
- ✅ Gestión de trabajos
- ✅ Generación de preference de MercadoPago
- ✅ Procesamiento de pagos
- ✅ Sistema de escrow
- ✅ Liberación de pagos
- ✅ Creación de reseñas
- ✅ Timeline de trabajos
- ✅ Validaciones de negocio
- ✅ Historial de pagos

**Total:** ~20 tests

## 🔧 Configuración

### Variables de Entorno

```bash
# .env.test
API_BASE_URL=http://localhost:8000
DATABASE_URL=postgresql://user:pass@localhost:5432/conectar_test
REDIS_URL=redis://localhost:6379/1
```

### Configuración de pytest

El archivo `conftest.py` contiene:

- Event loop para asyncio
- Fixtures globales
- Markers personalizados (`@pytest.mark.integration`)

## 📊 Coverage Objetivo

**Target:** 70% de cobertura mínima

Áreas cubiertas:

- ✅ Autenticación y autorización
- ✅ Gestión de profesionales
- ✅ Portfolio y búsquedas
- ✅ Ofertas y trabajos
- ✅ Pagos y escrow
- ✅ Reseñas
- ✅ Validaciones de negocio

## 🧪 Estructura de Tests

Cada test sigue el patrón AAA:

```python
@pytest.mark.asyncio
async def test_example(authenticated_client):
    # Arrange (preparar datos)
    data = {"key": "value"}
    
    # Act (ejecutar acción)
    response = await authenticated_client.post("/endpoint", json=data)
    
    # Assert (verificar resultado)
    assert response.status_code == 201
    assert response.json()["key"] == "value"
```

## 🔍 Fixtures Disponibles

### `client`
Cliente HTTP sin autenticación.

### `authenticated_client`
Cliente autenticado como profesional.

### `cliente_authenticated`
Cliente autenticado como cliente (usuario común).

### `profesional_authenticated`
Cliente autenticado como profesional verificado.

### `test_user_credentials`
Credenciales de usuario de prueba.

## 📝 Agregar Nuevos Tests

1. Crear archivo `test_nuevo_flow.py`
2. Importar fixtures necesarias
3. Escribir tests siguiendo convenciones
4. Ejecutar y verificar coverage

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_nuevo_feature(authenticated_client):
    # Test code here
    pass
```

## 🐛 Debugging

Para debugear un test específico:

```bash
# Con breakpoints
pytest tests/integration/test_professional_flow.py::test_name -v -s --pdb

# Ver logs completos
pytest tests/integration/ -v -s --log-cli-level=DEBUG
```

## ⚡ Performance

Los tests de integración pueden ser lentos. Para acelerar:

```bash
# Ejecutar en paralelo (requiere pytest-xdist)
pip install pytest-xdist
pytest tests/integration/ -n auto

# Solo tests rápidos (excluir marcados como @pytest.mark.slow)
pytest tests/integration/ -m "not slow"
```

## 📈 CI/CD

En CI/CD, ejecutar con:

```bash
pytest tests/integration/ -v --junitxml=test-results.xml --cov=servicios --cov-report=xml
```

## 🔐 Datos de Prueba

Los tests usan datos de prueba que se crean/limpian automáticamente.

**Usuarios de prueba:**
- `test_cliente@example.com` / `Test1234!` (Cliente)
- `test_professional@example.com` / `Test1234!` (Profesional)

**IMPORTANTE:** Estos usuarios deben existir en la base de datos de test antes de ejecutar los tests.

## 📚 Recursos

- [pytest docs](https://docs.pytest.org/)
- [pytest-asyncio](https://pytest-asyncio.readthedocs.io/)
- [httpx](https://www.python-httpx.org/)
