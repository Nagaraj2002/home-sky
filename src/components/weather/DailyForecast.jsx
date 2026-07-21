import { useMemo } from "react";
import { formatDay } from "../../utils/format.js";
import { getWeatherLabel } from "../../utils/weatherCodes.js";

export function DailyForecast({ forecast }) {
  const days = useMemo(() => {
    if (!forecast?.daily?.time) return [];
    return forecast.daily.time.map((time, index) => ({
      time,
      high: forecast.daily.temperature_2m_max[index],
      low: forecast.daily.temperature_2m_min[index],
      rain: forecast.daily.rain_sum[index],
      wind: forecast.daily.wind_speed_10m_max[index],
      weatherCode: forecast.daily.weather_code[index],
    }));
  }, [forecast]);

  if (days.length === 0) return null;

  return (
    <section className="panel forecast-panel" aria-labelledby="daily-title">
      <h2 id="daily-title">Seven-Day Forecast</h2>
      <div className="daily-list">
        {days.map((day) => (
          <article className="day-row" key={day.time}>
            <time>{formatDay(day.time)}</time>
            <span>{getWeatherLabel(day.weatherCode)}</span>
            <strong>{Math.round(day.high)}&deg; / {Math.round(day.low)}&deg;</strong>
            <small>{day.rain} mm rain</small>
            <small>{day.wind} km/h wind</small>
          </article>
        ))}
      </div>
    </section>
  );
}
