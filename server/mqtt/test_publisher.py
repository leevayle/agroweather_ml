import json
import ssl
import sys
import time

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


# ============================================================
# TEST WEATHER PAYLOAD
# ============================================================

PAYLOAD = {
    "station_id": "station_01",

    "temperature_c": 21.7,
    "humidity_percent": 78,

    "day_night": "day",

    "rain_sensor": 3840,
    "rain_status": "dry",
    "rainfall_mm": None,

    "wind_speed_kmh": 8.42,
    "wind_direction_deg": None,

    "pressure_hpa": None,

    "ldr_value": 1200,
}


# ============================================================
# VALIDATE CONFIGURATION
# ============================================================

if not MQTT_BROKER_HOST:
    print("ERROR: MQTT_BROKER_HOST is not configured.")
    print("Add your MQTT broker host to the root .env file.")
    sys.exit(1)

if not MQTT_USERNAME:
    print("ERROR: MQTT_USERNAME is not configured.")
    print("Add your MQTT username to the root .env file.")
    sys.exit(1)

if not MQTT_PASSWORD:
    print("ERROR: MQTT_PASSWORD is not configured.")
    print("Add your MQTT password to the root .env file.")
    sys.exit(1)


# ============================================================
# MQTT CLIENT
# ============================================================

client_id = f"{MQTT_CLIENT_ID}-publisher"

client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id=client_id,
)

client.username_pw_set(
    MQTT_USERNAME,
    MQTT_PASSWORD,
)

client.tls_set(
    ca_certs=certifi.where(),
    tls_version=ssl.PROTOCOL_TLS_CLIENT,
)


# ============================================================
# CALLBACKS
# ============================================================

publish_complete = False
connection_failed = False


def on_connect(client, userdata, flags, reason_code, properties):
    global connection_failed

    print()
    print("========================================")
    print("MQTT TEST PUBLISHER")
    print("========================================")
    print(f"Broker : {MQTT_BROKER_HOST}")
    print(f"Port   : {MQTT_BROKER_PORT}")
    print(f"Topic  : {MQTT_TOPIC}")
    print()

    if reason_code != 0:
        connection_failed = True

        print("MQTT CONNECTION FAILED")
        print(f"Reason code: {reason_code}")
        print()

        client.disconnect()
        return

    print("MQTT connection successful.")
    print()

    payload_json = json.dumps(PAYLOAD)

    print("Publishing test weather payload:")
    print(payload_json)
    print()

    result = client.publish(
        MQTT_TOPIC,
        payload_json,
        qos=1,
        retain=False,
    )

    if result.rc != mqtt.MQTT_ERR_SUCCESS:
        print("MQTT PUBLISH FAILED.")
        print(f"Error code: {result.rc}")
        client.disconnect()
        return

    print("Message accepted by MQTT client.")
    print("Waiting for broker confirmation...")

    try:
        result.wait_for_publish(timeout=10)
    except Exception as exc:
        print(f"Publish confirmation error: {exc}")
        client.disconnect()
        return

    if result.is_published():
        print()
        print("========================================")
        print("MESSAGE PUBLISHED SUCCESSFULLY")
        print("========================================")
        print(f"Topic: {MQTT_TOPIC}")
        print()
    else:
        print()
        print("MESSAGE WAS NOT CONFIRMED.")
        print()

    client.disconnect()


def on_disconnect(client, userdata, disconnect_flags, reason_code, properties):
    print("MQTT client disconnected.")


# ============================================================
# REGISTER CALLBACKS
# ============================================================

client.on_connect = on_connect
client.on_disconnect = on_disconnect


# ============================================================
# CONNECT
# ============================================================

print()
print("Connecting to MQTT broker...")
print(f"Host: {MQTT_BROKER_HOST}")
print(f"Port: {MQTT_BROKER_PORT}")
print()

try:
    client.connect(
        MQTT_BROKER_HOST,
        MQTT_BROKER_PORT,
        keepalive=60,
    )

except Exception as exc:
    print()
    print("========================================")
    print("MQTT CONNECTION ERROR")
    print("========================================")
    print(exc)
    print()
    sys.exit(1)


# ============================================================
# RUN MQTT LOOP
# ============================================================

try:
    client.loop_forever()

except KeyboardInterrupt:
    print()
    print("Test publisher stopped by user.")

finally:
    try:
        client.disconnect()
    except Exception:
        pass