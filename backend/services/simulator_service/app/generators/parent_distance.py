import random

def get_distance(current_distance: float) -> float:
    # Simulate parent walking away or coming back
    change = random.uniform(-5.0, 10.0)
    new_distance = current_distance + change
    return round(max(0.0, new_distance), 2)