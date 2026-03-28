from typing import Dict, Any

from .channels import SMSChannel, CallChannel, PushChannel



class AlertManager:
    def __init__(self):
        self._channels: Dict[str, Any] = {
            "LOW": [SMSChannel()],
            "MEDIUM": [SMSChannel(), PushChannel()],
            "HIGH": [SMSChannel(), PushChannel(), CallChannel()],
            "CRITICAL": [SMSChannel(), PushChannel(), CallChannel()],
        }

    async def handle(self, event: Dict[str, Any]):
        vehicle_id = event.get("vehicle_id")
        risk = str(event.get("risk_level", "LOW")).upper()

        channels = self._channels.get(risk, [])

        for channel in channels:
            await channel.send(vehicle_id, event)