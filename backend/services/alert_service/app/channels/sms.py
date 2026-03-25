from .base import AlertStrategy
from typing import Dict, Any
class SMSChannel(AlertStrategy):
    async def send(self, vehicle_id: str, payload: Dict[str, Any]):
        # Access safely with .get()
        risk = payload.get('priority', 'UNKNOWN') 
        print(f"[SMS] Vehicle {vehicle_id}: {risk} risk alert sent.")