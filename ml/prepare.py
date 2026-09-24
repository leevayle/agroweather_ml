import pandas as pd

# Load the Kisii dataset
data = pd.read_csv("data/045_kisii_cleaned.csv")

# Convert dates
data["time"] = pd.to_datetime(data["time"])

# Sort chronologically
data = data.sort_values("time").reset_index(drop=True)

# Calculate the number of days until the next observation
data["next_date"] = data["time"].shift(-1)

data["days_to_next"] = (
    data["next_date"] - data["time"]
).dt.days

# Keep only observations where the next observation
# is exactly one calendar day later
consecutive = data[data["days_to_next"] == 1].copy()

print("========== ORIGINAL DATA ==========")
print("Total observations:", len(data))

print("\n========== CONSECUTIVE DAILY DATA ==========")
print("Consecutive daily observations:", len(consecutive))

print("\nRemoved observations:", len(data) - len(consecutive))

print("\n========== DATE RANGE ==========")
print("First:", consecutive["time"].min())
print("Last:", consecutive["time"].max())

# Show some examples
print("\n========== SAMPLE ==========")
print(
    consecutive[
        ["time", "tavg", "tmin", "tmax", "prcp", "wspd", "pres"]
    ].head(10)
)

# Save the result
consecutive.to_csv(
    "data/kisii_consecutive.csv",
    index=False
)

print("\nSaved as:")
print("data/kisii_consecutive.csv")