from fastapi import APIRouter

from app.api.endpoints import instruments, specs

api_router = APIRouter()

api_router.include_router(specs.router, prefix="/specs", tags=["specs"])
api_router.include_router(instruments.router, prefix="/instruments", tags=["instruments"])


