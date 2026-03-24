from . import AlertStrategy


class SMSChannel(AlertStrategy):
    async def send(self, vehicle_id, payload):
        print(f"[SMS] Vehicle {vehicle_id}: {payload['risk_level']} risk")