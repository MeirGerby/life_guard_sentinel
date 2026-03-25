from fastapi import APIRouter, HTTPException, Depends
from typing import List 
from backend.shared import ProcessedVehicleData, get_logger
from ..services.redis_service import RedisService
from ..core.security import get_current_user, get_current_admin

router = APIRouter(prefix='/vehicles')
redis_service = RedisService()
logger = get_logger(__name__)

@router.get("/", response_model=List[ProcessedVehicleData])
# async def get_all_vehicles(current_admin = Depends(get_current_admin)):
async def get_all_vehicles():
    vehicles_data = await redis_service.get_all_vehicles_fast()
    return vehicles_data

@router.get("/{vehicle_id}")
# async def get_vehicle(vehicle_id: str, current_user = Depends(get_current_user)):
async def get_vehicle(vehicle_id: str):
    vehicle = await redis_service.get_vehicle(vehicle_id)

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return vehicle 


@router.post("/vehicles/{vehicle_id}/engine/start")
async def start_engine(vehicle_id: str):
    # שליחת פקודה ל-Kafka כדי שהסימולטור/רכב יניע
    # await kafka_producer.send("vehicle_commands", {
    #     "vehicle_id": vehicle_id,
    #     "command": "START_ENGINE"
    # })
    return {"status": "success", "action": "engine_start_command_sent"} 

@router.post("/vehicles/{vehicle_id}/engine/stop")
async def stop_engine(vehicle_id: str):
    # await kafka_producer.send("vehicle_commands", {
    #     "vehicle_id": vehicle_id, 
    #     "command": "STOP_ENGINE"
    # })
    return {"status": "success", "action": "engine_stop_command_sent"}