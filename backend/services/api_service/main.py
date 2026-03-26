import sys  
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from datetime import datetime   
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
    
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3005",
    "http://127.0.0.1:3005",
    "http://localhost:5173",  
    "http://127.0.0.1:5173",
]

app = FastAPI(
    title="Life Guard Sentinel API",
    version="1.0.0",
    debug=True,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         
    allow_credentials=True,
    allow_methods=["*"],              
    allow_headers=["*"],           
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
    return {"status": "healthy", "timestamp": datetime.now()}