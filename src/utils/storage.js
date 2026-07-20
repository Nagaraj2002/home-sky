const LEGACY_HOME_STORAGE_KEY = "home-sky.home";
const LOCATIONS_STORAGE_KEY = "home-sky.locations";
const ACTIVE_LOCATION_STORAGE_KEY = "home-sky.active-location-id";
const DEFAULT_LOCATION_STORAGE_KEY = "home-sky.default-location-id";

function readJson(key, fallback) {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function createLocationId(location) {
  return [
    location.id || "place",
    location.latitude,
    location.longitude,
    location.timezone,
  ].join("-");
}

export function normalizeLocation(location, label = "") {
  return {
    ...location,
    savedId: location.savedId || createLocationId(location),
    label: label.trim() || location.label || "",
  };
}

export function loadSavedLocations() {
  const savedLocations = readJson(LOCATIONS_STORAGE_KEY, []);

  if (savedLocations.length > 0) {
    return savedLocations;
  }

  const legacyHome = readJson(LEGACY_HOME_STORAGE_KEY, null);
  if (!legacyHome) {
    return [];
  }

  const migratedHome = normalizeLocation(legacyHome, "Home");
  saveLocations([migratedHome]);
  saveActiveLocationId(migratedHome.savedId);
  localStorage.removeItem(LEGACY_HOME_STORAGE_KEY);
  return [migratedHome];
}

export function saveLocations(locations) {
  writeJson(LOCATIONS_STORAGE_KEY, locations);
}

export function loadActiveLocationId() {
  return localStorage.getItem(ACTIVE_LOCATION_STORAGE_KEY);
}

export function saveActiveLocationId(locationId) {
  localStorage.setItem(ACTIVE_LOCATION_STORAGE_KEY, locationId);
}

export function clearActiveLocationId() {
  localStorage.removeItem(ACTIVE_LOCATION_STORAGE_KEY);
}

export function loadDefaultLocationId() {
  return localStorage.getItem(DEFAULT_LOCATION_STORAGE_KEY);
}

export function saveDefaultLocationId(locationId) {
  localStorage.setItem(DEFAULT_LOCATION_STORAGE_KEY, locationId);
}
