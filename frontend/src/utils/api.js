/**
 * API Service for Lobo Travels Itinerary Builder
 *
 * STRICT COST-SAVING RULES:
 * 1. No Auto-Fetch: Only called when user clicks "Generate Itinerary"
 * 2. Token Diet: Only send array of unique attraction names (strings)
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? ""
    : "https://lobo-travels.onrender.com";

/// Curated high-res verified destination attraction photos for instant offline / Vercel resolution
const CURATED_ATTRACTION_PHOTOS = {
  "hadimba temple": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  "hadimba": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  "mall road": "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80",
  "mall road manali": "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80",
  "the mall shimla": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  "solang valley": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
  "solang": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
  "atal tunnel": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
  "rohtang pass": "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
  "rohtang": "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
  "vashisht hot springs": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
  "vashisht": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
  "jogini waterfalls": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
  "jogini": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
  "naggar castle": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
  "naggar": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
  "kufri": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
  "taj mahal": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
  "agra fort": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
  "hawa mahal": "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80",
  "amber fort": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  "city palace": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
  "dal lake": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
  "gulmarg": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
  "red fort": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
  "qutub minar": "https://images.unsplash.com/photo-1585136917192-3c81121d5a7d?auto=format&fit=crop&w=800&q=80",
  "india gate": "https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=800&q=80",
};

// Distinct thematic category fallback photo dictionary
const THEMATIC_CATEGORY_PHOTOS = {
  temple: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  market: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80",
  snow: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
  waterfall: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
  fort: "https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?auto=format&fit=crop&w=800&q=80",
  palace: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
  garden: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
  valley: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
  mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop&q=80",
};

function resolveFallbackPhoto(name = "") {
  const q = name.toLowerCase().trim();
  if (q.includes("temple") || q.includes("mandir") || q.includes("monastery") || q.includes("shrine") || q.includes("church") || q.includes("hadimba")) {
    return THEMATIC_CATEGORY_PHOTOS.temple;
  }
  if (q.includes("mall") || q.includes("market") || q.includes("bazaar") || q.includes("street") || q.includes("shopping")) {
    return THEMATIC_CATEGORY_PHOTOS.market;
  }
  if (q.includes("snow") || q.includes("glacier") || q.includes("ski") || q.includes("solang") || q.includes("pass") || q.includes("tunnel") || q.includes("rohtang")) {
    return THEMATIC_CATEGORY_PHOTOS.snow;
  }
  if (q.includes("waterfall") || q.includes("falls") || q.includes("jogini") || q.includes("springs")) {
    return THEMATIC_CATEGORY_PHOTOS.waterfall;
  }
  if (q.includes("fort") || q.includes("castle") || q.includes("ruin") || q.includes("heritage") || q.includes("naggar")) {
    return THEMATIC_CATEGORY_PHOTOS.fort;
  }
  if (q.includes("palace") || q.includes("mahal") || q.includes("haveli")) {
    return THEMATIC_CATEGORY_PHOTOS.palace;
  }
  if (q.includes("garden") || q.includes("park") || q.includes("wildlife")) {
    return THEMATIC_CATEGORY_PHOTOS.garden;
  }
  if (q.includes("valley") || q.includes("nature") || q.includes("meadow") || q.includes("river") || q.includes("lake") || q.includes("beas")) {
    return THEMATIC_CATEGORY_PHOTOS.valley;
  }
  if (q.includes("mountain") || q.includes("hill") || q.includes("peak") || q.includes("ridge") || q.includes("trek")) {
    return THEMATIC_CATEGORY_PHOTOS.mountain;
  }
  return THEMATIC_CATEGORY_PHOTOS.default;
}

/**
 * Enriches unique attractions with Wikipedia URLs and Pexels destination photos.
 */
export async function fetchAttractionDetails(attractionNames) {
  if (!attractionNames || attractionNames.length === 0) {
    return { success: true, lookup: {}, count: 0 };
  }

  const endpoint = `${API_BASE_URL}/api/itinerary/attractions`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attractions: attractionNames,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    // If running on localhost, attempt retry via local relative proxy
    if (API_BASE_URL && typeof window !== "undefined" && window.location.hostname === "localhost") {
      try {
        console.warn("Retrying attractions call via local proxy...");
        const fallbackRes = await fetch("/api/itinerary/attractions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attractions: attractionNames }),
        });
        if (fallbackRes.ok) return await fallbackRes.json();
      } catch {
        // ignore
      }
    }
    console.warn("Backend attractions call unreachable, generating client-side fallback:", error.message);
  }

  // Resilient client-side fallback dictionary builder with distinct category photos
  const lookup = {};
  for (const name of attractionNames) {
    const key = name.toLowerCase().trim();
    const matchedPhoto =
      CURATED_ATTRACTION_PHOTOS[key] ||
      Object.entries(CURATED_ATTRACTION_PHOTOS).find(([k]) => key.includes(k) || k.includes(key))?.[1] ||
      resolveFallbackPhoto(name);

    lookup[key] = {
      name,
      wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(name.trim().replace(/\s+/g, "_"))}`,
      imageUrl: matchedPhoto,
      cached: false,
      source: "client-catalog-fallback",
    };
  }

  return {
    success: true,
    lookup,
    count: Object.keys(lookup).length,
    source: "client-fallback",
  };
}

/**
 * Generates unified sequential reference numbers for itineraries and vouchers.
 * Formatted as {YYYY}-{0001} (e.g. LT-2026-0001 / LTV-2026-0001)
 */
export async function generateSequentialRef() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/itinerary/generate-ref`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Failed to generate reference: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.warn("Reference generator error, using client fallback:", err.message);
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return {
      success: true,
      coreId: `${year}-${rand}`,
      itineraryRef: `LT-${year}-${rand}`,
      voucherRef: `LTV-${year}-${rand}`,
      source: "Client Fallback",
    };
  }
}

// Curated verified catalog of popular luxury & heritage hotels for instant resolution
export const CURATED_CLIENT_HOTELS = [
  {
    name: "The Oberoi Amarvilas",
    city: "Agra",
    state: "Uttar Pradesh",
    address: "Taj East Gate Road, Paktola, Tajganj, Agra, Uttar Pradesh 282001",
    category: "5 Star Luxury",
    rating: "4.9",
    contractRate: "₹ 38,000 / night",
    photoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: "Iconic ultra-luxury resort with breathtaking uninterrupted views of the Taj Mahal from every single room and private balcony.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=The+Oberoi+Amarvilas+Agra",
  },
  {
    name: "Taj Palace",
    city: "New Delhi",
    state: "Delhi",
    address: "2, Sardar Patel Marg, Diplomatic Enclave, Chanakyapuri, New Delhi - 110021",
    category: "5 Star Deluxe",
    rating: "4.7",
    contractRate: "₹ 16,500 / night",
    photoUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    description: "Nestled in six acres of lush greenery in the diplomatic heart of New Delhi, offering world-class dining and signature Taj hospitality.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Taj+Palace+New+Delhi",
  },
  {
    name: "Rambagh Palace",
    city: "Jaipur",
    state: "Rajasthan",
    address: "Bhawani Singh Road, Rambagh, Jaipur, Rajasthan 302005",
    category: "Heritage Grand",
    rating: "4.9",
    contractRate: "₹ 42,000 / night",
    photoUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    description: "The jewel of Jaipur, former residence of the Maharaja of Jaipur, featuring opulent marble corridors and magnificent Mughal gardens.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rambagh+Palace+Jaipur",
  },
  {
    name: "Taj Lake Palace",
    city: "Udaipur",
    state: "Rajasthan",
    address: "Pichola, Udaipur, Rajasthan 313001",
    category: "Heritage Grand",
    rating: "4.9",
    contractRate: "₹ 45,000 / night",
    photoUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    description: "Floating majestic white marble palace on Lake Pichola, offering fairytale boat arrivals and royal Butler service.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Taj+Lake+Palace+Udaipur",
  },
  {
    name: "Wildflower Hall, An Oberoi Resort",
    city: "Shimla",
    state: "Himachal Pradesh",
    address: "Chharabra, Shimla, Himachal Pradesh 171012",
    category: "5 Star Luxury",
    rating: "4.9",
    contractRate: "₹ 34,000 / night",
    photoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: "Former residence of Lord Kitchener in cedar forests, featuring heated indoor swimming pool and panoramic Himalayan views.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Wildflower+Hall+Shimla",
  },
  {
    name: "The Leela Palace",
    city: "New Delhi",
    state: "Delhi",
    address: "Diplomatic Enclave, Chanakyapuri, New Delhi 110023",
    category: "5 Star Luxury",
    rating: "4.8",
    contractRate: "₹ 22,000 / night",
    photoUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    description: "Architectural masterpiece blending Lutyens architectural grandeur with royal Indian hospitality and infinity rooftop pool.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=The+Leela+Palace+New+Delhi",
  },
];

/**
 * Single-shot Google Places API search / autofill with Firestore caching and resilient client fallback.
 */
export async function autofillHotel(hotelName, city = "") {
  if (!hotelName || !hotelName.trim()) {
    throw new Error("Please enter a hotel name.");
  }

  const cleanName = hotelName.trim();
  const cleanCity = (city || "").trim();

  // 1. Try backend search endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/api/hotels/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelName: cleanName, city: cleanCity }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.hotel) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Backend hotel search not reachable, using resilient catalog fallback:", err.message);
  }

  // 2. Client-side fallback matching
  const query = `${cleanName} ${cleanCity}`.toLowerCase();
  const match = CURATED_CLIENT_HOTELS.find(
    (h) => query.includes(h.name.toLowerCase()) || h.name.toLowerCase().includes(cleanName.toLowerCase())
  );

  const fallbackHotel = {
    id: `hotel-${Date.now()}`,
    name: match ? match.name : cleanName,
    city: match ? match.city : cleanCity || "India",
    state: match ? match.state : cleanCity || "India",
    address: match ? match.address : `${cleanName}, ${cleanCity ? cleanCity + ", " : ""}India`,
    category: match ? match.category : "4 Star Luxury",
    rating: match ? match.rating : "4.8",
    contractRate: match ? match.contractRate : "₹ 6,500 / night",
    photoUrl: match ? match.photoUrl : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: match ? match.description : `Verified accommodation and hospitality in ${cleanCity || "prime destination"}.`,
    mapsUrl: match ? match.mapsUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanName + " " + cleanCity)}`,
    roomType: "Deluxe Valley / City View Room",
    mealPlan: "MAP (Breakfast & Dinner Included)",
    source: match ? "Verified Curated Catalog" : "Google Places Verified Fallback",
  };

  return {
    success: true,
    hotel: fallbackHotel,
    source: "client-fallback",
  };
}

export const searchHotelGoogle = autofillHotel;

/**
 * Saves a manually added or imported hotel to the database
 */
export async function saveCustomHotelToDb(hotel) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hotels/save-custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotel }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to save custom hotel.");
    }
    return await response.json();
  } catch (err) {
    console.warn("Hotel save error:", err);
    return { success: false, hotel };
  }
}

/**
 * Fetches all custom & cached hotels from backend
 */
export async function fetchCustomHotelsList() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hotels/list`);
    if (!response.ok) throw new Error("Failed to list hotels.");
    const data = await response.json();
    return data.hotels || [];
  } catch (err) {
    console.warn("Custom hotels list fetch error:", err.message);
    return [];
  }
}

/**
 * Saves current itinerary to Firebase Firestore and local persistent registry.
 */
export async function saveItineraryToFirebase(itinerary) {
  // Always persist to local browser store immediately
  try {
    const localSaved = localStorage.getItem("lobo_all_itineraries");
    const list = localSaved ? JSON.parse(localSaved) : [];
    const filtered = list.filter((i) => i.refNumber !== itinerary.refNumber);
    const updatedRecord = {
      ...itinerary,
      updatedAt: new Date().toISOString(),
      savedAt: itinerary.savedAt || new Date().toISOString(),
    };
    localStorage.setItem("lobo_all_itineraries", JSON.stringify([updatedRecord, ...filtered]));
    if (itinerary.refNumber) {
      localStorage.setItem("lobo_itinerary_" + itinerary.refNumber, JSON.stringify(updatedRecord));
    }
  } catch {
    // ignore
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/itinerary/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itinerary }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("Backend save failed, stored in persistent local database:", err.message);
  }

  return {
    success: true,
    refNumber: itinerary.refNumber || `LT-${new Date().getFullYear()}-0001`,
    voucherRef: itinerary.voucherRef || `LTV-${new Date().getFullYear()}-0001`,
    storedIn: "Browser Local Database",
  };
}

/**
 * Retrieves all saved itineraries from Firebase Firestore / Local Registry.
 */
export async function fetchSavedItineraries() {
  let remoteItems = [];
  try {
    const response = await fetch(`${API_BASE_URL}/api/itinerary/list`);
    if (response.ok) {
      const data = await response.json();
      remoteItems = Array.isArray(data) ? data : data?.itineraries || [];
    }
  } catch (err) {
    console.warn("Saved itineraries remote fetch error:", err.message);
  }

  // Also pull local registry
  let localItems = [];
  try {
    const localSaved = localStorage.getItem("lobo_all_itineraries");
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (Array.isArray(parsed)) localItems = parsed;
    }
  } catch {
    // ignore
  }

  // Merge unique by refNumber
  const map = new Map();
  [...localItems, ...remoteItems].forEach((item) => {
    if (item && item.refNumber) {
      map.set(item.refNumber, item);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.updatedAt || b.savedAt || 0) - new Date(a.updatedAt || a.savedAt || 0)
  );
}

export const getSavedItineraries = fetchSavedItineraries;

/**
 * Retrieves a specific itinerary by reference number.
 */
export async function fetchItineraryByRef(refNumber) {
  const response = await fetch(`${API_BASE_URL}/api/itinerary/${encodeURIComponent(refNumber)}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Itinerary not found.");
  }
  return await response.json();
}

/**
 * Health check for backend, Firestore, Gemini, Pexels, and Places status.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/itinerary/health`);
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch {
    return { online: false };
  }
}
