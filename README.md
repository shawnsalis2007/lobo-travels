# Lobo Travels - Interactive Itinerary Builder 🧭

> Production-ready Travel Itinerary Builder web application with strict API cost minimization, Firebase Firestore caching, Google Gemini Flash integration, and client-side PDF export with clickable Wikipedia hyperlinks.

---

## 🌟 Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS | Fast responsive dual-pane studio layout |
| **PDF Engine** | `html2pdf.js` | 100% Client-side browser rendering, hyperlinks preserved |
| **Icons** | `lucide-react` | Modern luxury travel iconography |
| **Backend** | Node.js, Express.js (ESM) | REST API on port `5000` |
| **Cache Database** | Firebase Firestore Admin SDK | Firestore caching with automatic in-memory fallback |
| **AI Engine** | Google Gemini Flash | Strict Token Diet & Task Isolation |

---

## ⚡ Strict API Cost-Saving & AI Architecture

1. **No Auto-Fetch Policy**:
   - Keystrokes, dropdown updates, and day edits **never** trigger backend or AI calls.
   - The backend/AI pipeline is **only** triggered when the user explicitly clicks the **"Generate Itinerary"** button.

2. **Strict Token Diet**:
   - **Zero bloat**: Itinerary text, passenger names, flight times, prices, and formatting templates are **never** transmitted to the Gemini API.
   - Pure client-side JavaScript handles price calculation, day sequencing, and layout formatting.

3. **AI Task Isolation**:
   - The Gemini API is strictly tasked with taking an array of tourist attraction names (e.g. `["Solang Valley", "Hadimba Temple"]`) and returning structured JSON containing:
     - `name`: Tourist attraction name
     - `wikiUrl`: Accurate Wikipedia article URL
     - `imageUrl`: High-resolution photograph URL
   - Prompt is stripped of formatting rules and conversational overhead to minimize token usage.

4. **Firebase Firestore Caching Flow**:
   - When **"Generate Itinerary"** is clicked, the backend checks Firestore collection `attractions_cache` first.
   - **Cache Hit**: Returns cached Wikipedia URL and photo instantly with `0` Gemini tokens consumed.
   - **Cache Miss**: Sends **only the missing attraction names** to Gemini Flash.
   - Saves newly resolved attractions into Firestore for all future queries.
   - Resilient Fallback: If Firebase credentials are not yet supplied, an automatic in-memory cache with pre-seeded tourist destinations is used so the app works seamlessly out-of-the-box.

---

## 📁 Project Structure

```
Lobo Travels itenary builder/
├── backend/
│   ├── config/
│   │   └── firebase.js              # Firebase Admin SDK init with graceful fallback
│   ├── services/
│   │   ├── geminiService.js         # Strict token diet prompt & Gemini Flash client
│   │   └── attractionCacheService.js # Firestore-first caching & lookup logic
│   ├── routes/
│   │   └── itineraryRoutes.js       # Dedicated /api/itinerary/attractions endpoint
│   ├── data/
│   │   └── preloadedData.js         # Seed attractions cache & travel defaults
│   ├── .env.example                 # Environment variables template
│   ├── .env                         # Local backend environment
│   ├── package.json
│   └── server.js                    # Express app listening on port 5000
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Lobo Travels brand header & cost-saving badge
│   │   │   ├── ItineraryForm.jsx    # Tabbed dashboard (Days, Stay, Fleet, Inclusions)
│   │   │   ├── DayCardEditor.jsx    # Day title, description & attraction tags
│   │   │   ├── HotelVehicleSelector.jsx # Preloaded Hotels (meal plans) & Vehicles
│   │   │   ├── InclusionsExclusionsEditor.jsx # Dynamic Inclusions & Exclusions
│   │   │   ├── LivePreview.jsx      # Dual-sync editable proposal preview & PDF layout
│   │   │   └── AttractionCard.jsx   # Image thumbnail with clickable Wikipedia link
│   │   ├── utils/
│   │   │   ├── api.js               # Dedicated fetch client (No auto-fetch)
│   │   │   └── pdfGenerator.js      # Client-side html2pdf.js export utility
│   │   ├── data/
│   │   │   └── defaultItinerary.js  # Preloaded hotels, meal plans, vehicles, and seed data
│   │   ├── App.jsx                  # Main state container & view controller
│   │   ├── index.css                # Tailwind base styles & print media rules
│   │   └── main.jsx                 # React root
│   ├── index.html                   # HTML entry point with Google Fonts
│   ├── vite.config.js               # Vite config with backend proxy
│   ├── tailwind.config.js           # Lobo brand colors
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18 or higher (v24 LTS installed)
- **npm**: v9 or higher

### 2. Configure Backend Credentials (Optional)
Navigate to `backend/.env` and provide your API keys:

```ini
PORT=5000

# Google Gemini Flash API Key (Get free key from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Admin Credentials (Option A: Path to downloaded JSON key)
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json

# Firebase Admin Credentials (Option B: Inline env variables)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
> *Note: If keys are omitted, the application runs seamlessly using built-in verified travel seeds and an intelligent local cache.*

### 3. Run Backend Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### 4. Run Frontend Application
```bash
cd frontend
npm run dev
# Application opens on http://localhost:5173
```

---

## 📄 Client-Side PDF Export & Hardcoded Branding

- **Export Technology**: 100% browser-rendered using `html2pdf.js` with 2x retina canvas scaling.
- **Wikipedia Hyperlinks**: Clicking any attraction thumbnail in the PDF opens its official Wikipedia article in the browser.
- **Reference Number & Date**: Automatically generated (e.g. `LT-2026-XXXX`) and displays the current date.
- **Editable in Preview**: Click on any text, title, date, or hotel detail directly on the live preview document to tweak before exporting.
- **Hardcoded Official Lobo Travels Footer**:
  ```
  Contact: 9811240072, 9891240072, 9312640072
  Email: info@lobotravels.com
  Address: Shop No. 12, NDMC Market Near CNG Pump, Mandir Marg, New Delhi - 110001
  Website: lobotravels.com
  ```
