import certifi

from pymongo import MongoClient

from server.config import (
    MONGODB_DATABASE,
    MONGODB_URI,
    validate_required_configuration,
)


# ============================================================
# CONFIGURATION VALIDATION
# ============================================================

validate_required_configuration()


# ============================================================
# MONGODB CLIENT
# ============================================================

client = MongoClient(
    MONGODB_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000,
    socketTimeoutMS=20000,
)


# ============================================================
# DATABASE
# ============================================================

db = client[MONGODB_DATABASE]


# ============================================================
# COLLECTIONS
# ============================================================

users_collection = db["users"]

stations_collection = db["stations"]

weather_collection = db["weather_readings"]

forecasts_collection = db["forecasts"]

crops_collection = db["crops"]

user_crops_collection = db["user_crops"]

calendar_collection = db["calendar_tasks"]

notifications_collection = db["notifications"]


# ============================================================
# CONNECTION TEST
# ============================================================

def test_connection():
    """
    Test the MongoDB connection.

    Returns the MongoDB ping response if successful.
    Raises an exception if MongoDB cannot be reached.
    """

    return client.admin.command("ping")