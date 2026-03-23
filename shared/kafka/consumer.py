from kafka import KafkaConsumer
import json
from shared.config.settings import settings
from shared.utils.logger import get_logger

logger = get_logger(__name__)


class Consumer:
    def __init__(self, topic: str, group_id: str):
        self.consumer = KafkaConsumer(
            topic,
            bootstrap_servers=settings.KAFKA_BROKER,
            group_id=group_id,
            auto_offset_reset="earliest",
            enable_auto_commit=True,
            value_deserializer=lambda v: json.loads(v.decode("utf-8"))
        )

    def listen(self):
        for msg in self.consumer:
            logger.info(f"Received message: {msg.value}")
            yield msg.value