from shared.kafka.consumer import Consumer
from shared.kafka.producer import Producer
from shared.kafka.topics import Topics
from shared.redis.client import RedisClient
from shared.utils.logger import get_logger

from app.processors.rule_engine import evaluate_risk

logger = get_logger(__name__)

consumer = Consumer(Topics.VEHICLE_DATA, group_id="processing-group")
producer = Producer()
redis_client = RedisClient()


def run():
    for event in consumer.listen():
        logger.info(f"Processing: {event}")

        risk = evaluate_risk(event)

        # Save state in Redis
        redis_client.set(f"vehicle:{event['vehicle_id']}", str(event))

        if risk:
            alert = {
                "vehicle_id": event["vehicle_id"],
                "risk_level": risk,
                "message": "Danger detected!"
            }

            producer.send(Topics.ALERTS, alert)
            logger.warning(f"ALERT: {alert}")


if __name__ == "__main__":
    run()