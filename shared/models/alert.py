from pydantic import BaseModel, Field
from uuid import uuid4
from datetime import datetime
from enum import Enum 
from typing import List

class AlertAction(str, Enum):
    SMS = "SMS"
    CALL = "CALL"
    PUSH = "PUSH"

class AlertEvent(BaseModel):
    alert_id: str = Field(default_factory=lambda: str(uuid4()))
    vehicle_id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    priority: str 
    message: str
    actions: List[AlertAction]
    recipient_phone: str
    recipient_name: str
