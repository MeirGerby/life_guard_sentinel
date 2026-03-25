import sys  
from fastapi import FastAPI
from contextlib import asynccontextmanager
import asyncio
from .app.routes import vehicles, alerts, auth
from .app.services.redis_service import RedisService 
from .app.db.database import engine, Base

from .app.db.database import SessionLocal
from .app.db.models import User
from .app.core.security import get_password_hash

def create_first_admin():
    db = SessionLocal()
    admin_exists = db.query(User).filter(User.role == "admin").first()
    if not admin_exists:
        hashed_password = get_password_hash("admin1234") # סיסמה ראשונית
        admin = User(
            username="admin",
            email="admin@sentinel.com",
            hashed_password=hashed_password,
            role="admin"
        )
        db.add(admin)
        db.commit()
        print("First Admin created: user: admin, pass: admin1234")
    db.close()

Base.metadata.create_all(bind=engine)
create_first_admin()

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy()) 


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: logic here if needed
    yield
    # Shutdown: This is where we fix your error
    # We force the Redis connections to close BEFORE the loop dies
    from .app.routes.vehicles import redis_service as vehicle_redis
    from .app.routes.alerts import redis_service as alert_redis
    
    # Close both connections before the event loop is destroyed
    await asyncio.gather(
        vehicle_redis.client.client.aclose(),
        alert_redis.client.client.aclose(),
        return_exceptions=True
    )

app = FastAPI(
    title="Life Guard Sentinel API",
    version="1.0.0",
    debug=True,
    lifespan=lifespan
)


# Register routes
app.include_router(auth.router)
app.include_router(vehicles.router, tags=["Vehicles"])
app.include_router(alerts.router, tags=["Alerts"])


@app.get("/")
def root():
    return {"message": "API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}