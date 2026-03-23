import json
from typing import Optional, Dict, Any

from shared.redis.client import RedisClient


class RedisService:
    def __init__(self):
        self.client = RedisClient()

    def get_vehicle(self, vehicle_id: int) -> Optional[Dict[str, Any]]:
        data = self.client.get(f"vehicle:{vehicle_id}")
        if not data:
            return None

        try:
            return json.loads(data.replace("'", '"'))
        except Exception:
            return {"raw": data}

    def get_all_vehicles(self):
        keys = self.client.client.keys("vehicle:*")
        vehicles = []

        for key in keys:
            data = self.client.get(key)
            if data:
                try:
                    vehicles.append(json.loads(data.replace("'", '"')))
                except Exception:
                    vehicles.append({"raw": data})

        return vehicles

    def get_alerts(self):
        keys = self.client.client.keys("alert:*")
        alerts = []

        for key in keys:
            data = self.client.get(key)
            if data:
                try:
                    alerts.append(json.loads(data.replace("'", '"')))
                except Exception:
                    alerts.append({"raw": data})

        return alerts