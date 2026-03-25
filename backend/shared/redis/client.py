from redis.asyncio import Redis 
from backend.shared.config.settings import settings


class RedisClient:
    def __init__(self):
        self.client = Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=True,
            max_connections=100
        )

    async def set(self, key: str, value: str):
        """Asynchronously set a value in Redis."""
        await self.client.set(key, value)

    async def get(self, key: str):
        """Asynchronously get a value from Redis."""
        return await self.client.get(key)

    async def delete(self, key: str):
        """Asynchronously delete a key."""
        await self.client.delete(key)

    async def close(self):
        """Close the connection pull"""
        await self.client.aclose()