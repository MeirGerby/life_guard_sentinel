from app.channels.base import AlertChannel


class CallChannel(AlertChannel):
    async def send(self, vehicle_id, payload):
        print(f"[CALL] Calling parent of vehicle {vehicle_id}")