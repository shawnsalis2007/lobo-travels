import dotenv from "dotenv";

dotenv.config();

// In-memory cache to prevent redundant Pexels API calls
const imageMemoryCache = new Map();

// Curated verified photos for iconic Indian destinations & sights
const KNOWN_ATTRACTION_DIRECT_PHOTOS = {
  "hadimba": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  "hadimba temple": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  "mall road": "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80",
  "mall road manali": "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80",
  "the mall shimla": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  "solang valley": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
  "solang": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
  "atal tunnel": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
  "rohtang pass": "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
  "rohtang": "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
  "naggar castle": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
  "naggar": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
  "jogini waterfalls": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
  "jogini": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
  "vashisht": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
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

// Curated high-resolution fallback travel images mapped by common travel themes
const FALLBACK_CATEGORY_IMAGES = {
  mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
  temple: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  snow: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
  valley: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
  fort: "https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?auto=format&fit=crop&w=800&q=80",
  palace: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
  market: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  waterfall: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
  garden: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
};

/**
 * Returns a suitable fallback placeholder based on keywords in the query.
 */
export function getCuratedFallback(query = "") {
  const q = query.toLowerCase().trim();

  // 1. Check known specific attractions first
  if (KNOWN_ATTRACTION_DIRECT_PHOTOS[q]) {
    return KNOWN_ATTRACTION_DIRECT_PHOTOS[q];
  }
  for (const [key, url] of Object.entries(KNOWN_ATTRACTION_DIRECT_PHOTOS)) {
    if (q.includes(key) || key.includes(q)) {
      return url;
    }
  }

  // 2. Thematic category fallback
  if (q.includes("temple") || q.includes("mandir") || q.includes("monastery") || q.includes("shrine") || q.includes("church") || q.includes("hadimba")) {
    return FALLBACK_CATEGORY_IMAGES.temple;
  }
  if (q.includes("snow") || q.includes("glacier") || q.includes("ski") || q.includes("solang") || q.includes("pass") || q.includes("tunnel") || q.includes("rohtang")) {
    return FALLBACK_CATEGORY_IMAGES.snow;
  }
  if (q.includes("waterfall") || q.includes("falls") || q.includes("jogini") || q.includes("springs")) {
    return FALLBACK_CATEGORY_IMAGES.waterfall;
  }
  if (q.includes("mall") || q.includes("market") || q.includes("bazaar") || q.includes("street") || q.includes("shopping")) {
    return FALLBACK_CATEGORY_IMAGES.market;
  }
  if (q.includes("fort") || q.includes("castle") || q.includes("ruin") || q.includes("heritage") || q.includes("naggar")) {
    return FALLBACK_CATEGORY_IMAGES.fort;
  }
  if (q.includes("palace") || q.includes("mahal") || q.includes("haveli")) {
    return FALLBACK_CATEGORY_IMAGES.palace;
  }
  if (q.includes("garden") || q.includes("park") || q.includes("wildlife") || q.includes("sanctuary")) {
    return FALLBACK_CATEGORY_IMAGES.garden;
  }
  if (q.includes("valley") || q.includes("nature") || q.includes("meadow") || q.includes("river") || q.includes("lake") || q.includes("beas")) {
    return FALLBACK_CATEGORY_IMAGES.valley;
  }
  if (q.includes("mountain") || q.includes("hill") || q.includes("peak") || q.includes("ridge") || q.includes("trek")) {
    return FALLBACK_CATEGORY_IMAGES.mountain;
  }
  if (q.includes("beach") || q.includes("sea") || q.includes("coast") || q.includes("island")) {
    return FALLBACK_CATEGORY_IMAGES.beach;
  }
  return FALLBACK_CATEGORY_IMAGES.default;
}

/**
 * Fetches a destination or activity photo from Pexels API.
 * Falls back to high-resolution travel placeholders if Pexels API key is not provided,
 * if rate limits are exceeded, or if no matching photos are returned.
 *
 * @param {string} query - Destination or attraction name (e.g., "Solang Valley", "Hadimba Temple")
 * @returns {Promise<{imageUrl: string, photographer: string, source: string}>}
 */
export async function fetchPhotoForDestination(query) {
  if (!query || typeof query !== "string" || !query.trim()) {
    return {
      imageUrl: FALLBACK_CATEGORY_IMAGES.default,
      photographer: "Lobo Travels Studio",
      source: "fallback-placeholder",
    };
  }

  const cleanQuery = query.trim();
  const cacheKey = cleanQuery.toLowerCase();

  // Check in-memory cache first
  if (imageMemoryCache.has(cacheKey)) {
    return imageMemoryCache.get(cacheKey);
  }

  const pexelsApiKey = process.env.PEXELS_API_KEY;

  if (pexelsApiKey && pexelsApiKey !== "your_pexels_api_key_here") {
    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(cleanQuery)}&per_page=1&orientation=landscape`;
      console.log(`📸 [Pexels API] Searching photo for: "${cleanQuery}"`);

      const response = await fetch(url, {
        headers: {
          Authorization: pexelsApiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.photos && data.photos.length > 0) {
          const photo = data.photos[0];
          const result = {
            imageUrl: photo.src.large || photo.src.medium || photo.src.original,
            photographer: photo.photographer || "Pexels Contributor",
            photographerUrl: photo.photographer_url || "",
            source: "pexels",
          };

          // Cache and return
          imageMemoryCache.set(cacheKey, result);
          return result;
        } else {
          console.warn(`⚠️ [Pexels API] No photos found for "${cleanQuery}". Using curated fallback.`);
        }
      } else {
        console.warn(`⚠️ [Pexels API] Status ${response.status} for "${cleanQuery}". Using fallback.`);
      }
    } catch (err) {
      console.error(`❌ [Pexels API Error] Failed to fetch photo for "${cleanQuery}":`, err.message);
    }
  }

  // Curated fallback placeholder
  const fallbackResult = {
    imageUrl: getCuratedFallback(cleanQuery),
    photographer: "Unsplash Travel Archive",
    source: "curated-fallback",
  };

  imageMemoryCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

/**
 * Enriches an array of attraction names or activity items with photo URLs.
 *
 * @param {Array<string | object>} items - Array of attraction strings or activity objects
 * @returns {Promise<Array<object>>}
 */
export async function attachPhotosToActivities(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const enriched = [];

  for (const item of items) {
    if (typeof item === "string") {
      const photoData = await fetchPhotoForDestination(item);
      enriched.push({
        name: item,
        imageUrl: photoData.imageUrl,
        photographer: photoData.photographer,
        source: photoData.source,
      });
    } else if (typeof item === "object" && item !== null) {
      const searchKey = item.name || item.title || item.attraction || "Travel destination";
      // If photo is already present and valid, retain it
      if (item.imageUrl && item.imageUrl.startsWith("http")) {
        enriched.push(item);
      } else {
        const photoData = await fetchPhotoForDestination(searchKey);
        enriched.push({
          ...item,
          imageUrl: photoData.imageUrl,
          photographer: photoData.photographer,
          source: photoData.source,
        });
      }
    }
  }

  return enriched;
}
