from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Kafka
    KAFKA_BROKER: str = "kafka:9092"

    # Redis
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379

    # App
    APP_NAME: str = "life-guard-sentinel"
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file = ".env",
        extra='ignore'
    )

settings = Settings()