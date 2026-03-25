from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal 

class GPSLocation(BaseModel):
    lat: float
    lon: float = Field(validation_alias="lng")

class VehicleTelemetry(BaseModel):
    vehicle_id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    internal_temp: float
    engine_status: Literal["on", "off"]  
    occupancy_detected: bool
    parent_distance_meters: float
    location: GPSLocation



