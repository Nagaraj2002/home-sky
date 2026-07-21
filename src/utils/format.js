import { getWeatherLabel } from "./weatherCodes.js";

export function formatPlace(location) {
  return [location.name, location.admin1, location.country].filter(Boolean).join(", ");
}

export function formatHour(value) {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(
    new Date(value),
  );
}

export function formatDay(value) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export function formatUpdated(value, timezone) {
  if (!value || !timezone) return "";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

export function describeMoment(current) {
  if (!current) return "Weather for this moment is loading.";

  const details = [];
  if (current.rain > 0 || current.precipitation > 0) details.push("it is raining now");
  if (current.cloud_cover >= 75) details.push("the sky is mostly cloudy");
  else if (current.cloud_cover >= 35) details.push("there are some clouds");
  if (current.wind_speed_10m >= 30) details.push("it feels windy");
  else if (current.wind_speed_10m >= 18) details.push("there is a noticeable breeze");

  return `Right now, ${
    details.length ? details.join(", ") : getWeatherLabel(current.weather_code).toLowerCase()
  }.`;
}
