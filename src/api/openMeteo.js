const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const SEARCH_ALIASES = {
  bangalore: ["Bengaluru", "Bangalore India"],
  bengaluru: ["Bangalore", "Bengaluru India"],
  bailhongal: ["Bail Hongal", "Bailhongal Karnataka"],
};

function assertOk(response, fallbackMessage) {
  if (!response.ok) {
    throw new Error(fallbackMessage);
  }
}

export async function searchLocations(query) {
  const searches = [query, ...(SEARCH_ALIASES[query.toLowerCase()] || [])];
  const seen = new Set();
  const allResults = [];

  for (const search of searches) {
  const params = new URLSearchParams({
    name: search,
    count: "20",
    language: "en",
    format: "json",
  });

  const response = await fetch(`${GEOCODING_URL}?${params}`);
  assertOk(response, "Could not search for that place.");

  const data = await response.json();
    for (const location of data.results || []) {
      const key = `${location.id}-${location.latitude}-${location.longitude}`;
      if (!seen.has(key)) {
        seen.add(key);
        allResults.push(location);
      }
    }
  }

  return allResults.map((location) => ({
    id: location.id,
    name: location.name,
    admin1: location.admin1 || "",
    country: location.country || "",
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone,
  }));
}

export async function getForecast(home) {
  const currentFields = [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "dew_point_2m",
    "is_day",
    "precipitation",
    "rain",
    "showers",
    "snowfall",
    "cloud_cover",
    "cloud_cover_low",
    "cloud_cover_mid",
    "cloud_cover_high",
    "pressure_msl",
    "surface_pressure",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
    "weather_code",
  ].join(",");
  const hourlyFields = [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "dew_point_2m",
    "visibility",
    "precipitation_probability",
    "precipitation",
    "rain",
    "showers",
    "snowfall",
    "cloud_cover",
    "cloud_cover_low",
    "cloud_cover_mid",
    "cloud_cover_high",
    "pressure_msl",
    "surface_pressure",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
    "weather_code",
    "shortwave_radiation",
    "direct_radiation",
    "diffuse_radiation",
    "cape",
  ].join(",");
  const dailyFields = [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "precipitation_sum",
    "rain_sum",
    "wind_speed_10m_max",
    "sunrise",
    "sunset",
    "daylight_duration",
  ].join(",");
  const params = new URLSearchParams({
    latitude: String(home.latitude),
    longitude: String(home.longitude),
    timezone: home.timezone,
    forecast_days: "7",
    current: currentFields,
    hourly: hourlyFields,
    daily: dailyFields,
  });

  const response = await fetch(`${FORECAST_URL}?${params}`);
  assertOk(response, "Could not load the weather forecast.");

  const data = await response.json();
  return {
    current: data.current,
    currentUnits: data.current_units,
    hourly: data.hourly,
    hourlyUnits: data.hourly_units,
    daily: data.daily,
    dailyUnits: data.daily_units,
    timezone: data.timezone,
    fetchedAt: new Date().toISOString(),
  };
}
