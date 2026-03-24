import joblib
import numpy as np
import os

# Calculate path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "risk_model.pkl")

# We move the load inside a global variable that starts as None
_model = None

def get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train_model first!")
        _model = joblib.load(MODEL_PATH)
    return _model

def ml_risk(features: dict) -> int:
    # Now we only load the model when we actually need to predict
    model = get_model()
    
    X = np.array([[
        features["temp_delta"],
        features["internal_temp"],
        features["parent_distance"],
        int(features["is_child_alone"]),
        int(features["engine_off"])
    ]])

    prob = model.predict_proba(X)[0][1]
    return int(prob * 4)