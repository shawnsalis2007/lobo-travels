import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;
let isFirestoreAvailable = false;

// Fallback in-memory cache if Firebase credentials are not provided
const fallbackCache = new Map();
// Fallback in-memory itinerary store
const fallbackItineraries = new Map();

function initFirebase() {
  try {
    // 1. Check if already initialized
    if (admin.apps.length > 0) {
      db = admin.firestore();
      isFirestoreAvailable = true;
      console.log("🔥 [Firebase] Already initialized, reusing instance");
      return db;
    }

    // 2. Locate serviceAccountKey.json (supporting direct file and common Windows double-extension)
    const possiblePaths = [
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      path.join(__dirname, "../serviceAccountKey.json"),
      path.join(__dirname, "../serviceAccountKey.json.json"),
      path.join(process.cwd(), "serviceAccountKey.json"),
      path.join(process.cwd(), "backend/serviceAccountKey.json"),
    ].filter(Boolean);

    for (const keyPath of possiblePaths) {
      if (fs.existsSync(keyPath)) {
        try {
          const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          db = admin.firestore();
          isFirestoreAvailable = true;
          console.log(`🔥 [Firebase] Initialized successfully using: ${keyPath}`);
          return db;
        } catch (jsonErr) {
          console.error(`⚠️ [Firebase] Failed to parse JSON key at ${keyPath}:`, jsonErr.message);
        }
      }
    }

    // 3. Check for inline environment variables
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
      db = admin.firestore();
      isFirestoreAvailable = true;
      console.log("🔥 [Firebase] Initialized with inline environment variables");
      return db;
    }

    console.warn(
      "⚠️ [Firebase] No valid serviceAccountKey.json found. Operating in local fallback cache mode."
    );
    isFirestoreAvailable = false;
    return null;
  } catch (error) {
    console.error("❌ [Firebase] Initialization failed:", error.message);
    isFirestoreAvailable = false;
    return null;
  }
}

// Initialize on module load
initFirebase();

export { db, isFirestoreAvailable, fallbackCache, fallbackItineraries, admin };
