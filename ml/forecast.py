import os
import joblib
import pandas as pd


# ============================================================
# CONFIGURATION
# ============================================================

DATA_PATH = "data/kisii_consecutive.csv"
MODEL_DIR = "models"


# ============================================================
# LOAD MODELS
# ============================================================

avg_model = joblib.load(
    os.path.join(MODEL_DIR, "temperature_avg_model.pkl")
)

min_model = joblib.load(
    os.path.join(MODEL_DIR, "temperature_min_model.pkl")
)

max_model = joblib.load(
    os.path.join(MODEL_DIR, "temperature_max_model.pkl")
)


# ============================================================
# LOAD DATA
# ============================================================

data = pd.read_csv(DATA_PATH)

data["time"] = pd.to_datetime(data["time"])

data = (
    data
    .sort_values("time")
    .reset_index(drop=True)
)


# ============================================================
# CREATE MODEL FEATURES
# ============================================================

def create_features(history, forecast_date):

    if len(history) < 7:
        raise ValueError(
            "At least 7 observations are required."
        )

    forecast_date = pd.Timestamp(forecast_date)

    features = {

        # Latest observation
        "tavg": history.iloc[-1]["tavg"],
        "tmin": history.iloc[-1]["tmin"],
        "tmax": history.iloc[-1]["tmax"],

        # 1 day ago
        "tavg_1d": history.iloc[-1]["tavg"],
        "tmin_1d": history.iloc[-1]["tmin"],
        "tmax_1d": history.iloc[-1]["tmax"],

        # 2 days ago
        "tavg_2d": history.iloc[-2]["tavg"],
        "tmin_2d": history.iloc[-2]["tmin"],
        "tmax_2d": history.iloc[-2]["tmax"],

        # 3 days ago
        "tavg_3d": history.iloc[-3]["tavg"],
        "tmin_3d": history.iloc[-3]["tmin"],
        "tmax_3d": history.iloc[-3]["tmax"],

        # 4 days ago
        "tavg_4d": history.iloc[-4]["tavg"],
        "tmin_4d": history.iloc[-4]["tmin"],
        "tmax_4d": history.iloc[-4]["tmax"],

        # 7 days ago
        "tavg_7d": history.iloc[-7]["tavg"],
        "tmin_7d": history.iloc[-7]["tmin"],
        "tmax_7d": history.iloc[-7]["tmax"],

        # Calendar features
        "day_of_week": forecast_date.dayofweek,
        "month": forecast_date.month,
        "day_of_year": forecast_date.dayofyear
    }

    return pd.DataFrame([features])


# ============================================================
# MAIN FORECAST FUNCTION
# ============================================================

def forecast_temperature(start_date, end_date):

    start_date = pd.Timestamp(start_date)
    end_date = pd.Timestamp(end_date)

    if end_date < start_date:
        raise ValueError(
            "End date cannot be before start date."
        )

    history = data.copy()

    latest_date = history["time"].iloc[-1]

    # --------------------------------------------------------
    # We recursively forecast every day from the end of the
    # historical dataset until the requested end date.
    # --------------------------------------------------------

    all_future_dates = pd.date_range(
        start=latest_date + pd.Timedelta(days=1),
        end=end_date,
        freq="D"
    )

    results = []

    for forecast_date in all_future_dates:

        # ----------------------------------------------------
        # Build features
        # ----------------------------------------------------

        X = create_features(
            history,
            forecast_date
        )

        # ----------------------------------------------------
        # Predict average temperature
        # ----------------------------------------------------

        predicted_avg = avg_model.predict(X)[0]

        # ----------------------------------------------------
        # Predict minimum temperature
        # ----------------------------------------------------

        predicted_min = min_model.predict(X)[0]

        # ----------------------------------------------------
        # Predict maximum temperature
        # ----------------------------------------------------

        predicted_max = max_model.predict(X)[0]

        # ----------------------------------------------------
        # Basic consistency protection
        # ----------------------------------------------------

        predicted_min = min(
            predicted_min,
            predicted_avg
        )

        predicted_max = max(
            predicted_max,
            predicted_avg
        )

        # ----------------------------------------------------
        # Add result if within requested period
        # ----------------------------------------------------

        if forecast_date >= start_date:

            results.append({
                "date": forecast_date.strftime("%Y-%m-%d"),

                "avg_temperature": round(
                    float(predicted_avg),
                    2
                ),

                "min_temperature": round(
                    float(predicted_min),
                    2
                ),

                "max_temperature": round(
                    float(predicted_max),
                    2
                )
            })

        # ----------------------------------------------------
        # Add predicted day to history
        #
        # This allows the next day's prediction to use
        # today's prediction as an input.
        # ----------------------------------------------------

        new_row = pd.DataFrame([{
            "time": forecast_date,
            "tavg": predicted_avg,
            "tmin": predicted_min,
            "tmax": predicted_max
        }])

        history = pd.concat(
            [
                history,
                new_row
            ],
            ignore_index=True
        )

    return results