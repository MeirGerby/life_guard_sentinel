import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

# fake training data
X = []
y = []

for _ in range(5000):
    temp_delta = np.random.randint(0, 20)
    child_alone = np.random.choice([0, 1])
    engine_off = np.random.choice([0, 1])

    risk = 0

    if temp_delta > 10:
        risk += 1
    if child_alone:
        risk += 1
    if engine_off:
        risk += 1

    X.append([temp_delta, child_alone, engine_off])
    y.append(1 if risk >= 2 else 0)

model = RandomForestClassifier()
model.fit(X, y)

joblib.dump(model, "risk_model.pkl")