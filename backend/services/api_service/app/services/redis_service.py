import json
from typing import Optional, Dict, Any
import asyncio

from shared import RedisClient


class RedisService:
    def __init__(self):
        self.client = RedisClient()

    async def get_vehicle(self, vehicle_id: str) -> Optional[Dict[str, Any]]:
        data = await self.client.get(f"vehicle:{vehicle_id}")
        if not data:
            return None

        try:
            return json.loads(data.replace("'", '"'))
        except Exception:
            return {"raw": data}

    async def get_all_vehicles_fast(self):
        keys = await self.client.client.keys("vehicle:*")
        if not keys:
            return []
        
        results = await self.client.client.mget(keys=keys)
        
        vehicles = []
        for data in results:
            if data:
                try:
                    str_data = data.decode('utf-8') if isinstance(data, bytes) else str(data)
                    vehicles.append(json.loads(str_data.replace("'", '"')))
                except Exception:
                    vehicles.append({"raw": data})
        return vehicles

    async def get_alerts(self):
        keys = await self.client.client.keys("alert:*")
        alerts = []

        for key in keys:
            data = await self.client.get(key)
            if data:
                try:
                    alerts.append(json.loads(data.replace("'", '"')))
                except Exception:
                    alerts.append({"raw": data})

        return alerts
    