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
            print("MQTT is disabled: MQTT_BROKER_HOST is empty.")
            return False

        if not MQTT_USERNAME:
            raise RuntimeError("MQTT_USERNAME is not configured.")

        if not MQTT_PASSWORD:
            raise RuntimeError("MQTT_PASSWORD is not configured.")

        print(
            f"Connecting to MQTT broker "
            f"{MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}..."
        )

        self.client = mqtt.Client(
            mqtt.CallbackAPIVersion.VERSION2,
            client_id=MQTT_CLIENT_ID,
        )

        self.client.username_pw_set(
            MQTT_USERNAME,
            MQTT_PASSWORD,
        )

        self.client.tls_set(
            ca_certs=certifi.where(),
            tls_version=ssl.PROTOCOL_TLS_CLIENT,
        )

        self.client.reconnect_delay_set(
            min_delay=1,
            max_delay=60,
        )

        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message

        self.client.connect(
            MQTT_BROKER_HOST,
            MQTT_BROKER_PORT,
            keepalive=60,
        )

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
            print("MQTT connected successfully.")

            result, mid = client.subscribe(MQTT_TOPIC, qos=1)

            if result == mqtt.MQTT_ERR_SUCCESS:
                print(f"Subscribed to: {MQTT_TOPIC}")
            else:
                print(f"MQTT subscription failed: {result}")
        else:
            self.running = False
            print(f"MQTT connection failed. Reason code: {reason_code}")

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
        print(f"MQTT disconnected. Reason code: {reason_code}")

    # ========================================================
    # MESSAGE CALLBACK
    # ========================================================

    def on_message(
        self,
        client,
        userdata,
        message,
    ):
        try:
            payload = json.loads(message.payload.decode("utf-8"))

            if not isinstance(payload, dict):
                print("[MQTT] rejected: payload must be a JSON object")
                return

            weather = save_weather_reading(payload)

            print(
                f"[MQTT] {weather.get('station_id')} | "
                f"{weather.get('temperature_c')}°C | "
                f"{weather.get('humidity_percent')}% | "
                f"{weather.get('wind_speed_kmh')} km/h | "
                f"{weather.get('rain_status')}"
            )

        except json.JSONDecodeError:
            print("[MQTT] rejected: invalid JSON")

        except Exception as exc:
            print(f"[MQTT] error: {exc}")

    # ========================================================
    # DISCONNECT
    # ========================================================

    def disconnect(self):
        self.running = False

        if self.client is not None:
            self.client.loop_stop()
            self.client.disconnect()
            print("MQTT subscriber stopped.")