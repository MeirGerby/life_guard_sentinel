from fastapi import APIRouter

from app.services.redis_service import RedisService

router = APIRouter(prefix="/alerts")
redis_service = RedisService()


@router.get("/")
def get_alerts():
    return {"alerts": redis_service.get_alerts()}