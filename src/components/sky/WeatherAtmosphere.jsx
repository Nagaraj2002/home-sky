import { weatherLayerStyle } from "./skyLayerStyles.js";

export function WeatherAtmosphere({ weatherVisualState }) {
  return (
    <div className="weather-layer" style={weatherLayerStyle(weatherVisualState)} aria-hidden="true">
      <div className="storm-shadow" />
      <div className="lightning-flash" />
      <div className="fog-bank fog-bank-back" />
      <div className="rain-field" />
      <div className="snow-field" />
      <div className="fog-bank fog-bank-front" />
    </div>
  );
}
