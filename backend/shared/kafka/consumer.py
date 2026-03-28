import asyncio 
import json
from aiokafka import AIOKafkaConsumer 
from backend.shared.config.settings import settings
from backend.shared.utils.logger import get_logger

logger = get_logger(__name__)


class Consumer:
    def __init__(self, topic: str, group_id: str):
        self.consumer = AIOKafkaConsumer(
            topic,
            bootstrap_servers=settings.KAFKA_BROKER,
            group_id=group_id,
            auto_offset_reset="latest",
            enable_auto_commit=True,
            value_deserializer=lambda v: json.loads(v.decode("utf-8"))
        )
    
    async def start(self):
        """Start the consumer connection"""
        return await self.consumer.start()
    
    async def stop(self):
        """Close the consumer connection"""
        return await self.consumer.stop()

    async def listen(self):
        """Asynchronous generator to yield messages"""
        try:
            async for msg in self.consumer:
                logger.info(f"Received message: {msg.value}")
                yield msg.value
        except Exception as e:
            logger.error(f"Error while consuming {e}")
        finally:
            await self.stop()