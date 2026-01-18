import os
import sys
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

from sklearn.multioutput import MultiOutputClassifier, MultiOutputRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, ExtraTreesClassifier
from sklearn.model_selection import RandomizedSearchCV, GridSearchCV
from sklearn.metrics import accuracy_score

from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier

import joblib

# make the directories
if not os.path.exists("input"):
    os.makedirs("input")
if not os.path.exists("model"):
    os.makedirs("model")
if not os.path.exists("output"):
    os.makedirs("output")

dataset_df = pd.read_csv("input/train.csv")

dataset_df = dataset_df.sample(frac=1, random_state=42).reset_index(drop=True)

# Split into training set and test set (last 30 entries)
df = dataset_df.iloc[:-30].reset_index(drop=True)
test_df = dataset_df.iloc[-30:].reset_index(drop=True)

gender_dict = {
    "Male": 0,
    "Female": 1
}

bmi_dict = {
    "Normal": 0,
    "Normal Weight": 0,
    "Overweight": 1,
    "Obese": 2
}

disorder_dict = {
    "None": 0,
    "Insomnia": 1000,
    "Sleep Apnea": 2000,
}

def preprocess(df, is_train=True):
    df[["Systolic", "Diastolic"]] = df["Blood Pressure"].str.split("/", expand=True)
    df = df.drop(["Person ID", "Occupation", "Blood Pressure"], axis=1)
    df[["Systolic", "Diastolic"]] = df[["Systolic", "Diastolic"]].astype(int)

    # map categorical to numeric
    df["Gender"] = df["Gender"].map(gender_dict)
    df["BMI Category"] = df["BMI Category"].map(bmi_dict)
    df["Sleep Disorder"] = df["Sleep Disorder"].fillna("None")
    df["Sleep Disorder"] = df["Sleep Disorder"].map(disorder_dict)

    # proceess nans
    # numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    # all_cols = df.columns.tolist()
    # non_numeric_cols = [c for c in all_cols if c not in numeric_cols]

    # df[numeric_cols] = df[numeric_cols].fillna(0)
    # df[non_numeric_cols] = df[non_numeric_cols].fillna("Unknown")

    labels = ["Quality of Sleep", "Sleep Disorder"] # "Sleep Disorder"
    # df = df.drop(["Sleep Disorder"], axis=1)
    
    if not is_train:
        return df, None

    return df, labels

df, labels = preprocess(df)

# train/validation single split, not k-fold
def split_dataset(dataset, test_ratio=0.20, seed=42):
    np.random.seed(seed)
    test_indices = np.random.rand(len(dataset)) < test_ratio
    return dataset[~test_indices].reset_index(drop=True), dataset[test_indices].reset_index(drop=True)

train_ds_pd, valid_ds_pd = split_dataset(df, test_ratio=0.1)
print("{} examples in training, {} examples in testing.".format(
    len(train_ds_pd), len(valid_ds_pd))
)

# features and labels
y_train = train_ds_pd[labels]
y_valid = valid_ds_pd[labels]

X_train_raw = train_ds_pd.drop(columns=labels)
X_valid_raw = valid_ds_pd.drop(columns=labels)

X_full = pd.concat([X_train_raw, X_valid_raw], axis=0)

# One hot encoding
# cat_cols = [c for c in X_full.columns if X_full[c].dtype == "object"]
# print("Categorical columns:", cat_cols)
# X_full = pd.get_dummies(X_full, columns=cat_cols, dummy_na=False)

# split back after encoding
X_train = X_full.iloc[:len(X_train_raw)].reset_index(drop=True)
X_valid = X_full.iloc[len(X_train_raw):].reset_index(drop=True)

print("Encoded train shape:", X_train.shape)
print("Encoded valid shape:", X_valid.shape)

# model versions
VERSION = "rf_2"
LOAD_FROM_DISK = False # if set to true, will load pretrained model so you don't have to retrain
MODEL_PATH = f"model/{VERSION}.pkl" # otherwise will train a model and save (and overwrite) to path

if LOAD_FROM_DISK and os.path.exists(MODEL_PATH):
    print("Loading model from disk...")
    model = joblib.load(MODEL_PATH)
else:
    print("Training a new model...")

    base_rf = RandomForestRegressor(
        n_estimators=300,
        n_jobs=-1,
        oob_score=True,
        random_state=42,
        bootstrap=True,
    )

    base_rf = MultiOutputRegressor(base_rf, n_jobs=-1)

    # for random forests

    # param_dist = {
    #     "max_depth": [30, 35, 40],
    #     "n_estimators": [300, 450, 600],
    #     "max_features": ["sqrt", 0.3]
    # }

    param_dist = {
        "estimator__max_depth": range(5, 25, 5),
        "estimator__n_estimators": range(50, 350, 50),
        "estimator__max_features": ["sqrt", 0.3]
    }

    search = GridSearchCV(
        base_rf,
        param_grid=param_dist,
        scoring="neg_root_mean_squared_error",
        cv = 4,
        verbose=1,
        n_jobs=-1
    )

    search.fit(
        X_train,
        y_train
    )

    print("Best params:", search.best_params_)
    print("Best CV accuracy:", search.best_score_)

    model = search.best_estimator_

    if hasattr(model, "oob_score_"):
        print("Final RandomForest OOB score:", model.oob_score_)

    # Save
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

# only predict if we have a validation set
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

if len(X_valid) > 0:
    y_true = y_valid.values.ravel().astype(float)
    y_pred = model.predict(X_valid).ravel().astype(float)

    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)

    print(f"Val MAE:  {mae:.4f}")
    print(f"Val RMSE: {rmse:.4f}")
    print(f"Val R^2:  {r2:.4f}")

if hasattr(model, "oob_score_"):
    print("Final OOB score:", model.oob_score_)

print(model.get_params())

if hasattr(model, "feature_importances_"):
    importances = model.feature_importances_
    feature_names = X_train.columns

    feat_imp = sorted(
        zip(feature_names, importances),
        key=lambda x: x[1],
        reverse=True
    )

    # Visualize importances
    top_k = 5

    print(f"Top {top_k} feature importances:")
    for name, score in feat_imp[:top_k]:
        print(f"{name}: {score:.4f}")

    plt.figure(figsize=(8, 6))
    names = [x[0] for x in feat_imp[:top_k]]
    scores = [x[1] for x in feat_imp[:top_k]]
    plt.barh(names[::-1], scores[::-1])
    plt.title("Top feature importances")
    plt.tight_layout()
    plt.show()

test_df_features, _ = preprocess(test_df, is_train=False)

# cat_cols_test = [c for c in test_df_features.columns if test_df_features[c].dtype == "object"]
# test_encoded = pd.get_dummies(test_df_features, columns=cat_cols_test, dummy_na=False)

# Align columns with training data
test_encoded = test_df_features.reindex(columns=X_train.columns, fill_value=0)
test_true = test_df_features.reindex(columns=labels, fill_value=0)
# Predict
test_preds = model.predict(test_encoded)

mae = mean_absolute_error(test_true, test_preds)
rmse = np.sqrt(mean_squared_error(test_true, test_preds))
r2 = r2_score(test_true, test_preds)

print(f"Test MAE:  {mae:.4f}")
print(f"Test RMSE: {rmse:.4f}")
print(f"Test R^2:  {r2:.4f}")

# print(type(test_true))

for idx, row in test_preds.iterrows():
    # if (row["Sleep Disorder"] != )
    print(idx, row["Quality of Sleep"], row["Sleep Disorder"])

# for i in range(1, len(test_true)):
#     if (test_true[i][1] != round(test_preds[i][1] / 1000)):
#         print(test_true[1], test_preds[1])