from fastapi import APIRouter

from ..services.redis_service import RedisService

router = APIRouter(prefix="/alerts")
redis_service = RedisService()


@router.get("/")
async def get_alerts():
    return {"alerts": await redis_service.get_alerts()} 

