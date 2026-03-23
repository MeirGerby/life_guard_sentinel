from kafka import KafkaProducer
import json
from shared.config.settings import settings
from shared.utils.logger import get_logger

logger = get_logger(__name__)


class Producer:
    def __init__(self):
        self.producer = KafkaProducer(
            bootstrap_servers=settings.KAFKA_BROKER,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            retries=5
        )

    def send(self, topic: str, data: dict):
        try:
            future = self.producer.send(topic, data)
            result = future.get(timeout=10)
            logger.info(f"Message sent to {topic}: {data}")
            return result
        except Exception as e:
            logger.error(f"Failed to send message: {e}")