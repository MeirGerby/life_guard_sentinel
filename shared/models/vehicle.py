from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal 

class GPSLocation(BaseModel):
    lat: float
    lon: float

class VehicleTelemetry(BaseModel):
    vehicle_id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    internal_temp: float
    engine_status: Literal["on", "off"]  
    occupancy_detected: bool
    parent_distance_meters: float
    location: GPSLocation


# telemetry = VehicleTelemetry(
#     vehicle_id="CAR_101",
#     internal_temp=34.2,
#     engine_status="off",
#     occupancy_detected=True,
#     parent_distance_meters=200.5,
#     location=GPSLocation(lat=32.08, lon=34.78)
# )

# print(telemetry.model_dump_json())