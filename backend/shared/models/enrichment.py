from .vehicle import VehicleTelemetry
from typing import Optional 
from pydantic import Field
from enum import Enum
from datetime import datetime 

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ProcessedVehicleData(VehicleTelemetry):
    external_temp: Optional[float] = None
    is_heatwave: bool = False
    
    risk_score: int = Field(ge=0, le=100) 
    risk_level: RiskLevel
    recommendation: str
    
    owner_name: str
    owner_phone: str

    model_config = {
        "from_attributes": True, 
        "populate_by_name": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat(),
        }
    }