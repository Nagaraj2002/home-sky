import { describeMoment } from "../../utils/format.js";
import { getWeatherLabel } from "../../utils/weatherCodes.js";

export function CurrentWeather({ forecast }) {
  const current = forecast?.current;
  if (!current) return null;

  return (
    <section className="panel current-panel" aria-labelledby="current-weather-title">
      <div>
        <p className="eyebrow">Live Weather Now</p>
        <h2 id="current-weather-title">{getWeatherLabel(current.weather_code)}</h2>
        <p className="moment-copy">{describeMoment(current)}</p>
      </div>
      <div className="temperature-row">
        <strong>{Math.round(current.temperature_2m)}&deg;C</strong>
        <span>Feels like {Math.round(current.apparent_temperature)}&deg;C</span>
      </div>
      <dl className="weather-grid">
        <div><dt>Humidity</dt><dd>{current.relative_humidity_2m}%</dd></div>
        <div><dt>Cloud cover</dt><dd>{current.cloud_cover}%</dd></div>
        <div><dt>Rain now</dt><dd>{current.rain} mm</dd></div>
        <div><dt>Precipitation</dt><dd>{current.precipitation} mm</dd></div>
        <div><dt>Wind now</dt><dd>{current.wind_speed_10m} km/h</dd></div>
      </dl>
    </section>
  );
}
