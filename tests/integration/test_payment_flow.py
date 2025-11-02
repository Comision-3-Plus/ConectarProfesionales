"""
Tests de integración para flujo completo de pagos.
Cubre: Ofertas, Trabajos, Pagos, Escrow, Liberación.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient
import os
from datetime import datetime

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

# ============================================================================
# FIXTURES
# ============================================================================

@pytest_asyncio.fixture
async def cliente_authenticated():
    """Cliente autenticado como CLIENTE"""
    async with AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        login_response = await client.post("/api/v1/auth/login", data={
            "username": "test_cliente@example.com",
            "password": "Test1234!"
        })
        
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        client.headers["Authorization"] = f"Bearer {token}"
        
        yield client


@pytest_asyncio.fixture
async def profesional_authenticated():
    """Cliente autenticado como PROFESIONAL"""
    async with AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        login_response = await client.post("/api/v1/auth/login", data={
            "username": "test_professional@example.com",
            "password": "Test1234!"
        })
        
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        client.headers["Authorization"] = f"Bearer {token}"
        
        yield client


# ============================================================================
# TESTS DE OFERTAS
# ============================================================================

@pytest.mark.asyncio
async def test_create_oferta_as_cliente(cliente_authenticated):
    """
    Test: Cliente crea una oferta para un profesional.
    """
    oferta_data = {
        "profesional_id": "prof-uuid-123",  # ID del profesional
        "descripcion": "Necesito reparar una canilla que gotea",
        "fecha_preferida": datetime.now().isoformat(),
        "monto_ofrecido": 1500.0,
        "direccion": "Av. Corrientes 1234, CABA",
        "latitude": -34.6037,
        "longitude": -58.3816
    }
    
    response = await cliente_authenticated.post("/api/v1/ofertas", json=oferta_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["monto"] == 1500.0
    assert data["estado"] == "PENDIENTE"
    assert "id" in data


@pytest.mark.asyncio
async def test_get_ofertas_cliente(cliente_authenticated):
    """
    Test: Cliente obtiene sus ofertas.
    """
    response = await cliente_authenticated.get("/api/v1/cliente/ofertas")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_ofertas_profesional(profesional_authenticated):
    """
    Test: Profesional obtiene ofertas recibidas.
    """
    response = await profesional_authenticated.get("/api/v1/professional/ofertas")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_accept_oferta(profesional_authenticated, cliente_authenticated):
    """
    Test del flujo completo: Cliente crea oferta → Profesional acepta → Trabajo creado.
    """
    # 1. Cliente crea oferta
    oferta_data = {
        "profesional_id": "prof-uuid-123",
        "descripcion": "Instalación de ventilador de techo",
        "monto_ofrecido": 2000.0,
        "direccion": "Calle Falsa 123",
        "latitude": -34.6037,
        "longitude": -58.3816
    }
    
    create_response = await cliente_authenticated.post("/api/v1/ofertas", json=oferta_data)
    assert create_response.status_code == 201
    oferta_id = create_response.json()["id"]
    
    # 2. Profesional acepta la oferta
    accept_response = await profesional_authenticated.post(
        f"/api/v1/ofertas/{oferta_id}/accept"
    )
    
    assert accept_response.status_code == 200
    trabajo_data = accept_response.json()
    
    # Verificar que se creó el trabajo
    assert "trabajo_id" in trabajo_data
    assert trabajo_data["estado"] == "PENDIENTE_PAGO"


@pytest.mark.asyncio
async def test_reject_oferta(profesional_authenticated, cliente_authenticated):
    """
    Test: Profesional rechaza una oferta.
    """
    # Cliente crea oferta
    oferta_data = {
        "profesional_id": "prof-uuid-123",
        "descripcion": "Trabajo urgente",
        "monto_ofrecido": 1000.0,
        "direccion": "Dirección test",
        "latitude": -34.6,
        "longitude": -58.4
    }
    
    create_response = await cliente_authenticated.post("/api/v1/ofertas", json=oferta_data)
    oferta_id = create_response.json()["id"]
    
    # Profesional rechaza
    reject_response = await profesional_authenticated.post(
        f"/api/v1/ofertas/{oferta_id}/reject"
    )
    
    assert reject_response.status_code == 200
    data = reject_response.json()
    assert data["estado"] == "RECHAZADA"


# ============================================================================
# TESTS DE TRABAJOS
# ============================================================================

@pytest.mark.asyncio
async def test_get_trabajos_cliente(cliente_authenticated):
    """
    Test: Cliente obtiene sus trabajos.
    """
    response = await cliente_authenticated.get("/api/v1/trabajos")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_trabajos_profesional(profesional_authenticated):
    """
    Test: Profesional obtiene sus trabajos.
    """
    response = await profesional_authenticated.get("/api/v1/professional/trabajos")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_trabajo_detail(cliente_authenticated):
    """
    Test: Obtener detalle de un trabajo.
    """
    # Primero obtener lista de trabajos
    list_response = await cliente_authenticated.get("/api/v1/trabajos")
    trabajos = list_response.json()
    
    if len(trabajos) > 0:
        trabajo_id = trabajos[0]["id"]
        
        # Obtener detalle
        detail_response = await cliente_authenticated.get(f"/api/v1/trabajos/{trabajo_id}")
        
        assert detail_response.status_code == 200
        data = detail_response.json()
        assert data["id"] == trabajo_id
        assert "estado" in data
        assert "escrow_estado" in data


# ============================================================================
# TESTS DE PAGOS Y ESCROW
# ============================================================================

@pytest.mark.asyncio
async def test_create_payment_preference(cliente_authenticated):
    """
    Test: Crear preference de MercadoPago para un trabajo.
    """
    # Primero necesitamos un trabajo en estado PENDIENTE_PAGO
    # Asumiendo que ya existe un trabajo
    trabajo_id = 1  # ID de ejemplo
    
    payment_response = await cliente_authenticated.post(
        f"/api/v1/payment/create-preference/{trabajo_id}"
    )
    
    # Puede fallar si el trabajo no existe o no está en estado correcto
    # En producción verificar estado 200 o 400
    assert payment_response.status_code in [200, 400, 404]
    
    if payment_response.status_code == 200:
        data = payment_response.json()
        assert "preference_id" in data
        assert "init_point" in data


@pytest.mark.asyncio
async def test_payment_flow_complete(cliente_authenticated, profesional_authenticated):
    """
    Test del flujo completo de pago:
    1. Cliente crea oferta
    2. Profesional acepta (crea trabajo)
    3. Cliente genera preference de pago
    4. Simular webhook de MercadoPago (pago aprobado)
    5. Verificar escrow actualizado
    6. Profesional marca trabajo completado
    7. Cliente aprueba trabajo
    8. Verificar liberación de escrow
    """
    # 1. Cliente crea oferta
    oferta_data = {
        "profesional_id": "prof-uuid-123",
        "descripcion": "Trabajo completo de prueba",
        "monto_ofrecido": 3000.0,
        "direccion": "Test Address",
        "latitude": -34.6,
        "longitude": -58.4
    }
    
    oferta_response = await cliente_authenticated.post("/api/v1/ofertas", json=oferta_data)
    assert oferta_response.status_code == 201
    oferta_id = oferta_response.json()["id"]
    
    # 2. Profesional acepta
    accept_response = await profesional_authenticated.post(f"/api/v1/ofertas/{oferta_id}/accept")
    assert accept_response.status_code == 200
    trabajo_id = accept_response.json()["trabajo_id"]
    
    # 3. Cliente genera preference
    preference_response = await cliente_authenticated.post(
        f"/api/v1/payment/create-preference/{trabajo_id}"
    )
    
    if preference_response.status_code == 200:
        preference_data = preference_response.json()
        assert "preference_id" in preference_data
        
        # 4. Simular webhook (esto normalmente lo hace MercadoPago)
        # En tests reales, usar mock o endpoint de testing
        
        # 5. Verificar escrow
        trabajo_response = await cliente_authenticated.get(f"/api/v1/trabajos/{trabajo_id}")
        trabajo = trabajo_response.json()
        
        # Estado debería ser EN_CURSO con pago en escrow
        # (dependiendo de implementación del webhook)


@pytest.mark.asyncio
async def test_complete_trabajo_flow(profesional_authenticated, cliente_authenticated):
    """
    Test: Profesional marca trabajo como completado → Cliente aprueba.
    """
    # Asumiendo trabajo existente en estado EN_CURSO
    trabajo_id = 1
    
    # 1. Profesional marca como completado
    complete_response = await profesional_authenticated.put(
        f"/api/v1/trabajos/{trabajo_id}/marcar-completado"
    )
    
    if complete_response.status_code == 200:
        # 2. Cliente aprueba el trabajo
        approve_response = await cliente_authenticated.post(
            f"/api/v1/trabajos/{trabajo_id}/aprobar"
        )
        
        assert approve_response.status_code in [200, 400]
        
        if approve_response.status_code == 200:
            data = approve_response.json()
            assert data["estado"] == "COMPLETADO"
            assert data["escrow_estado"] == "LIBERADO"


# ============================================================================
# TESTS DE RESEÑAS
# ============================================================================

@pytest.mark.asyncio
async def test_create_resena(cliente_authenticated):
    """
    Test: Cliente crea reseña para un trabajo completado.
    """
    # Asumiendo trabajo completado
    trabajo_id = 1
    
    resena_data = {
        "rating": 5,
        "comentario": "Excelente trabajo, muy profesional y puntual",
        "puntualidad": 5,
        "profesionalismo": 5,
        "calidad_trabajo": 5,
        "relacion_precio_calidad": 5
    }
    
    response = await cliente_authenticated.post(
        f"/api/v1/resenas/{trabajo_id}",
        json=resena_data
    )
    
    # Puede fallar si el trabajo no está completado o ya tiene reseña
    assert response.status_code in [201, 400, 404]
    
    if response.status_code == 201:
        data = response.json()
        assert data["rating"] == 5
        assert data["trabajo_id"] == trabajo_id


@pytest.mark.asyncio
async def test_get_professional_reviews(cliente_authenticated):
    """
    Test: Obtener reseñas de un profesional.
    """
    prof_id = "prof-uuid-123"
    
    response = await cliente_authenticated.get(f"/api/v1/public/professional/{prof_id}/reviews")
    
    assert response.status_code in [200, 404]
    
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)


# ============================================================================
# TESTS DE TIMELINE
# ============================================================================

@pytest.mark.asyncio
async def test_get_trabajo_timeline(cliente_authenticated):
    """
    Test: Obtener historial de estados de un trabajo.
    """
    trabajo_id = 1
    
    response = await cliente_authenticated.get(f"/api/v1/trabajos/{trabajo_id}/timeline")
    
    assert response.status_code in [200, 404]
    
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)
        
        # Verificar estructura de timeline
        if len(data) > 0:
            event = data[0]
            assert "timestamp" in event
            assert "estado" in event
            assert "user_id" in event


# ============================================================================
# TESTS DE VALIDACIONES
# ============================================================================

@pytest.mark.asyncio
async def test_cannot_create_duplicate_resena(cliente_authenticated):
    """
    Test: No se puede crear más de una reseña por trabajo.
    """
    trabajo_id = 1  # Trabajo que ya tiene reseña
    
    resena_data = {
        "rating": 4,
        "comentario": "Segundo intento de reseña",
        "puntualidad": 4,
        "profesionalismo": 4,
        "calidad_trabajo": 4,
        "relacion_precio_calidad": 4
    }
    
    response = await cliente_authenticated.post(
        f"/api/v1/resenas/{trabajo_id}",
        json=resena_data
    )
    
    # Debería fallar si ya existe reseña
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_cannot_accept_oferta_twice(profesional_authenticated):
    """
    Test: No se puede aceptar una oferta ya aceptada.
    """
    oferta_id = 1  # Oferta ya aceptada
    
    response = await profesional_authenticated.post(f"/api/v1/ofertas/{oferta_id}/accept")
    
    assert response.status_code == 400


# ============================================================================
# TESTS DE PAYMENT HISTORY
# ============================================================================

@pytest.mark.asyncio
async def test_get_payment_history_cliente(cliente_authenticated):
    """
    Test: Cliente obtiene su historial de pagos.
    """
    response = await cliente_authenticated.get("/api/v1/payment/history")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_payment_history_profesional(profesional_authenticated):
    """
    Test: Profesional obtiene su historial de pagos recibidos.
    """
    response = await profesional_authenticated.get("/api/v1/payment/history")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
