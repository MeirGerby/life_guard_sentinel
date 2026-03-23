import json
import aioredis


class VehicleState:
    def __init__(self, redis):
        self.redis = redis

    async def update(self, vehicle_id: str, data: dict):
        await self.redis.set(f"vehicle:{vehicle_id}", json.dumps(data))

    async def get(self, vehicle_id: str):
        data = await self.redis.get(f"vehicle:{vehicle_id}")
        return json.loads(data) if data else None