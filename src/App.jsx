import { useEffect, useMemo, useState } from "react";
import { clearToken, getMe, saveUserLocations } from "./api/backend.js";
import { getForecast } from "./api/openMeteo.js";
import { AuthView } from "./components/auth/AuthView.jsx";
import { AddLocationView } from "./components/locations/AddLocationView.jsx";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import { SkyLab } from "./components/sky/SkyLab.jsx";
import { SkyView } from "./components/sky/SkyView.jsx";
import { WeatherView } from "./components/weather/WeatherView.jsx";
import {
  EMPTY_SKY_OVERRIDES,
  WEATHER_REFRESH_MS,
  getInitialRoute,
} from "./config/appConfig.js";
import { useLocalTime } from "./hooks/useLocalTime.js";
import {
  applySkyStateOverrides,
  createCloudVisualState,
  createSkyState,
  createSkyVisualState,
  createWeatherVisualState,
} from "./utils/skyState.js";
import { normalizeLocation } from "./utils/storage.js";

const IS_DEV = import.meta.env.DEV;

export default function App() {
  const [user, setUser] = useState(null);
  const [isBooting, setIsBooting] = useState(true);
  const [savedLocations, setSavedLocations] = useState([]);
  const [defaultLocationId, setDefaultLocationId] = useState("");
  const [view, setView] = useState("add");
  const [route, setRoute] = useState(getInitialRoute);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [forecastError, setForecastError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [skyLabOverrides, setSkyLabOverrides] = useState(EMPTY_SKY_OVERRIDES);
  const localTime = useLocalTime(activeLocation?.timezone);

  const liveSkyState = useMemo(
    () => createSkyState(forecast, activeLocation),
    [forecast, activeLocation],
  );
  const skyState = useMemo(
    () => applySkyStateOverrides(liveSkyState, skyLabOverrides),
    [liveSkyState, skyLabOverrides],
  );
  const skyVisualState = useMemo(() => createSkyVisualState(skyState), [skyState]);
  const cloudVisualState = useMemo(
    () => createCloudVisualState(skyState, skyVisualState),
    [skyState, skyVisualState],
  );
  const weatherVisualState = useMemo(
    () => createWeatherVisualState(skyState, skyVisualState, cloudVisualState),
    [skyState, skyVisualState, cloudVisualState],
  );

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
    setView(preferredLocation ? "app" : "add");
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
    function handlePopState() {
      setRoute(getInitialRoute());
      setView("app");
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
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

  function navigate(nextRoute) {
    if (route !== nextRoute) {
      window.history.pushState({}, "", nextRoute);
      setRoute(nextRoute);
    }
    setView("app");
    setIsSidebarOpen(false);
  }

  async function handleSave(location, label, shouldSetDefault) {
    const normalizedLocation = normalizeLocation(location, label);
    const nextSavedLocations = [
      normalizedLocation,
      ...savedLocations.filter((saved) => saved.savedId !== normalizedLocation.savedId),
    ];
    const nextDefaultId =
      shouldSetDefault || nextSavedLocations.length === 1
        ? normalizedLocation.savedId
        : defaultLocationId;

    await persistLocations(nextSavedLocations, nextDefaultId, normalizedLocation.savedId);
    setSelectedDraft(null);
    navigate("/sky");
  }

  async function handleSelectSaved(location) {
    setActiveLocation(location);
    setView("app");
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
    setView("add");
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
        <button className="sidebar-scrim" type="button" aria-label="Close sidebar" onClick={() => setIsSidebarOpen(false)} />
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
          onNavigate={navigate}
          currentRoute={route}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <section className="main-content">
          {view === "add" ? (
            <AddLocationView
              selectedLocation={selectedDraft}
              onPreview={(location) => setSelectedDraft(normalizeLocation(location))}
              onSave={handleSave}
            />
          ) : route === "/weather" ? (
            <WeatherView
              location={activeLocation}
              localTime={localTime}
              forecast={forecast}
              isLoading={isLoadingForecast}
              error={forecastError}
            />
          ) : (
            <>
              <SkyView
                location={activeLocation}
                localTime={localTime}
                forecast={forecast}
                skyState={skyState}
                skyVisualState={skyVisualState}
                cloudVisualState={cloudVisualState}
                weatherVisualState={weatherVisualState}
                isLoading={isLoadingForecast}
                error={forecastError}
              />
              {IS_DEV ? (
                <SkyLab
                  overrides={skyLabOverrides}
                  onChange={setSkyLabOverrides}
                  onReset={() => setSkyLabOverrides(EMPTY_SKY_OVERRIDES)}
                />
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
