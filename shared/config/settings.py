from pydantic import BaseSettings


class Settings(BaseSettings):
    # Kafka
    KAFKA_BROKER: str = "kafka:9092"

    # Redis
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379

    # App
    APP_NAME: str = "life-guard-sentinel"
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()