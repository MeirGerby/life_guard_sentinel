from app.channels.base import AlertChannel


class PushChannel(AlertChannel):
    async def send(self, vehicle_id, payload):
        print(f"[PUSH] Notification sent for vehicle {vehicle_id}")