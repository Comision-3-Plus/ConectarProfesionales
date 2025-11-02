"""
Configuración de pytest para tests de integración.
"""
import pytest
import asyncio
from datetime import datetime

# Configuración de pytest
def pytest_configure(config):
    """Configuración global de pytest"""
    # Generar timestamp único para cada run
    pytest.timestamp = int(datetime.now().timestamp())


# Event loop fixture para pytest-asyncio
@pytest.fixture(scope="session")
def event_loop():
    """
    Create an instance of the default event loop for the test session.
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# Markers personalizados
def pytest_configure(config):
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )
    config.addinivalue_line(
        "markers", "e2e: marks tests as end-to-end tests"
    )
