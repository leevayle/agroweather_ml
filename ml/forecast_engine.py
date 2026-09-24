import os
import joblib
import pandas as pd


# ============================================================
# PATHS
# ============================================================

DATA_PATH = "data/kisii_consecutive.csv"
MODEL_DIR = "models"


# ============================================================
# LOAD MODELS
# ============================================================

temperature_avg_model = joblib.load(
    os.path.join(
        MODEL_DIR,
        "temperature_avg_model.pkl"
    )
)

temperature_min_model = joblib.load(
    os.path.join(
        MODEL_DIR,
        "temperature_min_model.pkl"
    )
)

temperature_max_model = joblib.load(
    os.path.join(
        MODEL_DIR,
        "temperature_max_model.pkl"
    )
)

rain_classifier = joblib.load(
    os.path.join(
        MODEL_DIR,
        "rain_classifier.pkl"
    )
)

rain_amount_model = joblib.load(
    os.path.join(
        MODEL_DIR,
        "rainfall_amount_model.pkl"
    )
)

wind_model = joblib.load(
    os.path.join(
        MODEL_DIR,
        "wind_speed_model.pkl"
    )
)

pressure_model = joblib.load(
    os.path.join(
        MODEL_DIR,
        "pressure_model.pkl"
    )
)


# ============================================================
# LOAD HISTORICAL DATA
# ============================================================

data = pd.read_csv(DATA_PATH)

data["time"] = pd.to_datetime(
    data["time"]
)

data = (
    data
    .sort_values("time")
    .reset_index(drop=True)
)


# ============================================================
# TEMPERATURE FEATURES
# ============================================================

def temperature_features(history, date):

    return pd.DataFrame([{

        "tavg": history.iloc[-1]["tavg"],
        "tmin": history.iloc[-1]["tmin"],
        "tmax": history.iloc[-1]["tmax"],

        "tavg_1d": history.iloc[-1]["tavg"],
        "tmin_1d": history.iloc[-1]["tmin"],
        "tmax_1d": history.iloc[-1]["tmax"],

        "tavg_2d": history.iloc[-2]["tavg"],
        "tmin_2d": history.iloc[-2]["tmin"],
        "tmax_2d": history.iloc[-2]["tmax"],

        "tavg_3d": history.iloc[-3]["tavg"],
        "tmin_3d": history.iloc[-3]["tmin"],
        "tmax_3d": history.iloc[-3]["tmax"],

        "tavg_4d": history.iloc[-4]["tavg"],
        "tmin_4d": history.iloc[-4]["tmin"],
        "tmax_4d": history.iloc[-4]["tmax"],

        "tavg_7d": history.iloc[-7]["tavg"],
        "tmin_7d": history.iloc[-7]["tmin"],
        "tmax_7d": history.iloc[-7]["tmax"],

        "day_of_week": date.dayofweek,
        "month": date.month,
        "day_of_year": date.dayofyear
    }])


# ============================================================
# RAIN FEATURES
# ============================================================

def rain_features(history, date):

    return pd.DataFrame([{

        "tavg": history.iloc[-1]["tavg"],
        "tmin": history.iloc[-1]["tmin"],
        "tmax": history.iloc[-1]["tmax"],
        "prcp": history.iloc[-1]["prcp"],
        "wspd": history.iloc[-1]["wspd"],
        "pres": history.iloc[-1]["pres"],

        "prcp_1d": history.iloc[-1]["prcp"],
        "prcp_2d": history.iloc[-2]["prcp"],
        "prcp_3d": history.iloc[-3]["prcp"],
        "prcp_4d": history.iloc[-4]["prcp"],
        "prcp_7d": history.iloc[-7]["prcp"],

        "tavg_1d": history.iloc[-1]["tavg"],
        "tmin_1d": history.iloc[-1]["tmin"],
        "tmax_1d": history.iloc[-1]["tmax"],

        "tavg_2d": history.iloc[-2]["tavg"],
        "tmin_2d": history.iloc[-2]["tmin"],
        "tmax_2d": history.iloc[-2]["tmax"],

        "wspd_1d": history.iloc[-1]["wspd"],
        "wspd_2d": history.iloc[-2]["wspd"],

        "pres_1d": history.iloc[-1]["pres"],
        "pres_2d": history.iloc[-2]["pres"],

        "day_of_week": date.dayofweek,
        "month": date.month,
        "day_of_year": date.dayofyear
    }])


# ============================================================
# WIND FEATURES
# ============================================================

def wind_features(history, date):

    return pd.DataFrame([{

        "tavg": history.iloc[-1]["tavg"],
        "tmin": history.iloc[-1]["tmin"],
        "tmax": history.iloc[-1]["tmax"],
        "prcp": history.iloc[-1]["prcp"],
        "wspd": history.iloc[-1]["wspd"],
        "pres": history.iloc[-1]["pres"],

        "wspd_1d": history.iloc[-1]["wspd"],
        "wspd_2d": history.iloc[-2]["wspd"],
        "wspd_3d": history.iloc[-3]["wspd"],
        "wspd_4d": history.iloc[-4]["wspd"],
        "wspd_7d": history.iloc[-7]["wspd"],

        "tavg_1d": history.iloc[-1]["tavg"],
        "tmin_1d": history.iloc[-1]["tmin"],
        "tmax_1d": history.iloc[-1]["tmax"],

        "tavg_2d": history.iloc[-2]["tavg"],
        "tmin_2d": history.iloc[-2]["tmin"],
        "tmax_2d": history.iloc[-2]["tmax"],

        "prcp_1d": history.iloc[-1]["prcp"],
        "prcp_2d": history.iloc[-2]["prcp"],
        "prcp_3d": history.iloc[-3]["prcp"],

        "pres_1d": history.iloc[-1]["pres"],
        "pres_2d": history.iloc[-2]["pres"],

        "day_of_week": date.dayofweek,
        "month": date.month,
        "day_of_year": date.dayofyear
    }])


# ============================================================
# PRESSURE FEATURES
# ============================================================

def pressure_features(history, date):

    return pd.DataFrame([{

        "tavg": history.iloc[-1]["tavg"],
        "tmin": history.iloc[-1]["tmin"],
        "tmax": history.iloc[-1]["tmax"],
        "prcp": history.iloc[-1]["prcp"],
        "wspd": history.iloc[-1]["wspd"],
        "pres": history.iloc[-1]["pres"],

        "pres_1d": history.iloc[-1]["pres"],
        "pres_2d": history.iloc[-2]["pres"],
        "pres_3d": history.iloc[-3]["pres"],
        "pres_4d": history.iloc[-4]["pres"],
        "pres_7d": history.iloc[-7]["pres"],

        "tavg_1d": history.iloc[-1]["tavg"],
        "tmin_1d": history.iloc[-1]["tmin"],
        "tmax_1d": history.iloc[-1]["tmax"],

        "tavg_2d": history.iloc[-2]["tavg"],
        "tmin_2d": history.iloc[-2]["tmin"],
        "tmax_2d": history.iloc[-2]["tmax"],

        "prcp_1d": history.iloc[-1]["prcp"],
        "prcp_2d": history.iloc[-2]["prcp"],
        "prcp_3d": history.iloc[-3]["prcp"],

        "wspd_1d": history.iloc[-1]["wspd"],
        "wspd_2d": history.iloc[-2]["wspd"],
        "wspd_3d": history.iloc[-3]["wspd"],

        "day_of_week": date.dayofweek,
        "month": date.month,
        "day_of_year": date.dayofyear
    }])


# ============================================================
# MAIN FORECAST
# ============================================================

def forecast(start_date, end_date):

    start_date = pd.Timestamp(start_date)
    end_date = pd.Timestamp(end_date)

    if end_date < start_date:
        raise ValueError(
            "end_date must be on or after start_date"
        )

    history = data.copy()

    latest_date = history["time"].iloc[-1]

    future_dates = pd.date_range(
        start=latest_date + pd.Timedelta(days=1),
        end=end_date,
        freq="D"
    )

    results = []

    for date in future_dates:

        # ----------------------------------------------------
        # TEMPERATURE
        # ----------------------------------------------------

        temp_X = temperature_features(
            history,
            date
        )

        avg_temp = temperature_avg_model.predict(
            temp_X
        )[0]

        min_temp = temperature_min_model.predict(
            temp_X
        )[0]

        max_temp = temperature_max_model.predict(
            temp_X
        )[0]

        min_temp = min(
            min_temp,
            avg_temp
        )

        max_temp = max(
            max_temp,
            avg_temp
        )


        # ----------------------------------------------------
        # RAINFALL
        # ----------------------------------------------------

        rain_X = rain_features(
            history,
            date
        )

        rain_prediction = rain_classifier.predict(
            rain_X
        )[0]

        rain_probability = rain_classifier.predict_proba(
            rain_X
        )[0][1]

        rain_amount = rain_amount_model.predict(
            rain_X
        )[0]

        if rain_prediction == 0:

            rain_amount = 0.0

        else:

            rain_amount = max(
                0.0,
                rain_amount
            )


        # ----------------------------------------------------
        # WIND
        # ----------------------------------------------------

        wind_X = wind_features(
            history,
            date
        )

        wind_speed = wind_model.predict(
            wind_X
        )[0]

        wind_speed = max(
            0.0,
            wind_speed
        )


        # ----------------------------------------------------
        # PRESSURE
        # ----------------------------------------------------

        pressure_X = pressure_features(
            history,
            date
        )

        pressure = pressure_model.predict(
            pressure_X
        )[0]


        # ----------------------------------------------------
        # RESULT
        # ----------------------------------------------------

        result = {
            "date": date.strftime("%Y-%m-%d"),

            "temperature": {
                "avg_c": round(float(avg_temp), 2),
                "min_c": round(float(min_temp), 2),
                "max_c": round(float(max_temp), 2)
            },

            "rainfall": {
                "rain": bool(rain_prediction),
                "probability": round(
                    float(rain_probability),
                    3
                ),
                "amount_mm": round(
                    float(rain_amount),
                    2
                )
            },

            "wind_speed": round(
                float(wind_speed),
                2
            ),

            "pressure_hpa": round(
                float(pressure),
                2
            )
        }


        # ----------------------------------------------------
        # ONLY RETURN REQUESTED DATES
        # ----------------------------------------------------

        if date >= start_date:

            results.append(result)


        # ----------------------------------------------------
        # ADD PREDICTIONS TO HISTORY
        #
        # These become the inputs for the next day.
        # ----------------------------------------------------

        new_row = pd.DataFrame([{

            "time": date,

            "tavg": avg_temp,
            "tmin": min_temp,
            "tmax": max_temp,

            "prcp": rain_amount,

            "wspd": wind_speed,

            "pres": pressure
        }])

        history = pd.concat(
            [
                history,
                new_row
            ],
            ignore_index=True
        )


    return results