import { db, isFirestoreAvailable, fallbackCache } from "../config/firebase.js";
import { fetchAttractionMetadataFromGemini } from "./geminiService.js";
import { DEFAULT_ATTRACTIONS_SEED } from "../data/preloadedData.js";

const COLLECTION_NAME = "attractions_cache";

// Initialize fallback cache with preloaded seeds
for (const [key, val] of Object.entries(DEFAULT_ATTRACTIONS_SEED)) {
  fallbackCache.set(normalizeKey(key), val);
}

/**
 * Normalizes an attraction name for consistent cache key lookup.
 */
function normalizeKey(name) {
  return (name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
}

/**
 * Checks Firestore first for each attraction.
 * If not found in Firestore, queries Gemini API, stores result in Firestore, then returns.
 *
 * @param {string[]} attractionNames - Array of attraction names to resolve
 * @returns {Promise<Array<{name: string, wikiUrl: string, imageUrl: string, cached: boolean}>>}
 */
export async function getAttractionsWithCaching(attractionNames) {
  if (!Array.isArray(attractionNames) || attractionNames.length === 0) {
    return [];
  }

  // Deduplicate and trim inputs
  const uniqueNames = [...new Set(attractionNames.map((n) => (n || "").trim()).filter(Boolean))];
  const results = [];
  const missingForGemini = [];

  for (const name of uniqueNames) {
    const key = normalizeKey(name);
    let cachedData = null;

    // 1. Try Firestore if available
    if (isFirestoreAvailable && db) {
      try {
        const docRef = db.collection(COLLECTION_NAME).doc(key);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          cachedData = docSnap.data();
          console.log(`⚡ [Cache HIT - Firestore] Found "${name}" in Firestore`);
        }
      } catch (err) {
        console.warn(`⚠️ [Firestore Read Warning] for "${name}":`, err.message);
      }
    }

    // 2. Check fallback memory cache
    if (!cachedData && fallbackCache.has(key)) {
      cachedData = fallbackCache.get(key);
      console.log(`⚡ [Cache HIT - Memory Seed] Found "${name}" in local cache`);
    }

    if (cachedData) {
      results.push({
        ...cachedData,
        cached: true,
      });
    } else {
      console.log(`🔍 [Cache MISS] "${name}" not in cache. Queued for Gemini.`);
      missingForGemini.push(name);
    }
  }

  // 3. Strict Token Diet: Send ONLY missing attractions to Gemini Flash
  if (missingForGemini.length > 0) {
    console.log(`🤖 [Gemini Query] Fetching ${missingForGemini.length} missing attractions...`);
    const freshData = await fetchAttractionMetadataFromGemini(missingForGemini);

    for (const item of freshData) {
      const key = normalizeKey(item.name);
      const dataToSave = {
        name: item.name,
        wikiUrl: item.wikiUrl,
        imageUrl: item.imageUrl,
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore if available
      if (isFirestoreAvailable && db) {
        try {
          await db.collection(COLLECTION_NAME).doc(key).set(dataToSave, { merge: true });
          console.log(`💾 [Firestore WRITE] Cached "${item.name}" to collection "${COLLECTION_NAME}"`);
        } catch (err) {
          console.error(`❌ [Firestore Write Error] Failed to save "${item.name}":`, err.message);
        }
      }

      // Always save to fallback memory cache
      fallbackCache.set(key, dataToSave);

      results.push({
        ...dataToSave,
        cached: false,
      });
    }
  }

  return results;
}
