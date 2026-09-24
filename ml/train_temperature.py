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

data = data.sort_values("time").reset_index(drop=True)

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
# TEMPERATURE LAG FEATURES
# ============================================================

# Previous day
data["tavg_1d"] = data["tavg"].shift(1)
data["tmin_1d"] = data["tmin"].shift(1)
data["tmax_1d"] = data["tmax"].shift(1)

# Two days ago
data["tavg_2d"] = data["tavg"].shift(2)
data["tmin_2d"] = data["tmin"].shift(2)
data["tmax_2d"] = data["tmax"].shift(2)

# Three days ago
data["tavg_3d"] = data["tavg"].shift(3)
data["tmin_3d"] = data["tmin"].shift(3)
data["tmax_3d"] = data["tmax"].shift(3)

# Four days ago
data["tavg_4d"] = data["tavg"].shift(4)
data["tmin_4d"] = data["tmin"].shift(4)
data["tmax_4d"] = data["tmax"].shift(4)

# Seven days ago
data["tavg_7d"] = data["tavg"].shift(7)
data["tmin_7d"] = data["tmin"].shift(7)
data["tmax_7d"] = data["tmax"].shift(7)


# ============================================================
# NEXT-DAY TARGETS
# ============================================================

data["target_tavg"] = data["tavg"].shift(-1)
data["target_tmin"] = data["tmin"].shift(-1)
data["target_tmax"] = data["tmax"].shift(-1)


# ============================================================
# FEATURES
# ============================================================

features = [
    "tavg",
    "tmin",
    "tmax",

    "tavg_1d",
    "tmin_1d",
    "tmax_1d",

    "tavg_2d",
    "tmin_2d",
    "tmax_2d",

    "tavg_3d",
    "tmin_3d",
    "tmax_3d",

    "tavg_4d",
    "tmin_4d",
    "tmax_4d",

    "tavg_7d",
    "tmin_7d",
    "tmax_7d",

    "day_of_week",
    "month",
    "day_of_year"
]


# ============================================================
# REMOVE ROWS WITH MISSING VALUES
# ============================================================

data = data.dropna().reset_index(drop=True)

print("Rows after feature preparation:", len(data))


# ============================================================
# TIME-BASED TRAIN/TEST SPLIT
# ============================================================

split_index = int(len(data) * 0.80)

train_data = data.iloc[:split_index]
test_data = data.iloc[split_index:]

print()
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


# ============================================================
# MODEL TRAINING FUNCTION
# ============================================================

def train_temperature_model(
    target_column,
    model_filename,
    display_name
):

    print()
    print("=" * 70)
    print("TRAINING:", display_name)
    print("=" * 70)

    y_train = train_data[target_column]
    y_test = test_data[target_column]

    model = RandomForestRegressor(
        n_estimators=300,
        random_state=42,
        n_jobs=-1,
        min_samples_leaf=2
    )

    model.fit(X_train, y_train)

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

    model_path = os.path.join(
        MODEL_DIR,
        model_filename
    )

    joblib.dump(
        model,
        model_path
    )

    print("Model saved:", model_path)

    print(
        "MAE:",
        round(mae, 3),
        "°C"
    )

    print(
        "RMSE:",
        round(rmse, 3),
        "°C"
    )

    return model


# ============================================================
# TRAIN THREE SEPARATE MODELS
# ============================================================

avg_model = train_temperature_model(
    "target_tavg",
    "temperature_avg_model.pkl",
    "NEXT-DAY AVERAGE TEMPERATURE"
)

min_model = train_temperature_model(
    "target_tmin",
    "temperature_min_model.pkl",
    "NEXT-DAY MINIMUM TEMPERATURE"
)

max_model = train_temperature_model(
    "target_tmax",
    "temperature_max_model.pkl",
    "NEXT-DAY MAXIMUM TEMPERATURE"
)


# ============================================================
# FINISHED
# ============================================================

print()
print("=" * 70)
print("ALL TEMPERATURE MODELS TRAINED SUCCESSFULLY")
print("=" * 70)

print()
print("Models created:")

print("1.", os.path.join(
    MODEL_DIR,
    "temperature_avg_model.pkl"
))

print("2.", os.path.join(
    MODEL_DIR,
    "temperature_min_model.pkl"
))

print("3.", os.path.join(
    MODEL_DIR,
    "temperature_max_model.pkl"
))

print()
print("You can now run the forecasting engine.")