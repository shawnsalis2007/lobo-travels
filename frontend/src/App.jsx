import React, { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import ItineraryForm from "./components/ItineraryForm";
import LivePreview from "./components/LivePreview";
import SavedItinerariesModal from "./components/SavedItinerariesModal";
import ConfirmModal from "./components/ConfirmModal";
import CoverPhotoModal from "./components/CoverPhotoModal";
import SettingsModal, { DEFAULT_AGENCY_SETTINGS } from "./components/SettingsModal";
import KPICardsBar from "./components/KPICardsBar";
import RecentItinerariesTable from "./components/RecentItinerariesTable";
import TravelVoucherPDF from "./components/TravelVoucherPDF";
import ItineraryMap from "./components/ItineraryMap";
import DestinationsView from "./components/DestinationsView";
import HotelsDirectoryView from "./components/HotelsDirectoryView";
import DashboardView from "./components/DashboardView";
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
import { getAllAttractionsForDay, migrateLegacyDay, createDay, createStop } from "./utils/routeUtils";
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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(true);
  const [activeView, setActiveView] = useState("split"); // 'split' | 'editor' | 'preview' | 'map'
  const [mainTab, setMainTab] = useState("itinerary"); // 'itinerary' | 'destinations' | 'hotels' | 'dashboard'
  const [toast, setToast] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [stats, setStats] = useState({ cacheHits: 6, geminiCalls: 1, tokensSaved: "94%" });

  // Agency Branding & Configuration (Persisted)
  const [agencySettings, setAgencySettings] = useState(() => {
    try {
      const saved = localStorage.getItem("lobo_agency_settings");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_AGENCY_SETTINGS;
  });

  const handleSaveAgencySettings = (newSettings) => {
    setAgencySettings(newSettings);
    try {
      localStorage.setItem("lobo_agency_settings", JSON.stringify(newSettings));
    } catch {
      // ignore
    }
    showToast("success", "Agency settings & branding saved!");
  };

  const handleResetDemoData = () => {
    setAgencySettings(DEFAULT_AGENCY_SETTINGS);
    try {
      localStorage.setItem("lobo_agency_settings", JSON.stringify(DEFAULT_AGENCY_SETTINGS));
    } catch {
      // ignore
    }
    showToast("info", "Reset settings to Lobo Travels defaults.");
  };

  const previewRef = useRef(null);

  // Check health on startup
  useEffect(() => {
    checkBackendHealth().then((status) => {
      setBackendStatus(status);
    });
  }, []);

  // All Itineraries List for KPI Metrics & Dashboard
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
    return [
      {
        refNumber: "LT-2026-1048",
        destinationTitle: "Scenic Himachal Mountain Escape (Manali & Solang)",
        clientName: "Mr. Rajesh Sharma & Family",
        status: "Confirmed",
        estimatedCost: "₹ 48,500 / Total Package",
        days: INITIAL_ITINERARY_DATA.days,
      },
      {
        refNumber: "LT-2026-1049",
        destinationTitle: "Magical Kashmir Valley & Dal Lake Serenity",
        clientName: "Dr. Ananya Sen & Spouse",
        status: "Draft",
        estimatedCost: "₹ 62,000 / Total Package",
        days: INITIAL_ITINERARY_DATA.days.slice(0, 2),
      },
    ];
  });

  // Sync itinerariesList to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("lobo_all_itineraries", JSON.stringify(itinerariesList));
    } catch {
      // ignore
    }
  }, [itinerariesList]);

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
    setItineraryData((prev) => {
      const updated = { ...prev, [field]: value };
      setItinerariesList((list) => {
        const idx = list.findIndex((i) => i.refNumber === updated.refNumber);
        if (idx >= 0) {
          const copy = [...list];
          copy[idx] = { ...copy[idx], ...updated };
          return copy;
        }
        return [updated, ...list];
      });
      return updated;
    });
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
      setItinerariesList((prev) => [blank, ...prev.filter((d) => d.refNumber !== blank.refNumber)]);
      showToast("success", `New blank itinerary ready! Ref: ${blank.refNumber}`);
    } catch {
      const blank = createBlankItinerary();
      setItineraryData(blank);
      setItinerariesList((prev) => [blank, ...prev.filter((d) => d.refNumber !== blank.refNumber)]);
      showToast("success", `New blank itinerary ready! Ref: ${blank.refNumber}`);
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
    showToast("info", "Reset itinerary to standard Himachal template.");
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
      setItinerariesList((prev) => [updated, ...prev.filter((d) => d.refNumber !== updated.refNumber)]);
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
    setItinerariesList((prev) => [migrated, ...prev.filter((d) => d.refNumber !== migrated.refNumber)]);
    showToast("success", `Loaded ${savedDoc.refNumber} — ${savedDoc.destinationTitle || "Untitled"}`);
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
    showToast("success", `Duplicated itinerary as ${clonedRef}!`);
  };

  const handleDeleteItinerary = (refNumber) => {
    setItinerariesList((prev) => prev.filter((d) => d.refNumber !== refNumber));
    try {
      localStorage.removeItem("lobo_itinerary_" + refNumber);
    } catch {
      // ignore
    }
    showToast("info", `Deleted record ${refNumber}.`);
  };

  // ── Plan From Destination Catalog ────────────────────────────────────────
  const handlePlanFromDestination = (dest) => {
    setItineraryData((prev) => {
      const destinationTitle = `${dest.name} Tour Package (${dest.city})`;
      const updatedDays = prev.days && prev.days.length > 0 ? [...prev.days] : [createDay(1)];
      if (updatedDays[0]) {
        const firstStop = updatedDays[0].stops?.[0] || createStop(dest.city);
        firstStop.locationName = dest.city;
        firstStop.attractions = dest.highlights ? [...dest.highlights] : firstStop.attractions;
        updatedDays[0] = {
          ...updatedDays[0],
          title: `Day 1 - Arrival & ${dest.name} Sightseeing`,
          stops: [firstStop],
          attractions: dest.highlights ? [...dest.highlights] : updatedDays[0].attractions,
        };
      }
      return {
        ...prev,
        destinationTitle,
        days: updatedDays,
      };
    });
    setMainTab("itinerary");
    setActiveView("editor");
    showToast("success", `Loaded ${dest.name} into Itinerary Builder!`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Apply Hotel From Directory ───────────────────────────────────────────
  const handleSelectHotelFromDirectory = (hotel) => {
    handleFieldChange("selectedHotel", {
      ...itineraryData.selectedHotel,
      name: hotel.name,
      city: hotel.city || itineraryData.selectedHotel.city,
      category: hotel.category || itineraryData.selectedHotel.category,
      roomType: hotel.roomType || itineraryData.selectedHotel.roomType,
      mealPlan: hotel.mealPlan || itineraryData.selectedHotel.mealPlan,
      rating: hotel.rating || itineraryData.selectedHotel.rating,
      address: hotel.address || itineraryData.selectedHotel.address,
      mapsUrl: hotel.mapsUrl || itineraryData.selectedHotel.mapsUrl,
    });
    setMainTab("itinerary");
    showToast("success", `Applied "${hotel.name}" to active itinerary!`);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            imageUrl: null,
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      <Header
        itineraries={itinerariesList}
        onLoadItinerary={(item) => {
          handleLoadItinerary(item);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onNewBlank={handleCreateNewBlankItinerary}
        onGenerate={handleGenerateItinerary}
        onExportPdf={handleExportPdf}
        onExportVoucher={handleExportVoucher}
        onReset={handleResetTemplate}
        onSave={handleSaveItinerary}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
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
        currentTab={mainTab}
        onSelectTab={(tab) => {
          setMainTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
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

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={agencySettings}
        onSaveSettings={handleSaveAgencySettings}
        onResetDemoData={handleResetDemoData}
      />

      {/* ── View Routing Based on Selected Navigation Tab ── */}
      {mainTab === "destinations" ? (
        <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-6 pb-28 sm:pb-12">
          <DestinationsView onPlanItinerary={handlePlanFromDestination} />
        </main>
      ) : mainTab === "hotels" ? (
        <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-6 pb-28 sm:pb-12">
          <HotelsDirectoryView onSelectHotelForItinerary={handleSelectHotelFromDirectory} />
        </main>
      ) : mainTab === "dashboard" ? (
        <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-6 pb-28 sm:pb-12">
          <DashboardView
            itineraries={itinerariesList}
            onCreateItinerary={handleCreateNewBlankItinerary}
            onNewItinerary={handleCreateNewBlankItinerary}
            onEditItinerary={(item) => {
              handleLoadItinerary(item);
              setMainTab("itinerary");
              setActiveView("editor");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onViewItinerary={(item) => {
              handleLoadItinerary(item);
              setMainTab("itinerary");
              setActiveView("preview");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onDuplicateItinerary={handleDuplicateItinerary}
            onDeleteItinerary={handleDeleteItinerary}
            onExportPdf={(item) => {
              handleLoadItinerary(item);
              setTimeout(() => handleExportPdf(), 300);
            }}
            onExportVoucher={(item) => {
              handleLoadItinerary(item);
              setTimeout(() => handleExportVoucher(), 300);
            }}
            onSelectTab={setMainTab}
          />
        </main>
      ) : (
        <>
          {/* ── 5 Operations KPI Metric Cards + Reset, Save & Create Blank CTA ── */}
          <KPICardsBar
            itineraries={itinerariesList}
            onCreateBlank={handleCreateNewBlankItinerary}
            onReset={handleResetTemplate}
            onSave={handleSaveItinerary}
            isSaving={isSaving}
            onFilterClick={() => setIsSavedModalOpen(true)}
          />

          {/* Main Studio Body */}
          <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-6 pb-28 sm:pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Form Editor - Expanded, Spacious, Full Height */}
              <section
                className={`lg:col-span-6 xl:col-span-5 w-full h-auto ${
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
                className={`lg:col-span-6 xl:col-span-7 w-full ${
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
                  <TravelVoucherPDF itineraryData={itineraryData} agencySettings={agencySettings} />
                </div>
              </section>
            </div>

            {/* ── Recent Tour Itineraries Table ── */}
            <RecentItinerariesTable
              itineraries={itinerariesList}
              onEdit={(item) => {
                handleLoadItinerary(item);
                setMainTab("itinerary");
                setActiveView("editor");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onView={(item) => {
                handleLoadItinerary(item);
                setMainTab("itinerary");
                setActiveView("preview");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onDuplicate={handleDuplicateItinerary}
              onDelete={handleDeleteItinerary}
              onExportPdf={(item) => {
                handleLoadItinerary(item);
                setTimeout(() => handleExportPdf(), 300);
              }}
              onExportVoucher={(item) => {
                handleLoadItinerary(item);
                setTimeout(() => handleExportVoucher(), 300);
              }}
            />
          </main>
        </>
      )}

      {/* Mobile Bottom Sticky Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 z-40 shadow-lg flex items-center justify-around pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]">
        <button
          type="button"
          onClick={() => {
            setMainTab("itinerary");
            setActiveView("editor");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all min-h-[44px] cursor-pointer active:scale-90 ${
            mainTab === "itinerary" && activeView === "editor"
              ? "text-blue-700 bg-blue-50 font-extrabold shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="text-base">📝</span>
          <span>Editor</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMainTab("itinerary");
            setActiveView("preview");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all min-h-[44px] cursor-pointer active:scale-90 ${
            mainTab === "itinerary" && activeView === "preview"
              ? "text-blue-700 bg-blue-50 font-extrabold shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="text-base">👁️</span>
          <span>Preview</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMainTab("itinerary");
            setShowRouteMap(true);
            setActiveView("map");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all min-h-[44px] cursor-pointer active:scale-90 ${
            mainTab === "itinerary" && activeView === "map"
              ? "text-blue-700 bg-blue-50 font-extrabold shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="text-base">🗺️</span>
          <span>Map</span>
        </button>

        <button
          type="button"
          onClick={handleSaveItinerary}
          disabled={isSaving}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold text-emerald-700 active:scale-90 transition-transform min-h-[44px] cursor-pointer disabled:opacity-50"
        >
          <span className="text-base">{isSaving ? "⏳" : "💾"}</span>
          <span>{isSaving ? "Saving" : "Save"}</span>
        </button>

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={isExporting}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold text-blue-700 active:scale-90 transition-transform min-h-[44px] cursor-pointer disabled:opacity-50"
        >
          <span className="text-base">{isExporting ? "⏳" : "📥"}</span>
          <span>PDF</span>
        </button>
      </nav>
    </div>
  );
}
