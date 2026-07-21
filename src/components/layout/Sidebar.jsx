import { formatPlace, formatUpdated } from "../../utils/format.js";

export function Sidebar({
  isOpen,
  savedLocations,
  activeLocation,
  defaultLocationId,
  forecast,
  user,
  onAdd,
  onSelect,
  onNavigate,
  currentRoute,
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
        <p className="side-title">Views</p>
        <div className="view-nav">
          <button className={currentRoute === "/sky" ? "view-link active" : "view-link"} type="button" onClick={() => onNavigate("/sky")}>
            Sky
          </button>
          <button className={currentRoute === "/weather" ? "view-link active" : "view-link"} type="button" onClick={() => onNavigate("/weather")}>
            Weather
          </button>
        </div>
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
