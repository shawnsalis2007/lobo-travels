import express from "express";
import {
  searchGooglePlacesHotels,
  saveCustomHotel,
  listAllCustomHotels,
  autofillHotelDetails,
} from "../services/hotelPlacesService.js";
import { isFirestoreAvailable } from "../config/firebase.js";

const router = express.Router();

/**
 * POST /api/hotels/search  (or /api/hotels/autofill)
 * Searches Google Places API or Curated Hotel DB
 */
router.post("/search", async (req, res) => {
  try {
    const { hotelName, city } = req.body;
    if (!hotelName || typeof hotelName !== "string") {
      return res.status(400).json({
        success: false,
        message: "'hotelName' is required in request body.",
      });
    }

    console.log(`🏨 [POST /api/hotels/search] Searching hotel "${hotelName}" in "${city || ""}"`);
    const hotel = await searchGooglePlacesHotels(hotelName, city);

    return res.json({
      success: true,
      hotel,
      firestoreEnabled: isFirestoreAvailable,
    });
  } catch (error) {
    console.error("❌ [API Error] /api/hotels/search:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search hotel details.",
      error: error.message,
    });
  }
});

router.post("/autofill", async (req, res) => {
  try {
    const { hotelName, city } = req.body;
    if (!hotelName || typeof hotelName !== "string") {
      return res.status(400).json({
        success: false,
        message: "'hotelName' is required in request body.",
      });
    }
    const hotel = await autofillHotelDetails(hotelName, city);
    return res.json({ success: true, hotel, firestoreEnabled: isFirestoreAvailable });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/hotels/save-custom
 * Saves a manually added or imported hotel into database
 */
router.post("/save-custom", async (req, res) => {
  try {
    const hotelData = req.body.hotel || req.body;
    if (!hotelData || !hotelData.name) {
      return res.status(400).json({
        success: false,
        message: "Hotel object with 'name' is required.",
      });
    }

    const saved = await saveCustomHotel(hotelData);
    return res.json({
      success: true,
      hotel: saved,
      message: `Hotel "${saved.name}" saved to database successfully.`,
    });
  } catch (error) {
    console.error("❌ [API Error] /api/hotels/save-custom:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save hotel to database.",
      error: error.message,
    });
  }
});

/**
 * GET /api/hotels/list
 * Lists all custom & cached hotels
 */
router.get("/list", async (req, res) => {
  try {
    const hotels = await listAllCustomHotels();
    return res.json({
      success: true,
      count: hotels.length,
      hotels,
    });
  } catch (error) {
    console.error("❌ [API Error] /api/hotels/list:", error);
    return res.json({
      success: true,
      count: 0,
      hotels: [],
    });
  }
});

export default router;

