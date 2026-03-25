import random

def generate_temp(current_temp: float, engine_status: str) -> float:
    if engine_status == "off":
        # Temperature rises when engine is off
        new_temp = current_temp + random.uniform(0.1, 0.5)
    else:
        # AC keeps it stable or cools it down
        new_temp = current_temp + random.uniform(-0.2, 0.2)
    
    return round(max(15.0, min(55.0, new_temp)), 1) 

