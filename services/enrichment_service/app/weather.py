import requests
from shared.redis import client
import os
import json

# ===== CONFIG =====
API_KEY = os.getenv("WEATHER_API_KEY")
BASE_URL = "http://api.weatherapi.com/v1/current.json"

# Redis connection
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)


# ===== HELPERS =====
def round_coord(value, precision=2):
    return round(value, precision)


def build_cache_key(lat, lon):
    lat_r = round_coord(lat)
    lon_r = round_coord(lon)
    return f"weather:{lat_r}:{lon_r}"


# ===== WEATHER FETCH =====
def fetch_weather(lat, lon):
    params = {
        "key": API_KEY,
        "q": f"{lat},{lon}"
    }

    response = requests.get(BASE_URL, params=params, timeout=3)
    response.raise_for_status()

    data = response.json()

    return {
        "temp": data["current"]["temp_c"],
        "feels_like": data["current"]["feelslike_c"],
        "humidity": data["current"]["humidity"]
    }


# ===== MAIN FUNCTION =====
def get_weather_with_cache(lat, lon, ttl_seconds=300):
    key = build_cache_key(lat, lon)

    cached = r.get(key)
    if cached:
        print("✅ Cache hit")
        return json.loads(cached)

    print("🌐 Calling WeatherAPI...")
    weather = fetch_weather(lat, lon)

    r.setex(key, ttl_seconds, json.dumps(weather))

    return weather


# ===== PROCESSING EXAMPLE =====
def process_event(event):
    lat = event["lat"]
    lon = event["lon"]
    car_temp = event["car_temp"]

    weather = get_weather_with_cache(lat, lon)
    outside_temp = weather["temp"]

    risk = "LOW"
    if car_temp > 40 and outside_temp > 30:
        risk = "HIGH"

    return {
        "device_id": event["device_id"],
        "car_temp": car_temp,
        "outside_temp": outside_temp,
        "risk": risk
    }


# ===== TEST =====
if __name__ == "__main__":
    sample_event = {
        "device_id": "car_1",
        "lat": 31.77,
        "lon": 35.21,
        "car_temp": 42
    }

    result = process_event(sample_event)
    print(result)