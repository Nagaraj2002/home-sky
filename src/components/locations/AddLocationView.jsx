import { useEffect, useState } from "react";
import { formatPlace } from "../../utils/format.js";
import { LocationSearch } from "./LocationSearch.jsx";

export function AddLocationView({ selectedLocation, onPreview, onSave }) {
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
              <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Home, School, Office..." />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />
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
