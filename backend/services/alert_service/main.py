import asyncio
from backend.shared import Consumer, Topics

from .app import AlertManager


# TOPIC = "alerts"
GROUP_ID = "alert-service"


async def main():
    consumer = Consumer(
        Topics.ALERTS,
        group_id=GROUP_ID
    )

    manager = AlertManager()

    await consumer.start()
    try:
        async for msg in consumer.listen():
            await manager.handle(msg.value)   # type: ignore 

    finally:
        await consumer.stop()


if __name__ == "__main__":
    asyncio.run(main())