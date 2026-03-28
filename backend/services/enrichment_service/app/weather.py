import random


def get_external_temperature(lat: float, lon: float) -> float:
    # simulate external temp (could be API later)
    return round(random.uniform(25, 45), 2)


def is_heatwave(temp: float) -> bool:
    return temp >= 35