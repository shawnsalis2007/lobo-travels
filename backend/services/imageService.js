import dotenv from "dotenv";

dotenv.config();

// In-memory cache to prevent redundant Pexels API calls
const imageMemoryCache = new Map();

// Curated verified photos for iconic Indian destinations & sights
const KNOWN_ATTRACTION_DIRECT_PHOTOS = {
  // User hardcoded overrides
  "qutub minar": "https://images.unsplash.com/photo-1697729438410-d53c666e3810?w=600&auto=format&fit=crop&q=60",
  "qutb minar": "https://images.unsplash.com/photo-1697729438410-d53c666e3810?w=600&auto=format&fit=crop&q=60",
  "humayun's tomb": "https://images.unsplash.com/photo-1609670289875-590e8ec05c88?w=600&auto=format&fit=crop&q=60",
  "humayuns tomb": "https://images.unsplash.com/photo-1609670289875-590e8ec05c88?w=600&auto=format&fit=crop&q=60",
  "humayun tomb": "https://images.unsplash.com/photo-1609670289875-590e8ec05c88?w=600&auto=format&fit=crop&q=60",
  "india gate": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=60",
  "red fort": "https://images.unsplash.com/photo-1705524220939-dac17cf94236?w=600&auto=format&fit=crop&q=60",
  "lal qila": "https://images.unsplash.com/photo-1705524220939-dac17cf94236?w=600&auto=format&fit=crop&q=60",
  "jaisalmer fort": "https://images.unsplash.com/photo-1713349881676-594b95a5742b?w=600&auto=format&fit=crop&q=60",
  "sonar qila": "https://images.unsplash.com/photo-1713349881676-594b95a5742b?w=600&auto=format&fit=crop&q=60",
  "golden fort": "https://images.unsplash.com/photo-1713349881676-594b95a5742b?w=600&auto=format&fit=crop&q=60",
  "jaisalmer fort (sonar qila / golden fort)": "https://images.unsplash.com/photo-1713349881676-594b95a5742b?w=600&auto=format&fit=crop&q=60",
  "sam sand dunes": "https://plus.unsplash.com/premium_photo-1661936495413-875706d59696?w=600&auto=format&fit=crop&q=60",
  "sam sand dunes camel safari": "https://plus.unsplash.com/premium_photo-1661936495413-875706d59696?w=600&auto=format&fit=crop&q=60",
  "sam sand dunes camel safari & desert camp": "https://plus.unsplash.com/premium_photo-1661936495413-875706d59696?w=600&auto=format&fit=crop&q=60",
  "desert camp jaisalmer": "https://plus.unsplash.com/premium_photo-1661936495413-875706d59696?w=600&auto=format&fit=crop&q=60",
  "patwon ki haveli": "https://images.unsplash.com/photo-1677649117932-4c8abf3e27bb?w=600&auto=format&fit=crop&q=60",
  "patwa haveli": "https://images.unsplash.com/photo-1677649117932-4c8abf3e27bb?w=600&auto=format&fit=crop&q=60",

  // New Ayodhya Attractions
  "shree ram janmabhumi temple": "https://images.unsplash.com/photo-1706696950948-285f1c247348?auto=format&fit=crop&w=800&q=80",
  "ram janmabhumi": "https://images.unsplash.com/photo-1706696950948-285f1c247348?auto=format&fit=crop&w=800&q=80",
  "ram mandir": "https://images.unsplash.com/photo-1706696950948-285f1c247348?auto=format&fit=crop&w=800&q=80",
  "ram janmabhoomi": "https://images.unsplash.com/photo-1706696950948-285f1c247348?auto=format&fit=crop&w=800&q=80",
  "hanuman garhi": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
  "ram ki paidi - saryu river / saryu aarti": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  "ram ki paidi": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  "saryu river": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  "saryu aarti": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  "ayodhya": "https://images.unsplash.com/photo-1706696950948-285f1c247348?auto=format&fit=crop&w=800&q=80",

  // New Gaya & Bodh Gaya Attractions
  "vishnupad temple": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  "mangla gauri temple": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
  "gaya": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
  "mahabodhi temple": "https://images.unsplash.com/photo-1562979314-bee7453e938c?auto=format&fit=crop&w=800&q=80",
  "bodhi tree": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  "great buddha statue": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
  "bodh gaya": "https://images.unsplash.com/photo-1562979314-bee7453e938c?auto=format&fit=crop&w=800&q=80",

  // New Chitrakoot Attractions
  "ramghat": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  "kamadgiri temple": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  "kamadgiri": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  "chitrakoot": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",

  // New Prayagraj Attractions
  "triveni sangam": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
  "sangam prayagraj": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
  "shri bade hanuman ji mandir": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
  "bade hanuman": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
  "prayagraj": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
  "allahabad": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",

  // New Varanasi Attractions
  "dashashwamedh ghat": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  "assi ghat": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
  "shri kashi vishwanath temple": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  "kashi vishwanath": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  "sankat mochan hanuman temple": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
  "kaal bhairav temple": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  "manikarnika ghat": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  "varanasi": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  "banaras": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",

  // Dalhousie & Mcleodganj
  "dalhousie": "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80",
  "khajjiar": "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80",
  "mcleodganj": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  "namgyal monastery": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  "bhagsunag": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",

  // Existing Himachal & North India
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
 * Checks if an attraction has a direct hardcoded override photo
 */
export function getDirectAttractionPhoto(query = "") {
  const q = (query || "").toLowerCase().trim();
  if (!q) return null;

  if (KNOWN_ATTRACTION_DIRECT_PHOTOS[q]) {
    return KNOWN_ATTRACTION_DIRECT_PHOTOS[q];
  }

  for (const [key, url] of Object.entries(KNOWN_ATTRACTION_DIRECT_PHOTOS)) {
    if (q.includes(key) || (key.length > 4 && key.includes(q))) {
      return url;
    }
  }

  return null;
}

/**
 * Returns a suitable fallback placeholder based on keywords in the query.
 */
export function getCuratedFallback(query = "") {
  const directMatch = getDirectAttractionPhoto(query);
  if (directMatch) {
    return directMatch;
  }

  const q = (query || "").toLowerCase().trim();

  // Thematic category fallback
  if (q.includes("temple") || q.includes("mandir") || q.includes("monastery") || q.includes("shrine") || q.includes("church") || q.includes("hadimba") || q.includes("ghat") || q.includes("aarti")) {
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
  if (q.includes("fort") || q.includes("castle") || q.includes("ruin") || q.includes("heritage") || q.includes("naggar") || q.includes("qila")) {
    return FALLBACK_CATEGORY_IMAGES.fort;
  }
  if (q.includes("palace") || q.includes("mahal") || q.includes("haveli")) {
    return FALLBACK_CATEGORY_IMAGES.palace;
  }
  if (q.includes("garden") || q.includes("park") || q.includes("wildlife") || q.includes("sanctuary")) {
    return FALLBACK_CATEGORY_IMAGES.garden;
  }
  if (q.includes("valley") || q.includes("nature") || q.includes("meadow") || q.includes("river") || q.includes("lake") || q.includes("beas") || q.includes("saryu") || q.includes("sangam")) {
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
 * Fetches a destination or activity photo from curated overrides or Pexels API.
 * Ensures hardcoded overrides resolve immediately without depending on general searches.
 *
 * @param {string} query - Destination or attraction name (e.g., "Qutub Minar", "Solang Valley")
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

  // 1. Check in-memory cache first
  if (imageMemoryCache.has(cacheKey)) {
    return imageMemoryCache.get(cacheKey);
  }

  // 2. Direct hardcoded overrides: Never depend on external searches
  const directMatch = getDirectAttractionPhoto(cleanQuery);
  if (directMatch) {
    const directResult = {
      imageUrl: directMatch,
      photographer: "Verified Attraction Archive",
      source: "direct-override",
    };
    imageMemoryCache.set(cacheKey, directResult);
    return directResult;
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
