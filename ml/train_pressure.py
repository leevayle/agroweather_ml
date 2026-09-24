import os
import joblib
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error


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
print("First date:", data["time"].min().date())
print("Last date:", data["time"].max().date())


# ============================================================
# CALENDAR FEATURES
# ============================================================

data["day_of_week"] = data["time"].dt.dayofweek
data["month"] = data["time"].dt.month
data["day_of_year"] = data["time"].dt.dayofyear


# ============================================================
# PRESSURE HISTORY
# ============================================================

data["pres_1d"] = data["pres"].shift(1)
data["pres_2d"] = data["pres"].shift(2)
data["pres_3d"] = data["pres"].shift(3)
data["pres_4d"] = data["pres"].shift(4)
data["pres_7d"] = data["pres"].shift(7)


# ============================================================
# TEMPERATURE HISTORY
# ============================================================

data["tavg_1d"] = data["tavg"].shift(1)
data["tmin_1d"] = data["tmin"].shift(1)
data["tmax_1d"] = data["tmax"].shift(1)

data["tavg_2d"] = data["tavg"].shift(2)
data["tmin_2d"] = data["tmin"].shift(2)
data["tmax_2d"] = data["tmax"].shift(2)


# ============================================================
# RAINFALL HISTORY
# ============================================================

data["prcp_1d"] = data["prcp"].shift(1)
data["prcp_2d"] = data["prcp"].shift(2)
data["prcp_3d"] = data["prcp"].shift(3)


# ============================================================
# WIND HISTORY
# ============================================================

data["wspd_1d"] = data["wspd"].shift(1)
data["wspd_2d"] = data["wspd"].shift(2)
data["wspd_3d"] = data["wspd"].shift(3)


# ============================================================
# NEXT-DAY TARGET
# ============================================================

data["target_pres"] = data["pres"].shift(-1)


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

    # Pressure history
    "pres_1d",
    "pres_2d",
    "pres_3d",
    "pres_4d",
    "pres_7d",

    # Temperature history
    "tavg_1d",
    "tmin_1d",
    "tmax_1d",

    "tavg_2d",
    "tmin_2d",
    "tmax_2d",

    # Rainfall history
    "prcp_1d",
    "prcp_2d",
    "prcp_3d",

    # Wind history
    "wspd_1d",
    "wspd_2d",
    "wspd_3d",

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
print("Rows after feature preparation:", len(data))


# ============================================================
# PRESSURE STATISTICS
# ============================================================

print()
print("=" * 70)
print("PRESSURE STATISTICS")
print("=" * 70)

print(
    "Average pressure:",
    round(data["pres"].mean(), 2),
    "hPa"
)

print(
    "Minimum pressure:",
    round(data["pres"].min(), 2),
    "hPa"
)

print(
    "Maximum pressure:",
    round(data["pres"].max(), 2),
    "hPa"
)


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

split_index = int(len(data) * 0.80)

train_data = data.iloc[:split_index]
test_data = data.iloc[split_index:]

print()
print("=" * 70)
print("TRAIN / TEST SPLIT")
print("=" * 70)

print("Training rows:", len(train_data))
print("Testing rows:", len(test_data))

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

y_train = train_data["target_pres"]
y_test = test_data["target_pres"]


# ============================================================
# TRAIN MODEL
# ============================================================

print()
print("=" * 70)
print("TRAINING NEXT-DAY PRESSURE MODEL")
print("=" * 70)

model = RandomForestRegressor(
    n_estimators=300,
    random_state=42,
    n_jobs=-1,
    min_samples_leaf=2
)

model.fit(X_train, y_train)


# ============================================================
# EVALUATE
# ============================================================

predictions = model.predict(X_test)

mae = mean_absolute_error(
    y_test,
    predictions
)

rmse = np.sqrt(
    mean_squared_error(
        y_test,
        predictions
    )
)

print(
    "MAE:",
    round(mae, 3),
    "hPa"
)

print(
    "RMSE:",
    round(rmse, 3),
    "hPa"
)


# ============================================================
# SAVE MODEL
# ============================================================

model_path = os.path.join(
    MODEL_DIR,
    "pressure_model.pkl"
)

joblib.dump(
    model,
    model_path
)

print()
print("=" * 70)
print("PRESSURE MODEL SAVED")
print("=" * 70)

print("Model:", model_path)


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

print()
print("=" * 70)
print("TOP PRESSURE FEATURES")
print("=" * 70)

importance = pd.DataFrame({
    "feature": features,
    "importance": model.feature_importances_
})

importance = (
    importance
    .sort_values(
        "importance",
        ascending=False
    )
)

for _, row in importance.head(10).iterrows():

    print(
        f"{row['feature']:<20}"
        f"{row['importance']:.4f}"
    )


print()
print("=" * 70)
print("PRESSURE MODEL TRAINING COMPLETE")
print("=" * 70)