import time
import random
from shared.kafka.producer import Producer
from shared.kafka.topics import Topics
from shared.utils.logger import get_logger

logger = get_logger(__name__)
producer = Producer()

def generate_vehicle():
    return {
        "vehicle_id": random.randint(1, 1000),
        "temperature": random.randint(20, 50),
        "lat": round(random.uniform(30.0, 35.0), 6),
        "lon": round(random.uniform(30.0, 35.0), 6),
        "parent_distance": round(random.uniform(0, 50), 2)

    }

def run():
    while True:
        data = generate_vehicle()
        producer.send(Topics.VEHICLE_DATA, data)
        logger.info(f"Produced: {data}")
        time.sleep(1)

if __name__ == "__main__":
    run()