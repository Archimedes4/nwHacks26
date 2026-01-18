from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

model = joblib.load("model/rf_1.pkl")

@app.get("/health")
def health():
    return jsonify(status="ok")

@app.post("/predict")
def predict():
    data = request.get_json(force=True)

    gender = 0 if data["gender"] == "Male" else 1
    age = data["age"]
    sleepDur = data["sleepDuration"]
    act = data["activityMinutes"]
    bmi = data["weightKg"] / ((data["heightCm"] / 100) ** 2)
    bmi_cat = 0
    if (bmi >= 30): 
        bmi_cat = 2
    elif (bmi >= 25):
        bmi_cat = 1
    
    restHR = 78 if data.get("restingHeartrate") == None else data.get("restingHeartrate")
    steps = 6000 if data.get("dailySteps") ==  None else data.get("dailySteps")
    stressLevel = 5 if data.get("stressLevel")  == None else data.get("stressLevel")
    sys, dia = 110, 60

    x = [gender, age, sleepDur, act, stressLevel, bmi_cat, restHR, steps, sys, dia]
    X = np.array(x, dtype=float)

    if hasattr(model, "predict"):
        preds = model.predict(X.reshape(1, -1))[0]
        return jsonify(predictions=np.asarray(preds).tolist())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)