def evaluate_risk(vehicle: dict):
    temp = vehicle.get("temperature", 0)
    distance = vehicle.get("parent_distance", 0)

    if temp > 40 and distance > 10:
        return "HIGH"

    if temp > 35:
        return "MEDIUM"

    return None