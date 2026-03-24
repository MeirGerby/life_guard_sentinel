import sys  
from fastapi import FastAPI
from contextlib import asynccontextmanager
import asyncio
from .routes import vehicles, alerts, auth
from .services.redis_service import RedisService 
from .db.database import engine, Base

Base.metadata.create_all(bind=engine)

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy()) 


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: logic here if needed
    yield
    # Shutdown: This is where we fix your error
    # We force the Redis connections to close BEFORE the loop dies
    from .routes.vehicles import redis_service as vehicle_redis
    from .routes.alerts import redis_service as alert_redis
    
    # Close both connections before the event loop is destroyed
    await asyncio.gather(
        vehicle_redis.client.client.aclose(),
        alert_redis.client.client.aclose(),
        return_exceptions=True
    )

app = FastAPI(lifespan=lifespan)

app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(alerts.router)
app = FastAPI(
    title="Life Guard Sentinel API",
    version="1.0.0",
    debug=True
)

# Register routes
app.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicles"])
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])


@app.get("/")
def root():
    return {"message": "API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}