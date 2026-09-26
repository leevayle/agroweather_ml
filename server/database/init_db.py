from pymongo import ASCENDING, DESCENDING

from server.database.mongodb import (
    calendar_collection,
    crops_collection,
    forecasts_collection,
    notifications_collection,
    stations_collection,
    user_crops_collection,
    users_collection,
    weather_collection,
)


# ============================================================
# HELPER
# ============================================================

def create_index_if_missing(
    collection,
    keys,
    name,
    unique=False,
):
    """
    Create an index only if an equivalent index does not
    already exist.

    This makes database initialization safe to run multiple
    times.
    """

    existing_indexes = list(collection.list_indexes())

    for index in existing_indexes:
        existing_keys = list(index["key"].items())

        if existing_keys == keys:
            existing_name = index["name"]

            print(
                f"Index already exists on "
                f"{collection.name}: "
                f"{existing_name}"
            )

            return existing_name

    collection.create_index(
        keys,
        unique=unique,
        name=name,
    )

    print(
        f"Created index on "
        f"{collection.name}: {name}"
    )

    return name


# ============================================================
# INDEX CREATION
# ============================================================

def create_indexes():

    print("Creating MongoDB indexes...")


    # --------------------------------------------------------
    # USERS
    # --------------------------------------------------------

    create_index_if_missing(
        users_collection,
        [("email", ASCENDING)],
        "unique_user_email",
        unique=True,
    )


    # --------------------------------------------------------
    # STATIONS
    # --------------------------------------------------------

    create_index_if_missing(
        stations_collection,
        [("station_id", ASCENDING)],
        "unique_station_id",
        unique=True,
    )


    # --------------------------------------------------------
    # WEATHER READINGS
    # --------------------------------------------------------

    create_index_if_missing(
        weather_collection,
        [
            ("station_id", ASCENDING),
            ("timestamp", DESCENDING),
        ],
        "station_timestamp_desc",
    )


    # --------------------------------------------------------
    # FORECASTS
    # --------------------------------------------------------

    create_index_if_missing(
        forecasts_collection,
        [
            ("station_id", ASCENDING),
            ("forecast_date", ASCENDING),
        ],
        "station_forecast_date",
    )

    create_index_if_missing(
        forecasts_collection,
        [
            ("station_id", ASCENDING),
            ("generated_at", DESCENDING),
        ],
        "station_generated_at_desc",
    )


    # --------------------------------------------------------
    # CROPS
    # --------------------------------------------------------

    create_index_if_missing(
        crops_collection,
        [("name", ASCENDING)],
        "unique_crop_name",
        unique=True,
    )


    # --------------------------------------------------------
    # USER CROPS
    # --------------------------------------------------------

    create_index_if_missing(
        user_crops_collection,
        [
            ("user_id", ASCENDING),
            ("status", ASCENDING),
        ],
        "user_status",
    )


    # --------------------------------------------------------
    # CALENDAR TASKS
    # --------------------------------------------------------

    create_index_if_missing(
        calendar_collection,
        [
            ("user_id", ASCENDING),
            ("date", ASCENDING),
        ],
        "user_calendar_date",
    )


    # --------------------------------------------------------
    # NOTIFICATIONS
    # --------------------------------------------------------

    create_index_if_missing(
        notifications_collection,
        [
            ("user_id", ASCENDING),
            ("created_at", DESCENDING),
        ],
        "user_notifications_date",
    )

    create_index_if_missing(
        notifications_collection,
        [
            ("user_id", ASCENDING),
            ("read", ASCENDING),
        ],
        "user_notifications_read",
    )


    print()
    print("MongoDB indexes are ready.")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    create_indexes()