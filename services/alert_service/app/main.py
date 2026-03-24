import asyncio
import json
from aiokafka import AIOKafkaConsumer

from . import AlertManager


KAFKA_BROKER = "kafka:9092"
TOPIC = "alerts"
GROUP_ID = "alert-service"


async def main():
    consumer = AIOKafkaConsumer(
        TOPIC,
        bootstrap_servers=KAFKA_BROKER,
        group_id=GROUP_ID,
        auto_offset_reset="earliest"
    )

    manager = AlertManager()

    await consumer.start()
    try:
        async for msg in consumer:
            event = json.loads(msg.value)

            await manager.handle(event)

    finally:
        await consumer.stop()


if __name__ == "__main__":
    asyncio.run(main())