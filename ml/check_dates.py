import pandas as pd

# Load dataset
data = pd.read_csv("data/045_kisii_cleaned.csv")

# Convert time to datetime
data["time"] = pd.to_datetime(data["time"])

# Sort by date
data = data.sort_values("time").reset_index(drop=True)

# Calculate difference between consecutive dates
data["date_difference"] = data["time"].diff()

print("========== DATE RANGE ==========")
print("First date:", data["time"].min())
print("Last date:", data["time"].max())

print("\n========== DATE GAPS ==========")

gaps = data[data["date_difference"] > pd.Timedelta(days=1)]

print("Number of gaps greater than 1 day:", len(gaps))

print("\nFirst 20 gaps:")

print(
    gaps[
        ["time", "date_difference"]
    ].head(20).to_string(index=False)
)

print("\n========== OBSERVATIONS ==========")
print("Total observations:", len(data))