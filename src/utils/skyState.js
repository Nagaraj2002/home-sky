function clamp(value, min = 0, max = 1) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.min(max, Math.max(min, value));
}

function nearestHourlyIndex(hourly) {
  if (!hourly?.time?.length) {
    return -1;
  }

  const now = Date.now();
  let bestIndex = 0;
  let bestDistance = Math.abs(new Date(hourly.time[0]).getTime() - now);

  for (let index = 1; index < hourly.time.length; index += 1) {
    const distance = Math.abs(new Date(hourly.time[index]).getTime() - now);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function hourlyValue(hourly, field, index) {
  return index >= 0 ? hourly?.[field]?.[index] : undefined;
}

function firstDailyValue(daily, field) {
  return daily?.[field]?.[0] ?? null;
}

function daylightProgress(now, sunrise, sunset) {
  if (!sunrise || !sunset) {
    return null;
  }

  const sunriseMs = new Date(sunrise).getTime();
  const sunsetMs = new Date(sunset).getTime();
  const nowMs = now.getTime();

  if (Number.isNaN(sunriseMs) || Number.isNaN(sunsetMs) || sunsetMs <= sunriseMs) {
    return null;
  }

  return (nowMs - sunriseMs) / (sunsetMs - sunriseMs);
}

function valueWithHourlyFallback(current, hourly, field, hourlyIndex) {
  return current?.[field] ?? hourlyValue(hourly, field, hourlyIndex) ?? null;
}

export function createSkyState(forecast, location) {
  if (!forecast || !location) {
    return null;
  }

  const current = forecast.current || {};
  const hourly = forecast.hourly || {};
  const daily = forecast.daily || {};
  const hourlyIndex = nearestHourlyIndex(hourly);
  const now = new Date();
  const sunrise = firstDailyValue(daily, "sunrise");
  const sunset = firstDailyValue(daily, "sunset");
  const weatherCode = valueWithHourlyFallback(current, hourly, "weather_code", hourlyIndex);

  return {
    location: {
      name: location.name,
      label: location.label || "",
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone,
    },
    updatedAt: forecast.fetchedAt,
    sourceHour: hourlyIndex >= 0 ? hourly.time[hourlyIndex] : current.time || null,
    sun: {
      isDay: Boolean(valueWithHourlyFallback(current, hourly, "is_day", hourlyIndex)),
      sunrise,
      sunset,
      daylightDuration: firstDailyValue(daily, "daylight_duration"),
      daylightProgress: daylightProgress(now, sunrise, sunset),
      shortwaveRadiation: hourlyValue(hourly, "shortwave_radiation", hourlyIndex) ?? null,
      directRadiation: hourlyValue(hourly, "direct_radiation", hourlyIndex) ?? null,
      diffuseRadiation: hourlyValue(hourly, "diffuse_radiation", hourlyIndex) ?? null,
    },
    clouds: {
      total: valueWithHourlyFallback(current, hourly, "cloud_cover", hourlyIndex),
      low: valueWithHourlyFallback(current, hourly, "cloud_cover_low", hourlyIndex),
      middle: valueWithHourlyFallback(current, hourly, "cloud_cover_mid", hourlyIndex),
      high: valueWithHourlyFallback(current, hourly, "cloud_cover_high", hourlyIndex),
    },
    wind: {
      speed: valueWithHourlyFallback(current, hourly, "wind_speed_10m", hourlyIndex),
      direction: valueWithHourlyFallback(current, hourly, "wind_direction_10m", hourlyIndex),
      gusts: valueWithHourlyFallback(current, hourly, "wind_gusts_10m", hourlyIndex),
    },
    atmosphere: {
      humidity: valueWithHourlyFallback(current, hourly, "relative_humidity_2m", hourlyIndex),
      dewPoint: valueWithHourlyFallback(current, hourly, "dew_point_2m", hourlyIndex),
      visibility: hourlyValue(hourly, "visibility", hourlyIndex) ?? null,
      pressureMsl: valueWithHourlyFallback(current, hourly, "pressure_msl", hourlyIndex),
      surfacePressure: valueWithHourlyFallback(current, hourly, "surface_pressure", hourlyIndex),
    },
    precipitation: {
      probability: hourlyValue(hourly, "precipitation_probability", hourlyIndex) ?? null,
      precipitation: valueWithHourlyFallback(current, hourly, "precipitation", hourlyIndex),
      rain: valueWithHourlyFallback(current, hourly, "rain", hourlyIndex),
      showers: valueWithHourlyFallback(current, hourly, "showers", hourlyIndex),
      snowfall: valueWithHourlyFallback(current, hourly, "snowfall", hourlyIndex),
    },
    storm: {
      weatherCode,
      isThunderstorm: [95, 96, 99].includes(weatherCode),
      cape: hourlyValue(hourly, "cape", hourlyIndex) ?? null,
    },
  };
}

function overrideValue(baseValue, overrideValue) {
  return overrideValue === "" || overrideValue === null || overrideValue === undefined
    ? baseValue
    : Number(overrideValue);
}

function interpolateNumber(start, end, amount) {
  return start + (end - start) * amount;
}

function percentValue(value) {
  return clamp(value ?? 0, 0, 100) / 100;
}

function rainIntensity(precipitation) {
  const rain = precipitation?.rain ?? 0;
  const showers = precipitation?.showers ?? 0;
  const snowfall = precipitation?.snowfall ?? 0;
  return clamp((rain + showers + snowfall * 0.7) / 12, 0, 1);
}

function snowfallIntensity(precipitation) {
  return clamp((precipitation?.snowfall ?? 0) / 8, 0, 1);
}

function hexToRgb(hex) {
  const normalizedHex = hex.replace("#", "");
  return {
    r: parseInt(normalizedHex.slice(0, 2), 16),
    g: parseInt(normalizedHex.slice(2, 4), 16),
    b: parseInt(normalizedHex.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((value) => Math.round(value).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixColor(startColor, endColor, amount) {
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);
  return rgbToHex({
    r: interpolateNumber(start.r, end.r, amount),
    g: interpolateNumber(start.g, end.g, amount),
    b: interpolateNumber(start.b, end.b, amount),
  });
}

function phaseForProgress(progress) {
  if (progress === null || progress === undefined) {
    return "unknown";
  }

  if (progress < -0.12) return "night";
  if (progress < 0) return "pre-dawn";
  if (progress < 0.08) return "dawn";
  if (progress < 0.2) return "sunrise";
  if (progress < 0.72) return "day";
  if (progress < 0.88) return "golden-hour";
  if (progress <= 1) return "sunset";
  if (progress <= 1.12) return "dusk";
  return "night";
}

export function createSkyVisualState(skyState) {
  if (!skyState) {
    return null;
  }

  const progress = skyState.sun.daylightProgress ?? (skyState.sun.isDay ? 0.5 : null);
  const safeProgress = progress === null ? 0 : clamp(progress, 0, 1);
  const phase = phaseForProgress(progress);
  const isDeepNight = phase === "night";
  const isTwilight = phase === "pre-dawn" || phase === "dusk";
  const daylightArc = Math.sin(safeProgress * Math.PI);
  const horizonWarmth =
    progress === null || isDeepNight
      ? 0.1
      : Math.max(0, 1 - Math.min(Math.abs(safeProgress - 0.08), Math.abs(safeProgress - 0.92)) / 0.28);
  const nightAmount = skyState.sun.isDay ? 0 : isTwilight ? 0.46 : 0.78;
  const topColor = mixColor("#08142b", "#6fb7e8", daylightArc);
  const middleColor = mixColor("#12264a", "#a9d7f2", daylightArc);
  const horizonColor = mixColor("#17223c", "#f6c37a", Math.max(horizonWarmth, daylightArc * 0.35));
  const sunX = interpolateNumber(12, 88, safeProgress);
  const sunY = isDeepNight ? 112 : interpolateNumber(78, 18, daylightArc);
  const sunOpacity = skyState.sun.isDay || isTwilight
    ? clamp(daylightArc + horizonWarmth * 0.35, 0.04, 1)
    : 0;

  return {
    phase,
    daylightProgress: progress,
    background:
      `linear-gradient(180deg, ${topColor} 0%, ${middleColor} 45%, ${horizonColor} 100%)`,
    overlayOpacity: clamp(nightAmount + (1 - daylightArc) * 0.18, 0, 0.86),
    warmthOpacity: clamp(horizonWarmth * 0.5, 0, isDeepNight ? 0.16 : 0.68),
    photoOpacity: clamp(0.28 + daylightArc * 0.34 - nightAmount * 0.2, 0.1, 0.72),
    sun: {
      x: `${sunX}%`,
      y: `${sunY}%`,
      opacity: sunOpacity,
      size: `${interpolateNumber(120, 210, Math.max(horizonWarmth, 0.25))}px`,
    },
  };
}

export function createCloudVisualState(skyState, skyVisualState) {
  if (!skyState) {
    return null;
  }

  const total = percentValue(skyState.clouds.total);
  const low = percentValue(skyState.clouds.low ?? skyState.clouds.total);
  const middle = percentValue(skyState.clouds.middle ?? skyState.clouds.total);
  const high = percentValue(skyState.clouds.high ?? skyState.clouds.total);
  const rain = rainIntensity(skyState.precipitation);
  const daylight = skyState.sun.isDay ? 1 : 0.2;
  const visualDarkness = skyVisualState?.overlayOpacity ?? 0.2;
  const stormDarkness = skyState.storm.isThunderstorm ? 0.3 : 0;
  const cloudShadow = clamp(0.18 + rain * 0.34 + visualDarkness * 0.28 + stormDarkness, 0.16, 0.72);
  const windSpeed = skyState.wind.speed ?? 0;
  const windDirection = skyState.wind.direction ?? 90;
  const windPush = clamp(windSpeed / 80, 0, 1);

  function layer(coverage, type) {
    const specs = {
      high: { base: 0.06, scale: 1.16, blur: 16, height: 34, speed: 82 },
      middle: { base: 0.1, scale: 1, blur: 10, height: 46, speed: 62 },
      low: { base: 0.12, scale: 0.86, blur: 5, height: 58, speed: 42 },
    };
    const spec = specs[type];
    const opacity = clamp(spec.base + coverage * 0.72 + total * 0.14, 0, 0.9);
    const density = clamp(0.28 + coverage * 0.72, 0.2, 1);
    const warmth = skyVisualState?.warmthOpacity ?? 0;

    return {
      opacity,
      density,
      scale: spec.scale,
      blur: `${spec.blur}px`,
      height: `${spec.height}%`,
      spread: `${Math.round(interpolateNumber(60, 220, density))}px`,
      spreadHalf: `${Math.round(interpolateNumber(30, 110, density))}px`,
      duration: `${Math.round(interpolateNumber(spec.speed, spec.speed * 0.45, windPush))}s`,
      direction: `${windDirection + (type === "high" ? 12 : type === "low" ? -10 : 0)}deg`,
      colorA: `rgba(${Math.round(interpolateNumber(255, 102, cloudShadow))}, ${Math.round(
        interpolateNumber(255, 119, cloudShadow),
      )}, ${Math.round(interpolateNumber(255, 136, cloudShadow))}, ${clamp(0.42 + daylight * 0.26 + warmth * 0.18, 0.34, 0.78)})`,
      colorB: `rgba(${Math.round(interpolateNumber(224, 58, cloudShadow))}, ${Math.round(
        interpolateNumber(235, 70, cloudShadow),
      )}, ${Math.round(interpolateNumber(242, 86, cloudShadow))}, ${clamp(0.24 + coverage * 0.28 + rain * 0.2, 0.16, 0.72)})`,
    };
  }

  return {
    darkness: cloudShadow,
    windSpeed,
    windDirection,
    high: layer(high, "high"),
    middle: layer(middle, "middle"),
    low: layer(low, "low"),
  };
}

export function createWeatherVisualState(skyState, skyVisualState, cloudVisualState) {
  if (!skyState) {
    return null;
  }

  const rain = rainIntensity(skyState.precipitation);
  const snow = snowfallIntensity(skyState.precipitation);
  const visibility = skyState.atmosphere.visibility;
  const humidity = percentValue(skyState.atmosphere.humidity);
  const lowCloud = percentValue(skyState.clouds.low ?? skyState.clouds.total);
  const daylight = skyState.sun.isDay ? 1 : 0.22;
  const stormEnergy = skyState.storm.isThunderstorm
    ? 1
    : clamp((skyState.storm.cape ?? 0) / 2800, 0, 1);
  const visibilityFog =
    visibility === null || visibility === undefined ? 0 : clamp((16000 - visibility) / 14000, 0, 1);
  const fog = clamp(visibilityFog * 0.7 + humidity * 0.18 + lowCloud * 0.12, 0, 0.9);
  const darkness = clamp(
    (cloudVisualState?.darkness ?? 0.2) + rain * 0.22 + stormEnergy * 0.28 + (skyVisualState?.overlayOpacity ?? 0),
    0,
    0.82,
  );
  const windSpeed = skyState.wind.speed ?? 0;
  const windDirection = skyState.wind.direction ?? 90;

  return {
    fog: {
      opacity: clamp(fog * (0.7 + daylight * 0.18), 0, 0.82),
      blur: `${Math.round(interpolateNumber(20, 54, fog))}px`,
      color: `rgba(224, 235, 238, ${clamp(0.22 + fog * 0.48, 0, 0.72)})`,
    },
    precipitation: {
      rainOpacity: clamp(rain * 0.78, 0, 0.78),
      rainDuration: `${Math.round(interpolateNumber(900, 360, clamp(windSpeed / 80, 0, 1)))}ms`,
      snowOpacity: clamp(snow * 0.82, 0, 0.82),
      snowDuration: `${Math.round(interpolateNumber(12, 6, clamp(windSpeed / 80, 0, 1)))}s`,
      slant: `${interpolateNumber(-10, 10, clamp(windDirection / 360, 0, 1))}deg`,
    },
    storm: {
      opacity: clamp(stormEnergy * 0.75 + rain * 0.18, 0, 0.8),
      lightningOpacity: clamp(stormEnergy * 0.9, 0, 0.9),
    },
    darkness,
  };
}

export function applySkyStateOverrides(skyState, overrides) {
  if (!skyState) {
    return null;
  }

  return {
    ...skyState,
    labActive: Object.values(overrides).some((value) => value !== ""),
    sun: {
      ...skyState.sun,
      daylightProgress: overrideValue(skyState.sun.daylightProgress, overrides.daylightProgress),
    },
    clouds: {
      ...skyState.clouds,
      total: overrideValue(skyState.clouds.total, overrides.cloudTotal),
      low: overrideValue(skyState.clouds.low, overrides.cloudLow),
      middle: overrideValue(skyState.clouds.middle, overrides.cloudMiddle),
      high: overrideValue(skyState.clouds.high, overrides.cloudHigh),
    },
    wind: {
      ...skyState.wind,
      speed: overrideValue(skyState.wind.speed, overrides.windSpeed),
      direction: overrideValue(skyState.wind.direction, overrides.windDirection),
      gusts: overrideValue(skyState.wind.gusts, overrides.windGusts),
    },
    atmosphere: {
      ...skyState.atmosphere,
      humidity: overrideValue(skyState.atmosphere.humidity, overrides.humidity),
      visibility: overrideValue(skyState.atmosphere.visibility, overrides.visibility),
    },
    precipitation: {
      ...skyState.precipitation,
      rain: overrideValue(skyState.precipitation.rain, overrides.rain),
      showers: overrideValue(skyState.precipitation.showers, overrides.showers),
      snowfall: overrideValue(skyState.precipitation.snowfall, overrides.snowfall),
    },
    storm: {
      ...skyState.storm,
      weatherCode: overrideValue(skyState.storm.weatherCode, overrides.weatherCode),
      cape: overrideValue(skyState.storm.cape, overrides.cape),
    },
  };
}
