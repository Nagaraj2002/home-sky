function LabControl({ label, value, onChange, min, max, step = 1, unit = "" }) {
  return (
    <label className="lab-control">
      <span>
        {label}
        <small>{value === "" ? "live" : `${value}${unit}`}</small>
      </span>
      <input type="range" min={min} max={max} step={step} value={value === "" ? min : value} onChange={(event) => onChange(event.target.value)} />
      <input type="number" min={min} max={max} step={step} value={value} placeholder="live" onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function SkyLab({ overrides, onChange, onReset }) {
  function setOverride(key, value) {
    onChange({ ...overrides, [key]: value });
  }

  return (
    <aside className="sky-lab panel" aria-label="Sky laboratory">
      <div className="lab-header">
        <div>
          <p className="eyebrow">Dev Lab</p>
          <h2>Sky State Overrides</h2>
        </div>
        <button className="text-button" type="button" onClick={onReset}>
          Reset
        </button>
      </div>
      <div className="lab-grid">
        <LabControl label="Daylight" value={overrides.daylightProgress} min="0" max="1" step="0.01" onChange={(value) => setOverride("daylightProgress", value)} />
        <LabControl label="Cloud total" value={overrides.cloudTotal} min="0" max="100" unit="%" onChange={(value) => setOverride("cloudTotal", value)} />
        <LabControl label="Low cloud" value={overrides.cloudLow} min="0" max="100" unit="%" onChange={(value) => setOverride("cloudLow", value)} />
        <LabControl label="Mid cloud" value={overrides.cloudMiddle} min="0" max="100" unit="%" onChange={(value) => setOverride("cloudMiddle", value)} />
        <LabControl label="High cloud" value={overrides.cloudHigh} min="0" max="100" unit="%" onChange={(value) => setOverride("cloudHigh", value)} />
        <LabControl label="Visibility" value={overrides.visibility} min="0" max="50000" step="500" unit="m" onChange={(value) => setOverride("visibility", value)} />
        <LabControl label="Humidity" value={overrides.humidity} min="0" max="100" unit="%" onChange={(value) => setOverride("humidity", value)} />
        <LabControl label="Wind direction" value={overrides.windDirection} min="0" max="360" unit="deg" onChange={(value) => setOverride("windDirection", value)} />
        <LabControl label="Wind speed" value={overrides.windSpeed} min="0" max="120" unit="km/h" onChange={(value) => setOverride("windSpeed", value)} />
        <LabControl label="Wind gusts" value={overrides.windGusts} min="0" max="160" unit="km/h" onChange={(value) => setOverride("windGusts", value)} />
        <LabControl label="Rain" value={overrides.rain} min="0" max="30" step="0.1" unit="mm" onChange={(value) => setOverride("rain", value)} />
        <LabControl label="Showers" value={overrides.showers} min="0" max="30" step="0.1" unit="mm" onChange={(value) => setOverride("showers", value)} />
        <LabControl label="Snowfall" value={overrides.snowfall} min="0" max="30" step="0.1" unit="cm" onChange={(value) => setOverride("snowfall", value)} />
        <LabControl label="WMO code" value={overrides.weatherCode} min="0" max="99" onChange={(value) => setOverride("weatherCode", value)} />
        <LabControl label="CAPE" value={overrides.cape} min="0" max="5000" step="50" unit="J/kg" onChange={(value) => setOverride("cape", value)} />
      </div>
    </aside>
  );
}
