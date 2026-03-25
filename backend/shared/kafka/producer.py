import asyncio 
from datetime import datetime, date
import json
from aiokafka import AIOKafkaProducer 

from shared.config.settings import settings
from shared.utils.logger import get_logger

logger = get_logger(__name__)

def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")
class Producer:
    def __init__(self):
        self.producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BROKER,
            value_serializer=lambda v: json.dumps(v, default=json_serial).encode("utf-8"),
            retry_backoff_ms=100,
            request_timeout_ms=40000
        )
        

    async def start(self):
        """Must be called before sending messages"""
        return await self.producer.start()

    async def stop(self):
        """Clearly shut down the producer"""
        return await self.producer.stop()

    async def send(self, topic: str, data: dict):
        try:  
            result = await self.producer.send_and_wait(topic, data)
            logger.info(f"Message sent to {topic}: {data}")
            return result
        
        except Exception as e:
            logger.error(f"Failed to send message: {e}")
            raise