export function cloudLayerStyle(cloudVisualState, layerName) {
  const layer = cloudVisualState?.[layerName];
  if (!layer) return {};

  return {
    "--cloud-opacity": layer.opacity,
    "--cloud-density": layer.density,
    "--cloud-scale": layer.scale,
    "--cloud-blur": layer.blur,
    "--cloud-height": layer.height,
    "--cloud-spread": layer.spread,
    "--cloud-spread-half": layer.spreadHalf,
    "--cloud-duration": layer.duration,
    "--cloud-direction": layer.direction,
    "--cloud-color-a": layer.colorA,
    "--cloud-color-b": layer.colorB,
  };
}

export function weatherLayerStyle(weatherVisualState) {
  if (!weatherVisualState) return {};

  return {
    "--fog-opacity": weatherVisualState.fog.opacity,
    "--fog-blur": weatherVisualState.fog.blur,
    "--fog-color": weatherVisualState.fog.color,
    "--rain-opacity": weatherVisualState.precipitation.rainOpacity,
    "--rain-duration": weatherVisualState.precipitation.rainDuration,
    "--snow-opacity": weatherVisualState.precipitation.snowOpacity,
    "--snow-duration": weatherVisualState.precipitation.snowDuration,
    "--weather-slant": weatherVisualState.precipitation.slant,
    "--storm-opacity": weatherVisualState.storm.opacity,
    "--lightning-opacity": weatherVisualState.storm.lightningOpacity,
    "--weather-darkness": weatherVisualState.darkness,
  };
}
