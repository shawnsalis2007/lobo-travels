import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
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
  "bodhi tree": "https://images.pexels.com/photos/13894274/pexels-photo-13894274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
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
  "rohtang pass": "https://images.pexels.com/photos/35077792/pexels-photo-35077792.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "rohtang": "https://images.pexels.com/photos/35077792/pexels-photo-35077792.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "naggar castle": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
  "naggar": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
  "jogini waterfalls": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
  "jogini": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
  "vashisht": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
  "beas river": "https://images.pexels.com/photos/36721869/pexels-photo-36721869.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "kufri": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
  "taj mahal": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
  "agra fort": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
  "hawa mahal": "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80",
  "amber fort": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  "city palace": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
  "dal lake": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
  "gulmarg": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
  "golden temple": "https://images.pexels.com/photos/14890717/pexels-photo-14890717.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "golden temple amritsar": "https://images.pexels.com/photos/14890717/pexels-photo-14890717.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "pangong lake": "https://images.pexels.com/photos/27593915/pexels-photo-27593915.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "pangong tso": "https://images.pexels.com/photos/27593915/pexels-photo-27593915.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
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
 * Returns a suitable fallback placeholder based on keywords in the query if verified, else null.
 */
export function getCuratedFallback(query = "") {
  const directMatch = getDirectAttractionPhoto(query);
  if (directMatch) {
    return directMatch;
  }
  return null;
}

/**
 * Fetches a destination or activity photo from curated overrides or Pexels API.
 * Ensures hardcoded overrides resolve immediately without depending on general searches.
 * If neither a verified override nor a relevant Pexels photo is found, returns { imageUrl: null, photographer: null, source: "no-image" }.
 *
 * @param {string} query - Destination or attraction name (e.g., "Qutub Minar", "Solang Valley")
 * @returns {Promise<{imageUrl: string | null, photographer: string | null, source: string}>}
 */
export async function fetchPhotoForDestination(query) {
  if (!query || typeof query !== "string" || !query.trim()) {
    return {
      imageUrl: null,
      photographer: null,
      source: "no-image",
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
      const searchPexels = async (searchTerm) => {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=3&orientation=landscape`;
        console.log(`📸 [Pexels API] Searching photo for: "${searchTerm}"`);

        const response = await fetch(url, {
          headers: {
            Authorization: pexelsApiKey,
          },
        });

        if (!response.ok) return null;
        const data = await response.json();
        if (!data || !data.photos || data.photos.length === 0) return null;

        // Verify photo relevance using meaningful query tokens
        const qTokens = searchTerm
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length > 2 && !["and", "the", "for", "with", "near", "road", "city", "camp"].includes(w));

        for (const photo of data.photos) {
          const photoMeta = `${photo.alt || ""} ${photo.url || ""}`.toLowerCase();
          const isMatch = qTokens.length === 0 || qTokens.some((tok) => photoMeta.includes(tok));
          if (isMatch) {
            return {
              imageUrl: photo.src.large || photo.src.medium || photo.src.original,
              photographer: photo.photographer || "Pexels Contributor",
              photographerUrl: photo.photographer_url || "",
              source: "pexels",
            };
          }
        }
        return null;
      };

      // Search with full clean query
      let pexelsResult = await searchPexels(cleanQuery);

      // If no match and query has parenthetical note or delimiters, search with cleaned base name
      if (!pexelsResult && (cleanQuery.includes("(") || cleanQuery.includes("/") || cleanQuery.includes("-"))) {
        const simplifiedQuery = cleanQuery.replace(/\(.*?\)/g, "").replace(/[-/].*$/, "").trim();
        if (simplifiedQuery && simplifiedQuery.length > 2 && simplifiedQuery !== cleanQuery) {
          pexelsResult = await searchPexels(simplifiedQuery);
        }
      }

      if (pexelsResult) {
        imageMemoryCache.set(cacheKey, pexelsResult);
        return pexelsResult;
      } else {
        console.warn(`⚠️ [Pexels API] No verified photos found for "${cleanQuery}". No fallback image attached.`);
      }
    } catch (err) {
      console.error(`❌ [Pexels API Error] Failed to fetch photo for "${cleanQuery}":`, err.message);
    }
  }

  // Strictly respect: if images are not available in pexels then don't add any
  const noImageResult = {
    imageUrl: null,
    photographer: null,
    source: "no-image",
  };

  imageMemoryCache.set(cacheKey, noImageResult);
  return noImageResult;
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
