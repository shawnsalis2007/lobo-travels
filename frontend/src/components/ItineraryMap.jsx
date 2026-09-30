import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Moon,
  Plane,
  Train,
  Car,
  Layers,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Navigation,
} from "lucide-react";

// ── Comprehensive Static Coordinates Map for Instant, Zero-Latency Lookups ──
export const STATIC_COORDINATES = {
  // Himachal Pradesh
  "manali": [32.2432, 77.1892],
  "shimla": [31.1048, 77.1734],
  "solang valley": [32.3166, 77.1578],
  "atal tunnel": [32.4042, 77.1264],
  "rohtang pass": [32.3716, 77.2466],
  "naggar": [32.1408, 77.1724],
  "kullu": [31.9579, 77.1095],
  "bhuntar": [31.8781, 77.1539],
  "bhuntar airport": [31.8781, 77.1539],
  "vashisht": [32.2635, 77.1878],
  "dharamshala": [32.2190, 76.3234],
  "mcleodganj": [32.2426, 76.3213],
  "dalhousie": [32.5387, 75.9710],
  "kasol": [32.0100, 77.3150],
  "spiti": [32.2461, 78.0349],
  "kaza": [32.2276, 78.0710],
  "jibhi": [31.6375, 77.3486],
  "kalka": [30.8359, 76.9354],
  "chail": [30.9686, 77.1895],
  "kasauli": [30.9013, 76.9649],

  // Northern Hubs & Golden Triangle
  "delhi": [28.6139, 77.2090],
  "new delhi": [28.6139, 77.2090],
  "delhi (del)": [28.5562, 77.1000],
  "indira gandhi int'l airport": [28.5562, 77.1000],
  "chandigarh": [30.7333, 76.7794],
  "amritsar": [31.6340, 74.8723],
  "agra": [27.1767, 78.0081],
  "jaipur": [26.9124, 75.7873],
  "udaipur": [24.5854, 73.7125],
  "jodhpur": [26.2389, 73.0243],
  "jaisalmer": [26.9157, 70.9083],
  "pushkar": [26.4897, 74.5511],
  "varanasi": [25.3176, 82.9739],
  "rishikesh": [30.0869, 78.2676],
  "haridwar": [29.9457, 78.1642],
  "nainital": [29.3919, 79.4542],
  "mussoorie": [30.4598, 78.0644],
  "dehradun": [30.3165, 78.0322],
  "jim corbett": [29.5300, 78.7747],

  // Ladakh & Kashmir
  "leh": [34.1526, 77.5771],
  "ladakh": [34.1526, 77.5771],
  "nubra valley": [34.6863, 77.5673],
  "pangong lake": [33.7595, 78.6674],
  "srinagar": [34.0837, 74.7973],
  "gulmarg": [34.0484, 74.3805],
  "pahalgam": [34.0161, 75.3150],
  "sonmarg": [34.3000, 75.2900],

  // West & South Hubs
  "mumbai": [19.0760, 72.8777],
  "pune": [18.5204, 73.8567],
  "goa": [15.2993, 74.1240],
  "bangalore": [12.9716, 77.5946],
  "bengaluru": [12.9716, 77.5946],
  "mysore": [12.2958, 76.6394],
  "coorg": [12.3375, 75.8069],
  "kochi": [9.9312, 76.2673],
  "munnar": [10.0889, 77.0595],
  "alleppey": [9.4981, 76.3388],
  "thekkady": [9.6031, 77.1615],
  "ooty": [11.4102, 76.6950],
  "kodaikanal": [10.2381, 77.4892],
  "hyderabad": [17.3850, 78.4867],
  "chennai": [13.0827, 80.2707],

  // East & North East
  "kolkata": [22.5726, 88.3639],
  "darjeeling": [27.0410, 88.2663],
  "gangtok": [27.3389, 88.6065],
  "shillong": [25.5788, 91.8933],
  "guwahati": [26.1445, 91.7362],
  "kaziranga": [26.5775, 93.1711],
  "port blair": [11.6234, 92.7265],
  "havelock": [11.9761, 92.9876],
};

// In-memory dynamic geocoding cache for custom/rare locations
const geocodeCache = new Map();

function findStaticCoords(name) {
  if (!name || typeof name !== "string") return null;
  const clean = name.toLowerCase().trim();

  if (STATIC_COORDINATES[clean]) return STATIC_COORDINATES[clean];

  // Try substring matching
  for (const [key, coords] of Object.entries(STATIC_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }

  // Check cleaned version without words like "airport", "station", "hotel", "resort"
  const stripped = clean
    .replace(/\b(airport|station|hotel|resort|valley|city|lake|temple|pass)\b/g, "")
    .trim();

  if (stripped && STATIC_COORDINATES[stripped]) {
    return STATIC_COORDINATES[stripped];
  }

  for (const [key, coords] of Object.entries(STATIC_COORDINATES)) {
    if (stripped && (stripped.includes(key) || key.includes(stripped))) {
      return coords;
    }
  }

  return null;
}

// ── Custom Leaflet HTML Marker Icons ─────────────────────────────────────────
function createCustomIcon(dayNum, stopNum, isOvernight, transitType) {
  if (isOvernight) {
    return L.divIcon({
      className: "custom-marker-wrapper",
      html: `
        <div style="background: #1e3a8a; color: white; border-radius: 9999px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.35);">
          🌙
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -16],
    });
  }

  if (transitType === "flight") {
    return L.divIcon({
      className: "custom-marker-wrapper",
      html: `
        <div style="background: #0284c7; color: white; border-radius: 9999px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; border: 2px solid #ffffff; box-shadow: 0 3px 6px rgba(0,0,0,0.25);">
          ✈️
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -15],
    });
  }

  if (transitType === "train") {
    return L.divIcon({
      className: "custom-marker-wrapper",
      html: `
        <div style="background: #059669; color: white; border-radius: 9999px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; border: 2px solid #ffffff; box-shadow: 0 3px 6px rgba(0,0,0,0.25);">
          🚆
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -15],
    });
  }

  return L.divIcon({
    className: "custom-marker-wrapper",
    html: `
      <div style="background: #2563eb; color: white; border-radius: 9999px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 2px solid #ffffff; box-shadow: 0 3px 5px rgba(0,0,0,0.25);">
        D${dayNum}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

// ── Auto-Fit Map Bounds Helper ───────────────────────────────────────────────
function MapBoundsAdjuster({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;
    try {
      const latLngs = points.map((p) => p.latLng);
      if (latLngs.length === 1) {
        map.setView(latLngs[0], 10, { animate: true });
      } else {
        const bounds = L.latLngBounds(latLngs);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [35, 35], maxZoom: 12, animate: true });
        }
      }
    } catch (err) {
      console.warn("Map bounds fit error:", err);
    }
  }, [points, map]);

  return null;
}

// ── Main ItineraryMap Component ─────────────────────────────────────────────
export default function ItineraryMap({ days = [], destinationTitle = "", isCollapsible = true }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [resolvedPoints, setResolvedPoints] = useState([]);
  const [loadingGeocodes, setLoadingGeocodes] = useState(false);

  // Extract raw stops from days
  const rawStops = useMemo(() => {
    const list = [];
    (days || []).forEach((day, dIdx) => {
      const stops = Array.isArray(day.stops) ? day.stops : [];
      stops.forEach((stop, sIdx) => {
        if (stop.locationName && stop.locationName.trim()) {
          list.push({
            id: stop.id || `${dIdx}-${sIdx}`,
            dayNumber: day.dayNumber || dIdx + 1,
            dayTitle: day.title || "",
            stopIndex: sIdx + 1,
            locationName: stop.locationName.trim(),
            isOvernight: !!stop.isOvernight,
            noSightseeing: !!stop.noSightseeing,
            transitType: stop.intercityTransit?.type || "car",
            transitInfo: stop.intercityTransit,
            attractions: stop.attractions || [],
          });
        }
      });
    });
    return list;
  }, [days]);

  // Resolve coordinates: static first, then async Nominatim geocode
  useEffect(() => {
    let isCancelled = false;

    async function resolveAll() {
      const points = [];
      const toGeocode = [];

      for (const item of rawStops) {
        const staticCoords = findStaticCoords(item.locationName);
        if (staticCoords) {
          points.push({ ...item, latLng: staticCoords });
        } else if (geocodeCache.has(item.locationName.toLowerCase().trim())) {
          points.push({
            ...item,
            latLng: geocodeCache.get(item.locationName.toLowerCase().trim()),
          });
        } else {
          toGeocode.push(item);
        }
      }

      if (toGeocode.length > 0) {
        setLoadingGeocodes(true);
        for (const item of toGeocode) {
          if (isCancelled) break;
          try {
            const query = encodeURIComponent(`${item.locationName}, India`);
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
            );
            const data = await res.json();
            if (data && data.length > 0) {
              const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
              geocodeCache.set(item.locationName.toLowerCase().trim(), coords);
              points.push({ ...item, latLng: coords });
            } else {
              // Fallback to Manali/Delhi region default
              const fallback = [32.2432, 77.1892];
              points.push({ ...item, latLng: fallback });
            }
          } catch {
            const fallback = [32.2432, 77.1892];
            points.push({ ...item, latLng: fallback });
          }
        }
        if (!isCancelled) setLoadingGeocodes(false);
      }

      if (!isCancelled) {
        setResolvedPoints(points);
      }
    }

    resolveAll();

    return () => {
      isCancelled = true;
    };
  }, [rawStops]);

  const polylineCoords = useMemo(() => {
    return resolvedPoints.map((p) => p.latLng);
  }, [resolvedPoints]);

  const initialCenter = resolvedPoints[0]?.latLng || [32.2432, 77.1892]; // Manali default

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden mb-6 avoid-break">
      {/* Map Header Bar */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-2">
              <span>Interactive Route & Transit Map</span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.2 rounded-full border border-blue-200">
                {resolvedPoints.length} Stops Plotted
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              OpenStreetMap • Live Dashed Travel Route
            </p>
          </div>
        </div>

        {isCollapsible && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            title={isCollapsed ? "Expand Map" : "Collapse Map"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Map Container */}
      {!isCollapsed && (
        <div id="leaflet-map-container" className="relative w-full h-64 sm:h-72 lg:h-80 z-0 isolate">
          {resolvedPoints.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-xs">
              <MapPin className="w-6 h-6 mb-1 text-slate-300" />
              <span>Add stops with location names in the editor to view route map.</span>
            </div>
          ) : (
            <MapContainer
              center={initialCenter}
              zoom={8}
              scrollWheelZoom={false}
              className="w-full h-full z-0"
              style={{ width: "100%", height: "100%" }}
            >
              {/* Standard Keyless OpenStreetMap Tile Layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Dynamic Auto-Fit Bounds */}
              <MapBoundsAdjuster points={resolvedPoints} />

              {/* Dashed Route Polyline connecting sequential stops */}
              {polylineCoords.length > 1 && (
                <Polyline
                  positions={polylineCoords}
                  pathOptions={{
                    color: "#2563eb",
                    weight: 3.5,
                    dashArray: "6, 8",
                    opacity: 0.85,
                  }}
                />
              )}

              {/* Plotted Stop Markers */}
              {resolvedPoints.map((point, idx) => {
                const icon = createCustomIcon(
                  point.dayNumber,
                  point.stopIndex,
                  point.isOvernight,
                  point.transitType
                );

                return (
                  <Marker key={point.id || idx} position={point.latLng} icon={icon}>
                    <Popup className="custom-leaflet-popup">
                      <div className="p-1 space-y-1 text-xs min-w-[160px]">
                        <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
                          <span className="font-extrabold text-blue-900">
                            Day {point.dayNumber} - Stop {point.stopIndex}
                          </span>
                          {point.isOvernight && (
                            <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-full">
                              Overnight
                            </span>
                          )}
                        </div>

                        <p className="font-bold text-slate-800 text-sm">{point.locationName}</p>

                        {point.transitType && point.transitType !== "car" && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 p-1 rounded border border-slate-200">
                            <span className="font-semibold">
                              {point.transitType === "flight" ? "✈️ Flight: " : "🚆 Train: "}
                            </span>
                            <span>
                              {[point.transitInfo?.carrierName, point.transitInfo?.transitNumber]
                                .filter(Boolean)
                                .join(" ")}
                            </span>
                          </div>
                        )}

                        {point.attractions && point.attractions.length > 0 && (
                          <div className="text-[10px] text-slate-500 pt-0.5">
                            <span className="font-semibold text-slate-700">Highlights: </span>
                            {point.attractions.join(", ")}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}

          {/* Map Legend Overlay */}
          <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-slate-600 shadow-sm flex items-center space-x-3 pointer-events-none">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
              <span>Day Stop</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-950 inline-block"></span>
              <span>Overnight (🌙)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 border-t-2 border-dashed border-blue-600 inline-block"></span>
              <span>Route Line</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
