import { useEffect, useState } from "react";
import skyPhoto from "../../assets/phase-1a-sky.png";
import { formatPlace } from "../../utils/format.js";
import { getWeatherLabel } from "../../utils/weatherCodes.js";
import { CloudLayers } from "./CloudLayers.jsx";
import { WeatherAtmosphere } from "./WeatherAtmosphere.jsx";

export function SkyView({
  location,
  localTime,
  forecast,
  skyState,
  skyVisualState,
  cloudVisualState,
  weatherVisualState,
  isLoading,
  error,
}) {
  const [skyElement, setSkyElement] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(false);
  const current = forecast?.current;

  useEffect(() => {
    function handleFullscreenChange() {
      const skyIsFullscreen = document.fullscreenElement === skyElement;
      setIsFullscreen(skyIsFullscreen);
      setShowFullscreenControls(skyIsFullscreen);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [skyElement]);

  useEffect(() => {
    if (!showFullscreenControls) return;

    const hideTimer = window.setTimeout(() => {
      setShowFullscreenControls(false);
    }, 2600);

    return () => window.clearTimeout(hideTimer);
  }, [showFullscreenControls]);

  async function enterFullscreen() {
    if (skyElement?.requestFullscreen) await skyElement.requestFullscreen();
  }

  async function exitFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
  }

  if (!location) {
    return (
      <section className="panel empty-main">
        <p className="eyebrow">Sky View</p>
        <h1>Add your first location</h1>
        <p className="lede">Choose a saved place first, then Home Sky can open its sky.</p>
      </section>
    );
  }

  return (
    <section className="sky-view" aria-label="Sky view">
      <div
        className="sky-stage"
        ref={setSkyElement}
        style={{
          "--sky-background": skyVisualState?.background,
          "--sky-photo-opacity": skyVisualState?.photoOpacity,
          "--sky-night-opacity": skyVisualState?.overlayOpacity,
          "--sky-warmth-opacity": skyVisualState?.warmthOpacity,
          "--sun-x": skyVisualState?.sun.x,
          "--sun-y": skyVisualState?.sun.y,
          "--sun-size": skyVisualState?.sun.size,
          "--sun-opacity": skyVisualState?.sun.opacity,
        }}
        onMouseMove={() => isFullscreen && setShowFullscreenControls(true)}
        onClick={() => isFullscreen && setShowFullscreenControls(true)}
      >
        <img className="sky-photo" src={skyPhoto} alt="" aria-hidden="true" />
        <div className="sky-gradient" aria-hidden="true" />
        <div className="sky-sun" aria-hidden="true" />
        <CloudLayers cloudVisualState={cloudVisualState} />
        <WeatherAtmosphere weatherVisualState={weatherVisualState} />
        <div className="sky-vignette" aria-hidden="true" />
        <div className="sky-content">
          <p className="eyebrow">Sky</p>
          <h1>{location.label || location.name}</h1>
          <p>{formatPlace(location)}</p>
          <p className="sky-time">{localTime}</p>
          {isLoading ? <span className="sky-chip">Loading sky data...</span> : null}
          {error ? <span className="sky-chip error">{error}</span> : null}
          {!isLoading && !error && current ? (
            <span className="sky-chip">
              {Math.round(current.temperature_2m)}&deg;C - {getWeatherLabel(current.weather_code)}
            </span>
          ) : null}
          {skyState ? (
            <span className="sky-chip subtle">
              {skyState.labActive ? "Lab override active" : "Sky data ready"} - {skyVisualState?.phase ?? "sky"}
              {cloudVisualState ? ` - ${Math.round(skyState.clouds.total ?? 0)}% clouds` : ""}
            </span>
          ) : null}
        </div>
        <div className={showFullscreenControls || !isFullscreen ? "sky-actions visible" : "sky-actions"}>
          {isFullscreen ? (
            <>
              <span>Press Esc to exit</span>
              <button type="button" onClick={exitFullscreen}>Exit Fullscreen</button>
            </>
          ) : (
            <button type="button" onClick={enterFullscreen}>Enter Fullscreen Sky</button>
          )}
        </div>
      </div>
    </section>
  );
}
