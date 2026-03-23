import random


def get_traffic_level(lat: float, lon: float) -> str:
    return random.choice(["LOW", "MEDIUM", "HIGH"])