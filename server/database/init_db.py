from mongodb import (
    client,
    db,
    users_collection,
    stations_collection,
    weather_collection,
    forecasts_collection,
    crops_collection,
    user_crops_collection,
    calendar_collection,
    notifications_collection,
)


def create_indexes():

    print("Creating indexes...")


    # -------------------------
    # USERS
    # -------------------------

    users_collection.create_index(
        "email",
        unique=True,
        name="unique_user_email",
    )


    # -------------------------
    # STATIONS
    # -------------------------

    stations_collection.create_index(
        "station_id",
        unique=True,
        name="unique_station_id",
    )


    # -------------------------
    # WEATHER
    # -------------------------

    weather_collection.create_index(
        [
            ("station_id", 1),
            ("timestamp", -1),
        ],
        name="station_weather_time",
    )


    # -------------------------
    # FORECASTS
    # -------------------------

    forecasts_collection.create_index(
        [
            ("station_id", 1),
            ("forecast_date", 1),
        ],
        name="station_forecast_date",
    )


    forecasts_collection.create_index(
        "generated_at",
        name="forecast_generated_at",
    )


    # -------------------------
    # CROPS
    # -------------------------

    crops_collection.create_index(
        "name",
        unique=True,
        name="unique_crop_name",
    )


    # -------------------------
    # USER CROPS
    # -------------------------

    user_crops_collection.create_index(
        [
            ("user_id", 1),
            ("status", 1),
        ],
        name="user_crop_status",
    )


    # -------------------------
    # CALENDAR
    # -------------------------

    calendar_collection.create_index(
        [
            ("user_id", 1),
            ("date", 1),
        ],
        name="user_calendar_date",
    )


    # -------------------------
    # NOTIFICATIONS
    # -------------------------

    notifications_collection.create_index(
        [
            ("user_id", 1),
            ("created_at", -1),
        ],
        name="user_notifications",
    )


    notifications_collection.create_index(
        [
            ("user_id", 1),
            ("read", 1),
        ],
        name="user_notification_read",
    )


def main():

    try:

        client.admin.command("ping")

        print("MongoDB connection OK.")

        create_indexes()

        print("Indexes created successfully.")
        print()
        print("Database:", db.name)

    except Exception as error:

        print("Database initialization failed.")
        print(error)

    finally:

        client.close()


if __name__ == "__main__":
    main()