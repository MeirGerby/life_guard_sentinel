import asyncio
import random
from datetime import datetime
from shared import VehicleTelemetry, GPSLocation
from .generators.location import move_vehicle
from .generators.temperature import generate_temp
from .generators.parent_distance import get_distance

class VehicleSimulator:
    def __init__(self, num_vehicles: int = 1000):
        self.num_vehicles = num_vehicles
        self.vehicles = self._initialize_vehicles()

    def _initialize_vehicles(self):
        vehicles = []
        for i in range(self.num_vehicles):
            vehicles.append({
                "vehicle_id": f"V-{1000 + i}",
                "location": {"lat": 32.0853, "lon": 34.7818}, # Tel Aviv area
                "internal_temp": 24.0,
                "engine_status": random.choice(["on", "off"]),
                "occupancy_detected": random.choice([True, False, False, False]), # 25% chance of occupancy
                "parent_distance_meters": 5.0
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