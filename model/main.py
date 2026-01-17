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
    # TODO: Transform data
    x = data["x"]

    X = np.array([x], dtype=float) if isinstance(x[0], (int, float)) else np.array(x, dtype=float)

    if hasattr(model, "predict"):
        preds = model.predict(X)
        return jsonify(predictions=np.asarray(preds).tolist())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)