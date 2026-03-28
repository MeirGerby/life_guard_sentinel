from . import AlertStrategy


class CallChannel(AlertStrategy):
    async def send(self, vehicle_id, payload):
        print(f"[CALL] Calling parent of vehicle {vehicle_id}")