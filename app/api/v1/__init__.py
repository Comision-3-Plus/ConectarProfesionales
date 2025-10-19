"""
API v1 Router
"""
from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, users, professional, admin, public, search, webhook, cliente

api_router = APIRouter()

# Incluir los routers de los diferentes endpoints
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(professional.router, prefix="/professional", tags=["professional"])
api_router.include_router(cliente.router, prefix="/cliente", tags=["cliente"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(public.router, prefix="/public", tags=["public"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(webhook.router, prefix="/webhook", tags=["webhook"])
