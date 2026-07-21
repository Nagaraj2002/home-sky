import { formatPlace } from "../../utils/format.js";
import { CurrentWeather } from "./CurrentWeather.jsx";
import { DailyForecast } from "./DailyForecast.jsx";
import { HourlyForecast } from "./HourlyForecast.jsx";

export function WeatherView({ location, localTime, forecast, isLoading, error }) {
  if (!location) {
    return (
      <section className="panel empty-main">
        <p className="eyebrow">Home Sky</p>
        <h1>Add your first location</h1>
        <p className="lede">Saved places will appear in the sidebar for quick switching.</p>
      </section>
    );
  }

  return (
    <div className="weather-view">
      <header className="location-hero">
        <p className="eyebrow">{location.label || "Location"}</p>
        <h1>{formatPlace(location)}</h1>
        <p className="local-time">{localTime}</p>
      </header>
      {isLoading ? <section className="panel status-panel">Loading the sky data...</section> : null}
      {error ? <section className="panel status-panel error-panel">{error}</section> : null}
      {!isLoading && !error && forecast ? (
        <>
          <CurrentWeather forecast={forecast} />
          <HourlyForecast forecast={forecast} />
          <DailyForecast forecast={forecast} />
        </>
      ) : null}
    </div>
  );
}
