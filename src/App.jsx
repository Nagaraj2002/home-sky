import { useEffect, useMemo, useState } from "react";
import {
  clearToken,
  getGoogleConfig,
  getMe,
  logIn,
  logInWithGoogleCredential,
  saveUserLocations,
  signUp,
} from "./api/backend.js";
import { getForecast, searchLocations } from "./api/openMeteo.js";
import { useLocalTime } from "./hooks/useLocalTime.js";
import { normalizeLocation } from "./utils/storage.js";
import { getWeatherLabel } from "./utils/weatherCodes.js";

const SEARCH_MIN_LENGTH = 2;
const WEATHER_REFRESH_MS = 10 * 60 * 1000;

function formatPlace(location) {
  return [location.name, location.admin1, location.country].filter(Boolean).join(", ");
}

function formatHour(value) {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(
    new Date(value),
  );
}

function formatDay(value) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatUpdated(value, timezone) {
  if (!value || !timezone) return "";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

function describeMoment(current) {
  if (!current) return "Weather for this moment is loading.";
  const details = [];
  if (current.rain > 0 || current.precipitation > 0) details.push("it is raining now");
  if (current.cloud_cover >= 75) details.push("the sky is mostly cloudy");
  else if (current.cloud_cover >= 35) details.push("there are some clouds");
  if (current.wind_speed_10m >= 30) details.push("it feels windy");
  else if (current.wind_speed_10m >= 18) details.push("there is a noticeable breeze");
  return `Right now, ${details.length ? details.join(", ") : getWeatherLabel(current.weather_code).toLowerCase()}.`;
}

function AuthView({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [googleConfig, setGoogleConfig] = useState({ enabled: false, clientId: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadGoogleConfig() {
      try {
        const config = await getGoogleConfig();
        setGoogleConfig(config);
      } catch {
        setGoogleConfig({ enabled: false, clientId: "" });
      }
    }

    loadGoogleConfig();
  }, []);

  useEffect(() => {
    if (!googleConfig.enabled || !window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleConfig.clientId,
      callback: async (response) => {
        try {
          setError("");
          const user = await logInWithGoogleCredential(response.credential);
          onAuthed(user);
        } catch (googleError) {
          setError(googleError.message);
        }
      },
    });

    window.google.accounts.id.renderButton(document.getElementById("google-login-button"), {
      theme: "outline",
      size: "large",
      width: 320,
    });
  }, [googleConfig, onAuthed]);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setError("");
      const user =
        mode === "signup"
          ? await signUp(form)
          : await logIn({ email: form.email, password: form.password });
      onAuthed(user);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="panel auth-panel">
        <p className="eyebrow">Home Sky</p>
        <h1>{mode === "signup" ? "Create your sky account" : "Welcome back"}</h1>
        <p className="lede">Sign in first so your saved places stay available after refresh or a new tab.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </label>
          ) : null}
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              minLength="6"
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : mode === "signup" ? "Sign Up" : "Log In"}
          </button>
        </form>
        <div className="auth-divider">or</div>
        {googleConfig.enabled ? (
          <div id="google-login-button" className="google-login-button" />
        ) : (
          <button className="google-placeholder" type="button" disabled>
            Google login needs a Client ID
          </button>
        )}
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setError("");
            setMode(mode === "signup" ? "login" : "signup");
          }}
        >
          {mode === "signup" ? "Already have an account? Log in" : "New here? Create account"}
        </button>
      </section>
    </main>
  );
}

function Sidebar({
  isOpen,
  savedLocations,
  activeLocation,
  defaultLocationId,
  forecast,
  user,
  onAdd,
  onSelect,
  onClose,
  onLogout,
}) {
  return (
    <aside className={isOpen ? "sidebar open" : "sidebar"}>
      <div className="side-header">
        <button className="brand-button" type="button" onClick={onAdd}>
          <span>Home Sky</span>
          <small>{user.name}</small>
        </button>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Collapse sidebar">
          x
        </button>
      </div>

      <nav className="side-section" aria-label="Saved locations">
        <p className="side-title">Saved Locations</p>
        <button className="add-button" type="button" onClick={onAdd}>
          Add Location
        </button>
        <div className="location-nav">
          {savedLocations.length === 0 ? (
            <p className="empty-side">No saved places yet.</p>
          ) : (
            savedLocations.map((location) => (
              <button
                className={activeLocation?.savedId === location.savedId ? "nav-location active" : "nav-location"}
                type="button"
                key={location.savedId}
                onClick={() => onSelect(location)}
              >
                <span>{location.label || location.name}</span>
                <small>
                  {location.savedId === defaultLocationId ? "Default - " : ""}
                  {formatPlace(location)}
                </small>
              </button>
            ))
          )}
        </div>
      </nav>

      <div className="side-meta">
        <span>{forecast ? `Updated ${formatUpdated(forecast.fetchedAt, activeLocation?.timezone)}` : "No weather loaded"}</span>
        <span>Data source: Open-Meteo</span>
        <button className="text-button left" type="button" onClick={onLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}

function LocationSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (trimmedQuery.length < SEARCH_MIN_LENGTH) {
      setResults([]);
      setError("");
      setIsSearching(false);
      return;
    }

    let isActive = true;
    const searchTimer = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        setError("");
        const matches = await searchLocations(trimmedQuery);
        if (isActive) setResults(matches);
      } catch (searchError) {
        if (isActive) {
          setError(searchError.message);
          setResults([]);
        }
      } finally {
        if (isActive) setIsSearching(false);
      }
    }, 350);

    return () => {
      isActive = false;
      window.clearTimeout(searchTimer);
    };
  }, [trimmedQuery]);

  return (
    <div className="search-block">
      <label className="search-label" htmlFor="location-search">
        Search city or town
      </label>
      <input
        id="location-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Try Bengaluru, Bangalore, Bailhongal..."
        autoComplete="off"
      />
      <div className="search-state" aria-live="polite">
        {isSearching && "Searching Open-Meteo..."}
        {!isSearching && trimmedQuery.length > 0 && trimmedQuery.length < SEARCH_MIN_LENGTH
          ? "Type at least 2 characters."
          : ""}
        {!isSearching && error}
        {!isSearching && !error && trimmedQuery.length >= SEARCH_MIN_LENGTH && results.length === 0
          ? "No matching places. Try the official or nearby district name."
          : ""}
      </div>
      {results.length > 0 ? (
        <ul className="result-list">
          {results.map((location) => (
            <li key={`${location.id}-${location.latitude}-${location.longitude}`}>
              <button type="button" onClick={() => onSelect(location)}>
                <span>{location.name}</span>
                <small>{[location.admin1, location.country].filter(Boolean).join(", ")}</small>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function AddLocationView({ selectedLocation, onPreview, onSave }) {
  const [label, setLabel] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    setLabel("");
    setIsDefault(false);
  }, [selectedLocation?.savedId]);

  return (
    <section className="panel add-view" aria-labelledby="add-title">
      <p className="eyebrow">Add Location</p>
      <h1 id="add-title">Add a place you care about</h1>
      <p className="lede">
        Search a city, select the correct result, give it a name, and choose whether it should open by default.
      </p>
      <LocationSearch onSelect={onPreview} />

      {selectedLocation ? (
        <div className="selected-location">
          <div>
            <p className="eyebrow">Selected</p>
            <h2>{formatPlace(selectedLocation)}</h2>
          </div>
          <div className="form-grid">
            <label>
              Location name
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Home, School, Office..."
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(event) => setIsDefault(event.target.checked)}
              />
              Set as default location
            </label>
            <button type="button" onClick={() => onSave(selectedLocation, label || "Home", isDefault)}>
              Save Location
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CurrentWeather({ forecast }) {
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

function HourlyForecast({ forecast }) {
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

function DailyForecast({ forecast }) {
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

function WeatherView({ location, localTime, forecast, isLoading, error }) {
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

export default function App() {
  const [user, setUser] = useState(null);
  const [isBooting, setIsBooting] = useState(true);
  const [savedLocations, setSavedLocations] = useState([]);
  const [defaultLocationId, setDefaultLocationId] = useState("");
  const [view, setView] = useState("weather");
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [forecastError, setForecastError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const localTime = useLocalTime(activeLocation?.timezone);

  function hydrateUser(nextUser) {
    setUser(nextUser);
    setSavedLocations(nextUser.locations || []);
    setDefaultLocationId(nextUser.defaultLocationId || "");
    const locations = nextUser.locations || [];
    const preferredLocation =
      locations.find((location) => location.savedId === nextUser.defaultLocationId) ||
      locations.find((location) => location.savedId === nextUser.activeLocationId) ||
      locations[0] ||
      null;
    setActiveLocation(preferredLocation);
    setView(preferredLocation ? "weather" : "add");
  }

  useEffect(() => {
    async function boot() {
      try {
        const data = await getMe();
        hydrateUser(data.user);
      } catch {
        clearToken();
      } finally {
        setIsBooting(false);
      }
    }

    boot();
  }, []);

  useEffect(() => {
    if (!activeLocation) {
      setForecast(null);
      setForecastError("");
      return;
    }

    let isActive = true;
    async function loadForecast() {
      try {
        setIsLoadingForecast(true);
        setForecastError("");
        const nextForecast = await getForecast(activeLocation);
        if (isActive) setForecast(nextForecast);
      } catch (error) {
        if (isActive) {
          setForecastError(error.message);
          setForecast(null);
        }
      } finally {
        if (isActive) setIsLoadingForecast(false);
      }
    }

    loadForecast();
    const refreshId = window.setInterval(loadForecast, WEATHER_REFRESH_MS);

    return () => {
      isActive = false;
      window.clearInterval(refreshId);
    };
  }, [activeLocation]);

  async function persistLocations(nextLocations, nextDefaultId, nextActiveId) {
    const data = await saveUserLocations({
      locations: nextLocations,
      defaultLocationId: nextDefaultId,
      activeLocationId: nextActiveId,
    });
    hydrateUser(data.user);
  }

  function handlePreview(location) {
    setSelectedDraft(normalizeLocation(location));
  }

  async function handleSave(location, label, shouldSetDefault) {
    const normalizedLocation = normalizeLocation(location, label);
    const nextSavedLocations = [
      normalizedLocation,
      ...savedLocations.filter((saved) => saved.savedId !== normalizedLocation.savedId),
    ];
    const nextDefaultId =
      shouldSetDefault || nextSavedLocations.length === 1 ? normalizedLocation.savedId : defaultLocationId;

    await persistLocations(nextSavedLocations, nextDefaultId, normalizedLocation.savedId);
    setSelectedDraft(null);
    setView("weather");
  }

  async function handleSelectSaved(location) {
    setActiveLocation(location);
    setView("weather");
    setIsSidebarOpen(false);
    await persistLocations(savedLocations, defaultLocationId, location.savedId);
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setSavedLocations([]);
    setDefaultLocationId("");
    setActiveLocation(null);
    setForecast(null);
    setView("weather");
  }

  if (isBooting) {
    return <main className="auth-shell"><section className="panel auth-panel">Loading Home Sky...</section></main>;
  }

  if (!user) {
    return <AuthView onAuthed={hydrateUser} />;
  }

  return (
    <main className="app-shell">
      <div className="background" aria-hidden="true" />
      <button className="menu-toggle" type="button" onClick={() => setIsSidebarOpen(true)}>
        Menu
      </button>
      {isSidebarOpen ? (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}
      <div className={isSidebarOpen ? "app-layout sidebar-open" : "app-layout"}>
        <Sidebar
          isOpen={isSidebarOpen}
          savedLocations={savedLocations}
          activeLocation={activeLocation}
          defaultLocationId={defaultLocationId}
          forecast={forecast}
          user={user}
          onAdd={() => {
            setView("add");
            setIsSidebarOpen(false);
          }}
          onSelect={handleSelectSaved}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <section className="main-content">
          {view === "add" ? (
            <AddLocationView
              selectedLocation={selectedDraft}
              onPreview={handlePreview}
              onSave={handleSave}
            />
          ) : (
            <WeatherView
              location={activeLocation}
              localTime={localTime}
              forecast={forecast}
              isLoading={isLoadingForecast}
              error={forecastError}
            />
          )}
        </section>
      </div>
    </main>
  );
}
