import asyncio
import random
from datetime import datetime
from backend.shared import VehicleTelemetry, GPSLocation
from .generators.location import move_vehicle
from .generators.temperature import generate_temp
from .generators.parent_distance import get_distance
from faker import Faker

import random

fake = Faker()
class VehicleSimulator:
    def __init__(self, num_vehicles: int = 1000):
        self.num_vehicles = num_vehicles
        self.vehicles = self._initialize_vehicles()


    def _initialize_vehicles(self):
        vehicles = []
        
        city_centers = [
                {"name": "Tel Aviv", "lat": 32.0853, "lon": 34.7818, "weight": 40}, # 40% מהרכבים
                {"name": "Jerusalem", "lat": 31.7683, "lon": 35.2137, "weight": 25},
                {"name": "Haifa", "lat": 32.7940, "lon": 34.9896, "weight": 15},
                {"name": "Beersheba", "lat": 31.2530, "lon": 34.7915, "weight": 10},
                {"name": "Petah Tikva", "lat": 32.0840, "lon": 34.8878, "weight": 10}
            ]

        cities = []
        for city in city_centers:
            cities.extend([city] * city.get("weight", 1))

        
        for i in range(self.num_vehicles):

            base_city = random.choice(cities)
            
            offset_lat = random.uniform(-0.03, 0.03)
            offset_lon = random.uniform(-0.02, 0.02)
            
            lat = base_city["lat"] + offset_lat
            lon = base_city["lon"] + offset_lon
            
            vehicles.append({
                "vehicle_id": f"V-{1000 + i}",
                "location": {
                    "lat": round(lat, 6),
                    "lon": round(lon, 6) 
                },
                "internal_temp": round(random.uniform(22.0, 26.0), 1),
                "owner_name": fake.name(), 
                "owner_phone": fake.phone_number(),
                "engine_status": random.choice(["on", "off"]),
                "occupancy_detected": random.choice([True, False, False]),
                "parent_distance_meters": round(random.uniform(2, 100), 1),
            })
        return vehicles

    def update_vehicle_state(self, vehicle: dict) -> VehicleTelemetry:
        # Update values using generators
        vehicle["location"] = move_vehicle(vehicle["location"]["lat"], vehicle["location"]["lon"])
        vehicle["internal_temp"] = generate_temp(vehicle["internal_temp"], vehicle["engine_status"])
        vehicle["parent_distance_meters"] = get_distance(vehicle["parent_distance_meters"])
        
        # Occasionally flip engine/occupancy for variety
        if random.random() < 0.01:
            vehicle["engine_status"] = "on" if vehicle["engine_status"] == "off" else "off"
        
        return VehicleTelemetry(
            vehicle_id=vehicle["vehicle_id"],
            timestamp=datetime.now(),
            internal_temp=vehicle["internal_temp"],
            engine_status=vehicle["engine_status"],
            occupancy_detected=vehicle["occupancy_detected"],
            parent_distance_meters=vehicle["parent_distance_meters"],
            location=GPSLocation(**vehicle["location"])
        )