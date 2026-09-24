from forecast_engine import forecast


print("=" * 70)
print("TESTING COMPLETE WEATHER FORECAST ENGINE")
print("=" * 70)


results = forecast(
    "2025-10-25",
    "2025-10-31"
)


for item in results:

    print()
    print(item["date"])

    print(
        "Temperature:",
        item["temperature"]
    )

    print(
        "Rainfall:",
        item["rainfall"]
    )

    print(
        "Wind speed:",
        item["wind_speed"]
    )

    print(
        "Pressure:",
        item["pressure_hpa"],
        "hPa"
    )


print()
print("=" * 70)
print("FORECAST ENGINE TEST COMPLETE")
print("=" * 70)