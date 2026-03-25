from fastapi import APIRouter, HTTPException, Depends

from ..services.redis_service import RedisService
from ..core.security import get_current_user, get_current_admin

router = APIRouter(prefix='/vehicles')
redis_service = RedisService()


@router.get("/")
# async def get_all_vehicles(current_admin = Depends(get_current_admin)):
async def get_all_vehicles():
    return {"vehicles": await redis_service.get_all_vehicles_fast()}


@router.get("/{vehicle_id}")
# async def get_vehicle(vehicle_id: str, current_user = Depends(get_current_user)):
async def get_vehicle(vehicle_id: str):
    vehicle = await redis_service.get_vehicle(vehicle_id)

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return vehicle