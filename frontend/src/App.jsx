import React, { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
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
  Map,
} from "lucide-react";

export default function App() {
  // Check if current URL is a guest read-only view route: /view/:ref
  const isGuestView =
    typeof window !== "undefined" && window.location.pathname.startsWith("/view");

  if (isGuestView) {
    return <GuestItineraryView />;
  }

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

  // Check health on startup
  useEffect(() => {
    checkBackendHealth().then((status) => {
      setBackendStatus(status);
    });
  }, []);

  // Sync working itinerary state to LocalStorage for instant preview & guest access
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

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const handleFieldChange = (field, value) => {
    setItineraryData((prev) => ({ ...prev, [field]: value }));
  };

  // ── Day management ───────────────────────────────────────────────────────
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

  const handleCreateNewBlankItinerary = async () => {
    setIsGenerating(false);
    showToast("info", "Creating new blank itinerary...");
    try {
      const seq = await generateSequentialRef();
      const blank = createBlankItinerary(seq);
      setItineraryData(blank);
      showToast("success", `New blank itinerary created! Ref: ${blank.refNumber}`);
    } catch {
      const blank = createBlankItinerary();
      setItineraryData(blank);
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
    showToast("info", "Reset itinerary to standard Himachal template.");
  };

  // ── Save / Load ──────────────────────────────────────────────────────────
  const handleSaveItinerary = async () => {
    setIsSaving(true);
    try {
      const res = await saveItineraryToFirebase(itineraryData);
      setItineraryData((prev) => ({
        ...prev,
        refNumber: res.refNumber || prev.refNumber,
        voucherRef: res.voucherRef || prev.voucherRef,
      }));
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
    showToast("success", `Loaded ${savedDoc.refNumber} — ${savedDoc.destinationTitle || "Untitled"}`);
  };

  // ── Mark as Confirmed ────────────────────────────────────────────────────
  const handleConfirmItinerary = (patch) => {
    const voucherRef = itineraryData.refNumber.replace("LT-", "LTV-");
    setItineraryData((prev) => ({
      ...prev,
      ...patch,
      status: "Confirmed",
      voucherRef,
    }));
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
      let newHits = 0, newGemini = 0;

      const updatedDays = itineraryData.days.map((day) => {
        const allDayAttractions = getAllAttractionsForDay(day);
        const details = allDayAttractions.map((attName) => {
          const key = attName.toLowerCase().trim();
          const found = lookup[key];
          if (found) {
            if (found.cached) newHits++; else newGemini++;
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

      // Auto pick cover photo from first attraction of Day 1 if mode is auto
      let coverPhoto = itineraryData.coverPhoto;
      if ((!coverPhoto || coverPhoto.mode === "auto") && updatedDays[0]?.attractionDetails?.[0]?.imageUrl) {
        coverPhoto = { mode: "auto", url: updatedDays[0].attractionDetails[0].imageUrl };
      }

      setItineraryData((prev) => ({ ...prev, days: updatedDays, coverPhoto }));
      setStats((prev) => ({ ...prev, cacheHits: prev.cacheHits + newHits, geminiCalls: prev.geminiCalls + newGemini }));
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
      showToast("error", "Preview element not found.");
      return;
    }
    setIsExporting(true);
    showToast("info", "Capturing route map & rendering high-resolution PDF...");
    try {
      // 1. Capture snapshot of interactive map container
      const mapImg = await captureMapSnapshot("leaflet-map-container");
      if (mapImg) {
        setMapImageBase64(mapImg);
        // Brief delay so state updates and DOM renders the snapshot before PDF print
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // 2. Render PDF from preview DOM
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header
        onNewBlank={handleCreateNewBlankItinerary}
        onGenerate={handleGenerateItinerary}
        onExportPdf={handleExportPdf}
        onExportVoucher={handleExportVoucher}
        onReset={handleResetTemplate}
        onSave={handleSaveItinerary}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onMarkConfirmed={() => setIsConfirmModalOpen(true)}
        onOpenCoverModal={() => setIsCoverModalOpen(true)}
        isGenerating={isGenerating}
        isExporting={isExporting}
        isExportingVoucher={isExportingVoucher}
        isSaving={isSaving}
        stats={stats}
        backendStatus={backendStatus}
        itineraryStatus={itineraryData.status}
        voucherRef={itineraryData.voucherRef}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-2 ${
              toast.type === "success"
                ? "bg-emerald-900 text-emerald-100 border-emerald-700"
                : toast.type === "error"
                ? "bg-rose-900 text-rose-100 border-rose-700"
                : "bg-blue-900 text-blue-100 border-blue-700"
            }`}
          >
            {toast.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-300" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-300" />}
            {toast.type === "info" && <Database className="w-4 h-4 text-blue-300" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
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

      {/* Main Studio Body */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20 sm:pb-6">
        {/* Left Form Editor */}
        <section
          className={`lg:col-span-5 h-auto lg:h-[calc(100vh-130px)] lg:sticky lg:top-24 ${
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
          />
        </section>

        {/* Right Live & Editable Preview with Map right on top */}
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
              <span>Live Interactive Preview</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Tap text to edit inline
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Toggle Route Map */}
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
                <Map className="w-3.5 h-3.5 text-blue-600" />
                <span>{showRouteMap ? "Hide Map" : "Show Map"}</span>
              </button>

              {itineraryData.status === "Confirmed" && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>CONFIRMED</span>
                </span>
              )}
              <span className="text-[11px] text-slate-400">
                Ref: <strong className="text-slate-600">{itineraryData.refNumber}</strong>
              </span>
            </div>
          </div>

          {/* Interactive Leaflet Route Map directly above Live Preview */}
          {(showRouteMap || activeView === "map") && (
            <ItineraryMap
              days={itineraryData.days}
              destinationTitle={itineraryData.destinationTitle}
              isCollapsible={true}
            />
          )}

          {activeView !== "map" && (
            <LivePreview
              ref={previewRef}
              itineraryData={itineraryData}
              mapImageBase64={mapImageBase64}
              onUpdateField={handleFieldChange}
            />
          )}

          {/* Hidden Travel Voucher DOM Container for client-side html2pdf export */}
          <div className="hidden">
            <TravelVoucherPDF itineraryData={itineraryData} />
          </div>
        </section>
      </main>

      {/* Mobile Bottom Sticky Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 z-40 shadow-lg flex items-center justify-around">
        <button
          type="button"
          onClick={() => setActiveView("editor")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-bold transition-all ${
            activeView === "editor"
              ? "text-blue-700 bg-blue-50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="text-sm">📝</span>
          <span>Editor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("preview")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-bold transition-all ${
            activeView === "preview"
              ? "text-blue-700 bg-blue-50"
              : "text-slate-500 hover:text-slate-800"
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
            activeView === "map"
              ? "text-blue-700 bg-blue-50"
              : "text-slate-500 hover:text-slate-800"
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
  );
}
