import redis
from shared.config.settings import settings


class RedisClient:
    def __init__(self):
        self.client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=True
        )

    def set(self, key: str, value: str):
        self.client.set(key, value)

    def get(self, key: str):
        return self.client.get(key)

    def delete(self, key: str):
        self.client.delete(key)