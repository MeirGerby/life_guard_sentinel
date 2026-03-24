import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# 1. Define the correct path to save the model where ml_engine expects it
# This ensures the model ends up in services/processing_service/app/models/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "..", "models")
os.makedirs(MODEL_DIR, exist_ok=True)
MODEL_PATH = os.path.join(MODEL_DIR, "risk_model.pkl")

# fake training data
X = []
y = []

for _ in range(5000):
    # Generating inputs to match the 5 features in ml_engine.py
    temp_delta = np.random.randint(0, 20)
    internal_temp = np.random.randint(20, 50)
    parent_distance = np.random.randint(0, 100)
    child_alone = np.random.choice([0, 1])
    engine_off = np.random.choice([0, 1])

    risk = 0
    # Logic to determine if y (label) should be 1 or 0
    if temp_delta > 10: risk += 1
    if child_alone: risk += 1
    if engine_off: risk += 1
    if internal_temp > 40: risk += 1

    # KEY FIX: The list below MUST match the order and count in ml_engine.py
    X.append([temp_delta, internal_temp, parent_distance, child_alone, engine_off])
    y.append(1 if risk >= 2 else 0)

model = RandomForestClassifier()
model.fit(X, y)

# 2. Save to the specific directory
joblib.dump(model, MODEL_PATH)
print(f"Model trained and saved to: {MODEL_PATH}")