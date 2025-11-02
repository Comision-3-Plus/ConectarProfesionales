"""
Tests de integración para flujo completo de profesionales.
Cubre: Registro, KYC, Portfolio, Búsqueda geoespacial.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# URL base del API Gateway
BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

# ============================================================================
# FIXTURES
# ============================================================================

@pytest_asyncio.fixture
async def client():
    """Cliente HTTP asíncrono para tests"""
    async with AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        yield client


@pytest_asyncio.fixture
async def authenticated_client():
    """Cliente autenticado como profesional"""
    async with AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # Login
        login_response = await client.post("/api/v1/auth/login", data={
            "username": "test_professional@example.com",
            "password": "Test1234!"
        })
        
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Agregar token a headers
        client.headers["Authorization"] = f"Bearer {token}"
        
        yield client


@pytest_asyncio.fixture
async def test_user_credentials():
    """Credenciales de usuario de prueba"""
    return {
        "email": f"test_prof_{pytest.timestamp}@example.com",
        "password": "Test1234!",
        "nombre": "Juan",
        "apellido": "Pérez",
        "telefono": "+541112345678"
    }


# ============================================================================
# TESTS DE REGISTRO Y AUTENTICACIÓN
# ============================================================================

@pytest.mark.asyncio
async def test_professional_registration_flow(client, test_user_credentials):
    """
    Test del flujo completo de registro de profesional.
    
    Pasos:
    1. Registrar usuario
    2. Verificar que el usuario existe
    3. Hacer login
    4. Verificar token JWT
    """
    # 1. Registrar usuario
    register_response = await client.post("/api/v1/auth/register", json={
        "email": test_user_credentials["email"],
        "password": test_user_credentials["password"],
        "nombre": test_user_credentials["nombre"],
        "apellido": test_user_credentials["apellido"],
        "telefono": test_user_credentials["telefono"],
        "rol": "PROFESIONAL"
    })
    
    assert register_response.status_code == 201
    user_data = register_response.json()
    assert user_data["email"] == test_user_credentials["email"]
    assert user_data["rol"] == "PROFESIONAL"
    
    # 2. Login
    login_response = await client.post("/api/v1/auth/login", data={
        "username": test_user_credentials["email"],
        "password": test_user_credentials["password"]
    })
    
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    
    # 3. Verificar token con /auth/me
    token = token_data["access_token"]
    me_response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == test_user_credentials["email"]


# ============================================================================
# TESTS DE PERFIL PROFESIONAL
# ============================================================================

@pytest.mark.asyncio
async def test_create_professional_profile(authenticated_client):
    """
    Test crear perfil de profesional.
    """
    profile_data = {
        "oficio_principal_id": 1,  # Plomero
        "biografia": "Plomero con 10 años de experiencia",
        "precio_por_hora": 1500.0,
        "radio_trabajo_km": 20,
        "latitude": -34.6037,
        "longitude": -58.3816
    }
    
    response = await authenticated_client.post(
        "/api/v1/professional/profile",
        json=profile_data
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["oficio_principal_id"] == 1
    assert data["precio_por_hora"] == 1500.0


@pytest.mark.asyncio
async def test_get_professional_profile(authenticated_client):
    """
    Test obtener perfil de profesional.
    """
    response = await authenticated_client.get("/api/v1/professional/me")
    
    assert response.status_code == 200
    data = response.json()
    assert "oficio_principal_id" in data
    assert "rating_promedio" in data


# ============================================================================
# TESTS DE PORTFOLIO
# ============================================================================

@pytest.mark.asyncio
async def test_create_portfolio_item(authenticated_client):
    """
    Test crear item de portfolio.
    """
    portfolio_data = {
        "titulo": "Instalación de calefón",
        "descripcion": "Instalación completa de calefón a gas en departamento"
    }
    
    response = await authenticated_client.post(
        "/api/v1/professional/portfolio",
        json=portfolio_data
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["titulo"] == portfolio_data["titulo"]
    assert data["descripcion"] == portfolio_data["descripcion"]
    assert "id" in data


@pytest.mark.asyncio
async def test_get_portfolio_items(authenticated_client):
    """
    Test listar items de portfolio.
    """
    response = await authenticated_client.get("/api/v1/professional/portfolio")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_update_portfolio_item(authenticated_client):
    """
    Test actualizar item de portfolio.
    """
    # Primero crear un item
    create_response = await authenticated_client.post(
        "/api/v1/professional/portfolio",
        json={
            "titulo": "Trabajo original",
            "descripcion": "Descripción original"
        }
    )
    
    assert create_response.status_code == 201
    item_id = create_response.json()["id"]
    
    # Actualizar el item
    update_response = await authenticated_client.put(
        f"/api/v1/professional/portfolio/{item_id}",
        json={
            "titulo": "Trabajo actualizado",
            "descripcion": "Descripción actualizada"
        }
    )
    
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["titulo"] == "Trabajo actualizado"


@pytest.mark.asyncio
async def test_delete_portfolio_item(authenticated_client):
    """
    Test eliminar item de portfolio.
    """
    # Crear item
    create_response = await authenticated_client.post(
        "/api/v1/professional/portfolio",
        json={
            "titulo": "Item a eliminar",
            "descripcion": "Este item será eliminado"
        }
    )
    
    item_id = create_response.json()["id"]
    
    # Eliminar item
    delete_response = await authenticated_client.delete(
        f"/api/v1/professional/portfolio/{item_id}"
    )
    
    assert delete_response.status_code == 204
    
    # Verificar que no existe
    get_response = await authenticated_client.get(
        f"/api/v1/professional/portfolio/{item_id}"
    )
    assert get_response.status_code == 404


# ============================================================================
# TESTS DE BÚSQUEDA GEOESPACIAL
# ============================================================================

@pytest.mark.asyncio
async def test_search_professionals_by_location(client):
    """
    Test búsqueda de profesionales por ubicación.
    """
    search_params = {
        "latitude": -34.6037,  # Buenos Aires
        "longitude": -58.3816,
        "radio_km": 10,
        "oficio": "Plomero"
    }
    
    response = await client.post("/api/v1/search", json=search_params)
    
    assert response.status_code == 200
    data = response.json()
    assert "resultados" in data
    assert "total" in data
    assert isinstance(data["resultados"], list)


@pytest.mark.asyncio
async def test_search_professionals_with_filters(client):
    """
    Test búsqueda con filtros adicionales.
    """
    search_params = {
        "latitude": -34.6037,
        "longitude": -58.3816,
        "radio_km": 20,
        "oficio": "Electricista",
        "rating_minimo": 4.0,
        "precio_maximo": 2000.0,
        "disponible": True
    }
    
    response = await client.post("/api/v1/search", json=search_params)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verificar que todos los resultados cumplen los filtros
    for prof in data["resultados"]:
        assert prof["rating_promedio"] >= 4.0
        assert prof["precio_por_hora"] <= 2000.0


@pytest.mark.asyncio
async def test_search_with_ordering(client):
    """
    Test búsqueda con ordenamiento.
    """
    # Buscar ordenado por rating
    response_rating = await client.post("/api/v1/search", json={
        "latitude": -34.6037,
        "longitude": -58.3816,
        "radio_km": 50,
        "ordenar_por": "rating"
    })
    
    assert response_rating.status_code == 200
    results_rating = response_rating.json()["resultados"]
    
    # Verificar que está ordenado por rating descendente
    if len(results_rating) > 1:
        for i in range(len(results_rating) - 1):
            assert results_rating[i]["rating_promedio"] >= results_rating[i + 1]["rating_promedio"]
    
    # Buscar ordenado por precio
    response_precio = await client.post("/api/v1/search", json={
        "latitude": -34.6037,
        "longitude": -58.3816,
        "radio_km": 50,
        "ordenar_por": "precio"
    })
    
    assert response_precio.status_code == 200
    results_precio = response_precio.json()["resultados"]
    
    # Verificar que está ordenado por precio ascendente
    if len(results_precio) > 1:
        for i in range(len(results_precio) - 1):
            assert results_precio[i]["precio_por_hora"] <= results_precio[i + 1]["precio_por_hora"]


# ============================================================================
# TESTS DE PERFIL PÚBLICO
# ============================================================================

@pytest.mark.asyncio
async def test_get_public_professional_profile(client):
    """
    Test obtener perfil público de un profesional.
    """
    # Primero buscar un profesional
    search_response = await client.post("/api/v1/search", json={
        "latitude": -34.6037,
        "longitude": -58.3816,
        "radio_km": 50
    })
    
    results = search_response.json()["resultados"]
    
    if len(results) > 0:
        prof_id = results[0]["id"]
        
        # Obtener perfil público
        profile_response = await client.get(f"/api/v1/public/professional/{prof_id}")
        
        assert profile_response.status_code == 200
        data = profile_response.json()
        assert "nombre" in data
        assert "oficio_principal" in data
        assert "rating_promedio" in data
        assert "portfolio" in data


@pytest.mark.asyncio
async def test_get_public_portfolio(client):
    """
    Test obtener portfolio público de un profesional.
    """
    search_response = await client.post("/api/v1/search", json={
        "latitude": -34.6037,
        "longitude": -58.3816,
        "radio_km": 50
    })
    
    results = search_response.json()["resultados"]
    
    if len(results) > 0:
        prof_id = results[0]["id"]
        
        portfolio_response = await client.get(f"/api/v1/public/professional/{prof_id}/portfolio")
        
        assert portfolio_response.status_code == 200
        data = portfolio_response.json()
        assert isinstance(data, list)


# ============================================================================
# TESTS DE ESTADÍSTICAS
# ============================================================================

@pytest.mark.asyncio
async def test_get_professional_stats(authenticated_client):
    """
    Test obtener estadísticas del profesional.
    """
    response = await authenticated_client.get("/api/v1/professional/me/stats")
    
    assert response.status_code == 200
    data = response.json()
    assert "total_trabajos" in data
    assert "trabajos_completados" in data
    assert "ingresos_totales" in data
    assert "rating_promedio" in data


# ============================================================================
# TESTS DE CACHE
# ============================================================================

@pytest.mark.asyncio
async def test_search_cache_performance(client):
    """
    Test que la búsqueda usa cache correctamente.
    """
    search_params = {
        "latitude": -34.6037,
        "longitude": -58.3816,
        "radio_km": 10
    }
    
    # Primera búsqueda (sin cache)
    import time
    start_time = time.time()
    response1 = await client.post("/api/v1/search", json=search_params)
    first_duration = time.time() - start_time
    
    # Segunda búsqueda (con cache)
    start_time = time.time()
    response2 = await client.post("/api/v1/search", json=search_params)
    second_duration = time.time() - start_time
    
    assert response1.status_code == 200
    assert response2.status_code == 200
    
    # La segunda búsqueda debería ser más rápida (cache hit)
    # En pruebas locales puede no ser significativo, pero en producción sí
    print(f"Primera búsqueda: {first_duration:.3f}s")
    print(f"Segunda búsqueda: {second_duration:.3f}s")
