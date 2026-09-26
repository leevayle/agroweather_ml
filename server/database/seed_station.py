from datetime import datetime, timezone

from mongodb import stations_collection


station = {
    "station_id": "station_01",

    "name": "AgroWeather Station 01",

    "status": "offline",

    "location": {
        "name": "Kisii_01",
        "latitude": None,
        "longitude": None,
    },

    "mqtt_topic": (
        "agroweather/station/01/weather"
    ),

    "last_seen": None,

    "created_at": datetime.now(timezone.utc),
}


result = stations_collection.update_one(
    {
        "station_id": station["station_id"],
    },
    {
        "$setOnInsert": station,
    },
    upsert=True,
)


if result.upserted_id:

    print("Station created.")

else:

    print("Station already exists.")