import requests
import os
from dotenv import load_dotenv

# --------------------------------------------------
# ENV SETUP
# --------------------------------------------------
load_dotenv()
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

# --------------------------------------------------
# GEOLOCATION HELPERS
# --------------------------------------------------

def get_lat_lon_from_city(location_name: str):
    """
    Converts city/village name to latitude and longitude
    using OpenWeather Geocoding API
    """
    if not OPENWEATHER_API_KEY:
        raise ValueError("OPENWEATHER_API_KEY environment variable is not set")

    url = "https://api.openweathermap.org/geo/1.0/direct"
    params = {
        "q": location_name,
        "limit": 1,
        "appid": OPENWEATHER_API_KEY
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
    except Exception:
        return None, None

    if not data or "lat" not in data[0] or "lon" not in data[0]:
        return None, None

    return data[0]["lat"], data[0]["lon"]


def get_lat_lon_from_ip():
    """
    IP-based geolocation (fallback when GPS is unavailable)
    """
    try:
        response = requests.get("https://ipapi.co/json/", timeout=5)
        response.raise_for_status()
        data = response.json()
        return data.get("latitude"), data.get("longitude")
    except Exception:
        return None, None

# --------------------------------------------------
# WEATHER DATA
# --------------------------------------------------

def get_weather_data(lat: float, lon: float):
    """
    Fetches real-time atmospheric data from OpenWeather
    """
    if not OPENWEATHER_API_KEY:
        raise ValueError("OPENWEATHER_API_KEY environment variable is not set")

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "appid": OPENWEATHER_API_KEY
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()

    return {
        "temperature": data["main"]["temp"],
        "feels_like": data["main"]["feels_like"],
        "humidity": data["main"]["humidity"],
        "pressure": data["main"]["pressure"],
        "wind_speed": data["wind"].get("speed", 0),
        "wind_direction": data["wind"].get("deg"),
        "rain_1h": data.get("rain", {}).get("1h", 0),
        "cloud_cover": data.get("clouds", {}).get("all", 0),
        "weather_condition": data["weather"][0]["description"],
        "visibility": data.get("visibility")
    }

# --------------------------------------------------
# SOIL & AGRO DATA
# --------------------------------------------------

def get_soil_data(lat: float, lon: float):
    """
    Fetches soil and agro parameters from Open-Meteo
    """
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&hourly="
        "soil_moisture_0_1cm,"
        "soil_temperature_0cm,"
        "et0_fao_evapotranspiration"
    )

    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()

    hourly = data.get("hourly", {})
    return {
        "soil_moisture": hourly.get("soil_moisture_0_1cm", [None])[-1],
        "soil_temperature": hourly.get("soil_temperature_0cm", [None])[-1],
        "evapotranspiration": hourly.get("et0_fao_evapotranspiration", [0])[-1]
    }

# --------------------------------------------------
# MASTER FUNCTION (FINAL)
# --------------------------------------------------

def get_all_realtime_factors(
    lat: float = None,
    lon: float = None,
    location_name: str = None
):
    """
    Priority-based real-time data fetch:
    1. GPS latitude & longitude
    2. IP-based geolocation
    3. City-name geocoding (last fallback)
    """
    try:
        # ---------- PRIMARY: GPS ----------
        if lat is not None and lon is not None:
            resolved_lat, resolved_lon = lat, lon
            resolved_location = "GPS-based location"

        # ---------- FALLBACK: IP ----------
        else:
            resolved_lat, resolved_lon = get_lat_lon_from_ip()
            resolved_location = "IP-based location"

        # ---------- LAST FALLBACK: CITY ----------
        if (resolved_lat is None or resolved_lon is None) and location_name:
            resolved_lat, resolved_lon = get_lat_lon_from_city(location_name)
            resolved_location = location_name

        if resolved_lat is None or resolved_lon is None:
            return None

        weather = get_weather_data(resolved_lat, resolved_lon)
        soil = get_soil_data(resolved_lat, resolved_lon)

        return {
            "location": resolved_location,
            "latitude": resolved_lat,
            "longitude": resolved_lon,
            **weather,
            **soil
        }

    except Exception as e:
        print(f"[Weather Error] {e}")
        return None

# --------------------------------------------------
# TEST (OPTIONAL)
# --------------------------------------------------

if __name__ == "__main__":
    data = get_all_realtime_factors(location_name="Lucknow")
    if data:
        for k, v in data.items():
            print(f"{k}: {v}")
