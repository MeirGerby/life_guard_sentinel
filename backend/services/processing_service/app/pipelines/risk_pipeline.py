from backend.shared.models.enrichment import ProcessedVehicleData, RiskLevel

from ..processors import (
    extract_features, 
    heat_risk, 
    rule_risk, 
    ml_risk
)


def calculate_level(score: int):
    if score >= 80:
        return RiskLevel.CRITICAL, "Immediate action required"
    elif score >= 60:
        return RiskLevel.HIGH, "High risk detected"
    elif score >= 30:
        return RiskLevel.MEDIUM, "Moderate risk"
    else:
        return RiskLevel.LOW, "Low risk"


def run_pipeline(data: dict) -> ProcessedVehicleData:
    features = extract_features(data)

    score = 0
    score += heat_risk(data)
    score += rule_risk(features)
    score += ml_risk(features)
    score = min(score, 100)

    level, recommendation = calculate_level(score)
    
    clean_data = data.copy()
    clean_data.pop("risk_score", None)
    clean_data.pop("risk_level", None)
    clean_data.pop("recommendation", None)

    return ProcessedVehicleData(
        **clean_data,
        risk_score=score,
        risk_level=level,
        recommendation=recommendation
    )