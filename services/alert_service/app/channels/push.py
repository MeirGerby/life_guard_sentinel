from . import AlertStrategy



class PushChannel(AlertStrategy):
    async def send(self, vehicle_id, payload):
        print(f"[PUSH] Notification sent for vehicle {vehicle_id}")