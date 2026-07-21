import { useMemo } from "react";
import { formatHour } from "../../utils/format.js";
import { getWeatherLabel } from "../../utils/weatherCodes.js";

export function HourlyForecast({ forecast }) {
  const hours = useMemo(() => {
    if (!forecast?.hourly?.time) return [];
    const now = new Date();
    const startIndex = forecast.hourly.time.findIndex((time) => new Date(time) >= now);
    const safeStart = startIndex >= 0 ? startIndex : 0;

    return forecast.hourly.time.slice(safeStart, safeStart + 12).map((time, index) => {
      const dataIndex = safeStart + index;
      return {
        time,
        temperature: forecast.hourly.temperature_2m[dataIndex],
        rainChance: forecast.hourly.precipitation_probability[dataIndex],
        weatherCode: forecast.hourly.weather_code[dataIndex],
      };
    });
  }, [forecast]);

  if (hours.length === 0) return null;

  return (
    <section className="panel forecast-panel" aria-labelledby="hourly-title">
      <h2 id="hourly-title">Hourly Forecast</h2>
      <div className="hourly-list">
        {hours.map((hour) => (
          <article className="hour-card" key={hour.time}>
            <time>{formatHour(hour.time)}</time>
            <strong>{Math.round(hour.temperature)}&deg;C</strong>
            <span>{getWeatherLabel(hour.weatherCode)}</span>
            <small>{hour.rainChance}% rain</small>
          </article>
        ))}
      </div>
    </section>
  );
}
