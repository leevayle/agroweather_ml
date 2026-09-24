import os
import joblib
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    mean_absolute_error,
    mean_squared_error
)


# ============================================================
# CONFIGURATION
# ============================================================

DATA_PATH = "data/kisii_consecutive.csv"
MODEL_DIR = "models"

os.makedirs(MODEL_DIR, exist_ok=True)


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("LOADING KISII WEATHER DATA")
print("=" * 70)

data = pd.read_csv(DATA_PATH)

data["time"] = pd.to_datetime(data["time"])

data = (
    data
    .sort_values("time")
    .reset_index(drop=True)
)

print("Total observations:", len(data))

print(
    "First date:",
    data["time"].min().date()
)

print(
    "Last date:",
    data["time"].max().date()
)


# ============================================================
# CALENDAR FEATURES
# ============================================================

data["day_of_week"] = data["time"].dt.dayofweek
data["month"] = data["time"].dt.month
data["day_of_year"] = data["time"].dt.dayofyear


# ============================================================
# RAINFALL LAG FEATURES
# ============================================================

data["prcp_1d"] = data["prcp"].shift(1)
data["prcp_2d"] = data["prcp"].shift(2)
data["prcp_3d"] = data["prcp"].shift(3)
data["prcp_4d"] = data["prcp"].shift(4)
data["prcp_7d"] = data["prcp"].shift(7)


# ============================================================
# TEMPERATURE FEATURES
# ============================================================

data["tavg_1d"] = data["tavg"].shift(1)
data["tmin_1d"] = data["tmin"].shift(1)
data["tmax_1d"] = data["tmax"].shift(1)

data["tavg_2d"] = data["tavg"].shift(2)
data["tmin_2d"] = data["tmin"].shift(2)
data["tmax_2d"] = data["tmax"].shift(2)


# ============================================================
# WIND FEATURES
# ============================================================

data["wspd_1d"] = data["wspd"].shift(1)
data["wspd_2d"] = data["wspd"].shift(2)


# ============================================================
# PRESSURE FEATURES
# ============================================================

data["pres_1d"] = data["pres"].shift(1)
data["pres_2d"] = data["pres"].shift(2)


# ============================================================
# CREATE RAIN / NO-RAIN TARGET
# ============================================================

# We consider rainfall greater than 0 mm as rain.

data["target_rain"] = (
    data["prcp"].shift(-1) > 0
).astype(int)


# ============================================================
# CREATE RAINFALL AMOUNT TARGET
# ============================================================

data["target_prcp"] = data["prcp"].shift(-1)


# ============================================================
# FEATURES
# ============================================================

features = [

    # Current weather
    "tavg",
    "tmin",
    "tmax",
    "prcp",
    "wspd",
    "pres",

    # Rainfall history
    "prcp_1d",
    "prcp_2d",
    "prcp_3d",
    "prcp_4d",
    "prcp_7d",

    # Temperature history
    "tavg_1d",
    "tmin_1d",
    "tmax_1d",

    "tavg_2d",
    "tmin_2d",
    "tmax_2d",

    # Wind history
    "wspd_1d",
    "wspd_2d",

    # Pressure history
    "pres_1d",
    "pres_2d",

    # Calendar
    "day_of_week",
    "month",
    "day_of_year"
]


# ============================================================
# REMOVE MISSING VALUES
# ============================================================

data = data.dropna().reset_index(drop=True)

print()
print(
    "Rows after feature preparation:",
    len(data)
)


# ============================================================
# SHOW RAIN STATISTICS
# ============================================================

rain_days = (data["target_prcp"] > 0).sum()
dry_days = (data["target_prcp"] == 0).sum()

print()
print("=" * 70)
print("RAINFALL STATISTICS")
print("=" * 70)

print(
    "Rain days:",
    rain_days
)

print(
    "Dry days:",
    dry_days
)

print(
    "Rain percentage:",
    round(
        rain_days / len(data) * 100,
        2
    ),
    "%"
)

print(
    "Average rainfall:",
    round(
        data["target_prcp"].mean(),
        3
    ),
    "mm"
)

print(
    "Maximum rainfall:",
    round(
        data["target_prcp"].max(),
        2
    ),
    "mm"
)


# ============================================================
# TIME-BASED TRAIN / TEST SPLIT
# ============================================================

split_index = int(
    len(data) * 0.80
)

train_data = data.iloc[
    :split_index
]

test_data = data.iloc[
    split_index:
]

print()
print("=" * 70)
print("TRAIN / TEST SPLIT")
print("=" * 70)

print(
    "Training rows:",
    len(train_data)
)

print(
    "Testing rows:",
    len(test_data)
)

print(
    "Training period:",
    train_data["time"].min().date(),
    "to",
    train_data["time"].max().date()
)

print(
    "Testing period:",
    test_data["time"].min().date(),
    "to",
    test_data["time"].max().date()
)


X_train = train_data[features]
X_test = test_data[features]


# ============================================================
# RAIN / NO-RAIN CLASSIFIER
# ============================================================

print()
print("=" * 70)
print("TRAINING RAIN / NO-RAIN MODEL")
print("=" * 70)

y_rain_train = train_data["target_rain"]
y_rain_test = test_data["target_rain"]

rain_classifier = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    n_jobs=-1,
    min_samples_leaf=2,
    class_weight="balanced"
)

rain_classifier.fit(
    X_train,
    y_rain_train
)

rain_predictions = rain_classifier.predict(
    X_test
)


rain_accuracy = accuracy_score(
    y_rain_test,
    rain_predictions
)

rain_precision = precision_score(
    y_rain_test,
    rain_predictions,
    zero_division=0
)

rain_recall = recall_score(
    y_rain_test,
    rain_predictions,
    zero_division=0
)


print(
    "Accuracy:",
    round(rain_accuracy, 3)
)

print(
    "Precision:",
    round(rain_precision, 3)
)

print(
    "Recall:",
    round(rain_recall, 3)
)


# ============================================================
# RAINFALL AMOUNT MODEL
# ============================================================

print()
print("=" * 70)
print("TRAINING RAINFALL AMOUNT MODEL")
print("=" * 70)

y_amount_train = train_data["target_prcp"]
y_amount_test = test_data["target_prcp"]


rain_amount_model = RandomForestRegressor(
    n_estimators=300,
    random_state=42,
    n_jobs=-1,
    min_samples_leaf=2
)

rain_amount_model.fit(
    X_train,
    y_amount_train
)

amount_predictions = rain_amount_model.predict(
    X_test
)


amount_mae = mean_absolute_error(
    y_amount_test,
    amount_predictions
)

amount_rmse = np.sqrt(
    mean_squared_error(
        y_amount_test,
        amount_predictions
    )
)


print(
    "MAE:",
    round(amount_mae, 3),
    "mm"
)

print(
    "RMSE:",
    round(amount_rmse, 3),
    "mm"
)


# ============================================================
# SAVE MODELS
# ============================================================

classifier_path = os.path.join(
    MODEL_DIR,
    "rain_classifier.pkl"
)

amount_model_path = os.path.join(
    MODEL_DIR,
    "rainfall_amount_model.pkl"
)


joblib.dump(
    rain_classifier,
    classifier_path
)

joblib.dump(
    rain_amount_model,
    amount_model_path
)


print()
print("=" * 70)
print("RAINFALL MODELS SAVED")
print("=" * 70)

print(
    "1.",
    classifier_path
)

print(
    "2.",
    amount_model_path
)


# ============================================================
# FINISHED
# ============================================================

print()
print("=" * 70)
print("RAINFALL MODEL TRAINING COMPLETE")
print("=" * 70)