import asyncio
    
from .app import VehicleState ,run_pipeline
from shared import (
    Consumer, 
    RedisClient, 
    Producer, 
    Topics, 
    AlertEvent, 
    AlertAction,
    get_logger
)

logger = get_logger(__name__)

GROUP_ID = "processing_service_group"

async def main():
    consumer = Consumer(Topics.ENRICHED_DATA, GROUP_ID)
    producer = Producer()
    redis = RedisClient()
    state = VehicleState(redis)


    await consumer.start()
    await producer.start()
    logger.info("Processing Service started. Listening for enriched telemetry...")

    try:
        async for msg in consumer.listen():

            processed = run_pipeline(msg)  # type: ignore

            
            await state.update(processed.vehicle_id, processed.model_dump(mode='json'))


            if processed.risk_level in ["MEDIUM", "HIGH", "CRITICAL"]:
                actions = []
                message_prefix = ""

                if processed.risk_level == "MEDIUM":
                    actions = [AlertAction.SMS]
                    message_prefix = "[SMS NOTICE]"
                
                elif processed.risk_level == "HIGH":
                    actions = [AlertAction.SMS, AlertAction.PUSH] 
                    message_prefix = "[VEHICLE ACTION REQUIRED]"
                
                elif processed.risk_level == "CRITICAL":
                    actions = [AlertAction.SMS, AlertAction.PUSH, AlertAction.CALL]
                    message_prefix = "[EMERGENCY - DISPATCHING SERVICES]"

                logger.warning(f"{processed.risk_level} RISK for {processed.vehicle_id}: {processed.risk_score}")
                alert = AlertEvent(
                    vehicle_id=processed.vehicle_id,
                    priority=processed.risk_level, 
                    message=f"{message_prefix} {processed.recommendation}",
                    actions=actions,
                    recipient_phone=processed.owner_phone,
                    recipient_name=processed.owner_name
                )

                await producer.send(
                    Topics.ALERTS,
                    alert.model_dump()
                )

    finally:
        await consumer.stop()
        await producer.stop()
        await redis.client.close()


if __name__ == "__main__":
    asyncio.run(main())