import time
import random
from shared.kafka.producer import Producer

# producer = Producer("kafka:9092")
producer = Producer("localhost:9092")

def generate_vehicle():
    return {
        "vehicle_id": random.randint(1, 1000),
        "temperature": random.randint(20, 50),
        "lat": random.random(),
        "lon": random.random()
    }

if __name__ == "__main__":
    while True:
        data = generate_vehicle()
        producer.send("vehicle-data", data)
        print(data)
        time.sleep(1)