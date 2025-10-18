"""
E2E Tests for Module 1 (Auth/KYC)
===================================
QA Automation Engineer - End-to-End Testing Suite

This script validates the complete flow of Module 1:
1. Professional Happy Path (Registration → Login → KYC Upload → Admin Approval)
2. Security Role Enforcement (403 Forbidden)
3. Authentication Guard (401 Unauthorized)

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


def create_test_file(filename: str, content: str) -> tuple:
    """Create a test file for upload."""
    file_content = content.encode('utf-8')
    return (filename, file_content, 'text/plain')


# ============================================================================
# TEST 1: PROFESSIONAL HAPPY PATH (El Camino Feliz)
# ============================================================================

def test_e2e_professional_flow(client: httpx.Client):
    """
    Test the complete professional flow:
    1. Register Professional
    2. Login as Professional
    3. Upload KYC documents
    4. Admin reviews pending KYC
    5. Admin approves KYC
    """
    print("\n" + "="*70)
    print("TEST 1: PROFESSIONAL HAPPY PATH - El Camino Feliz")
    print("="*70)
    
    # Setup: Generate unique identifiers
    pro_email = generate_unique_email("pro")
    pro_password = "Password123!"
    
    # -------------------------------------------------------------------------
    # STEP 1: Login as Admin (prerequisite)
    # -------------------------------------------------------------------------
    print("\n[STEP 1] Login as Admin...")
    token_admin = login_user(client, ADMIN_EMAIL, ADMIN_PASSWORD)
    print(f"✓ Admin token obtained: {token_admin[:20]}...")
    
    # -------------------------------------------------------------------------
    # STEP 2: Register Professional
    # -------------------------------------------------------------------------
    print(f"\n[STEP 2] Registering Professional: {pro_email}...")
    pro_data = register_user(
        client,
        email=pro_email,
        password=pro_password,
        nombre="Juan",
        apellido="Profesional",
        rol="PROFESIONAL"
    )
    pro_id = pro_data["id"]
    print(f"✓ Professional registered with ID: {pro_id}")
    assert pro_data["email"] == pro_email
    assert pro_data["rol"] == "PROFESIONAL"
    
    # -------------------------------------------------------------------------
    # STEP 3: Login as Professional
    # -------------------------------------------------------------------------
    print(f"\n[STEP 3] Login as Professional: {pro_email}...")
    token_pro = login_user(client, pro_email, pro_password)
    print(f"✓ Professional token obtained: {token_pro[:20]}...")
    
    # -------------------------------------------------------------------------
    # STEP 4: Upload KYC Documents
    # -------------------------------------------------------------------------
    print("\n[STEP 4] Uploading KYC documents...")
    
    # Create test files
    files = [
        ("files", ("dni_frente.txt", io.BytesIO(b"DNI Frente - Test Document"), "text/plain")),
        ("files", ("dni_dorso.txt", io.BytesIO(b"DNI Dorso - Test Document"), "text/plain"))
    ]
    
    response = client.post(
        "/professional/kyc/upload",
        headers={"Authorization": f"Bearer {token_pro}"},
        files=files
    )
    assert response.status_code == 200, f"KYC upload failed: {response.text}"
    kyc_data = response.json()
    print(f"✓ KYC documents uploaded successfully")
    print(f"  Files: {kyc_data.get('files', [])}")
    
    # -------------------------------------------------------------------------
    # STEP 5: Admin Reviews Pending KYC
    # -------------------------------------------------------------------------
    print("\n[STEP 5] Admin reviewing pending KYC submissions...")
    response = client.get(
        "/admin/kyc/pendientes",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200, f"Failed to get pending KYC: {response.text}"
    pending_kyc = response.json()
    print(f"✓ Found {len(pending_kyc)} pending KYC submissions")
    
    # Find our professional in the pending list (by email)
    our_pro = None
    for kyc in pending_kyc:
        if kyc.get("email") == pro_email:
            our_pro = kyc
            break
    
    assert our_pro is not None, f"Professional {pro_email} not found in pending KYC list. List: {pending_kyc}"
    print(f"✓ Found our professional in pending list")
    print(f"  Professional ID (for approval): {our_pro['id']}")
    
    profesional_id = our_pro["id"]  # This is the Profesional table ID, not Usuario ID
    
    # -------------------------------------------------------------------------
    # STEP 6: Admin Approves KYC
    # -------------------------------------------------------------------------
    print(f"\n[STEP 6] Admin approving KYC for professional {profesional_id}...")
    response = client.post(
        f"/admin/kyc/approve/{profesional_id}",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200, f"KYC approval failed: {response.text}"
    approval_data = response.json()
    print(f"✓ KYC approved successfully")
    print(f"  Response: {approval_data}")
    
    print("\n" + "="*70)
    print("✓ TEST 1 PASSED: Professional Happy Path Complete!")
    print("="*70)


# ============================================================================
# TEST 2: SECURITY ROLE ENFORCEMENT (El Patovica)
# ============================================================================

def test_security_roles_403(client: httpx.Client):
    """
    Test that security roles are properly enforced:
    1. Register Cliente
    2. Login as Cliente
    3. Attempt to access Admin endpoints → 403
    4. Attempt to access Professional endpoints → 403
    """
    print("\n" + "="*70)
    print("TEST 2: SECURITY ROLE ENFORCEMENT - El Patovica")
    print("="*70)
    
    # Setup: Generate unique cliente
    cliente_email = generate_unique_email("cliente")
    cliente_password = "Password123!"
    
    # -------------------------------------------------------------------------
    # STEP 1: Register Cliente
    # -------------------------------------------------------------------------
    print(f"\n[STEP 1] Registering Cliente: {cliente_email}...")
    cliente_data = register_user(
        client,
        email=cliente_email,
        password=cliente_password,
        nombre="Maria",
        apellido="Cliente",
        rol="CLIENTE"
    )
    print(f"✓ Cliente registered with ID: {cliente_data['id']}")
    assert cliente_data["rol"] == "CLIENTE"
    
    # -------------------------------------------------------------------------
    # STEP 2: Login as Cliente
    # -------------------------------------------------------------------------
    print(f"\n[STEP 2] Login as Cliente: {cliente_email}...")
    token_cliente = login_user(client, cliente_email, cliente_password)
    print(f"✓ Cliente token obtained: {token_cliente[:20]}...")
    
    # -------------------------------------------------------------------------
    # STEP 3: Attempt Admin Endpoint (Should be 403)
    # -------------------------------------------------------------------------
    print("\n[STEP 3] Cliente attempting to access Admin endpoint...")
    response = client.get(
        "/admin/kyc/pendientes",
        headers={"Authorization": f"Bearer {token_cliente}"}
    )
    print(f"  Response status: {response.status_code}")
    assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
    print("✓ Access denied (403) - Security working as expected!")
    
    # -------------------------------------------------------------------------
    # STEP 4: Attempt Professional Endpoint (Should be 403)
    # -------------------------------------------------------------------------
    print("\n[STEP 4] Cliente attempting to access Professional endpoint...")
    
    # Create a dummy file for the upload attempt
    files = [
        ("files", ("test.txt", io.BytesIO(b"Test content"), "text/plain"))
    ]
    
    response = client.post(
        "/professional/kyc/upload",
        headers={"Authorization": f"Bearer {token_cliente}"},
        files=files
    )
    print(f"  Response status: {response.status_code}")
    assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
    print("✓ Access denied (403) - Security working as expected!")
    
    print("\n" + "="*70)
    print("✓ TEST 2 PASSED: Role-Based Access Control is Working!")
    print("="*70)


# ============================================================================
# TEST 3: AUTHENTICATION GUARD (Sin Token)
# ============================================================================

def test_security_unauthorized_401(client: httpx.Client):
    """
    Test that protected endpoints require authentication:
    1. Attempt to access /users/me without token → 401
    """
    print("\n" + "="*70)
    print("TEST 3: AUTHENTICATION GUARD - Sin Token")
    print("="*70)
    
    # -------------------------------------------------------------------------
    # STEP 1: Attempt Protected Endpoint Without Token
    # -------------------------------------------------------------------------
    print("\n[STEP 1] Attempting to access /users/me without token...")
    response = client.get("/users/me")
    print(f"  Response status: {response.status_code}")
    assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
    print("✓ Unauthorized (401) - Authentication required!")
    
    # Additional check: Try with invalid token
    print("\n[STEP 2] Attempting to access /users/me with invalid token...")
    response = client.get(
        "/users/me",
        headers={"Authorization": "Bearer invalid_token_12345"}
    )
    print(f"  Response status: {response.status_code}")
    assert response.status_code in [401, 403], f"Expected 401 or 403, got {response.status_code}"
    print("✓ Invalid token rejected!")
    
    print("\n" + "="*70)
    print("✓ TEST 3 PASSED: Authentication Guard is Working!")
    print("="*70)


# ============================================================================
# TEST 4: PROFESSIONAL PROFILE UPDATE (Configuración del Servicio)
# ============================================================================

def test_professional_profile_update(client: httpx.Client):
    """
    Test the professional profile update flow:
    1. Register and login as professional
    2. Get initial profile (GET /professional/me)
    3. Update profile configuration (PUT /professional/profile)
    4. Verify changes were applied
    5. Test partial update (only some fields)
    """
    print("\n" + "="*70)
    print("TEST 4: PROFESSIONAL PROFILE UPDATE - Configuración del Servicio")
    print("="*70)
    
    # Setup: Generate unique professional
    pro_email = generate_unique_email("pro_config")
    pro_password = "Password123!"
    
    # -------------------------------------------------------------------------
    # STEP 1: Register and Login Professional
    # -------------------------------------------------------------------------
    print(f"\n[STEP 1] Registering Professional: {pro_email}...")
    register_user(client, pro_email, pro_password, "Config", "Test", "PROFESIONAL")
    token_pro = login_user(client, pro_email, pro_password)
    print(f"✓ Professional logged in: {token_pro[:20]}...")
    
    # -------------------------------------------------------------------------
    # STEP 2: Get Initial Profile
    # -------------------------------------------------------------------------
    print("\n[STEP 2] Getting initial profile...")
    response = client.get(
        "/professional/me",
        headers={"Authorization": f"Bearer {token_pro}"}
    )
    assert response.status_code == 200, f"Get profile failed: {response.text}"
    initial_profile = response.json()
    print(f"✓ Initial profile retrieved")
    print(f"  Radio cobertura: {initial_profile.get('radio_cobertura_km')} km")
    print(f"  Acepta instant: {initial_profile.get('acepta_instant')}")
    print(f"  Tarifa por hora: {initial_profile.get('tarifa_por_hora')}")
    
    # Verify initial values
    assert initial_profile["radio_cobertura_km"] == 10, "Default radio should be 10 km"
    assert initial_profile["acepta_instant"] == False, "Default acepta_instant should be False"
    assert initial_profile["tarifa_por_hora"] is None, "Default tarifa should be None"
    
    # -------------------------------------------------------------------------
    # STEP 3: Update Complete Profile
    # -------------------------------------------------------------------------
    print("\n[STEP 3] Updating complete profile...")
    update_data = {
        "radio_cobertura_km": 25,
        "acepta_instant": True,
        "tarifa_por_hora": 5000.00
    }
    
    response = client.put(
        "/professional/profile",
        headers={"Authorization": f"Bearer {token_pro}"},
        json=update_data
    )
    assert response.status_code == 200, f"Profile update failed: {response.text}"
    updated_profile = response.json()
    print(f"✓ Profile updated successfully")
    print(f"  New Radio cobertura: {updated_profile['radio_cobertura_km']} km")
    print(f"  New Acepta instant: {updated_profile['acepta_instant']}")
    print(f"  New Tarifa por hora: {updated_profile['tarifa_por_hora']}")
    
    # Verify all changes
    assert updated_profile["radio_cobertura_km"] == 25
    assert updated_profile["acepta_instant"] == True
    assert float(updated_profile["tarifa_por_hora"]) == 5000.00
    
    # -------------------------------------------------------------------------
    # STEP 4: Test Partial Update (PATCH-style)
    # -------------------------------------------------------------------------
    print("\n[STEP 4] Testing partial update (only radio)...")
    partial_update = {
        "radio_cobertura_km": 50
    }
    
    response = client.put(
        "/professional/profile",
        headers={"Authorization": f"Bearer {token_pro}"},
        json=partial_update
    )
    assert response.status_code == 200, f"Partial update failed: {response.text}"
    partial_profile = response.json()
    print(f"✓ Partial update successful")
    print(f"  Radio updated to: {partial_profile['radio_cobertura_km']} km")
    print(f"  Acepta instant unchanged: {partial_profile['acepta_instant']}")
    print(f"  Tarifa unchanged: {partial_profile['tarifa_por_hora']}")
    
    # Verify only radio changed, others remained
    assert partial_profile["radio_cobertura_km"] == 50
    assert partial_profile["acepta_instant"] == True  # Should remain True
    assert float(partial_profile["tarifa_por_hora"]) == 5000.00  # Should remain 5000
    
    # -------------------------------------------------------------------------
    # STEP 5: Test Cliente Cannot Update Professional Profile (403)
    # -------------------------------------------------------------------------
    print("\n[STEP 5] Testing Cliente cannot update professional profile...")
    cliente_email = generate_unique_email("cliente_noauth")
    cliente_password = "Password123!"
    register_user(client, cliente_email, cliente_password, "Cliente", "NoAuth", "CLIENTE")
    token_cliente = login_user(client, cliente_email, cliente_password)
    
    response = client.put(
        "/professional/profile",
        headers={"Authorization": f"Bearer {token_cliente}"},
        json={"radio_cobertura_km": 100}
    )
    print(f"  Response status: {response.status_code}")
    assert response.status_code == 403, f"Expected 403, got {response.status_code}"
    print("✓ Cliente correctly denied (403)")
    
    print("\n" + "="*70)
    print("✓ TEST 4 PASSED: Professional Profile Update Working!")
    print("="*70)


# ============================================================================
# TEST 5: OFICIOS M2M RELATIONSHIP (Gestión de Oficios)
# ============================================================================

def test_oficios_m2m_flow(client: httpx.Client):
    """
    Test the complete Oficios M2M flow:
    1. Admin creates oficios (Plomería, Electricidad)
    2. Get list of oficios (as authenticated user)
    3. Professional assigns multiple oficios to themselves
    4. Verify oficios were assigned correctly
    5. Update oficios list (replace with new list)
    6. Verify Cliente cannot create oficios (403)
    """
    print("\n" + "="*70)
    print("TEST 5: OFICIOS M2M RELATIONSHIP - Gestión de Oficios")
    print("="*70)
    
    # Setup: Login Admin and create Professional
    admin_token = login_user(client, ADMIN_EMAIL, ADMIN_PASSWORD)
    
    pro_email = generate_unique_email("pro_oficios")
    pro_password = "Password123!"
    register_user(client, pro_email, pro_password, "Pro", "Oficios", "PROFESIONAL")
    pro_token = login_user(client, pro_email, pro_password)
    
    # -------------------------------------------------------------------------
    # STEP 1: Admin Creates Oficios
    # -------------------------------------------------------------------------
    print("\n[STEP 1] Admin creating oficios...")
    
    timestamp = datetime.now().timestamp()
    
    # Create Plomería
    response = client.post(
        "/admin/oficios",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "nombre": f"Plomería {timestamp}",
            "descripcion": "Instalación y reparación de sistemas de agua y desagüe"
        }
    )
    assert response.status_code == 201, f"Failed to create Plomería: {response.text}"
    oficio_plomeria = response.json()
    plomeria_id = oficio_plomeria["id"]
    print(f"✓ Oficio 'Plomería' created with ID: {plomeria_id}")
    
    # Create Electricidad
    response = client.post(
        "/admin/oficios",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "nombre": f"Electricidad {timestamp}",
            "descripcion": "Instalación y mantenimiento de sistemas eléctricos"
        }
    )
    assert response.status_code == 201, f"Failed to create Electricidad: {response.text}"
    oficio_electricidad = response.json()
    electricidad_id = oficio_electricidad["id"]
    print(f"✓ Oficio 'Electricidad' created with ID: {electricidad_id}")
    
    # Create Carpintería
    response = client.post(
        "/admin/oficios",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "nombre": f"Carpintería {timestamp}",
            "descripcion": "Fabricación y reparación de estructuras de madera"
        }
    )
    assert response.status_code == 201, f"Failed to create Carpintería: {response.text}"
    oficio_carpinteria = response.json()
    carpinteria_id = oficio_carpinteria["id"]
    print(f"✓ Oficio 'Carpintería' created with ID: {carpinteria_id}")
    
    # -------------------------------------------------------------------------
    # STEP 2: Test Duplicate Oficio Name (Should Fail)
    # -------------------------------------------------------------------------
    print("\n[STEP 2] Testing duplicate oficio name...")
    response = client.post(
        "/admin/oficios",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "nombre": f"Plomería {timestamp}",
            "descripcion": "Duplicate test"
        }
    )
    print(f"  Response status: {response.status_code}")
    assert response.status_code == 400, f"Expected 400 for duplicate, got {response.status_code}"
    print("✓ Duplicate oficio correctly rejected (400)")
    
    # -------------------------------------------------------------------------
    # STEP 3: Get List of Oficios (As Professional)
    # -------------------------------------------------------------------------
    print("\n[STEP 3] Professional fetching list of oficios...")
    response = client.get(
        "/admin/oficios",
        headers={"Authorization": f"Bearer {pro_token}"}
    )
    assert response.status_code == 200, f"Failed to get oficios: {response.text}"
    oficios_list = response.json()
    print(f"✓ Retrieved {len(oficios_list)} oficios")
    for oficio in oficios_list:
        print(f"  - {oficio['nombre']}: {oficio['descripcion'][:50]}...")
    
    # -------------------------------------------------------------------------
    # STEP 4: Professional Assigns Multiple Oficios
    # -------------------------------------------------------------------------
    print("\n[STEP 4] Professional assigning Plomería and Electricidad...")
    response = client.put(
        "/professional/profile/oficios",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={
            "oficio_ids": [plomeria_id, electricidad_id]
        }
    )
    assert response.status_code == 200, f"Failed to assign oficios: {response.text}"
    assigned_oficios = response.json()
    print(f"✓ Assigned {len(assigned_oficios)} oficios")
    
    # Verify assigned oficios
    assigned_names = {o["nombre"] for o in assigned_oficios}
    assert any("Plomería" in name for name in assigned_names), "Plomería should be assigned"
    assert any("Electricidad" in name for name in assigned_names), "Electricidad should be assigned"
    print(f"  Oficios assigned: {assigned_names}")
    
    # -------------------------------------------------------------------------
    # STEP 5: Update Oficios List (Replace with new list)
    # -------------------------------------------------------------------------
    print("\n[STEP 5] Professional replacing oficios with Carpintería only...")
    response = client.put(
        "/professional/profile/oficios",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={
            "oficio_ids": [carpinteria_id]
        }
    )
    assert response.status_code == 200, f"Failed to update oficios: {response.text}"
    new_oficios = response.json()
    print(f"✓ Updated oficios list")
    
    # Verify only Carpintería remains
    new_names = {o["nombre"] for o in new_oficios}
    assert len(new_oficios) == 1, f"Should have only 1 oficio, got {len(new_oficios)}"
    assert any("Carpintería" in name for name in new_names), "Carpintería should be the only oficio"
    print(f"  Current oficios: {new_names}")
    
    # -------------------------------------------------------------------------
    # STEP 6: Test Invalid Oficio ID (404)
    # -------------------------------------------------------------------------
    print("\n[STEP 6] Testing invalid oficio ID...")
    fake_uuid = "00000000-0000-0000-0000-000000000000"
    response = client.put(
        "/professional/profile/oficios",
        headers={"Authorization": f"Bearer {pro_token}"},
        json={
            "oficio_ids": [fake_uuid]
        }
    )
    print(f"  Response status: {response.status_code}")
    assert response.status_code == 404, f"Expected 404 for invalid ID, got {response.status_code}"
    print("✓ Invalid oficio ID correctly rejected (404)")
    
    # -------------------------------------------------------------------------
    # STEP 7: Test Cliente Cannot Create Oficios (403)
    # -------------------------------------------------------------------------
    print("\n[STEP 7] Testing Cliente cannot create oficios...")
    cliente_email = generate_unique_email("cliente_nooficio")
    cliente_password = "Password123!"
    register_user(client, cliente_email, cliente_password, "Cliente", "NoOficio", "CLIENTE")
    cliente_token = login_user(client, cliente_email, cliente_password)
    
    response = client.post(
        "/admin/oficios",
        headers={"Authorization": f"Bearer {cliente_token}"},
        json={
            "nombre": "Jardinería",
            "descripcion": "Should fail"
        }
    )
    print(f"  Response status: {response.status_code}")
    assert response.status_code == 403, f"Expected 403, got {response.status_code}"
    print("✓ Cliente correctly denied from creating oficios (403)")
    
    print("\n" + "="*70)
    print("✓ TEST 5 PASSED: Oficios M2M Relationship Working!")
    print("="*70)


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("""
    ╔══════════════════════════════════════════════════════════════════════╗
    ║                                                                      ║
    ║           E2E TEST SUITE - MODULE 1 (Auth/KYC)                      ║
    ║                                                                      ║
    ║  QA Automation Engineer - Quality Assurance Report                  ║
    ║                                                                      ║
    ╚══════════════════════════════════════════════════════════════════════╝
    
    Running against: http://localhost:8000/api/v1
    
    Tests to execute:
    1. ✓ Professional Happy Path (Registration → KYC → Approval)
    2. ✓ Security Role Enforcement (403 Forbidden)
    3. ✓ Authentication Guard (401 Unauthorized)
    4. ✓ Professional Profile Update (Service Configuration)
    5. ✓ Oficios M2M Relationship (Admin creates, Professional assigns)
    
    """)
    
    pytest.main([__file__, "-v", "--tb=short"])
