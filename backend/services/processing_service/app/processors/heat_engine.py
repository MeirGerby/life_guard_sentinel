def heat_risk(data: dict) -> int:
    score = 0

    if data["internal_temp"] > 40:
        score += 40
    elif data["internal_temp"] > 35:
        score += 25

    if data.get("is_heatwave"):
        score += 20

    return score