import express from "express";
import { autofillHotelDetails } from "../services/hotelPlacesService.js";
import { isFirestoreAvailable } from "../config/firebase.js";

const router = express.Router();

/**
 * POST /api/hotels/autofill
 * Calls Google Places API once to fetch hotel address, phone, Google Maps URL, and photos.
 * Stores result in Firestore 'hotels' collection. Subsequent reads load from Firestore.
 */
router.post("/autofill", async (req, res) => {
  try {
    const { hotelName, city } = req.body;

    if (!hotelName || typeof hotelName !== "string") {
      return res.status(400).json({
        success: false,
        message: "'hotelName' is required in request body.",
      });
    }

    console.log(`🏨 [POST /api/hotels/autofill] Autofilling hotel "${hotelName}" in "${city || ""}"`);

    const hotel = await autofillHotelDetails(hotelName, city);

    return res.json({
      success: true,
      hotel,
      firestoreEnabled: isFirestoreAvailable,
    });
  } catch (error) {
    console.error("❌ [API Error] /api/hotels/autofill:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to autofill hotel details.",
      error: error.message,
    });
  }
});

export default router;
