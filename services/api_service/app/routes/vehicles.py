from fastapi import APIRouter, HTTPException

from app.services.redis_service import RedisService

router = APIRouter()
redis_service = RedisService()


@router.get("/")
def get_all_vehicles():
    return {"vehicles": redis_service.get_all_vehicles()}


@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: int):
    vehicle = redis_service.get_vehicle(vehicle_id)

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return vehicle