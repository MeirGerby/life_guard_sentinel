from fastapi import FastAPI

from app.routes import vehicles, alerts


app = FastAPI(
    title="Life Guard Sentinel API",
    version="1.0.0"
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