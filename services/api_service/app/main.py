from fastapi import FastAPI
from shared.redis.client import RedisClient

app = FastAPI()
redis_client = RedisClient()


@app.get("/vehicles/{vehicle_id}")
def get_vehicle(vehicle_id: int):
    data = redis_client.get(f"vehicle:{vehicle_id}")
    return {"vehicle": data}


@app.get("/health")
def health():
    return {"status": "ok"}