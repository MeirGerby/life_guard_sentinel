import asyncio
import json

from shared import (
    VehicleTelemetry, 
    ProcessedVehicleData, 
    RiskLevel, 
    Consumer, 
    Producer,
    Topics
)

from app.weather import get_external_temperature, is_heatwave
from app.traffic import get_traffic_level
from app.geofencing import is_danger_zone


INPUT_TOPIC = "vehicle-data"
OUTPUT_TOPIC = "telemetry.enriched"
GROUP_ID = "enrichment-group"


def calculate_risk(data: dict) -> (int, RiskLevel, str):
    score = 0

    # temperature inside vehicle
    if data["temperature"] > 40:
        score += 40
    elif data["temperature"] > 35:
        score += 25

    # external heat
    if data["is_heatwave"]:
        score += 20

    # parent distance
    if data.get("parent_distance", 0) > 20:
        score += 20

    # danger zone
    if data.get("danger_zone"):
        score += 20

    # normalize
    score = min(score, 100)

    # risk level
    if score >= 80:
        return score, RiskLevel.CRITICAL, "Immediate action required"
    elif score >= 60:
        return score, RiskLevel.HIGH, "High risk detected"
    elif score >= 30:
        return score, RiskLevel.MEDIUM, "Moderate risk"
    else:
        return score, RiskLevel.LOW, "Low risk"


async def main():
    consumer = Consumer(
        topic=Topics.VEHICLE_DATA,
        group_id=GROUP_ID,

    )
    producer = Producer()

    await consumer.start()
    await producer.start()

    try:
        async for msg in consumer.listen():

            vehicle = VehicleTelemetry(**msg.value)    # type: ignore

            
            ext_temp = get_external_temperature(vehicle.location.lat, vehicle.location.lon)
            heatwave = is_heatwave(ext_temp)
            traffic = get_traffic_level(vehicle.location.lat, vehicle.location.lon)
            danger = is_danger_zone(vehicle.location.lat, vehicle.location.lon)

            enriched_dict = {
                **vehicle.model_dump(),
                "external_temp": ext_temp,
                "is_heatwave": heatwave,
                "traffic": traffic,
                "danger_zone": danger,
                "owner_name": "John Doe",
                "owner_phone": "+123456789"
            }


            score, level, recommendation = calculate_risk(enriched_dict)

            processed = ProcessedVehicleData(
                **enriched_dict,
                risk_score=score,
                risk_level=level,
                recommendation=recommendation
            )

            
            await producer.send(
                Topics.ENRICHED_DATA,
                processed.model_dump()
            )

    finally:
        await consumer.stop()
        await producer.stop()


if __name__ == "__main__":
    asyncio.run(main())