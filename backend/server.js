import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import itineraryRoutes from "./routes/itineraryRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import { isFirestoreAvailable } from "./config/firebase.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/hotels", hotelRoutes);

// Root health & info
app.get("/", (req, res) => {
  res.json({
    app: "Lobo Travels Itinerary Builder Backend",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/api/itinerary/health",
      resolveAttractions: "POST /api/itinerary/attractions",
    },
    firestoreCaching: isFirestoreAvailable ? "Active (Firebase Firestore)" : "Active (Fallback Memory Cache)",
  });
});

app.listen(PORT, () => {
  console.log(`\n========================================================`);
  console.log(`🚀 Lobo Travels Itinerary Builder Server running on: http://localhost:${PORT}`);
  console.log(`📡 Health endpoint: http://localhost:${PORT}/api/itinerary/health`);
  console.log(`🔥 Firestore caching: ${isFirestoreAvailable ? "CONNECTED ✅" : "FALLBACK MODE ⚠️"}`);
  console.log(`⚡ Gemini API key: ${process.env.GEMINI_API_KEY ? "CONFIGURED ✅" : "NOT SET (Local Fallback active) ⚠️"}`);
  console.log(`========================================================\n`);
});
