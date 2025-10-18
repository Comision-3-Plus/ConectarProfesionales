"""
E2E Tests for Module 2 (User Profile & Portfolio)
==================================================
QA Automation Engineer - End-to-End Testing Suite

This script validates the complete flow of Module 2:
1. User Profile Update (PUT /users/me) - Both Cliente and Professional
2. Avatar Upload (POST /users/me/avatar)
3. Servicios Instantáneos (Admin creates, Professional assigns)
4. Portfolio Management (Create, Upload Images, Public View, Delete)

NO MOCKS. Real API calls to http://api:8000/api/v1
"""

import httpx
import pytest
from datetime import datetime
from typing import Dict, Any
import io


# Configuration
API_URL = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "Admin1234!"


@pytest.fixture
def client():
    """HTTP client fixture for making API requests."""
    with httpx.Client(base_url=API_URL, timeout=30.0) as client:
        yield client


def generate_unique_email(prefix: str) -> str:
    """Generate unique email using timestamp to avoid conflicts."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
    return f"{prefix}_{timestamp}@example.com"


def register_user(client: httpx.Client, email: str, password: str, nombre: str, apellido: str, rol: str) -> Dict[str, Any]:
    """Register a new user and return the response JSON."""
    response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "nombre": nombre,
            "apellido": apellido,
            "rol": rol
        }
    )
    assert response.status_code == 201, f"Registration failed: {response.text}"
    return response.json()


def login_user(client: httpx.Client, email: str, password: str) -> str:
    """Login user and return the access token."""
    response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    assert "access_token" in data, "No access_token in response"
    return data["access_token"]


# ============================================================================
# TEST 1: USER PROFILE UPDATE (nombre y apellido)
# ============================================================================

def test_user_profile_update(client: httpx.Client):
    """
    Test user profile update for both Cliente and Professional:
    1. Register Cliente, update nombre/apellido
    2. Register Professional, update nombre/apellido
    3. Verify changes with GET /users/me
    4. Test partial update (only nombre)
    """
    print("\n" + "="*70)
    print("TEST 1: USER PROFILE UPDATE - Datos Básicos")
    print("="*70)
    
    # -------------------------------------------------------------------------
    # STEP 1: Cliente Profile Update
    # -------------------------------------------------------------------------
    print("\n[STEP 1] Testing Cliente profile update...")
    cliente_email = generate_unique_email("cliente_profile")
    cliente_password = "Password123!"
    
    cliente_data = register_user(
        client, cliente_email, cliente_password, 
        "Juan", "Original", "CLIENTE"
    )
    cliente_token = login_user(client, cliente_email, cliente_password)
    print(f"✓ Cliente registered: {cliente_email}")
    
    # Get initial profile
    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {cliente_token}"}
    )
    assert response.status_code == 200
    initial_profile = response.json()
    print(f"  Initial: {initial_profile['nombre']} {initial_profile['apellido']}")
    assert initial_profile["nombre"] == "Juan"
    assert initial_profile["apellido"] == "Original"
    
    # Update full profile
    response = client.put(
        "/users/me",
        headers={"Authorization": f"Bearer {cliente_token}"},
        json={
            "nombre": "Juan Carlos",
            "apellido": "Modificado"
        }
    )
    assert response.status_code == 200, f"Update failed: {response.text}"
    updated_profile = response.json()
    print(f"  Updated: {updated_profile['nombre']} {updated_profile['apellido']}")
    assert updated_profile["nombre"] == "Juan Carlos"
    assert updated_profile["apellido"] == "Modificado"
    
    # Verify with GET
    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {cliente_token}"}
    )
    verified = response.json()
    assert verified["nombre"] == "Juan Carlos"
    assert verified["apellido"] == "Modificado"
    print("✓ Cliente profile update verified")
    
    # -------------------------------------------------------------------------
    # STEP 2: Professional Profile Update
    # -------------------------------------------------------------------------
    print("\n[STEP 2] Testing Professional profile update...")
    pro_email = generate_unique_email("pro_profile")
    pro_password = "Password123!"
    
    register_user(client, pro_email, pro_password, "Maria", "Profesional", "PROFESIONAL")
    pro_token = login_user(client, pro_email, pro_password)
    print(f"✓ Professional registered: {pro_email}")
    
    # Partial update (only nombre)
    response = client.put(
        "/users/me",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={
            "nombre": "Maria Alejandra"
        }
    )
    assert response.status_code == 200
    partial_update = response.json()
    print(f"  Updated: {partial_update['nombre']} {partial_update['apellido']}")
    assert partial_update["nombre"] == "Maria Alejandra"
    assert partial_update["apellido"] == "Profesional"  # Should remain unchanged
    print("✓ Professional partial update verified")
    
    # -------------------------------------------------------------------------
    # STEP 3: Test Unauthenticated Access (401)
    # -------------------------------------------------------------------------
    print("\n[STEP 3] Testing unauthenticated update...")
    response = client.put(
        "/users/me",
        json={"nombre": "Hacker"}
    )
    assert response.status_code == 401
    print("✓ Unauthenticated update correctly rejected (401)")
    
    print("\n" + "="*70)
    print("✓ TEST 1 PASSED: User Profile Update Working!")
    print("="*70)


# ============================================================================
# TEST 2: AVATAR UPLOAD
# ============================================================================

def test_avatar_upload(client: httpx.Client):
    """
    Test avatar upload for users:
    1. Register Cliente, upload avatar
    2. Verify avatar_url in /users/me
    3. Test invalid file format (should fail)
    4. Register Professional, upload avatar
    5. Replace avatar with new one
    """
    print("\n" + "="*70)
    print("TEST 2: AVATAR UPLOAD - Foto de Perfil")
    print("="*70)
    
    # -------------------------------------------------------------------------
    # STEP 1: Cliente Avatar Upload
    # -------------------------------------------------------------------------
    print("\n[STEP 1] Cliente uploading avatar...")
    cliente_email = generate_unique_email("cliente_avatar")
    cliente_password = "Password123!"
    
    cliente_data = register_user(
        client, cliente_email, cliente_password,
        "Avatar", "Cliente", "CLIENTE"
    )
    cliente_token = login_user(client, cliente_email, cliente_password)
    cliente_id = cliente_data["id"]
    
    # Create fake image file
    fake_image = io.BytesIO(b"fake image content - this would be a real image")
    
    response = client.post(
        "/users/me/avatar",
        headers={"Authorization": f"Bearer {cliente_token}"},
        files={"file": ("avatar.jpg", fake_image, "image/jpeg")}
    )
    assert response.status_code == 200, f"Avatar upload failed: {response.text}"
    avatar_response = response.json()
    print(f"✓ Avatar uploaded")
    print(f"  Avatar URL: {avatar_response.get('avatar_url')}")
    
    # Verify avatar_url was saved
    assert avatar_response["avatar_url"] is not None
    assert "avatar" in avatar_response["avatar_url"]
    assert cliente_id in avatar_response["avatar_url"]
    
    # -------------------------------------------------------------------------
    # STEP 2: Verify Avatar in Profile
    # -------------------------------------------------------------------------
    print("\n[STEP 2] Verifying avatar in profile...")
    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {cliente_token}"}
    )
    profile = response.json()
    assert profile["avatar_url"] is not None
    print(f"✓ Avatar URL in profile: {profile['avatar_url']}")
    
    # -------------------------------------------------------------------------
    # STEP 3: Test Invalid File Format
    # -------------------------------------------------------------------------
    print("\n[STEP 3] Testing invalid file format...")
    invalid_file = io.BytesIO(b"not an image")
    
    response = client.post(
        "/users/me/avatar",
        headers={"Authorization": f"Bearer {cliente_token}"},
        files={"file": ("document.pdf", invalid_file, "application/pdf")}
    )
    assert response.status_code == 400, f"Expected 400 for invalid format, got {response.status_code}"
    print("✓ Invalid format correctly rejected (400)")
    
    # -------------------------------------------------------------------------
    # STEP 4: Professional Avatar Upload
    # -------------------------------------------------------------------------
    print("\n[STEP 4] Professional uploading avatar...")
    pro_email = generate_unique_email("pro_avatar")
    pro_password = "Password123!"
    
    pro_data = register_user(
        client, pro_email, pro_password,
        "Avatar", "Professional", "PROFESIONAL"
    )
    pro_token = login_user(client, pro_email, pro_password)
    
    fake_image = io.BytesIO(b"professional avatar image")
    response = client.post(
        "/users/me/avatar",
        headers={"Authorization": f"Bearer {pro_token}"},
        files={"file": ("pro_avatar.png", fake_image, "image/png")}
    )
    assert response.status_code == 200
    print("✓ Professional avatar uploaded")
    
    # -------------------------------------------------------------------------
    # STEP 5: Replace Avatar
    # -------------------------------------------------------------------------
    print("\n[STEP 5] Replacing avatar with new one...")
    new_image = io.BytesIO(b"new avatar image")
    response = client.post(
        "/users/me/avatar",
        headers={"Authorization": f"Bearer {pro_token}"},
        files={"file": ("new_avatar.jpg", new_image, "image/jpeg")}
    )
    assert response.status_code == 200
    new_avatar = response.json()
    print(f"✓ Avatar replaced")
    print(f"  New URL: {new_avatar['avatar_url']}")
    
    print("\n" + "="*70)
    print("✓ TEST 2 PASSED: Avatar Upload Working!")
    print("="*70)


# ============================================================================
# TEST 3: SERVICIOS INSTANTÁNEOS (Admin creates, Professional assigns)
# ============================================================================

def test_servicios_instantaneos_flow(client: httpx.Client):
    """
    Test servicios instantáneos complete flow:
    1. Admin creates oficio "Mantenimiento Hogar"
    2. Admin creates servicios instantáneos linked to oficio
    3. List servicios by oficio
    4. Professional assigns servicios
    5. Update servicios list
    6. Test invalid oficio_id (404)
    """
    print("\n" + "="*70)
    print("TEST 3: SERVICIOS INSTANTÁNEOS - Servicios Rápidos")
    print("="*70)
    
    # Setup: Login Admin and create Professional
    admin_token = login_user(client, ADMIN_EMAIL, ADMIN_PASSWORD)
    
    pro_email = generate_unique_email("pro_servicios")
    pro_password = "Password123!"
    register_user(client, pro_email, pro_password, "Pro", "Servicios", "PROFESIONAL")
    pro_token = login_user(client, pro_email, pro_password)
    
    # -------------------------------------------------------------------------
    # STEP 1: Admin Creates Oficio
    # -------------------------------------------------------------------------
    print("\n[STEP 1] Admin creating oficio 'Mantenimiento Hogar'...")
    response = client.post(
        "/admin/oficios",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "nombre": f"Mantenimiento Hogar {datetime.now().timestamp()}",
            "descripcion": "Servicios de mantenimiento general del hogar"
        }
    )
    assert response.status_code == 201, f"Failed to create oficio: {response.text}"
    oficio = response.json()
    oficio_id = oficio["id"]
    print(f"✓ Oficio created with ID: {oficio_id}")
    
    # -------------------------------------------------------------------------
    # STEP 2: Admin Creates Servicios Instantáneos
    # -------------------------------------------------------------------------
    print("\n[STEP 2] Admin creating servicios instantáneos...")
    
    servicios_to_create = [
        {
            "nombre": "Colgar un cuadro",
            "descripcion": "Instalación de cuadros y marcos en la pared"
        },
        {
            "nombre": "Cambiar foco",
            "descripcion": "Reemplazo de focos y bombillas"
        },
        {
            "nombre": "Armar mueble",
            "descripcion": "Armado de muebles de kit (IKEA, etc.)"
        }
    ]
    
    servicio_ids = []
    for servicio_data in servicios_to_create:
        response = client.post(
            "/admin/servicios-instant",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                **servicio_data,
                "oficio_id": oficio_id
            }
        )
        assert response.status_code == 201, f"Failed to create servicio: {response.text}"
        servicio = response.json()
        servicio_ids.append(servicio["id"])
        print(f"✓ Servicio '{servicio['nombre']}' created")
    
    # -------------------------------------------------------------------------
    # STEP 3: List Servicios by Oficio
    # -------------------------------------------------------------------------
    print(f"\n[STEP 3] Listing servicios for oficio {oficio_id}...")
    response = client.get(
        f"/admin/oficios/{oficio_id}/servicios-instant",
        headers={"Authorization": f"Bearer {pro_token}"}
    )
    assert response.status_code == 200, f"Failed to list servicios: {response.text}"
    servicios_list = response.json()
    print(f"✓ Retrieved {len(servicios_list)} servicios")
    for servicio in servicios_list:
        print(f"  - {servicio['nombre']}")
    
    assert len(servicios_list) == 3
    
    # -------------------------------------------------------------------------
    # STEP 4: Professional Assigns Servicios
    # -------------------------------------------------------------------------
    print("\n[STEP 4] Professional assigning 2 servicios...")
    response = client.put(
        "/professional/profile/servicios-instant",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={
            "servicio_ids": servicio_ids[:2]  # First 2 services
        }
    )
    assert response.status_code == 200, f"Failed to assign servicios: {response.text}"
    assigned_servicios = response.json()
    print(f"✓ Assigned {len(assigned_servicios)} servicios")
    
    assigned_names = {s["nombre"] for s in assigned_servicios}
    assert "Colgar un cuadro" in assigned_names
    assert "Cambiar foco" in assigned_names
    print(f"  Services: {assigned_names}")
    
    # -------------------------------------------------------------------------
    # STEP 5: Update Servicios List (Replace)
    # -------------------------------------------------------------------------
    print("\n[STEP 5] Professional replacing with all 3 servicios...")
    response = client.put(
        "/professional/profile/servicios-instant",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={
            "servicio_ids": servicio_ids  # All 3 services
        }
    )
    assert response.status_code == 200
    new_servicios = response.json()
    assert len(new_servicios) == 3
    print(f"✓ Updated to {len(new_servicios)} servicios")
    
    # -------------------------------------------------------------------------
    # STEP 6: Test Invalid Oficio ID (404)
    # -------------------------------------------------------------------------
    print("\n[STEP 6] Testing invalid oficio_id...")
    fake_uuid = "00000000-0000-0000-0000-000000000000"
    response = client.get(
        f"/admin/oficios/{fake_uuid}/servicios-instant",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 404
    print("✓ Invalid oficio_id correctly rejected (404)")
    
    # -------------------------------------------------------------------------
    # STEP 7: Test Invalid Servicio Creation (Non-existent oficio)
    # -------------------------------------------------------------------------
    print("\n[STEP 7] Testing servicio creation with invalid oficio...")
    response = client.post(
        "/admin/servicios-instant",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "nombre": "Invalid Service",
            "descripcion": "Should fail",
            "oficio_id": fake_uuid
        }
    )
    assert response.status_code == 404
    print("✓ Servicio with invalid oficio correctly rejected (404)")
    
    # -------------------------------------------------------------------------
    # STEP 8: Cliente Cannot Create Servicios (403)
    # -------------------------------------------------------------------------
    print("\n[STEP 8] Testing Cliente cannot create servicios...")
    cliente_email = generate_unique_email("cliente_noservicio")
    cliente_password = "Password123!"
    register_user(client, cliente_email, cliente_password, "Cliente", "No", "CLIENTE")
    cliente_token = login_user(client, cliente_email, cliente_password)
    
    response = client.post(
        "/admin/servicios-instant",
        headers={"Authorization": f"Bearer {cliente_token}"},
        json={
            "nombre": "Unauthorized",
            "descripcion": "Should fail",
            "oficio_id": oficio_id
        }
    )
    assert response.status_code == 403
    print("✓ Cliente correctly denied (403)")
    
    print("\n" + "="*70)
    print("✓ TEST 3 PASSED: Servicios Instantáneos Working!")
    print("="*70)


# ============================================================================
# TEST 4: PORTFOLIO MANAGEMENT (Create, Upload, View, Delete)
# ============================================================================

def test_portfolio_management_flow(client: httpx.Client):
    """
    Test complete portfolio management:
    1. Professional creates portfolio item (text only)
    2. Professional uploads images to portfolio item
    3. Professional uploads multiple images
    4. Public views portfolio (no auth)
    5. Professional deletes portfolio item
    6. Verify deletion removed images
    """
    print("\n" + "="*70)
    print("TEST 4: PORTFOLIO MANAGEMENT - Trabajos Anteriores")
    print("="*70)
    
    # Setup: Create Professional
    pro_email = generate_unique_email("pro_portfolio")
    pro_password = "Password123!"
    pro_data = register_user(
        client, pro_email, pro_password,
        "Portfolio", "Pro", "PROFESIONAL"
    )
    pro_token = login_user(client, pro_email, pro_password)
    
    # Get professional ID from /professional/me
    response = client.get(
        "/professional/me",
        headers={"Authorization": f"Bearer {pro_token}"}
    )
    assert response.status_code == 200
    pro_profile = response.json()
    profesional_id = pro_profile["id"]
    print(f"✓ Professional ID: {profesional_id}")
    
    # -------------------------------------------------------------------------
    # STEP 1: Create Portfolio Item (Text Only)
    # -------------------------------------------------------------------------
    print("\n[STEP 1] Creating portfolio item (text only)...")
    response = client.post(
        "/professional/portfolio",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={
            "titulo": "Reparación de cocina completa",
            "descripcion": "Cambio de mesada, instalación de bachas y grifería nueva"
        }
    )
    assert response.status_code == 201, f"Failed to create portfolio: {response.text}"
    portfolio_item = response.json()
    item_id = portfolio_item["id"]
    print(f"✓ Portfolio item created with ID: {item_id}")
    print(f"  Título: {portfolio_item['titulo']}")
    assert portfolio_item["profesional_id"] == profesional_id
    assert len(portfolio_item["imagenes"]) == 0  # No images yet
    
    # -------------------------------------------------------------------------
    # STEP 2: Upload First Image
    # -------------------------------------------------------------------------
    print("\n[STEP 2] Uploading first image to portfolio...")
    fake_image1 = io.BytesIO(b"before photo - cocina antigua")
    
    response = client.post(
        f"/professional/portfolio/{item_id}/image",
        headers={"Authorization": f"Bearer {pro_token}"},
        files={"file": ("cocina_antes.jpg", fake_image1, "image/jpeg")}
    )
    assert response.status_code == 200, f"Failed to upload image: {response.text}"
    updated_item = response.json()
    print(f"✓ First image uploaded")
    print(f"  Images count: {len(updated_item['imagenes'])}")
    assert len(updated_item["imagenes"]) == 1
    assert updated_item["imagenes"][0]["orden"] == 0
    
    # -------------------------------------------------------------------------
    # STEP 3: Upload Multiple Images
    # -------------------------------------------------------------------------
    print("\n[STEP 3] Uploading more images...")
    
    fake_image2 = io.BytesIO(b"after photo - cocina renovada")
    response = client.post(
        f"/professional/portfolio/{item_id}/image",
        headers={"Authorization": f"Bearer {pro_token}"},
        files={"file": ("cocina_despues.jpg", fake_image2, "image/jpeg")}
    )
    assert response.status_code == 200
    
    fake_image3 = io.BytesIO(b"detail photo - grifo nuevo")
    response = client.post(
        f"/professional/portfolio/{item_id}/image",
        headers={"Authorization": f"Bearer {pro_token}"},
        files={"file": ("detalle_grifo.png", fake_image3, "image/png")}
    )
    assert response.status_code == 200
    final_item = response.json()
    
    print(f"✓ Total images uploaded: {len(final_item['imagenes'])}")
    assert len(final_item["imagenes"]) == 3
    
    # Verify orden sequence
    ordenes = [img["orden"] for img in final_item["imagenes"]]
    assert ordenes == [0, 1, 2], f"Expected [0,1,2], got {ordenes}"
    print(f"  Image orden: {ordenes}")
    
    # -------------------------------------------------------------------------
    # STEP 4: Create Second Portfolio Item
    # -------------------------------------------------------------------------
    print("\n[STEP 4] Creating second portfolio item...")
    response = client.post(
        "/professional/portfolio",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={
            "titulo": "Instalación de aire acondicionado",
            "descripcion": "Split de 3000 frigorías en dormitorio principal"
        }
    )
    assert response.status_code == 201
    item2 = response.json()
    item2_id = item2["id"]
    print(f"✓ Second portfolio item created: {item2_id}")
    
    # -------------------------------------------------------------------------
    # STEP 5: Public Views Portfolio (No Auth)
    # -------------------------------------------------------------------------
    print("\n[STEP 5] Public viewing portfolio (no authentication)...")
    response = client.get(f"/public/professional/{profesional_id}/portfolio")
    assert response.status_code == 200, f"Failed to get public portfolio: {response.text}"
    portfolio = response.json()
    print(f"✓ Retrieved {len(portfolio)} portfolio items")
    
    assert len(portfolio) == 2, f"Expected 2 items, got {len(portfolio)}"
    
    # Find our first item and verify images
    first_item = next(item for item in portfolio if item["id"] == item_id)
    assert len(first_item["imagenes"]) == 3
    print(f"  Item 1: {first_item['titulo']} - {len(first_item['imagenes'])} images")
    print(f"  Item 2: {item2['titulo']} - {len(item2['imagenes'])} images")
    
    # -------------------------------------------------------------------------
    # STEP 6: Test Invalid Professional ID (404)
    # -------------------------------------------------------------------------
    print("\n[STEP 6] Testing invalid professional ID...")
    fake_uuid = "00000000-0000-0000-0000-000000000000"
    response = client.get(f"/public/professional/{fake_uuid}/portfolio")
    assert response.status_code == 404
    print("✓ Invalid professional ID correctly rejected (404)")
    
    # -------------------------------------------------------------------------
    # STEP 7: Test Upload to Non-Owned Portfolio (404)
    # -------------------------------------------------------------------------
    print("\n[STEP 7] Testing upload to someone else's portfolio...")
    
    # Create another professional
    pro2_email = generate_unique_email("pro2_portfolio")
    pro2_password = "Password123!"
    register_user(client, pro2_email, pro2_password, "Pro2", "Other", "PROFESIONAL")
    pro2_token = login_user(client, pro2_email, pro2_password)
    
    # Try to upload to first pro's portfolio
    fake_image = io.BytesIO(b"hacker image")
    response = client.post(
        f"/professional/portfolio/{item_id}/image",
        headers={"Authorization": f"Bearer {pro2_token}"},
        files={"file": ("hack.jpg", fake_image, "image/jpeg")}
    )
    assert response.status_code == 404  # Not found because it's not owned by pro2
    print("✓ Upload to non-owned portfolio correctly rejected (404)")
    
    # -------------------------------------------------------------------------
    # STEP 8: Professional Deletes Portfolio Item
    # -------------------------------------------------------------------------
    print("\n[STEP 8] Professional deleting first portfolio item...")
    response = client.delete(
        f"/professional/portfolio/{item_id}",
        headers={"Authorization": f"Bearer {pro_token}"}
    )
    assert response.status_code == 204, f"Failed to delete portfolio: {response.text}"
    print("✓ Portfolio item deleted")
    
    # -------------------------------------------------------------------------
    # STEP 9: Verify Deletion (Public View)
    # -------------------------------------------------------------------------
    print("\n[STEP 9] Verifying deletion from public view...")
    response = client.get(f"/public/professional/{profesional_id}/portfolio")
    assert response.status_code == 200
    remaining_portfolio = response.json()
    print(f"✓ Remaining items: {len(remaining_portfolio)}")
    assert len(remaining_portfolio) == 1
    assert remaining_portfolio[0]["id"] == item2_id
    
    # -------------------------------------------------------------------------
    # STEP 10: Test Delete Non-Owned Portfolio (404)
    # -------------------------------------------------------------------------
    print("\n[STEP 10] Testing delete of non-owned portfolio...")
    response = client.delete(
        f"/professional/portfolio/{item2_id}",
        headers={"Authorization": f"Bearer {pro2_token}"}
    )
    assert response.status_code == 404
    print("✓ Delete non-owned portfolio correctly rejected (404)")
    
    # -------------------------------------------------------------------------
    # STEP 11: Cliente Cannot Create Portfolio (403)
    # -------------------------------------------------------------------------
    print("\n[STEP 11] Testing Cliente cannot create portfolio...")
    cliente_email = generate_unique_email("cliente_noportfolio")
    cliente_password = "Password123!"
    register_user(client, cliente_email, cliente_password, "Cliente", "No", "CLIENTE")
    cliente_token = login_user(client, cliente_email, cliente_password)
    
    response = client.post(
        "/professional/portfolio",
        headers={"Authorization": f"Bearer {cliente_token}"},
        json={
            "titulo": "Unauthorized",
            "descripcion": "Should fail"
        }
    )
    assert response.status_code == 403
    print("✓ Cliente correctly denied (403)")
    
    print("\n" + "="*70)
    print("✓ TEST 4 PASSED: Portfolio Management Working!")
    print("="*70)


# ============================================================================
# TEST 5: INTEGRATION TEST (Complete Module 2 Flow)
# ============================================================================

def test_module_2_complete_integration(client: httpx.Client):
    """
    Complete integration test for Module 2:
    1. Register Professional
    2. Update profile (nombre, apellido)
    3. Upload avatar
    4. Admin creates oficio and servicios instantáneos
    5. Professional assigns servicios
    6. Professional creates portfolio with images
    7. Public views complete professional profile
    """
    print("\n" + "="*70)
    print("TEST 5: MODULE 2 INTEGRATION - Complete Flow")
    print("="*70)
    
    # Setup
    admin_token = login_user(client, ADMIN_EMAIL, ADMIN_PASSWORD)
    
    # -------------------------------------------------------------------------
    # STEP 1: Register Professional
    # -------------------------------------------------------------------------
    print("\n[STEP 1] Registering professional...")
    pro_email = generate_unique_email("pro_integration")
    pro_password = "Password123!"
    pro_data = register_user(
        client, pro_email, pro_password,
        "Juan", "Pérez", "PROFESIONAL"
    )
    pro_token = login_user(client, pro_email, pro_password)
    print(f"✓ Professional registered: {pro_email}")
    
    # -------------------------------------------------------------------------
    # STEP 2: Update User Profile
    # -------------------------------------------------------------------------
    print("\n[STEP 2] Updating user profile...")
    response = client.put(
        "/users/me",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={
            "nombre": "Juan Carlos",
            "apellido": "Pérez González"
        }
    )
    assert response.status_code == 200
    print("✓ Profile updated")
    
    # -------------------------------------------------------------------------
    # STEP 3: Upload Avatar
    # -------------------------------------------------------------------------
    print("\n[STEP 3] Uploading avatar...")
    fake_avatar = io.BytesIO(b"professional avatar photo")
    response = client.post(
        "/users/me/avatar",
        headers={"Authorization": f"Bearer {pro_token}"},
        files={"file": ("avatar.jpg", fake_avatar, "image/jpeg")}
    )
    assert response.status_code == 200
    print("✓ Avatar uploaded")
    
    # -------------------------------------------------------------------------
    # STEP 4: Admin Creates Oficio and Servicios
    # -------------------------------------------------------------------------
    print("\n[STEP 4] Admin creating oficio and servicios...")
    
    # Create oficio
    response = client.post(
        "/admin/oficios",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "nombre": f"Plomería Integration {datetime.now().timestamp()}",
            "descripcion": "Servicios de plomería profesional"
        }
    )
    assert response.status_code == 201
    oficio = response.json()
    oficio_id = oficio["id"]
    
    # Create servicios
    servicio_ids = []
    for servicio_name in ["Destape de cañerías", "Reparación de grifos"]:
        response = client.post(
            "/admin/servicios-instant",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "nombre": servicio_name,
                "descripcion": f"Servicio de {servicio_name.lower()}",
                "oficio_id": oficio_id
            }
        )
        assert response.status_code == 201
        servicio_ids.append(response.json()["id"])
    
    print(f"✓ Created oficio and {len(servicio_ids)} servicios")
    
    # -------------------------------------------------------------------------
    # STEP 5: Professional Assigns Servicios
    # -------------------------------------------------------------------------
    print("\n[STEP 5] Professional assigning servicios...")
    response = client.put(
        "/professional/profile/servicios-instant",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={"servicio_ids": servicio_ids}
    )
    assert response.status_code == 200
    print(f"✓ Assigned {len(servicio_ids)} servicios")
    
    # -------------------------------------------------------------------------
    # STEP 6: Professional Creates Portfolio
    # -------------------------------------------------------------------------
    print("\n[STEP 6] Professional creating portfolio...")
    
    # Create portfolio item
    response = client.post(
        "/professional/portfolio",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={
            "titulo": "Instalación completa de baño",
            "descripcion": "Instalación de inodoro, bidet, ducha y lavabo"
        }
    )
    assert response.status_code == 201
    portfolio_item = response.json()
    item_id = portfolio_item["id"]
    
    # Upload images
    for i in range(3):
        fake_image = io.BytesIO(f"portfolio image {i}".encode())
        response = client.post(
            f"/professional/portfolio/{item_id}/image",
            headers={"Authorization": f"Bearer {pro_token}"},
            files={"file": (f"trabajo_{i}.jpg", fake_image, "image/jpeg")}
        )
        assert response.status_code == 200
    
    print("✓ Created portfolio with 3 images")
    
    # -------------------------------------------------------------------------
    # STEP 7: Get Professional Profile
    # -------------------------------------------------------------------------
    print("\n[STEP 7] Getting complete professional profile...")
    response = client.get(
        "/professional/me",
        headers={"Authorization": f"Bearer {pro_token}"}
    )
    assert response.status_code == 200
    profile = response.json()
    profesional_id = profile["id"]
    print(f"✓ Professional profile retrieved")
    print(f"  Name: {profile['nombre']} {profile['apellido']}")
    
    # -------------------------------------------------------------------------
    # STEP 8: Public Views Portfolio
    # -------------------------------------------------------------------------
    print("\n[STEP 8] Public viewing portfolio...")
    response = client.get(f"/public/professional/{profesional_id}/portfolio")
    assert response.status_code == 200
    portfolio = response.json()
    print(f"✓ Public can view {len(portfolio)} portfolio items")
    assert len(portfolio[0]["imagenes"]) == 3
    
    # -------------------------------------------------------------------------
    # STEP 9: Verify User Profile Has Avatar
    # -------------------------------------------------------------------------
    print("\n[STEP 9] Verifying user profile completeness...")
    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {pro_token}"}
    )
    assert response.status_code == 200
    user_profile = response.json()
    print(f"✓ Complete user profile:")
    print(f"  Name: {user_profile['nombre']} {user_profile['apellido']}")
    print(f"  Avatar: {user_profile['avatar_url']}")
    assert user_profile["nombre"] == "Juan Carlos"
    assert user_profile["apellido"] == "Pérez González"
    assert user_profile["avatar_url"] is not None
    
    print("\n" + "="*70)
    print("✓ TEST 5 PASSED: Complete Module 2 Integration Working!")
    print("="*70)


# ============================================================================
# TEST 12: PUBLIC PROFILE VIEW (Get Professional Public Profile)
# ============================================================================

def test_public_profile_view(client: httpx.Client):
    """
    Test public profile view endpoint:
    1. Admin creates oficio and professional gets approved
    2. Professional sets up complete profile (avatar, oficios, portfolio)
    3. Public views complete profile (no auth required)
    4. Verify all nested data (oficios, portfolio with images)
    5. Test non-existent professional (404)
    6. Test non-approved professional (404)
    """
    print("\n" + "="*70)
    print("TEST 12: PUBLIC PROFILE VIEW - Página de Producto")
    print("="*70)
    
    # Setup
    admin_token = login_user(client, ADMIN_EMAIL, ADMIN_PASSWORD)
    
    # -------------------------------------------------------------------------
    # STEP 1: Create and Approve Professional
    # -------------------------------------------------------------------------
    print("\n[STEP 1] Creating and approving professional...")
    pro_email = generate_unique_email("pro_public_profile")
    pro_password = "Password123!"
    
    pro_data = register_user(
        client, pro_email, pro_password,
        "María", "González", "PROFESIONAL"
    )
    pro_token = login_user(client, pro_email, pro_password)
    print(f"✓ Professional registered: {pro_email}")
    
    # Get professional ID
    response = client.get(
        "/professional/me",
        headers={"Authorization": f"Bearer {pro_token}"}
    )
    assert response.status_code == 200
    pro_profile = response.json()
    profesional_id = pro_profile["id"]
    
    # Upload KYC documents (mock)
    fake_doc = io.BytesIO(b"fake kyc document")
    response = client.post(
        "/professional/kyc/upload",
        headers={"Authorization": f"Bearer {pro_token}"},
        files={"files": ("documento.pdf", fake_doc, "application/pdf")}
    )
    assert response.status_code == 200
    
    # Admin approves KYC
    response = client.post(
        f"/admin/kyc/approve/{profesional_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    print(f"✓ Professional approved (ID: {profesional_id})")
    
    # -------------------------------------------------------------------------
    # STEP 2: Upload Avatar
    # -------------------------------------------------------------------------
    print("\n[STEP 2] Uploading professional avatar...")
    fake_avatar = io.BytesIO(b"professional avatar photo")
    response = client.post(
        "/users/me/avatar",
        headers={"Authorization": f"Bearer {pro_token}"},
        files={"file": ("avatar.jpg", fake_avatar, "image/jpeg")}
    )
    assert response.status_code == 200
    avatar_data = response.json()
    print(f"✓ Avatar uploaded: {avatar_data['avatar_url']}")
    
    # -------------------------------------------------------------------------
    # STEP 3: Admin Creates Oficio
    # -------------------------------------------------------------------------
    print("\n[STEP 3] Admin creating oficio...")
    response = client.post(
        "/admin/oficios",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "nombre": f"Electricista {datetime.now().timestamp()}",
            "descripcion": "Instalaciones y reparaciones eléctricas"
        }
    )
    assert response.status_code == 201
    oficio = response.json()
    oficio_id = oficio["id"]
    print(f"✓ Oficio created: {oficio['nombre']}")
    
    # -------------------------------------------------------------------------
    # STEP 4: Professional Assigns Oficio
    # -------------------------------------------------------------------------
    print("\n[STEP 4] Professional assigning oficio...")
    response = client.put(
        "/professional/profile/oficios",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={"oficio_ids": [oficio_id]}
    )
    assert response.status_code == 200
    print("✓ Oficio assigned")
    
    # -------------------------------------------------------------------------
    # STEP 5: Professional Creates Portfolio with Images
    # -------------------------------------------------------------------------
    print("\n[STEP 5] Professional creating portfolio...")
    
    # Create first portfolio item
    response = client.post(
        "/professional/portfolio",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={
            "titulo": "Instalación eléctrica residencial",
            "descripcion": "Instalación completa de cableado en casa de 3 habitaciones"
        }
    )
    assert response.status_code == 201
    portfolio1 = response.json()
    item1_id = portfolio1["id"]
    
    # Upload 2 images to first item
    for i in range(2):
        fake_image = io.BytesIO(f"portfolio image {i}".encode())
        response = client.post(
            f"/professional/portfolio/{item1_id}/image",
            headers={"Authorization": f"Bearer {pro_token}"},
            files={"file": (f"trabajo1_{i}.jpg", fake_image, "image/jpeg")}
        )
        assert response.status_code == 200
    
    # Create second portfolio item
    response = client.post(
        "/professional/portfolio",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={
            "titulo": "Reparación de tablero eléctrico",
            "descripcion": "Reemplazo de disyuntores y upgrade de tablero principal"
        }
    )
    assert response.status_code == 201
    portfolio2 = response.json()
    item2_id = portfolio2["id"]
    
    # Upload 3 images to second item
    for i in range(3):
        fake_image = io.BytesIO(f"portfolio image {i}".encode())
        response = client.post(
            f"/professional/portfolio/{item2_id}/image",
            headers={"Authorization": f"Bearer {pro_token}"},
            files={"file": (f"trabajo2_{i}.jpg", fake_image, "image/jpeg")}
        )
        assert response.status_code == 200
    
    print("✓ Created 2 portfolio items with 5 total images")
    
    # -------------------------------------------------------------------------
    # STEP 6: Public Views Complete Profile (NO AUTH)
    # -------------------------------------------------------------------------
    print("\n[STEP 6] Public viewing complete professional profile (no auth)...")
    response = client.get(f"/public/professional/{profesional_id}")
    assert response.status_code == 200, f"Failed to get public profile: {response.text}"
    
    public_profile = response.json()
    print(f"✓ Public profile retrieved")
    print(f"  Name: {public_profile['nombre']} {public_profile['apellido']}")
    print(f"  Nivel: {public_profile['nivel']}")
    print(f"  Radio cobertura: {public_profile['radio_cobertura_km']} km")
    print(f"  Acepta instant: {public_profile['acepta_instant']}")
    print(f"  Avatar URL: {public_profile.get('avatar_url')}")
    
    # -------------------------------------------------------------------------
    # STEP 7: Verify Nested Data
    # -------------------------------------------------------------------------
    print("\n[STEP 7] Verifying nested data structure...")
    
    # Verify basic info
    assert public_profile["id"] == profesional_id
    assert public_profile["nombre"] == "María"
    assert public_profile["apellido"] == "González"
    assert public_profile["avatar_url"] is not None
    print("✓ Basic info correct")
    
    # Verify NO sensitive data
    assert "email" not in public_profile
    assert "estado_verificacion" not in public_profile
    print("✓ No sensitive data exposed")
    
    # Verify oficios
    assert "oficios" in public_profile
    assert len(public_profile["oficios"]) == 1
    assert public_profile["oficios"][0]["nombre"].startswith("Electricista")
    print(f"✓ Oficios: {len(public_profile['oficios'])} items")
    
    # Verify portfolio with images
    assert "portfolio" in public_profile
    assert len(public_profile["portfolio"]) == 2
    print(f"✓ Portfolio: {len(public_profile['portfolio'])} items")
    
    # Verify first portfolio item images
    item1 = next(item for item in public_profile["portfolio"] if item["id"] == item1_id)
    assert len(item1["imagenes"]) == 2
    assert item1["imagenes"][0]["orden"] == 0
    assert item1["imagenes"][1]["orden"] == 1
    print(f"  Item 1: {len(item1['imagenes'])} images")
    
    # Verify second portfolio item images
    item2 = next(item for item in public_profile["portfolio"] if item["id"] == item2_id)
    assert len(item2["imagenes"]) == 3
    print(f"  Item 2: {len(item2['imagenes'])} images")
    
    # -------------------------------------------------------------------------
    # STEP 8: Test Non-Existent Professional (404)
    # -------------------------------------------------------------------------
    print("\n[STEP 8] Testing non-existent professional...")
    fake_uuid = "00000000-0000-0000-0000-000000000000"
    response = client.get(f"/public/professional/{fake_uuid}")
    assert response.status_code == 404
    print("✓ Non-existent professional correctly rejected (404)")
    
    # -------------------------------------------------------------------------
    # STEP 9: Test Non-Approved Professional (404)
    # -------------------------------------------------------------------------
    print("\n[STEP 9] Testing non-approved professional visibility...")
    
    # Create another professional but DON'T approve
    pro2_email = generate_unique_email("pro_not_approved")
    pro2_password = "Password123!"
    register_user(client, pro2_email, pro2_password, "No", "Aprobado", "PROFESIONAL")
    pro2_token = login_user(client, pro2_email, pro2_password)
    
    # Get pro2 ID
    response = client.get(
        "/professional/me",
        headers={"Authorization": f"Bearer {pro2_token}"}
    )
    pro2_profile = response.json()
    pro2_id = pro2_profile["id"]
    
    # Try to view non-approved professional's public profile
    response = client.get(f"/public/professional/{pro2_id}")
    assert response.status_code == 404, f"Expected 404 for non-approved, got {response.status_code}"
    print("✓ Non-approved professional correctly hidden (404)")
    
    # -------------------------------------------------------------------------
    # STEP 10: Verify Query Optimization (Single Request)
    # -------------------------------------------------------------------------
    print("\n[STEP 10] Verifying query optimization...")
    # This is a smoke test - in production we'd use SQL logging
    # to verify joinedload reduces queries to 1-2
    import time
    start = time.time()
    response = client.get(f"/public/professional/{profesional_id}")
    end = time.time()
    
    assert response.status_code == 200
    elapsed_ms = (end - start) * 1000
    print(f"✓ Profile loaded in {elapsed_ms:.2f}ms")
    print("  (Should be fast due to joinedload optimization)")
    
    print("\n" + "="*70)
    print("✓ TEST 12 PASSED: Public Profile View Working!")
    print("="*70)


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("""
    ╔══════════════════════════════════════════════════════════════════════╗
    ║                                                                      ║
    ║      E2E TEST SUITE - MODULE 2 (User Profile & Portfolio)           ║
    ║                                                                      ║
    ║  QA Automation Engineer - Quality Assurance Report                  ║
    ║                                                                      ║
    ╚══════════════════════════════════════════════════════════════════════╝
    
    Running against: http://localhost:8000/api/v1
    
    Tests to execute:
    1. ✓ User Profile Update (PUT /users/me)
    2. ✓ Avatar Upload (POST /users/me/avatar)
    3. ✓ Servicios Instantáneos (Admin creates, Professional assigns)
    4. ✓ Portfolio Management (Create, Upload, View, Delete)
    5. ✓ Complete Module 2 Integration Flow
    12. ✓ Public Profile View (GET /public/professional/{id})
    
    """)
    
    pytest.main([__file__, "-v", "--tb=short"])
