from fastapi import APIRouter
from backend.shared import get_logger
from ..services.redis_service import RedisService

router = APIRouter(prefix="/alerts")
redis_service = RedisService()
logger = get_logger(__name__)

@router.get("/")
async def get_alerts():
    return {"alerts": await redis_service.get_alerts()}  


@router.post("/notify")
async def notify_owner(payload: dict):
    vehicle_id = payload.get("vehicle_id")
    phone = payload.get("phone")
    message = payload.get("message")
    
    logger.info(f"Sending SMS to {phone} for vehicle {vehicle_id}")
    return {"status": "success", "sent_to": phone}

