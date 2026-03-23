def ml_risk(features: dict) -> int:
    # simulate ML contribution
    score = 0

    if features["temp_delta"] > 10:
        score += 10

    return score