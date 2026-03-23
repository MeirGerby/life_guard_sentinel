def extract_features(data: dict) -> dict:
    return {
        "temp_delta": data["internal_temp"] - (data.get("external_temp") or 0),
        "is_child_alone": data["occupancy_detected"] and data["parent_distance_meters"] > 10,
        "engine_off": data["engine_status"] == "off"
    }