import { db, isFirestoreAvailable } from "../config/firebase.js";

const HOTELS_COLLECTION = "hotels";

// In-memory cache fallback for hotels
const memoryHotelsCache = new Map();

// Known curated Indian luxury & boutique hotels fallback catalog
const CURATED_HOTEL_CATALOG = [
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
  },
];

/**
 * Normalizes a hotel name and optional city into a stable cache key
 */
export function normalizeHotelKey(hotelName, city = "") {
  const raw = `${hotelName || ""} ${city || ""}`.toLowerCase().trim();
  return raw.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * Searches Google Places API (or Curated DB) for rich hotel profile
 */
export async function searchGooglePlacesHotels(hotelName, city = "") {
  if (!hotelName || typeof hotelName !== "string") {
    throw new Error("Hotel name is required.");
  }

  const queryTerm = `${hotelName.trim()} ${city.trim()}`.toLowerCase();

  // 1. Check curated catalog for instant high-res match
  const curated = CURATED_HOTEL_CATALOG.find(
    (c) => queryTerm.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(hotelName.toLowerCase().trim())
  );

  let result = {
    name: hotelName.trim(),
    city: city.trim() || (curated ? curated.city : "India"),
    state: curated ? curated.state : city.trim() || "India",
    address: curated ? curated.address : `${hotelName.trim()}, ${city.trim() ? city.trim() + ", " : ""}India`,
    category: curated ? curated.category : "4 Star",
    rating: curated ? curated.rating : "4.6",
    contractRate: curated ? curated.contractRate : "₹6,500/night",
    photoUrl: curated ? curated.photoUrl : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: curated ? curated.description : `Premium hospitality and comfort in ${city.trim() || "prime location"}.`,
    phone: "",
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotelName.trim() + " " + city.trim())}`,
    source: curated ? "curated-catalog" : "local-resolver",
  };

  const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (placesApiKey && placesApiKey !== "your_google_places_api_key_here") {
    try {
      const query = encodeURIComponent(`${hotelName} hotel ${city}`.trim());
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${placesApiKey}`;
      const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(3500) });
      const searchJson = await searchRes.json();

      if (searchJson.status === "OK" && searchJson.results && searchJson.results.length > 0) {
        const place = searchJson.results[0];
        const placeId = place.place_id;

        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,international_phone_number,url,rating,photos,website,address_components&key=${placesApiKey}`;
        const detailsRes = await fetch(detailsUrl, { signal: AbortSignal.timeout(3500) });
        const detailsJson = await detailsRes.json();

        if (detailsJson.status === "OK" && detailsJson.result) {
          const res = detailsJson.result;
          let photoUrl = result.photoUrl;

          if (Array.isArray(res.photos) && res.photos.length > 0 && res.photos[0].photo_reference) {
            photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${res.photos[0].photo_reference}&key=${placesApiKey}`;
          }

          // Extract state/city from address components if available
          let state = result.state;
          let foundCity = result.city;
          if (Array.isArray(res.address_components)) {
            for (const comp of res.address_components) {
              if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
              if (comp.types.includes("locality")) foundCity = comp.long_name;
            }
          }

          result = {
            name: res.name || hotelName,
            city: foundCity || city.trim(),
            state: state || city.trim(),
            address: res.formatted_address || result.address,
            phone: res.formatted_phone_number || res.international_phone_number || "",
            mapsUrl: res.url || result.mapsUrl,
            rating: res.rating ? String(res.rating) : result.rating,
            category: res.rating && res.rating >= 4.5 ? "5 Star Luxury" : "4 Star",
            contractRate: result.contractRate,
            photoUrl,
            description: result.description,
            website: res.website || "",
            placeId,
            source: "google-places-api",
          };
        }
      }
    } catch (apiErr) {
      console.warn("⚠️ [Google Places API Warning]:", apiErr.message);
    }
  }

  return result;
}

/**
 * Saves a hotel into Firestore / Memory cache
 */
export async function saveCustomHotel(hotelData) {
  const cacheKey = normalizeHotelKey(hotelData.name, hotelData.city);
  const docData = {
    ...hotelData,
    id: hotelData.id || `custom-${cacheKey}`,
    cacheKey,
    updatedAt: new Date().toISOString(),
    createdAt: hotelData.createdAt || new Date().toISOString(),
  };

  if (isFirestoreAvailable && db) {
    try {
      await db.collection(HOTELS_COLLECTION).doc(cacheKey).set(docData, { merge: true });
      console.log(`💾 [Firestore] Saved custom hotel "${docData.name}"`);
    } catch (err) {
      console.warn("⚠️ [Firestore Hotel Save Error]:", err.message);
    }
  }

  memoryHotelsCache.set(cacheKey, docData);
  return docData;
}

/**
 * Lists all stored custom/cached hotels
 */
export async function listAllCustomHotels() {
  const list = [];
  if (isFirestoreAvailable && db) {
    try {
      const snap = await db.collection(HOTELS_COLLECTION).orderBy("updatedAt", "desc").limit(100).get();
      snap.forEach((d) => list.push(d.data()));
    } catch (err) {
      console.warn("⚠️ [Firestore Hotel List Error]:", err.message);
    }
  }

  if (list.length === 0) {
    for (const v of memoryHotelsCache.values()) {
      list.push(v);
    }
  }

  return list;
}

/**
 * Legacy autofill compatibility wrapper
 */
export async function autofillHotelDetails(hotelName, city = "") {
  return await searchGooglePlacesHotels(hotelName, city);
}

