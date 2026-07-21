import { cloudLayerStyle } from "./skyLayerStyles.js";

export function CloudLayers({ cloudVisualState }) {
  return (
    <>
      <div className="cloud-layer cloud-layer-high" style={cloudLayerStyle(cloudVisualState, "high")} aria-hidden="true" />
      <div className="cloud-layer cloud-layer-middle" style={cloudLayerStyle(cloudVisualState, "middle")} aria-hidden="true" />
      <div className="cloud-layer cloud-layer-low" style={cloudLayerStyle(cloudVisualState, "low")} aria-hidden="true" />
    </>
  );
}
