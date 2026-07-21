import { useEffect, useState } from "react";
import { searchLocations } from "../../api/openMeteo.js";
import { SEARCH_MIN_LENGTH } from "../../config/appConfig.js";

export function LocationSearch({ onSelect }) {
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
