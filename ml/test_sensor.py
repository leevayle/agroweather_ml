import requests

url = "http://127.0.0.1:8000/sensor"

data = {
    "temperature_c": 21.7,
    "humidity_percent": 78.4,
    "day_night": "day",
    "rainfall_mm": 2.3,
    "rain_status": "raining",
    "wind_speed_kmh": 9.8,
    "wind_direction": "NE",
    "pressure_hpa": 1014.8
}

response = requests.post(
    url,
    json=data,
    timeout=5
)

print("Status:", response.status_code)
print("Response:")
print(response.json())