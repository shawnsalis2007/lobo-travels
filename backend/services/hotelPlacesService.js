import { db, isFirestoreAvailable } from "../config/firebase.js";

const HOTELS_COLLECTION = "hotels";

// In-memory cache fallback for hotels
const memoryHotelsCache = new Map();

/**
 * Normalizes a hotel name and optional city into a stable cache key
 * @param {string} hotelName
 * @param {string} [city]
 * @returns {string}
 */
export function normalizeHotelKey(hotelName, city = "") {
  const raw = `${hotelName || ""} ${city || ""}`.toLowerCase().trim();
  return raw.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * Autofills hotel details (address, phone, Google Maps URL, photos, rating)
 * Architecture:
 * 1. Checks Firestore `hotels` collection first (cached).
 * 2. If miss, calls Google Places API once using GOOGLE_PLACES_API_KEY.
 * 3. Saves result in Firestore `hotels` collection for all future reads.
 * 4. Falls back gracefully with curated/smart defaults if key is missing or on error.
 *
 * @param {string} hotelName
 * @param {string} [city]
 * @returns {Promise<object>}
 */
export async function autofillHotelDetails(hotelName, city = "") {
  if (!hotelName || typeof hotelName !== "string") {
    throw new Error("hotelName is required.");
  }

  const cacheKey = normalizeHotelKey(hotelName, city);

  // 1. Check Firestore Cache
  if (isFirestoreAvailable && db) {
    try {
      const doc = await db.collection(HOTELS_COLLECTION).doc(cacheKey).get();
      if (doc.exists) {
        console.log(`🏨 [Firestore Hotel Cache HIT] "${cacheKey}"`);
        return { ...doc.data(), cached: true, source: "firestore-cache" };
      }
    } catch (err) {
      console.warn("⚠️ [Firestore Hotel Read Error]:", err.message);
    }
  } else if (memoryHotelsCache.has(cacheKey)) {
    console.log(`🏨 [Memory Hotel Cache HIT] "${cacheKey}"`);
    return { ...memoryHotelsCache.get(cacheKey), cached: true, source: "memory-cache" };
  }

  console.log(`🏨 [Hotel Cache MISS] Fetching details for "${hotelName}" in "${city}"...`);

  let hotelData = {
    name: hotelName.trim(),
    city: city.trim(),
    address: `${hotelName.trim()}, ${city.trim() ? city.trim() + ", " : ""}India`,
    phone: "",
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotelName.trim() + " " + city.trim())}`,
    rating: "4.5",
    photos: [],
    website: "",
    source: "local-resolver",
  };

  const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (placesApiKey && placesApiKey !== "your_google_places_api_key_here") {
    try {
      // Step 1: Text Search for Place ID
      const query = encodeURIComponent(`${hotelName} ${city}`.trim());
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${placesApiKey}`;
      const searchRes = await fetch(searchUrl);
      const searchJson = await searchRes.json();

      if (searchJson.status === "OK" && searchJson.results && searchJson.results.length > 0) {
        const place = searchJson.results[0];
        const placeId = place.place_id;

        // Step 2: Fetch Details
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,international_phone_number,url,rating,photos,website&key=${placesApiKey}`;
        const detailsRes = await fetch(detailsUrl);
        const detailsJson = await detailsRes.json();

        if (detailsJson.status === "OK" && detailsJson.result) {
          const res = detailsJson.result;
          const photoUrls = [];

          if (Array.isArray(res.photos)) {
            for (const p of res.photos.slice(0, 3)) {
              if (p.photo_reference) {
                photoUrls.push(
                  `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${placesApiKey}`
                );
              }
            }
          }

          hotelData = {
            name: res.name || hotelName,
            city: city.trim(),
            address: res.formatted_address || hotelData.address,
            phone: res.formatted_phone_number || res.international_phone_number || "",
            mapsUrl: res.url || hotelData.mapsUrl,
            rating: res.rating ? String(res.rating) : hotelData.rating,
            photos: photoUrls,
            website: res.website || "",
            placeId,
            source: "google-places-api",
          };
          console.log(`✅ [Google Places API] Resolved hotel: ${hotelData.name}`);
        }
      }
    } catch (apiErr) {
      console.error("❌ [Google Places API Error]:", apiErr.message);
    }
  }

  // 3. Save to Firestore collection 'hotels'
  const savedDocument = {
    ...hotelData,
    cacheKey,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isFirestoreAvailable && db) {
    try {
      await db.collection(HOTELS_COLLECTION).doc(cacheKey).set(savedDocument, { merge: true });
      console.log(`💾 [Firestore] Cached hotel "${cacheKey}"`);
    } catch (saveErr) {
      console.warn("⚠️ [Firestore Hotel Write Error]:", saveErr.message);
    }
  } else {
    memoryHotelsCache.set(cacheKey, savedDocument);
  }

  return { ...savedDocument, cached: false };
}
