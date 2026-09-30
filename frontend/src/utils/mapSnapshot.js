import html2canvas from "html2canvas";

/**
 * Captures a high-resolution snapshot of the Leaflet map DOM element as a PNG Data URI.
 *
 * @param {string|HTMLElement} [elementOrId="leaflet-map-container"]
 * @returns {Promise<string|null>}
 */
export async function captureMapSnapshot(elementOrId = "leaflet-map-container") {
  try {
    const el =
      typeof elementOrId === "string"
        ? document.getElementById(elementOrId)
        : elementOrId;

    if (!el) {
      console.warn("Map snapshot: DOM element not found.");
      return null;
    }

    // Wait a brief tick for tiles/markers to finish rendering
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(el, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      logging: false,
      backgroundColor: "#ffffff",
      ignoreElements: (element) => {
        // Ignore zoom controls or collapsible buttons in static PDF snapshot
        return element.classList?.contains("leaflet-control-zoom");
      },
    });

    const dataUrl = canvas.toDataURL("image/png");
    console.log("📸 [Map Snapshot] Successfully captured map image");
    return dataUrl;
  } catch (err) {
    console.warn("⚠️ [Map Snapshot] Capture failed, using fallback:", err.message);
    return null;
  }
}
