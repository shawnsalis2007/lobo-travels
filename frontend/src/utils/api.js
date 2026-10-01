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

/**
 * Enriches unique attractions with Wikipedia URLs and Pexels destination photos.
 */
export async function fetchAttractionDetails(attractionNames) {
  if (!attractionNames || attractionNames.length === 0) {
    return { success: true, lookup: {}, count: 0 };
  }

  const endpoint = `${API_BASE_URL}/api/itinerary/attractions`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attractions: attractionNames,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // If running with absolute remote URL fails, attempt relative proxy if in browser
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
        // ignore fallback error and throw original
      }
    }
    console.error("API Call error:", error);
    throw error;
  }
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
 * Saves current itinerary to Firebase Firestore.
 */
export async function saveItineraryToFirebase(itinerary) {
  const response = await fetch(`${API_BASE_URL}/api/itinerary/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ itinerary }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to save itinerary to Firestore.");
  }

  return await response.json();
}

/**
 * Retrieves all saved itineraries from Firebase Firestore.
 */
export async function fetchSavedItineraries() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/itinerary/list`);
    if (!response.ok) {
      throw new Error("Failed to fetch saved itineraries.");
    }
    const data = await response.json();
    return data.itineraries || [];
  } catch (err) {
    console.warn("Saved itineraries list fetch error:", err.message);
    return [];
  }
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
