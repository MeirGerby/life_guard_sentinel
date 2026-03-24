from fastapi import APIRouter, HTTPException

from ..services.redis_service import RedisService

router = APIRouter(prefix='/vehicles')
redis_service = RedisService()


@router.get("/")
async def get_all_vehicles():
    return {"vehicles": await redis_service.get_all_vehicles_fast()}


@router.get("/{vehicle_id}")
async def get_vehicle(vehicle_id: int):
    vehicle = await redis_service.get_vehicle(vehicle_id)

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return vehicle