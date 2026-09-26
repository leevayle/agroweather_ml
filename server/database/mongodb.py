import os

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()


MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "agroweather")


if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not configured.")


client = MongoClient(
    MONGODB_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000,
    socketTimeoutMS=20000,
)


db = client[MONGODB_DATABASE]


users_collection = db["users"]
stations_collection = db["stations"]
weather_collection = db["weather_readings"]
forecasts_collection = db["forecasts"]
crops_collection = db["crops"]
user_crops_collection = db["user_crops"]
calendar_collection = db["calendar_tasks"]
notifications_collection = db["notifications"]


def test_connection():
    client.admin.command("ping")
    return True