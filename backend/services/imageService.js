import dotenv from "dotenv";

dotenv.config();

// In-memory cache to prevent redundant Pexels API calls
const imageMemoryCache = new Map();

// Curated high-resolution fallback travel images mapped by common travel themes
const FALLBACK_CATEGORY_IMAGES = {
  mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
  temple: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  snow: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
  valley: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  fort: "https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?auto=format&fit=crop&w=800&q=80",
  palace: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
  market: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
};

/**
 * Returns a suitable fallback placeholder based on keywords in the query.
 */
function getCuratedFallback(query = "") {
  const q = query.toLowerCase();
  if (q.includes("temple") || q.includes("monastery") || q.includes("shrine") || q.includes("church")) {
    return FALLBACK_CATEGORY_IMAGES.temple;
  }
  if (q.includes("snow") || q.includes("glacier") || q.includes("ski") || q.includes("solang") || q.includes("pass")) {
    return FALLBACK_CATEGORY_IMAGES.snow;
  }
  if (q.includes("valley") || q.includes("nature") || q.includes("meadow") || q.includes("river") || q.includes("lake")) {
    return FALLBACK_CATEGORY_IMAGES.valley;
  }
  if (q.includes("fort") || q.includes("castle") || q.includes("ruin") || q.includes("heritage")) {
    return FALLBACK_CATEGORY_IMAGES.fort;
  }
  if (q.includes("palace") || q.includes("mahal") || q.includes("haveli")) {
    return FALLBACK_CATEGORY_IMAGES.palace;
  }
  if (q.includes("mall") || q.includes("market") || q.includes("bazaar") || q.includes("street")) {
    return FALLBACK_CATEGORY_IMAGES.market;
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
