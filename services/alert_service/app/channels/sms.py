from app.channels.base import AlertChannel


class SMSChannel(AlertChannel):
    async def send(self, vehicle_id, payload):
        print(f"[SMS] Vehicle {vehicle_id}: {payload['risk_level']} risk")