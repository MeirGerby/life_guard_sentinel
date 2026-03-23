import asyncio
import json
import aioredis
from aiokafka import AIOKafkaProducer

from shared.models.alert import AlertEvent, AlertAction

from app.consumer import create_consumer
from app.pipelines.risk_pipeline import run_pipeline
from app.state.vehicle_state import VehicleState


KAFKA_BROKER = "kafka:9092"
OUTPUT_TOPIC = "alerts"


async def main():
    consumer = await create_consumer()

    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BROKER,
        value_serializer=lambda v: json.dumps(v).encode("utf-8")
    )

    redis = await aioredis.from_url(
        "redis://redis:6379",
        encoding="utf-8",
        decode_responses=True
    )

    state = VehicleState(redis)

    await producer.start()

    try:
        async for msg in consumer:
            raw = json.loads(msg.value)

            # 🧠 process
            processed = run_pipeline(raw)

            # 💾 update state
            await state.update(processed.vehicle_id, processed.dict())

            # 🚨 create alert if needed
            if processed.risk_level in ["HIGH", "CRITICAL"]:
                alert = AlertEvent(
                    vehicle_id=processed.vehicle_id,
                    priority=processed.risk_level,
                    message=processed.recommendation,
                    actions=[
                        AlertAction.SMS,
                        AlertAction.PUSH,
                        AlertAction.CALL
                    ],
                    recipient_phone=processed.owner_phone,
                    recipient_name=processed.owner_name
                )

                await producer.send_and_wait(
                    OUTPUT_TOPIC,
                    alert.dict()
                )

    finally:
        await consumer.stop()
        await producer.stop()
        await redis.close()


if __name__ == "__main__":
    asyncio.run(main())