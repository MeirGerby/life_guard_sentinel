def is_danger_zone(lat: float, lon: float) -> bool:
    # simple mock: define dangerous zone range
    if 31.0 < lat < 33.0 and 34.0 < lon < 35.0:
        return True
    return False