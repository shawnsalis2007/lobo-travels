/**
 * routeUtils.js
 * Utility helpers for multi-stop day routing logic and intercity transit (Car, Flight, Train).
 * RULE: Never calculate or display kilometers or travel hours.
 */

/**
 * Creates a default intercity transit object.
 * @param {'car' | 'flight' | 'train'} [type='car']
 * @returns {object}
 */
export function createIntercityTransit(type = "car") {
  return {
    type, // 'car' | 'flight' | 'train'
    carrierName: "", // e.g. "IndiGo", "Vande Bharat Express", "Emirates"
    transitNumber: "", // e.g. "6E-204", "22436"
    departureLocation: "", // Airport / Station name
    arrivalLocation: "", // Airport / Station name
    departureTime: "",
    arrivalTime: "",
  };
}

/**
 * Creates a blank stop object with a unique id.
 * @param {string} [locationName]
 * @returns {object}
 */
export function createStop(locationName = "") {
  return {
    id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    locationName,
    isOvernight: false,
    isCheckIn: false,
    isCheckOut: false,
    noSightseeing: false, // transit-only flag
    attractionInput: "",
    attractions: [],
    intercityTransit: createIntercityTransit("car"),
  };
}

/**
 * Creates a blank day with one default stop.
 * @param {number} dayNumber
 * @param {string} [date]
 * @param {string} [dayOfWeek]
 * @returns {object}
 */
export function createDay(dayNumber, date = "", dayOfWeek = "") {
  const stop = createStop("");
  stop.isOvernight = true; // first stop is overnight by default
  return {
    id: `day-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dayNumber,
    date,
    dayOfWeek,
    title: `Day ${dayNumber} - Local Sightseeing`,
    description: "",
    stops: [stop],
    attractions: [],
    attractionDetails: [],
    meals: { breakfast: false, lunch: false, dinner: false },
  };
}

/**
 * Computes or formats date and day of week for a specific day in the itinerary.
 * @param {object} day
 * @param {number} [dayIndex=0]
 * @param {string} [travelDates=""]
 * @returns {{ date: string, dayOfWeek: string, display: string }}
 */
export function getDayDateInfo(day, dayIndex = 0, travelDates = "") {
  // 1. If day already has explicit date
  if (day?.date) {
    const parsed = new Date(day.date);
    if (!isNaN(parsed.getTime())) {
      const dayOfWeek = day.dayOfWeek || parsed.toLocaleDateString("en-US", { weekday: "long" });
      const dateStr = parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      return { date: dateStr, dayOfWeek, display: `${dateStr} • ${dayOfWeek}` };
    }
    return {
      date: day.date,
      dayOfWeek: day.dayOfWeek || "",
      display: day.dayOfWeek ? `${day.date} • ${day.dayOfWeek}` : day.date,
    };
  }

  // 2. Parse from travelDates string if available e.g. "15 Oct 2026 – 18 Oct 2026"
  if (travelDates) {
    const match = travelDates.match(/(\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/);
    if (match) {
      const baseDate = new Date(match[1]);
      if (!isNaN(baseDate.getTime())) {
        const targetDate = new Date(baseDate);
        targetDate.setDate(baseDate.getDate() + dayIndex);
        const dayOfWeek = targetDate.toLocaleDateString("en-US", { weekday: "long" });
        const dateStr = targetDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        return { date: dateStr, dayOfWeek, display: `${dateStr} • ${dayOfWeek}` };
      }
    }
  }

  return { date: "", dayOfWeek: "", display: "" };
}

/**
 * Migrates legacy day objects (no stops array) to the new multi-stop format.
 * @param {object} day
 * @returns {object}
 */
export function migrateLegacyDay(day) {
  if (Array.isArray(day.stops) && day.stops.length > 0) {
    return {
      ...day,
      stops: day.stops.map((s) => ({
        ...s,
        intercityTransit: s.intercityTransit || createIntercityTransit("car"),
      })),
      meals: day.meals || { breakfast: false, lunch: false, dinner: false },
    };
  }

  // Extract overnight location from title/description heuristically
  const stop = createStop(extractLocationFromTitle(day.title || ""));
  stop.isOvernight = true;
  stop.attractions = Array.isArray(day.attractions) ? [...day.attractions] : [];
  stop.intercityTransit = createIntercityTransit("car");

  return {
    ...day,
    stops: [stop],
    meals: day.meals || { breakfast: false, lunch: false, dinner: false },
  };
}

/**
 * Heuristic: pull the city/place name from a day title
 */
function extractLocationFromTitle(title) {
  const patterns = [/at (.+?)(?:\s*&|\s*–|$)/i, /in (.+?)(?:\s*&|\s*–|$)/i, /to (.+?)(?:\s*&|\s*–|$)/i];
  for (const re of patterns) {
    const m = title.match(re);
    if (m && m[1]) return m[1].trim().split(" ").slice(0, 2).join(" ");
  }
  return "";
}

/**
 * Returns the overnight location for a given day.
 * @param {object} day
 * @returns {string}
 */
export function getOvernightLocation(day) {
  if (!Array.isArray(day.stops)) return "";
  const overnightStop = day.stops.find((s) => s.isOvernight);
  return overnightStop ? overnightStop.locationName : (day.stops[day.stops.length - 1]?.locationName || "");
}

/**
 * Formats a dynamic headline for intercity transits.
 * - Car: "Drive from [Origin] to [Destination]"
 * - Flight: "Flight [Carrier] [FlightNo] from [Origin Airport] to [Destination Airport]"
 * - Train: "Train Transfer via [Carrier/Train No] from [Origin Station] to [Destination Station]"
 *
 * @param {object} transit
 * @param {string} [fallbackFrom]
 * @param {string} [fallbackTo]
 * @returns {string}
 */
export function formatTransitHeadline(transit, fallbackFrom = "", fallbackTo = "") {
  if (!transit) return "";

  const from = transit.departureLocation || fallbackFrom || "Origin";
  const to = transit.arrivalLocation || fallbackTo || "Destination";
  const timeInfo = transit.departureTime
    ? ` (${transit.departureTime}${transit.arrivalTime ? " - " + transit.arrivalTime : ""})`
    : "";

  if (transit.type === "flight") {
    const flightName = [transit.carrierName, transit.transitNumber].filter(Boolean).join(" ");
    return `Flight ${flightName ? flightName + " " : ""}from ${from} to ${to}${timeInfo}`.trim();
  }

  if (transit.type === "train") {
    const trainName = [transit.carrierName, transit.transitNumber].filter(Boolean).join(" ");
    return `Train Transfer via ${trainName ? trainName + " " : "Train "}from ${from} to ${to}${timeInfo}`.trim();
  }

  // Default: Car
  if (fallbackFrom && fallbackTo && fallbackFrom.toLowerCase().trim() !== fallbackTo.toLowerCase().trim()) {
    return `Drive from ${fallbackFrom} to ${fallbackTo}.`;
  }

  return "";
}

/**
 * Auto-generate a drive or intercity transit line if the current day's first stop
 * differs from the previous day's overnight location or has transit configured.
 *
 * RULE: Never include km or travel time.
 * @param {object|null} prevDay
 * @param {object} currentDay
 * @returns {string|null}
 */
export function buildDriveLine(prevDay, currentDay) {
  if (!currentDay) return null;

  const firstStop = Array.isArray(currentDay.stops) && currentDay.stops.length > 0 ? currentDay.stops[0] : null;
  const transit = firstStop?.intercityTransit;
  const prevOvernight = prevDay ? getOvernightLocation(prevDay) : "";
  const currentFirstStop = firstStop?.locationName || "";

  // If specific flight or train transit is configured on the day/stop
  if (transit && (transit.type === "flight" || transit.type === "train")) {
    return formatTransitHeadline(transit, prevOvernight, currentFirstStop);
  }

  // Car transit comparison
  if (!prevDay || !prevOvernight || !currentFirstStop) return null;
  if (prevOvernight.toLowerCase().trim() === currentFirstStop.toLowerCase().trim()) return null;

  return `Drive from ${prevOvernight} to ${currentFirstStop}.`;
}

/**
 * Auto-generate transit description for a transit-only stop.
 * @param {string} fromLocation
 * @param {string} toLocation
 * @param {object} [transit]
 * @returns {string}
 */
export function buildTransitLine(fromLocation, toLocation, transit = null) {
  if (transit && (transit.type === "flight" || transit.type === "train")) {
    return formatTransitHeadline(transit, fromLocation, toLocation);
  }
  if (fromLocation && toLocation) {
    return `Check out from ${fromLocation} and proceed to ${toLocation}.`;
  }
  if (toLocation) return `Proceed to ${toLocation}.`;
  if (fromLocation) return `Check out from ${fromLocation} and proceed onward.`;
  return "Check out and proceed onward.";
}

/**
 * Collect all attraction names across all stops of a day
 * (skipping transit-only stops).
 * @param {object} day
 * @returns {string[]}
 */
export function getAllAttractionsForDay(day) {
  if (!day) return [];
  const raw = Array.isArray(day.stops)
    ? day.stops.filter((s) => !s.noSightseeing).flatMap((s) => s.attractions || [])
    : day.attractions || [];

  return raw
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object" && item.name) return String(item.name).trim();
      return "";
    })
    .filter(Boolean);
}

/**
 * Vehicle brands → models mapping for the 2-tier vehicle selector.
 */
export const VEHICLE_BRANDS = [
  "Toyota",
  "Kia",
  "Maruti Suzuki",
  "Hyundai",
  "Mahindra",
  "Tata",
  "Force",
  "Mercedes-Benz",
  "Other",
];

export const VEHICLE_MODELS_BY_BRAND = {
  Toyota: ["Innova Crysta", "Fortuner", "Camry", "Etios", "Glanza"],
  Kia: ["Carens", "Seltos", "Carnival"],
  "Maruti Suzuki": ["Swift Dzire", "Ertiga", "XL6", "Ciaz", "Grand Vitara"],
  Hyundai: ["Creta", "Tucson", "Alcazar", "Verna", "Aura"],
  Mahindra: ["Scorpio-N", "XUV700", "Thar", "XUV300", "Bolero"],
  Tata: ["Safari", "Harrier", "Nexon", "Tigor"],
  Force: ["Tempo Traveller 12-Seater", "Tempo Traveller 17-Seater", "Urbania 15-Seater", "Gurkha"],
  "Mercedes-Benz": ["E-Class", "S-Class", "V-Class", "GLS"],
  Other: [],
};

/**
 * Format a number in Indian Rupee format (₹X,XX,XXX).
 * @param {number|string} amount
 * @returns {string}
 */
export function formatIndianRupee(amount) {
  const num = parseInt(String(amount).replace(/[^\d]/g, ""), 10);
  if (isNaN(num)) return "—";
  return "₹" + num.toLocaleString("en-IN");
}

/**
 * Resolves the accommodation / hotel object for a specific day.
 * Checks day.hotel, day.accommodation, or falls back to itineraryData.selectedHotel
 * or matches city from overnight stop.
 *
 * @param {object} day
 * @param {object} itineraryData
 * @returns {{ name: string, city: string, roomType: string, mealPlan: string, rating: string, address: string, photoUrl: string, isCustom: boolean }}
 */
export function getDayAccommodation(day, itineraryData = {}) {
  const globalHotel = itineraryData?.selectedHotel || {
    name: "Snow Valley Resorts, Manali",
    city: "Manali",
    roomType: "Deluxe Mountain View Room",
    mealPlan: "MAP (Breakfast & Dinner Included)",
    rating: "4.5/5",
    address: "",
  };

  if (!day) return globalHotel;

  // 1. Explicit hotel object on the day
  if (day.hotel && typeof day.hotel === "object" && day.hotel.name) {
    return {
      name: day.hotel.name,
      city: day.hotel.city || day.hotel.name.split(",")[1]?.trim() || globalHotel.city || "",
      roomType: day.hotel.roomType || globalHotel.roomType || "Deluxe Mountain View Room",
      mealPlan: day.hotel.mealPlan || globalHotel.mealPlan || "MAP (Breakfast & Dinner Included)",
      rating: day.hotel.rating || globalHotel.rating || "4.5/5",
      address: day.hotel.address || globalHotel.address || "",
      photoUrl: day.hotel.photoUrl || globalHotel.photoUrl || "",
      isCustom: !!day.hotel.isCustom,
    };
  }

  // 2. Explicit accommodation string on the day
  if (typeof day.accommodation === "string" && day.accommodation.trim()) {
    return {
      name: day.accommodation.trim(),
      city: globalHotel.city || "",
      roomType: globalHotel.roomType || "Deluxe Mountain View Room",
      mealPlan: globalHotel.mealPlan || "MAP (Breakfast & Dinner Included)",
      rating: globalHotel.rating || "4.5/5",
      address: globalHotel.address || "",
      photoUrl: globalHotel.photoUrl || "",
    };
  }

  // 3. Fallback to overnight stop location / tour hotel
  const overnightLoc = getOvernightLocation(day);
  const city = overnightLoc || globalHotel.city || "";

  return {
    name: globalHotel.name,
    city: city || globalHotel.city,
    roomType: globalHotel.roomType || "Deluxe Mountain View Room",
    mealPlan: globalHotel.mealPlan || "MAP (Breakfast & Dinner Included)",
    rating: globalHotel.rating || "4.5/5",
    address: globalHotel.address || "",
    photoUrl: globalHotel.photoUrl || "",
  };
}

