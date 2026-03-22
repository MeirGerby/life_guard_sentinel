from .vehicle import VehicleTelemetry
from typing import Optional 
from pydantic import Field
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ProcessedVehicleData(VehicleTelemetry):
    # הוספת נתוני סביבה
    external_temp: Optional[float] = None
    is_heatwave: bool = False
    
    # ניתוח סיכונים
    risk_score: int = Field(ge=0, le=100) # ציון בין 0 ל-100
    risk_level: RiskLevel
    recommendation: str
    
    # פרטי בעלים (נשלף מ-Redis/DB)
    owner_name: str
    owner_phone: str
