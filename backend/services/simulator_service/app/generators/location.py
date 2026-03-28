import random

def move_vehicle(current_lat: float, current_lon: float) -> dict:
    # Roughly 10-50 meters of movement
    new_lat = current_lat + random.uniform(-0.0005, 0.0005)
    new_lon = current_lon + random.uniform(-0.0005, 0.0005)
    return {"lat": round(new_lat, 6), "lon": round(new_lon, 6)}