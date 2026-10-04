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
  // Delhi Landmarks
  "qutub minar": "https://images.pexels.com/photos/17348001/pexels-photo-17348001.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "qutb minar": "https://images.pexels.com/photos/17348001/pexels-photo-17348001.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "humayun's tomb": "https://images.pexels.com/photos/13256094/pexels-photo-13256094.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "humayuns tomb": "https://images.pexels.com/photos/13256094/pexels-photo-13256094.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "humayun tomb": "https://images.pexels.com/photos/13256094/pexels-photo-13256094.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "india gate": "https://images.pexels.com/photos/16952108/pexels-photo-16952108.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "red fort": "https://images.pexels.com/photos/14094276/pexels-photo-14094276.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "lal qila": "https://images.pexels.com/photos/14094276/pexels-photo-14094276.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "lotus temple": "https://images.pexels.com/photos/4727066/pexels-photo-4727066.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "akshardham": "https://images.pexels.com/photos/33971089/pexels-photo-33971089.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "swaminarayan akshardham": "https://images.pexels.com/photos/33971089/pexels-photo-33971089.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "chandni chowk": "https://images.pexels.com/photos/20795328/pexels-photo-20795328.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "jama masjid": "https://images.pexels.com/photos/20083843/pexels-photo-20083843.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

  // Jaisalmer Landmarks
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

  // Ayodhya Attractions
  "shree ram janmabhumi temple": "https://images.pexels.com/photos/36478003/pexels-photo-36478003.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "ram janmabhumi": "https://images.pexels.com/photos/36478003/pexels-photo-36478003.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "ram mandir": "https://images.pexels.com/photos/36478003/pexels-photo-36478003.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "ram janmabhoomi": "https://images.pexels.com/photos/36478003/pexels-photo-36478003.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "hanuman garhi": "https://images.pexels.com/photos/36478011/pexels-photo-36478011.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "ram ki paidi - saryu river / saryu aarti": "https://images.pexels.com/photos/36478020/pexels-photo-36478020.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "ram ki paidi": "https://images.pexels.com/photos/36478020/pexels-photo-36478020.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "saryu river": "https://images.pexels.com/photos/36478020/pexels-photo-36478020.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "saryu aarti": "https://images.pexels.com/photos/36478020/pexels-photo-36478020.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "ayodhya": "https://images.pexels.com/photos/36478003/pexels-photo-36478003.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

  // Gaya & Bodh Gaya Attractions
  "vishnupad temple": "https://images.pexels.com/photos/36065289/pexels-photo-36065289.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "mangla gauri temple": "https://images.pexels.com/photos/36478619/pexels-photo-36478619.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "gaya": "https://images.pexels.com/photos/36065289/pexels-photo-36065289.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "mahabodhi temple": "https://images.pexels.com/photos/8186112/pexels-photo-8186112.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bodhi tree": "https://images.pexels.com/photos/13894274/pexels-photo-13894274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "great buddha statue": "https://images.pexels.com/photos/37181085/pexels-photo-37181085.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bodh gaya": "https://images.pexels.com/photos/8186112/pexels-photo-8186112.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

  // Chitrakoot Attractions
  "ramghat": "https://images.pexels.com/photos/36402970/pexels-photo-36402970.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "kamadgiri temple": "https://images.pexels.com/photos/36402970/pexels-photo-36402970.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "kamadgiri": "https://images.pexels.com/photos/36402970/pexels-photo-36402970.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "chitrakoot": "https://images.pexels.com/photos/36402970/pexels-photo-36402970.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

  // Prayagraj Attractions
  "triveni sangam": "https://images.pexels.com/photos/30218192/pexels-photo-30218192.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "sangam prayagraj": "https://images.pexels.com/photos/30218192/pexels-photo-30218192.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "shri bade hanuman ji mandir": "https://images.pexels.com/photos/36478011/pexels-photo-36478011.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bade hanuman": "https://images.pexels.com/photos/36478011/pexels-photo-36478011.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "prayagraj": "https://images.pexels.com/photos/30218192/pexels-photo-30218192.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "allahabad": "https://images.pexels.com/photos/30218192/pexels-photo-30218192.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

  // Varanasi Attractions
  "dashashwamedh ghat": "https://images.pexels.com/photos/27670662/pexels-photo-27670662.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "assi ghat": "https://images.pexels.com/photos/17869831/pexels-photo-17869831.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "shri kashi vishwanath temple": "https://images.pexels.com/photos/15142391/pexels-photo-15142391.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "kashi vishwanath": "https://images.pexels.com/photos/15142391/pexels-photo-15142391.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "sankat mochan hanuman temple": "https://images.pexels.com/photos/36478619/pexels-photo-36478619.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "kaal bhairav temple": "https://images.pexels.com/photos/36065289/pexels-photo-36065289.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "manikarnika ghat": "https://images.pexels.com/photos/19272041/pexels-photo-19272041.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "varanasi": "https://images.pexels.com/photos/27670662/pexels-photo-27670662.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "banaras": "https://images.pexels.com/photos/27670662/pexels-photo-27670662.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

  // Dalhousie & Mcleodganj
  "dalhousie": "https://images.pexels.com/photos/30104593/pexels-photo-30104593.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "khajjiar": "https://images.pexels.com/photos/30104593/pexels-photo-30104593.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "mcleodganj": "https://images.pexels.com/photos/755401/pexels-photo-755401.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "namgyal monastery": "https://images.pexels.com/photos/37248332/pexels-photo-37248332.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bhagsunag": "https://images.pexels.com/photos/730697/pexels-photo-730697.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bhagsu waterfall": "https://images.pexels.com/photos/730697/pexels-photo-730697.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

  // Himachal & North India
  "hadimba": "https://images.pexels.com/photos/32690108/pexels-photo-32690108.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "hadimba temple": "https://images.pexels.com/photos/32690108/pexels-photo-32690108.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "mall road": "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80",
  "mall road manali": "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80",
  "the mall shimla": "https://images.pexels.com/photos/16777016/pexels-photo-16777016.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "ridge shimla": "https://images.pexels.com/photos/16777016/pexels-photo-16777016.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "solang valley": "https://images.pexels.com/photos/6149892/pexels-photo-6149892.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "solang": "https://images.pexels.com/photos/6149892/pexels-photo-6149892.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "atal tunnel": "https://images.pexels.com/photos/29494193/pexels-photo-29494193.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "rohtang pass": "https://images.pexels.com/photos/35077792/pexels-photo-35077792.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "rohtang": "https://images.pexels.com/photos/35077792/pexels-photo-35077792.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "naggar castle": "https://images.pexels.com/photos/18406578/pexels-photo-18406578.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "naggar": "https://images.pexels.com/photos/18406578/pexels-photo-18406578.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "jogini waterfalls": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
  "jogini": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
  "vashisht": "https://images.pexels.com/photos/31776507/pexels-photo-31776507.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "vashisht hot water springs": "https://images.pexels.com/photos/31776507/pexels-photo-31776507.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "beas river": "https://images.pexels.com/photos/36721869/pexels-photo-36721869.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "kufri": "https://images.pexels.com/photos/21558505/pexels-photo-21558505.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "taj mahal": "https://images.pexels.com/photos/11948442/pexels-photo-11948442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "agra fort": "https://images.pexels.com/photos/31301782/pexels-photo-31301782.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "hawa mahal": "https://images.pexels.com/photos/19867647/pexels-photo-19867647.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "amber fort": "https://images.pexels.com/photos/19446861/pexels-photo-19446861.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "city palace": "https://images.pexels.com/photos/32261804/pexels-photo-32261804.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "dal lake": "https://images.pexels.com/photos/25786714/pexels-photo-25786714.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "gulmarg": "https://images.pexels.com/photos/32620987/pexels-photo-32620987.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
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
