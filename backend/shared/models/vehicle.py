from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Literal 

class GPSLocation(BaseModel):
    lat: float
    lng: float = Field(..., alias="lon") 

    model_config = ConfigDict(
        populate_by_name=True
    )

class VehicleTelemetry(BaseModel):
    vehicle_id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    internal_temp: float
    engine_status: Literal["on", "off"]  
    occupancy_detected: bool
    parent_distance_meters: float
    location: GPSLocation



