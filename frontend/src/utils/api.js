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

/**
 * Single-shot Google Places API autofill with Firestore caching in 'hotels' collection.
 */
export async function autofillHotel(hotelName, city = "") {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hotels/autofill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelName, city }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to autofill hotel.");
    }
    return await response.json();
  } catch (err) {
    console.warn("Hotel autofill error:", err);
    throw err;
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
