export const SEARCH_MIN_LENGTH = 2;
export const WEATHER_REFRESH_MS = 10 * 60 * 1000;
export const APP_ROUTES = new Set(["/sky", "/weather"]);

export const EMPTY_SKY_OVERRIDES = {
  daylightProgress: "",
  cloudTotal: "",
  cloudLow: "",
  cloudMiddle: "",
  cloudHigh: "",
  visibility: "",
  humidity: "",
  windDirection: "",
  windSpeed: "",
  windGusts: "",
  rain: "",
  showers: "",
  snowfall: "",
  weatherCode: "",
  cape: "",
};

export function getInitialRoute() {
  return APP_ROUTES.has(window.location.pathname) ? window.location.pathname : "/sky";
}
