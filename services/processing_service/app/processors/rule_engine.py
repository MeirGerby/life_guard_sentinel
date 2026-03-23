def rule_risk(features: dict) -> int:
    score = 0

    if features["is_child_alone"]:
        score += 30

    if features["engine_off"]:
        score += 20

    return score