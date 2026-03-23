from typing import Dict, Any

from app.channels.sms import SMSChannel
from app.channels.call import CallChannel
from app.channels.push import PushChannel


class AlertManager:
    def __init__(self):
        self._channels = {
            "low": [SMSChannel()],
            "medium": [SMSChannel(), PushChannel()],
            "high": [SMSChannel(), PushChannel(), CallChannel()],
            "critical": [SMSChannel(), PushChannel(), CallChannel()],
        }

    async def handle(self, event: Dict[str, Any]):
        vehicle_id = event.get("vehicle_id")
        risk = event.get("risk_level", "low")

        channels = self._channels.get(risk, [])

        for channel in channels:
            await channel.send(vehicle_id, event)