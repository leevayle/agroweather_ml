import json
import ssl

import certifi
import paho.mqtt.client as mqtt

from server.config import (
    MQTT_BROKER_HOST,
    MQTT_BROKER_PORT,
    MQTT_CLIENT_ID,
    MQTT_PASSWORD,
    MQTT_TOPIC,
    MQTT_USERNAME,
)

from server.services.weather_service import (
    save_weather_reading,
)


class MQTTSubscriber:

    def __init__(self):

        self.client = None

        self.running = False


    # ========================================================
    # CONNECT
    # ========================================================

    def connect(self):

        if not MQTT_BROKER_HOST:

            print(
                "MQTT is disabled: "
                "MQTT_BROKER_HOST is empty."
            )

            return False


        if not MQTT_USERNAME:

            raise RuntimeError(
                "MQTT_USERNAME is not configured."
            )


        if not MQTT_PASSWORD:

            raise RuntimeError(
                "MQTT_PASSWORD is not configured."
            )


        print(
            f"Connecting to MQTT broker "
            f"{MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}..."
        )


        # ----------------------------------------------------
        # Create MQTT client
        # ----------------------------------------------------

        self.client = mqtt.Client(
            mqtt.CallbackAPIVersion.VERSION2,
            client_id=MQTT_CLIENT_ID,
        )


        # ----------------------------------------------------
        # Authentication
        # ----------------------------------------------------

        self.client.username_pw_set(
            MQTT_USERNAME,
            MQTT_PASSWORD,
        )


        # ----------------------------------------------------
        # TLS
        # ----------------------------------------------------

        self.client.tls_set(
            ca_certs=certifi.where(),
            tls_version=ssl.PROTOCOL_TLS_CLIENT,
        )


        # ----------------------------------------------------
        # Reconnect behaviour
        # ----------------------------------------------------

        self.client.reconnect_delay_set(
            min_delay=1,
            max_delay=60,
        )


        # ----------------------------------------------------
        # Callbacks
        # ----------------------------------------------------

        self.client.on_connect = (
            self.on_connect
        )

        self.client.on_disconnect = (
            self.on_disconnect
        )

        self.client.on_message = (
            self.on_message
        )


        # ----------------------------------------------------
        # Connect
        # ----------------------------------------------------

        self.client.connect(
            MQTT_BROKER_HOST,
            MQTT_BROKER_PORT,
            keepalive=60,
        )


        # ----------------------------------------------------
        # Start MQTT network loop
        # ----------------------------------------------------

        self.client.loop_start()


        return True


    # ========================================================
    # CONNECT CALLBACK
    # ========================================================

    def on_connect(
        self,
        client,
        userdata,
        flags,
        reason_code,
        properties,
    ):

        if reason_code == 0:

            self.running = True

            print(
                "MQTT connected successfully."
            )


            result, mid = client.subscribe(
                MQTT_TOPIC,
                qos=1,
            )


            if result == mqtt.MQTT_ERR_SUCCESS:

                print(
                    f"Subscribed to: {MQTT_TOPIC}"
                )

            else:

                print(
                    "MQTT subscription failed: "
                    f"{result}"
                )


        else:

            self.running = False

            print(
                "MQTT connection failed."
            )

            print(
                f"Reason code: {reason_code}"
            )


    # ========================================================
    # DISCONNECT CALLBACK
    # ========================================================

    def on_disconnect(
        self,
        client,
        userdata,
        disconnect_flags,
        reason_code,
        properties,
    ):

        self.running = False

        print(
            "MQTT disconnected."
        )

        print(
            f"Reason code: {reason_code}"
        )


    # ========================================================
    # MESSAGE CALLBACK
    # ========================================================

    def on_message(
        self,
        client,
        userdata,
        message,
    ):

        print()

        print(
            "MQTT message received:"
        )

        print(
            f"Topic: {message.topic}"
        )


        try:

            # ------------------------------------------------
            # Decode MQTT payload
            # ------------------------------------------------

            payload_text = (
                message.payload.decode(
                    "utf-8"
                )
            )


            print(
                f"Payload: {payload_text}"
            )


            # ------------------------------------------------
            # Parse JSON
            # ------------------------------------------------

            payload = json.loads(
                payload_text
            )


            if not isinstance(
                payload,
                dict,
            ):

                print(
                    "Rejected MQTT message: "
                    "payload must be a JSON object."
                )

                return


            # ------------------------------------------------
            # Save weather reading
            # ------------------------------------------------

            weather = (
                save_weather_reading(
                    payload
                )
            )


            print(
                "Weather reading saved successfully."
            )


            print(
                f"Station: "
                f"{weather['station_id']}"
            )


            print(
                f"Temperature: "
                f"{weather['temperature_c']} °C"
            )


            print(
                f"Humidity: "
                f"{weather['humidity_percent']} %"
            )


            print(
                f"Wind: "
                f"{weather['wind_speed_kmh']} km/h"
            )


            print(
                f"Rain: "
                f"{weather['rain_status']}"
            )


        except json.JSONDecodeError:

            print(
                "Rejected MQTT message: "
                "invalid JSON."
            )


        except Exception as exc:

            print(
                "Error processing MQTT message:"
            )

            print(exc)


    # ========================================================
    # DISCONNECT
    # ========================================================

    def disconnect(self):

        self.running = False


        if self.client is not None:

            self.client.loop_stop()

            self.client.disconnect()

            print(
                "MQTT subscriber stopped."
            )