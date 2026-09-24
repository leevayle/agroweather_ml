import pandas as pd

# Load the Kisii dataset
data = pd.read_csv("data/045_kisii_cleaned.csv")

print("========== DATASET INFO ==========")

print("\nNumber of rows:", len(data))
print("Number of columns:", len(data.columns))

print("\nColumns:")
print(data.columns.tolist())

print("\n========== FIRST 10 ROWS ==========")
print(data.head(10))

print("\n========== DATA TYPES ==========")
print(data.dtypes)

print("\n========== MISSING VALUES ==========")
print(data.isnull().sum())

print("\n========== DUPLICATES ==========")
print("Duplicate rows:", data.duplicated().sum())

print("\n========== BASIC STATISTICS ==========")
print(data.describe())