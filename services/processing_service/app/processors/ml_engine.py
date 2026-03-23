import joblib
import numpy as np

model = joblib.load("app/models/risk_model.pkl")

def ml_risk(features: dict) -> int:
    X = np.array([[
        features["temp_delta"],
        features["internal_temp"],
        features["parent_distance"],
        int(features["is_child_alone"]),
        int(features["engine_off"])
    ]])

    prob = model.predict_proba(X)[0][1]

    return int(prob * 4)