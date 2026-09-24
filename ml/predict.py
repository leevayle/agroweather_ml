from forecast import forecast_temperature


# ============================================================
# HELPER: PRINT FORECAST
# ============================================================

def print_forecast(results):

    print()
    print("=" * 75)
    print("TEMPERATURE FORECAST")
    print("=" * 75)

    for item in results:

        print(
            f"{item['date']} | "
            f"AVG: {item['avg_temperature']}°C | "
            f"MIN: {item['min_temperature']}°C | "
            f"MAX: {item['max_temperature']}°C"
        )

    print("=" * 75)


# ============================================================
# EXAMPLE 1 — NEXT 4 DAYS
# ============================================================

print()
print("NEXT 4 DAYS")

results = forecast_temperature(
    "2025-10-25",
    "2025-10-28"
)

print_forecast(results)


# ============================================================
# EXAMPLE 2 — NEXT 7 DAYS
# ============================================================

print()
print("NEXT 7 DAYS")

results = forecast_temperature(
    "2025-10-25",
    "2025-10-31"
)

print_forecast(results)


# ============================================================
# EXAMPLE 3 — SPECIFIC FUTURE DATE
# ============================================================

print()
print("SPECIFIC DATE")

results = forecast_temperature(
    "2025-11-15",
    "2025-11-15"
)

print_forecast(results)


# ============================================================
# EXAMPLE 4 — DATE RANGE
# ============================================================

print()
print("DATE RANGE")

results = forecast_temperature(
    "2025-11-01",
    "2025-11-07"
)

print_forecast(results)