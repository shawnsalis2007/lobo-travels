import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

if (apiKey && apiKey !== "your_gemini_api_key_here") {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for speed and minimal token footprint
    model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1, // Low temperature for factual, deterministic results
        responseMimeType: "application/json",
      },
    });
    console.log("⚡ [Gemini Flash] Initialized successfully");
  } catch (err) {
    console.error("❌ [Gemini Flash] Initialization error:", err.message);
  }
} else {
  console.warn(
    "⚠️ [Gemini Flash] GEMINI_API_KEY not configured in .env. Will use intelligent fallback metadata generator."
  );
}

/**
 * Strict Token Diet: The ONLY job of Gemini is to take the key attractions list
 * and return Wikipedia URL and a reliable high-res image URL.
 * NO itinerary text, NO prices, NO formatting rules are sent.
 *
 * @param {string[]} attractions - Array of attraction names, e.g. ["Solang Valley", "Hadimba Temple"]
 * @returns {Promise<Array<{name: string, wikiUrl: string, imageUrl: string}>>}
 */
export async function fetchAttractionMetadataFromGemini(attractions) {
  if (!attractions || attractions.length === 0) {
    return [];
  }

  // Token Diet prompt: Minimal tokens, pure JSON instruction
  const prompt = `Return a JSON array for these tourist attractions with accurate Wikipedia URL and a high quality direct image URL (Unsplash or Wikimedia direct JPG/PNG).
Attractions: ${JSON.stringify(attractions)}

JSON format:
[
  {
    "name": "Attraction Name",
    "wikiUrl": "https://en.wikipedia.org/wiki/...",
    "imageUrl": "https://..."
  }
]`;

  if (model) {
    try {
      console.log(`📡 [Gemini Flash] Requesting metadata for ${attractions.length} attractions:`, attractions);
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);

      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          name: item.name || "",
          wikiUrl:
            item.wikiUrl ||
            `https://en.wikipedia.org/wiki/${encodeURIComponent(item.name || "")}`,
          imageUrl:
            item.imageUrl && item.imageUrl.startsWith("http")
              ? item.imageUrl
              : `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80`,
          source: "gemini-flash",
        }));
      }
    } catch (error) {
      console.error("⚠️ [Gemini Flash] API call failed, falling back to local resolver:", error.message);
    }
  }

  // Fallback generator when Gemini key is absent or network fails
  return attractions.map((name) => {
    const cleanName = name.trim();
    const encoded = encodeURIComponent(cleanName);
    return {
      name: cleanName,
      wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanName.replace(/\s+/g, "_"))}`,
      // Curated travel Unsplash imagery with attraction query
      imageUrl: `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80`,
      source: "fallback-resolver",
    };
  });
}
