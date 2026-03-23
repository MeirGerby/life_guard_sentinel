from aiokafka import AIOKafkaConsumer


async def create_consumer():
    consumer = AIOKafkaConsumer(
        "telemetry.enriched",
        bootstrap_servers="kafka:9092",
        group_id="processing-service",
        auto_offset_reset="earliest"
    )
    await consumer.start()
    return consumer