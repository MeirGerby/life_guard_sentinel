from shared.models.enrichment import ProcessedVehicleData, RiskLevel

from app.processors.feature_engineering import extract_features
from app.processors.heat_engine import heat_risk
from app.processors.rule_engine import rule_risk
from app.processors.ml_engine import ml_risk


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

    return ProcessedVehicleData(
        **data,
        risk_score=score,
        risk_level=level,
        recommendation=recommendation
    )