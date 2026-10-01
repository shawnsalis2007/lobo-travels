import React, { useState, useRef, useEffect } from "react";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import HotelsDirectoryView from "./components/HotelsDirectoryView";
import DestinationsView from "./components/DestinationsView";
import SettingsView from "./components/SettingsView";
import ItineraryForm from "./components/ItineraryForm";
import LivePreview from "./components/LivePreview";
import SavedItinerariesModal from "./components/SavedItinerariesModal";
import ConfirmModal from "./components/ConfirmModal";
import CoverPhotoModal from "./components/CoverPhotoModal";
import TravelVoucherPDF from "./components/TravelVoucherPDF";
import ItineraryMap from "./components/ItineraryMap";
import GuestItineraryView from "./pages/GuestItineraryView";
import { INITIAL_ITINERARY_DATA, createBlankItinerary } from "./data/defaultItinerary";
import {
  fetchAttractionDetails,
  checkBackendHealth,
  saveItineraryToFirebase,
  getSavedItineraries,
  generateSequentialRef,
} from "./utils/api";
import { exportItineraryToPdf, exportVoucherToPdf } from "./utils/pdfGenerator";
import { captureMapSnapshot } from "./utils/mapSnapshot";
import { getAllAttractionsForDay, migrateLegacyDay, createDay } from "./utils/routeUtils";
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  Database,
  Eye,
  FileCheck,
  Map as MapIcon,
  Plus,
  RefreshCw,
  FolderOpen,
  CloudUpload,
  Image as ImageIcon,
  FileDown,
} from "lucide-react";

// Default Seed Itineraries for Operations Dashboard
const DEFAULT_SEED_ITINERARIES = [
  {
    refNumber: "LT-2026-1048",
    voucherRef: "LTV-2026-1048",
    destinationTitle: "Scenic Himachal Mountain Escape (Manali & Solang)",
    clientName: "Mr. Rajesh Sharma & Family",
    clientPhone: "+91 9811240072",
    pax: "2 Adults + 1 Child",
    tripDuration: "4 Days / 3 Nights",
    travelDates: "15 Oct – 18 Oct 2026",
    startDate: "2026-10-15",
    endDate: "2026-10-18",
    estimatedCost: "₹ 48,500 / Total Package",
    status: "Confirmed",
    advancePaid: "₹ 20,000 (UPI)",
    generatedDate: "15 Oct 2026",
    days: INITIAL_ITINERARY_DATA.days.map(migrateLegacyDay),
    selectedHotel: INITIAL_ITINERARY_DATA.selectedHotel,
    selectedVehicle: INITIAL_ITINERARY_DATA.selectedVehicle,
    inclusions: INITIAL_ITINERARY_DATA.inclusions,
    exclusions: INITIAL_ITINERARY_DATA.exclusions,
    notes: INITIAL_ITINERARY_DATA.notes,
    managedFlightDetails: INITIAL_ITINERARY_DATA.managedFlightDetails,
  },
  {
    refNumber: "LT-2026-1049",
    voucherRef: "LTV-2026-1049",
    destinationTitle: "Magical Kashmir Valley & Dal Lake Serenity",
    clientName: "Dr. Ananya Sen & Spouse",
    clientPhone: "+91 9876543210",
    pax: "2 Adults",
    tripDuration: "5 Days / 4 Nights",
    travelDates: "22 Oct – 26 Oct 2026",
    startDate: "2026-10-22",
    endDate: "2026-10-26",
    estimatedCost: "₹ 62,000 / Total Package",
    status: "Generated",
    advancePaid: "",
    generatedDate: "16 Oct 2026",
    days: [
      {
        id: "kash-1",
        dayNumber: 1,
        title: "Srinagar Arrival & Dal Lake Shikara Ride",
        transitType: "Drive",
        stops: [{ id: "s1", name: "Srinagar Airport", type: "city" }, { id: "s2", name: "Dal Lake", type: "city", isTransit: true }],
        keyAttractions: ["Dal Lake", "Mughal Gardens"],
        description: "Welcome to Srinagar. Transfer to luxury houseboat and enjoy an evening sunset Shikara cruise on Dal Lake.",
        attractionDetails: [
          {
            name: "Dal Lake",
            wikiUrl: "https://en.wikipedia.org/wiki/Dal_Lake",
            imageUrl: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80",
          },
        ],
      },
      {
        id: "kash-2",
        dayNumber: 2,
        title: "Gulmarg Gondola Ride & Meadow Exploration",
        transitType: "Drive",
        stops: [{ id: "s3", name: "Srinagar", type: "city" }, { id: "s4", name: "Gulmarg", type: "city" }],
        keyAttractions: ["Gulmarg Gondola", "Apharwat Peak"],
        description: "Excursion to the Meadow of Flowers. Experience Asia's highest cable car ride to Apharwat Peak.",
        attractionDetails: [],
      },
    ],
    selectedHotel: { name: "The Lalit Grand Palace Srinagar", roomCategory: "Super Deluxe Palace Room", mealPlan: "MAP" },
    selectedVehicle: { name: "AC Toyota Innova", capacity: "6 Seater" },
    inclusions: ["Houseboat Stay", "Breakfast & Dinner", "Airport Transfers", "Shikara Ride"],
    exclusions: ["Airfare", "Gondola Phase 2 Tickets", "Personal Expenses"],
  },
  {
    refNumber: "LT-2026-1050",
    voucherRef: "LTV-2026-1050",
    destinationTitle: "Golden Triangle Heritage Tour (Delhi - Agra - Jaipur)",
    clientName: "David & Sarah Miller",
    clientPhone: "+44 7700 900077",
    pax: "2 Adults (UK Visitors)",
    tripDuration: "6 Days / 5 Nights",
    travelDates: "05 Nov – 10 Nov 2026",
    startDate: "2026-11-05",
    endDate: "2026-11-10",
    estimatedCost: "₹ 84,000 / Total Package",
    status: "Draft",
    advancePaid: "",
    generatedDate: "18 Oct 2026",
    days: [
      {
        id: "gt-1",
        dayNumber: 1,
        title: "Delhi Sightseeing & Drive to Agra",
        transitType: "Drive",
        stops: [{ id: "s1", name: "Delhi", type: "city" }, { id: "s2", name: "Agra", type: "city" }],
        keyAttractions: ["Qutub Minar", "India Gate"],
        description: "Explore New Delhi heritage landmarks before driving along Yamuna Expressway to Agra.",
        attractionDetails: [],
      },
    ],
    selectedHotel: { name: "ITC Mughal, Agra", roomCategory: "Mughal Chamber", mealPlan: "CP" },
    selectedVehicle: { name: "AC Toyota Crysta", capacity: "6 Seater" },
    inclusions: ["5-Star Hotels", "Daily Buffet Breakfast", "All Sightseeing in AC Crysta", "English Speaking Guide"],
    exclusions: ["Monument Entrance Fees", "Lunches & Dinners"],
  },
];

export default function App() {
  // Check if current URL is a guest read-only view route: /view/:ref
  const isGuestView =
    typeof window !== "undefined" && window.location.pathname.startsWith("/view");

  if (isGuestView) {
    return <GuestItineraryView />;
  }

  // Navigation State
  const [currentTab, setCurrentTab] = useState("dashboard"); // 'dashboard' | 'itinerary' | 'hotels' | 'destinations' | 'settings'
  const [searchQuery, setSearchQuery] = useState("");

  // Main Active Itinerary State
  const [itineraryData, setItineraryData] = useState(() => {
    try {
      const saved = localStorage.getItem("lobo_active_itinerary");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...parsed, days: (parsed.days || []).map(migrateLegacyDay) };
      }
    } catch {
      // ignore
    }
    return {
      ...INITIAL_ITINERARY_DATA,
      days: INITIAL_ITINERARY_DATA.days.map(migrateLegacyDay),
    };
  });

  // Saved Itineraries Database list for Dashboard Table
  const [itinerariesList, setItinerariesList] = useState(() => {
    try {
      const saved = localStorage.getItem("lobo_all_itineraries");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_SEED_ITINERARIES;
  });

  const [mapImageBase64, setMapImageBase64] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingVoucher, setIsExportingVoucher] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(true);
  const [activeView, setActiveView] = useState("split"); // 'split' | 'editor' | 'preview' | 'map'
  const [toast, setToast] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [stats, setStats] = useState({ cacheHits: 6, geminiCalls: 1, tokensSaved: "94%" });

  const previewRef = useRef(null);

  // Check health on startup & load cloud itineraries
  useEffect(() => {
    checkBackendHealth().then((status) => {
      setBackendStatus(status);
    });

    getSavedItineraries()
      .then((docs) => {
        if (Array.isArray(docs) && docs.length > 0) {
          setItinerariesList((prev) => {
            // merge cloud docs with local
            const map = new Map();
            docs.forEach((d) => map.set(d.refNumber, d));
            prev.forEach((d) => {
              if (!map.has(d.refNumber)) map.set(d.refNumber, d);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {
        // use local seed
      });
  }, []);

  // Sync active itinerary state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("lobo_active_itinerary", JSON.stringify(itineraryData));
      if (itineraryData.refNumber) {
        localStorage.setItem("lobo_itinerary_" + itineraryData.refNumber, JSON.stringify(itineraryData));
      }
    } catch {
      // ignore storage quota errors
    }
  }, [itineraryData]);

  // Agency settings & branding
  const [agencySettings, setAgencySettings] = useState(() => {
    try {
      const saved = localStorage.getItem("lobo_agency_settings");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      name: "Lobo Travels",
      tagline: "Travel packages, fleet operations, and all travel related solutions.",
      logoUrl: "https://github.com/VensonLobo/Logo-hoasting/blob/main/Untitled%20design%20(10).png?raw=true",
      email: "info@lobotravels.com",
      website: "lobotravels.com",
      address: "Shop No. 12, NDMC Market Near CNG Pump, Mandir Marg, New Delhi - 110001",
      phones: "9811240072, 9891240072, 9312640072",
      itineraryPrefix: "LT-",
      voucherPrefix: "LTV-",
    };
  });

  const handleSaveAgencySettings = (newSettings) => {
    setAgencySettings(newSettings);
    try {
      localStorage.setItem("lobo_agency_settings", JSON.stringify(newSettings));
    } catch {
      // ignore
    }
    showToast("success", "Agency branding & configuration saved!");
  };

  const handleResetDemoData = () => {
    setItinerariesList(DEFAULT_SEED_ITINERARIES);
    try {
      localStorage.setItem("lobo_all_itineraries", JSON.stringify(DEFAULT_SEED_ITINERARIES));
    } catch {
      // ignore
    }
    showToast("info", "Demo database reset to default itineraries.");
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const handleFieldChange = (field, value) => {
    setItineraryData((prev) => {
      const updated = { ...prev, [field]: value };
      // Sync into itineraries list
      setItinerariesList((list) =>
        list.map((item) => (item.refNumber === updated.refNumber ? { ...item, ...updated } : item))
      );
      return updated;
    });
  };

  // ── Day Management ────────────────────────────────────────────────────────
  const handleAddDay = () => {
    const nextNum = itineraryData.days.length + 1;
    const newDay = createDay(nextNum);
    setItineraryData((prev) => ({ ...prev, days: [...prev.days, newDay] }));
    showToast("info", `Day ${nextNum} added.`);
  };

  const handleAddDayBelow = (index) => {
    setItineraryData((prev) => {
      const days = [...prev.days];
      const insertAt = index + 1;
      const newDay = createDay(insertAt + 1);
      days.splice(insertAt, 0, newDay);
      return {
        ...prev,
        days: days.map((d, i) => ({ ...d, dayNumber: i + 1 })),
      };
    });
    showToast("info", `Day inserted below Day ${index + 1}.`);
  };

  const handleUpdateDay = (updatedDay) => {
    setItineraryData((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.id === updatedDay.id ? updatedDay : d)),
    }));
  };

  const handleDeleteDay = (dayId) => {
    setItineraryData((prev) => {
      const filtered = prev.days.filter((d) => d.id !== dayId);
      return { ...prev, days: filtered.map((d, i) => ({ ...d, dayNumber: i + 1 })) };
    });
    showToast("info", "Day removed from itinerary.");
  };

  const handleMoveDayUp = (index) => {
    if (index === 0) return;
    setItineraryData((prev) => {
      const days = [...prev.days];
      [days[index], days[index - 1]] = [days[index - 1], days[index]];
      return { ...prev, days: days.map((d, i) => ({ ...d, dayNumber: i + 1 })) };
    });
  };

  const handleMoveDayDown = (index) => {
    if (index === itineraryData.days.length - 1) return;
    setItineraryData((prev) => {
      const days = [...prev.days];
      [days[index], days[index + 1]] = [days[index + 1], days[index]];
      return { ...prev, days: days.map((d, i) => ({ ...d, dayNumber: i + 1 })) };
    });
  };

  // ── Create & Reset Itinerary ──────────────────────────────────────────────
  const handleCreateNewBlankItinerary = async () => {
    setIsGenerating(false);
    showToast("info", "Generating new blank itinerary...");
    try {
      const seq = await generateSequentialRef();
      const blank = createBlankItinerary(seq);
      setItineraryData(blank);
      setItinerariesList((prev) => [blank, ...prev.filter((d) => d.refNumber !== blank.refNumber)]);
      setCurrentTab("itinerary");
      showToast("success", `New blank itinerary created! Ref: ${blank.refNumber}`);
    } catch {
      const blank = createBlankItinerary();
      setItineraryData(blank);
      setItinerariesList((prev) => [blank, ...prev.filter((d) => d.refNumber !== blank.refNumber)]);
      setCurrentTab("itinerary");
      showToast("success", `New blank itinerary created! Ref: ${blank.refNumber}`);
    }
  };

  const handleResetTemplate = async () => {
    const seq = await generateSequentialRef();
    const refreshed = {
      ...INITIAL_ITINERARY_DATA,
      days: INITIAL_ITINERARY_DATA.days.map(migrateLegacyDay),
      refNumber: seq.itineraryRef || `LT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      voucherRef: seq.voucherRef || `LTV-${new Date().getFullYear()}-0001`,
      generatedDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    };
    setItineraryData(refreshed);
    setItinerariesList((prev) => [refreshed, ...prev.filter((d) => d.refNumber !== refreshed.refNumber)]);
    setCurrentTab("itinerary");
    showToast("info", "Loaded standard Himachal tour template.");
  };

  // ── Dashboard Row Actions ────────────────────────────────────────────────
  const handleEditItinerary = (item) => {
    setItineraryData({
      ...item,
      days: (item.days || []).map(migrateLegacyDay),
    });
    setCurrentTab("itinerary");
    showToast("info", `Opened ${item.refNumber} in Studio Editor.`);
  };

  const handleViewItinerary = (item) => {
    setItineraryData({
      ...item,
      days: (item.days || []).map(migrateLegacyDay),
    });
    setCurrentTab("itinerary");
    setActiveView("preview");
  };

  const handleDuplicateItinerary = async (item) => {
    const seq = await generateSequentialRef();
    const clonedRef = seq.itineraryRef || `LT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const clonedVoucher = seq.voucherRef || `LTV-${new Date().getFullYear()}-0001`;
    const cloned = {
      ...item,
      refNumber: clonedRef,
      voucherRef: clonedVoucher,
      clientName: `${item.clientName || "Guest"} (Copy)`,
      status: "Draft",
      generatedDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    };
    setItinerariesList((prev) => [cloned, ...prev]);
    setItineraryData(cloned);
    setCurrentTab("itinerary");
    showToast("success", `Duplicated as ${clonedRef}!`);
  };

  const handleDeleteItinerary = (refNumber) => {
    setItinerariesList((prev) => prev.filter((d) => d.refNumber !== refNumber));
    try {
      localStorage.removeItem("lobo_itinerary_" + refNumber);
    } catch {
      // ignore
    }
    showToast("info", `Deleted itinerary ${refNumber}.`);
  };

  // ── Save / Load ──────────────────────────────────────────────────────────
  const handleSaveItinerary = async () => {
    setIsSaving(true);
    try {
      const res = await saveItineraryToFirebase(itineraryData);
      const updated = {
        ...itineraryData,
        refNumber: res.refNumber || itineraryData.refNumber,
        voucherRef: res.voucherRef || itineraryData.voucherRef,
      };
      setItineraryData(updated);
      setItinerariesList((prev) => [
        updated,
        ...prev.filter((d) => d.refNumber !== updated.refNumber),
      ]);
      showToast("success", `Saved! Ref: ${res.refNumber}`);
    } catch (err) {
      showToast("error", `Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadItinerary = (savedDoc) => {
    if (!savedDoc) return;
    const migrated = {
      ...savedDoc,
      days: (savedDoc.days || []).map(migrateLegacyDay),
      voucherRef: savedDoc.voucherRef || (savedDoc.refNumber ? savedDoc.refNumber.replace("LT-", "LTV-") : ""),
      managedFlightDetails: savedDoc.managedFlightDetails || {
        isFlightBookedByLobo: false,
        arrivalFlight: {
          airline: "",
          flightNumber: "",
          pnr: "",
          departureAirport: savedDoc.arrivalInfo || "",
          departureTime: "",
          arrivalAirport: "",
          arrivalTime: "",
          terminal: "",
          baggageAllowance: "",
        },
        departureFlight: {
          airline: "",
          flightNumber: "",
          pnr: "",
          departureAirport: "",
          departureTime: "",
          arrivalAirport: savedDoc.departureInfo || "",
          arrivalTime: "",
          terminal: "",
          baggageAllowance: "",
        },
      },
    };
    setItineraryData(migrated);
    setCurrentTab("itinerary");
    showToast("success", `Loaded ${savedDoc.refNumber} — ${savedDoc.destinationTitle || "Untitled"}`);
  };

  // ── Mark as Confirmed ────────────────────────────────────────────────────
  const handleConfirmItinerary = (patch) => {
    const voucherRef = itineraryData.refNumber.replace("LT-", "LTV-");
    const updated = {
      ...itineraryData,
      ...patch,
      status: "Confirmed",
      voucherRef,
    };
    setItineraryData(updated);
    setItinerariesList((prev) =>
      prev.map((item) => (item.refNumber === updated.refNumber ? updated : item))
    );
    setIsConfirmModalOpen(false);
    showToast("success", `Booking confirmed! Voucher Ref: ${voucherRef}`);
  };

  // ── Generate (Strict Token Diet) ─────────────────────────────────────────
  const handleGenerateItinerary = async () => {
    const allAttractions = [];
    itineraryData.days.forEach((day) => {
      const dayAttractions = getAllAttractionsForDay(day);
      dayAttractions.forEach((att) => {
        if (att && att.trim()) allAttractions.push(att.trim());
      });
    });

    const uniqueAttractions = [...new Set(allAttractions)];
    if (uniqueAttractions.length === 0) {
      showToast("info", "Add at least one key attraction to a stop before generating.");
      return;
    }

    setIsGenerating(true);
    try {
      showToast("info", `Checking Firestore & Gemini for ${uniqueAttractions.length} attractions...`);
      const response = await fetchAttractionDetails(uniqueAttractions);
      const lookup = response.lookup || {};
      let newHits = 0,
        newGemini = 0;

      const updatedDays = itineraryData.days.map((day) => {
        const allDayAttractions = getAllAttractionsForDay(day);
        const details = allDayAttractions.map((attName) => {
          const key = attName.toLowerCase().trim();
          const found = lookup[key];
          if (found) {
            if (found.cached) newHits++;
            else newGemini++;
            return found;
          }
          return {
            name: attName,
            wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(attName.trim().replace(/\s+/g, "_"))}`,
            imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
            cached: false,
          };
        });
        return { ...day, attractionDetails: details };
      });

      let coverPhoto = itineraryData.coverPhoto;
      if ((!coverPhoto || coverPhoto.mode === "auto") && updatedDays[0]?.attractionDetails?.[0]?.imageUrl) {
        coverPhoto = { mode: "auto", url: updatedDays[0].attractionDetails[0].imageUrl };
      }

      const updated = {
        ...itineraryData,
        days: updatedDays,
        coverPhoto,
        status: itineraryData.status === "Confirmed" ? "Confirmed" : "Generated",
      };

      setItineraryData(updated);
      setItinerariesList((prev) =>
        prev.map((item) => (item.refNumber === updated.refNumber ? updated : item))
      );
      setStats((prev) => ({
        ...prev,
        cacheHits: prev.cacheHits + newHits,
        geminiCalls: prev.geminiCalls + newGemini,
      }));
      showToast("success", `Enriched ${uniqueAttractions.length} attractions with Wikipedia links & photos!`);
    } catch (error) {
      showToast("error", `Generate error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── PDF Export (Itinerary) ───────────────────────────────────────────────
  const handleExportPdf = async () => {
    if (!previewRef.current) {
      showToast("error", "Preview element not ready.");
      return;
    }
    setIsExporting(true);
    showToast("info", "Capturing route map & rendering high-resolution PDF...");
    try {
      const mapImg = await captureMapSnapshot("leaflet-map-container");
      if (mapImg) {
        setMapImageBase64(mapImg);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      await exportItineraryToPdf(previewRef.current, itineraryData.refNumber);
      showToast("success", "Itinerary PDF exported! Check your downloads.");
    } catch (err) {
      showToast("error", "PDF failed: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // ── PDF Export (Travel Voucher) ──────────────────────────────────────────
  const handleExportVoucher = async () => {
    const voucherElement = document.getElementById("voucher-pdf-target");
    if (!voucherElement) {
      showToast("error", "Voucher template element not found.");
      return;
    }
    setIsExportingVoucher(true);
    showToast("info", "Rendering official Travel Voucher PDF...");
    try {
      await exportVoucherToPdf(voucherElement, itineraryData.refNumber);
      showToast("success", "Travel Voucher PDF exported! Check your downloads.");
    } catch (err) {
      showToast("error", "Voucher export failed: " + err.message);
    } finally {
      setIsExportingVoucher(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e15] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* ── 1. UNIVERSAL TOP NAVIGATION BAR ───────────────────────────── */}
      <Navbar
        activeTab={currentTab}
        onSelectTab={setCurrentTab}
        onNewBlank={handleCreateNewBlankItinerary}
        backendStatus={backendStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ── 2. GLOBAL TOAST NOTIFICATIONS ─────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center space-x-2.5 ${
              toast.type === "success"
                ? "bg-emerald-950 text-emerald-100 border-emerald-600 shadow-emerald-900/30"
                : toast.type === "error"
                ? "bg-rose-950 text-rose-100 border-rose-600 shadow-rose-900/30"
                : "bg-blue-950 text-blue-100 border-blue-600 shadow-blue-900/30"
            }`}
          >
            {toast.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === "info" && <Database className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── 3. MODALS ─────────────────────────────────────────────────── */}
      <SavedItinerariesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        onLoadItinerary={handleLoadItinerary}
        onNewBlank={handleCreateNewBlankItinerary}
      />

      {isConfirmModalOpen && (
        <ConfirmModal
          itineraryData={itineraryData}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmItinerary}
        />
      )}

      <CoverPhotoModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        days={itineraryData.days}
        coverPhoto={itineraryData.coverPhoto}
        onSelectCoverPhoto={(cp) => handleFieldChange("coverPhoto", cp)}
      />

      {/* ── 4. VIEW ROUTING ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-slate-100">
        {/* VIEW: DASHBOARD */}
        {currentTab === "dashboard" && (
          <DashboardView
            itineraries={itinerariesList}
            onSelectTab={setCurrentTab}
            onCreateItinerary={handleCreateNewBlankItinerary}
            onLoadTemplate={handleResetTemplate}
            onEditItinerary={handleEditItinerary}
            onViewItinerary={handleViewItinerary}
            onDuplicateItinerary={handleDuplicateItinerary}
            onDeleteItinerary={handleDeleteItinerary}
            onExportPdf={(item) => {
              handleEditItinerary(item);
              setTimeout(() => handleExportPdf(), 300);
            }}
            onExportVoucher={(item) => {
              handleEditItinerary(item);
              setTimeout(() => handleExportVoucher(), 300);
            }}
          />
        )}

        {/* VIEW: HOTELS DIRECTORY */}
        {currentTab === "hotels" && (
          <HotelsDirectoryView
            onSelectHotelForItinerary={(hotel) => {
              handleFieldChange("selectedHotel", {
                name: hotel.name,
                roomCategory: hotel.roomType || hotel.category || "Deluxe Valley Room",
                mealPlan: hotel.mealPlan || "MAP",
              });
              setCurrentTab("itinerary");
              showToast("success", `Applied ${hotel.name} to tour itinerary!`);
            }}
          />
        )}

        {/* VIEW: DESTINATIONS CATALOG */}
        {currentTab === "destinations" && <DestinationsView />}

        {/* VIEW: AGENCY SETTINGS */}
        {currentTab === "settings" && (
          <SettingsView
            settings={agencySettings}
            onSaveSettings={handleSaveAgencySettings}
            onResetDemoData={handleResetDemoData}
          />
        )}

        {/* VIEW: ITINERARY STUDIO / BUILDER */}
        {currentTab === "itinerary" && (
          <div className="flex flex-col flex-1">
            {/* Itinerary Studio Sub-Header Toolbar */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                    Itinerary Studio
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    {itineraryData.refNumber}
                  </span>
                  {itineraryData.status === "Confirmed" && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Confirmed</span>
                    </span>
                  )}
                </div>

                {/* Token Diet Stats Pill */}
                <div className="hidden xl:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-600">
                  <span className="text-emerald-700 font-bold">● Token Diet</span>
                  <span className="text-slate-300">|</span>
                  <span>Cache: {stats.cacheHits} Hits</span>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar py-0.5">
                {/* Reset Template */}
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Load Himachal Template"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Template</span>
                </button>

                {/* Cover Photo */}
                <button
                  type="button"
                  onClick={() => setIsCoverModalOpen(true)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 bg-white rounded-lg border border-slate-200 transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Choose Cover Photo"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Cover</span>
                </button>

                {/* Save Itinerary */}
                <button
                  type="button"
                  onClick={handleSaveItinerary}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                  title="Save to Cloud"
                >
                  <CloudUpload className={`w-3.5 h-3.5 text-emerald-600 ${isSaving ? "animate-bounce" : ""}`} />
                  <span>{isSaving ? "Saving…" : "Save"}</span>
                </button>

                {/* Generate AI */}
                <button
                  type="button"
                  onClick={handleGenerateItinerary}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50 active:scale-95"
                  title="Resolve Wikipedia & photos with strict Token Diet"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>{isGenerating ? "Enriching…" : "Generate AI"}</span>
                </button>

                {/* Confirm Booking */}
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center space-x-1 cursor-pointer active:scale-95 ${
                    itineraryData.status === "Confirmed"
                      ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                  }`}
                  title="Confirm booking and unlock Travel Voucher"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{itineraryData.status === "Confirmed" ? "Confirmed" : "Confirm"}</span>
                </button>

                {/* Export PDF */}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50 active:scale-95"
                  title="Export A4 PDF with exact company footer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{isExporting ? "PDF…" : "PDF"}</span>
                </button>

                {/* Export Voucher */}
                <button
                  type="button"
                  onClick={handleExportVoucher}
                  disabled={itineraryData.status !== "Confirmed" || isExportingVoucher}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer active:scale-95 ${
                    itineraryData.status === "Confirmed"
                      ? "bg-indigo-700 hover:bg-indigo-800 text-white shadow-xs"
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                  }`}
                  title={
                    itineraryData.status === "Confirmed"
                      ? "Export official Travel Voucher PDF"
                      : "Confirm booking first to export Travel Voucher"
                  }
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>{isExportingVoucher ? "Voucher…" : "Voucher"}</span>
                </button>
              </div>
            </div>

            {/* Studio Workspace Main Split Layout */}
            <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20 sm:pb-6 text-slate-800">
              {/* Left Form Editor */}
              <section
                className={`lg:col-span-5 h-auto lg:h-[calc(100vh-140px)] lg:sticky lg:top-32 ${
                  activeView === "editor" || activeView === "split" ? "block" : "hidden lg:block"
                }`}
              >
                <ItineraryForm
                  itineraryData={itineraryData}
                  onChangeField={handleFieldChange}
                  onAddDay={handleAddDay}
                  onAddDayBelow={handleAddDayBelow}
                  onUpdateDay={handleUpdateDay}
                  onDeleteDay={handleDeleteDay}
                  onMoveDayUp={handleMoveDayUp}
                  onMoveDayDown={handleMoveDayDown}
                  onGenerate={handleGenerateItinerary}
                  isGenerating={isGenerating}
                  onOpenCoverModal={() => setIsCoverModalOpen(true)}
                  onMarkConfirmed={() => setIsConfirmModalOpen(true)}
                />
              </section>

              {/* Right Live & Editable Preview */}
              <section
                className={`lg:col-span-7 ${
                  activeView === "preview" || activeView === "map" || activeView === "split"
                    ? "block"
                    : "hidden lg:block"
                }`}
              >
                {/* Top Helper & Controls Bar */}
                <div className="mb-3 flex items-center justify-between text-xs text-slate-500 px-2 flex-wrap gap-2">
                  <div className="flex items-center space-x-1.5 font-medium">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-700">Live Interactive Preview</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Tap any text to edit inline
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowRouteMap(!showRouteMap)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                        showRouteMap
                          ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
                          : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                      }`}
                      title="Toggle interactive route map"
                    >
                      <MapIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>{showRouteMap ? "Hide Map" : "Show Map"}</span>
                    </button>

                    <span className="text-[11px] text-slate-400">
                      Ref: <strong className="text-slate-700">{itineraryData.refNumber}</strong>
                    </span>
                  </div>
                </div>

                {/* Leaflet Interactive Route Map */}
                {(showRouteMap || activeView === "map") && (
                  <ItineraryMap
                    days={itineraryData.days}
                    destinationTitle={itineraryData.destinationTitle}
                    isCollapsible={true}
                  />
                )}

                {/* Live A4 Document Preview */}
                {activeView !== "map" && (
                  <LivePreview
                    ref={previewRef}
                    itineraryData={itineraryData}
                    mapImageBase64={mapImageBase64}
                    onUpdateField={handleFieldChange}
                  />
                )}

                {/* Hidden Travel Voucher DOM for PDF Render */}
                <div className="hidden">
                  <TravelVoucherPDF itineraryData={itineraryData} />
                </div>
              </section>
            </main>

            {/* Mobile Bottom Sticky Action Bar in Studio */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 z-40 shadow-lg flex items-center justify-around">
              <button
                type="button"
                onClick={() => setActiveView("editor")}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-bold transition-all ${
                  activeView === "editor" ? "text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span className="text-sm">📝</span>
                <span>Editor</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-bold transition-all ${
                  activeView === "preview" ? "text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span className="text-sm">👁️</span>
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRouteMap(true);
                  setActiveView("map");
                }}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-bold transition-all ${
                  activeView === "map" ? "text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span className="text-sm">🗺️</span>
                <span>Map</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-bold text-blue-700 active:scale-95 transition-transform"
              >
                <span className="text-sm">{isExporting ? "⏳" : "📥"}</span>
                <span>PDF</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
