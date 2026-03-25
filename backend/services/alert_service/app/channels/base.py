from abc import ABC, abstractmethod
from typing import Dict, Any


class AlertStrategy(ABC):
    @abstractmethod
    async def send(self, vehicle_id: str, payload: Dict[str, Any]):
        pass