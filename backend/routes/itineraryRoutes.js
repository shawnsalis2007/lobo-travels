import express from "express";
import { getAttractionsWithCaching } from "../services/attractionCacheService.js";
import { fetchPhotoForDestination, attachPhotosToActivities } from "../services/imageService.js";
import { autofillHotelDetails } from "../services/hotelPlacesService.js";
import { getNextSequentialReference } from "../services/referenceCounterService.js";
import { db, isFirestoreAvailable, fallbackItineraries } from "../config/firebase.js";

const router = express.Router();
const ITINERARIES_COLLECTION = "itineraries";

/**
 * GET /api/itinerary/health
 * Returns service status for Firebase, Gemini, Pexels, and Google Places
 */
router.get("/health", (req, res) => {
  res.json({
    status: "online",
    service: "Lobo Travels Itinerary Builder API",
    firestoreConnected: isFirestoreAvailable,
    geminiConfigured: Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
    ),
    pexelsConfigured: Boolean(
      process.env.PEXELS_API_KEY &&
        process.env.PEXELS_API_KEY !== "your_pexels_api_key_here"
    ),
    placesConfigured: Boolean(
      process.env.GOOGLE_PLACES_API_KEY &&
        process.env.GOOGLE_PLACES_API_KEY !== "your_google_places_api_key_here"
    ),
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/itinerary/generate-ref
 * Generates unified sequential reference numbers using atomic Firestore transaction.
 * Output: { itineraryRef: "LT-2026-0001", voucherRef: "LTV-2026-0001", coreId: "2026-0001" }
 */
router.post("/generate-ref", async (req, res) => {
  try {
    const refData = await getNextSequentialReference();
    return res.json({
      success: true,
      ...refData,
    });
  } catch (error) {
    console.error("❌ [API Error] /api/itinerary/generate-ref:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate sequential reference numbers.",
      error: error.message,
    });
  }
});

/**
 * POST /api/itinerary/hotels/autofill  (also available at /api/hotels/autofill)
 * Single-shot Google Places API route with Firestore caching in 'hotels' collection.
 * Body: { hotelName: "Snow Valley Resorts", city: "Manali" }
 */
router.post("/hotels/autofill", async (req, res) => {
  try {
    const { hotelName, city } = req.body;

    if (!hotelName || typeof hotelName !== "string") {
      return res.status(400).json({
        success: false,
        message: "'hotelName' is required.",
      });
    }

    console.log(`🏨 [POST /api/itinerary/hotels/autofill] Autofilling hotel "${hotelName}" in "${city || ""}"`);

    const hotel = await autofillHotelDetails(hotelName, city);

    return res.json({
      success: true,
      hotel,
      firestoreEnabled: isFirestoreAvailable,
    });
  } catch (error) {
    console.error("❌ [API Error] /api/itinerary/hotels/autofill:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to autofill hotel details.",
      error: error.message,
    });
  }
});

/**
 * POST /api/itinerary/save
 * Saves or updates an itinerary in Firebase Firestore.
 */
router.post("/save", async (req, res) => {
  try {
    const itinerary = req.body.itinerary || req.body;

    if (!itinerary || typeof itinerary !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid payload: 'itinerary' object is required.",
      });
    }

    // Generate atomic sequential reference number if missing or temporary
    let refNumber = itinerary.refNumber;
    let voucherRef = itinerary.voucherRef;

    if (!refNumber || refNumber.startsWith("LT-Draft") || refNumber.includes("undefined")) {
      const seq = await getNextSequentialReference();
      refNumber = seq.itineraryRef;
      voucherRef = seq.voucherRef;
    }

    if (!voucherRef) {
      voucherRef = refNumber.replace("LT-", "LTV-");
    }

    const itineraryDocument = {
      ...itinerary,
      refNumber,
      voucherRef,
      updatedAt: new Date().toISOString(),
      savedAt: itinerary.savedAt || new Date().toISOString(),
    };

    // Save to Firestore if available
    let savedToFirestore = false;
    if (isFirestoreAvailable && db) {
      try {
        await db
          .collection(ITINERARIES_COLLECTION)
          .doc(refNumber)
          .set(itineraryDocument, { merge: true });
        console.log(`💾 [Firestore] Saved itinerary document "${refNumber}"`);
        savedToFirestore = true;
      } catch (fsErr) {
        console.warn(`⚠️ [Firestore Save Warning] Falling back to local memory:`, fsErr.message);
      }
    }

    fallbackItineraries.set(refNumber, itineraryDocument);
    if (!savedToFirestore) {
      console.log(`💾 [Fallback Memory] Saved itinerary document "${refNumber}"`);
    }

    return res.json({
      success: true,
      refNumber,
      voucherRef,
      message: `Itinerary ${refNumber} saved successfully!`,
      itinerary: itineraryDocument,
      storedIn: savedToFirestore ? "Firebase Firestore" : "Local Memory Store",
    });
  } catch (error) {
    console.error("❌ [API Error] Failed to save itinerary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save itinerary to database.",
      error: error.message,
    });
  }
});

/**
 * GET /api/itinerary/list
 * Retrieves all saved itineraries for the travel agent dashboard.
 */
router.get("/list", async (req, res) => {
  try {
    const list = [];
    let usedFirestore = false;

    if (isFirestoreAvailable && db) {
      try {
        const snapshot = await db
          .collection(ITINERARIES_COLLECTION)
          .orderBy("updatedAt", "desc")
          .limit(50)
          .get();

        snapshot.forEach((doc) => {
          list.push(doc.data());
        });
        usedFirestore = true;
      } catch (fsErr) {
        console.warn(`⚠️ [Firestore List Warning] Falling back to local memory:`, fsErr.message);
      }
    }

    if (!usedFirestore) {
      for (const val of fallbackItineraries.values()) {
        list.push(val);
      }
      list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    }

    return res.json({
      success: true,
      count: list.length,
      itineraries: list,
      source: usedFirestore ? "Firebase Firestore" : "Local Memory Store",
    });
  } catch (error) {
    console.error("❌ [API Error] Failed to list itineraries:", error);
    return res.json({
      success: true,
      count: 0,
      itineraries: [],
      source: "Local Memory Store (Empty Fallback)",
    });
  }
});

/**
 * POST /api/itinerary/attractions
 * Dedicated endpoint triggered ONLY on "Generate Itinerary" button click.
 * Strictly adheres to Token Diet: receives only attraction names array.
 *
 * Phase 1 → Firestore cache check → Gemini Flash (for wikiUrl only on miss)
 * Phase 2 → Pexels API → attach real destination photo to every attraction
 */
router.post("/attractions", async (req, res) => {
  try {
    const { attractions } = req.body;

    if (!Array.isArray(attractions) || attractions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request must include a non-empty 'attractions' array of strings.",
      });
    }

    console.log(`\n======================================================`);
    console.log(`🎯 [POST /api/itinerary/attractions] Incoming ${attractions.length} attractions`);
    console.log(`======================================================`);

    // Phase 1: Resolve Wikipedia + cached image via Firestore & Gemini
    const cacheResult = await getAttractionsWithCaching(attractions);

    // Phase 2: Enrich each attraction with a live Pexels destination photo
    const enriched = await Promise.all(
      cacheResult.map(async (item) => {
        const pexelsData = await fetchPhotoForDestination(item.name);
        return {
          ...item,
          imageUrl: pexelsData.source !== "curated-fallback"
            ? pexelsData.imageUrl
            : item.imageUrl || pexelsData.imageUrl,
          fallbackImageUrl: item.imageUrl || pexelsData.imageUrl,
          photographer: pexelsData.photographer || null,
          photoSource: pexelsData.source,
        };
      })
    );

    // Build quick lookup dictionary for frontend
    const lookup = {};
    for (const item of enriched) {
      lookup[item.name.toLowerCase().trim()] = item;
    }

    console.log(`📸 [Pexels] Photos attached to ${enriched.length} attractions`);

    return res.json({
      success: true,
      count: enriched.length,
      attractions: enriched,
      lookup,
      firestoreEnabled: isFirestoreAvailable,
      pexelsEnabled: Boolean(
        process.env.PEXELS_API_KEY &&
          process.env.PEXELS_API_KEY !== "your_pexels_api_key_here"
      ),
    });
  } catch (error) {
    console.error("❌ [API Error] /api/itinerary/attractions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error resolving attractions.",
      error: error.message,
    });
  }
});

/**
 * POST /api/itinerary/enrich-activities
 * Standalone endpoint: attaches Pexels photo URLs to day activities.
 */
router.post("/enrich-activities", async (req, res) => {
  try {
    const { activities } = req.body;

    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request must include a non-empty 'activities' array.",
      });
    }

    console.log(`\n📸 [POST /api/itinerary/enrich-activities] Enriching ${activities.length} activities with Pexels photos`);

    const enriched = await attachPhotosToActivities(activities);

    return res.json({
      success: true,
      count: enriched.length,
      activities: enriched,
      pexelsEnabled: Boolean(
        process.env.PEXELS_API_KEY &&
          process.env.PEXELS_API_KEY !== "your_pexels_api_key_here"
      ),
    });
  } catch (error) {
    console.error("❌ [API Error] /api/itinerary/enrich-activities:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to enrich activities with photos.",
      error: error.message,
    });
  }
});

/**
 * GET /api/itinerary/public/:ref  (or /api/itineraries/public/:ref)
 * Public read-only endpoint for guest web views without requiring staff authentication.
 */
router.get("/public/:ref", async (req, res) => {
  try {
    const { ref } = req.params;

    if (!ref) {
      return res.status(400).json({
        success: false,
        message: "Reference number parameter is required.",
      });
    }

  let foundItinerary = null;
    let usedFirestore = false;

    if (isFirestoreAvailable && db) {
      try {
        const docSnap = await db.collection(ITINERARIES_COLLECTION).doc(ref).get();
        if (docSnap.exists) {
          foundItinerary = docSnap.data();
          usedFirestore = true;
        } else {
          // Try searching by refNumber field query
          const querySnap = await db
            .collection(ITINERARIES_COLLECTION)
            .where("refNumber", "==", ref)
            .limit(1)
            .get();
          if (!querySnap.empty) {
            foundItinerary = querySnap.docs[0].data();
            usedFirestore = true;
          }
        }
      } catch (fsErr) {
        console.warn(`⚠️ [Firestore Public Get Warning] for "${ref}":`, fsErr.message);
      }
    }

    if (!foundItinerary && fallbackItineraries.has(ref)) {
      foundItinerary = fallbackItineraries.get(ref);
    }

    if (!foundItinerary) {
      for (const it of fallbackItineraries.values()) {
        if (it.refNumber === ref || it.id === ref || it.voucherRef === ref) {
          foundItinerary = it;
          break;
        }
      }
    }

    if (!foundItinerary) {
      return res.status(404).json({
        success: false,
        message: `Itinerary with reference '${ref}' was not found.`,
      });
    }

    return res.json({
      success: true,
      refNumber: foundItinerary.refNumber || ref,
      itinerary: foundItinerary,
      source: usedFirestore ? "Firebase Firestore" : "Local Memory Store",
    });
  } catch (error) {
    console.error(`❌ [API Error] Public view error for ${req.params.ref}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve itinerary.",
      error: error.message,
    });
  }
});

/**
 * GET /api/itinerary/:refNumber
 * Retrieves a specific itinerary by reference number.
 */
router.get("/:refNumber", async (req, res) => {
  try {
    const { refNumber } = req.params;

    if (!refNumber) {
      return res.status(400).json({
        success: false,
        message: "Reference number parameter is required.",
      });
    }

    let foundItinerary = null;
    let usedFirestore = false;

    if (isFirestoreAvailable && db) {
      try {
        const docSnap = await db.collection(ITINERARIES_COLLECTION).doc(refNumber).get();
        if (docSnap.exists) {
          foundItinerary = docSnap.data();
          usedFirestore = true;
        }
      } catch (fsErr) {
        console.warn(`⚠️ [Firestore Get Warning] for "${refNumber}":`, fsErr.message);
      }
    }

    if (!foundItinerary && fallbackItineraries.has(refNumber)) {
      foundItinerary = fallbackItineraries.get(refNumber);
    }

    if (!foundItinerary) {
      for (const it of fallbackItineraries.values()) {
        if (it.refNumber === refNumber || it.id === refNumber || it.voucherRef === refNumber) {
          foundItinerary = it;
          break;
        }
      }
    }

    if (!foundItinerary) {
      return res.status(404).json({
        success: false,
        message: `Itinerary with reference number '${refNumber}' was not found.`,
      });
    }

    return res.json({
      success: true,
      refNumber,
      itinerary: foundItinerary,
      source: usedFirestore ? "Firebase Firestore" : "Local Memory Store",
    });
  } catch (error) {
    console.error(`❌ [API Error] Failed to retrieve itinerary ${req.params.refNumber}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve itinerary.",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/itinerary/:refNumber
 * Removes an itinerary from database.
 */
router.delete("/:refNumber", async (req, res) => {
  try {
    const { refNumber } = req.params;

    if (!refNumber) {
      return res.status(400).json({ success: false, message: "Reference number parameter is required." });
    }

    let firestoreDeleted = false;
    if (isFirestoreAvailable && db) {
      try {
        await db.collection(ITINERARIES_COLLECTION).doc(refNumber).delete();
        firestoreDeleted = true;
      } catch (fsErr) {
        console.warn(`⚠️ [Firestore Delete Warning] for "${refNumber}":`, fsErr.message);
      }
    }

    fallbackItineraries.delete(refNumber);

    return res.json({
      success: true,
      message: `Itinerary ${refNumber} deleted successfully.`,
      source: firestoreDeleted ? "Firebase Firestore" : "Local Memory Store",
    });
  } catch (error) {
    console.error(`❌ [API Error] Failed to delete itinerary:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete itinerary.",
      error: error.message,
    });
  }
});

export default router;
