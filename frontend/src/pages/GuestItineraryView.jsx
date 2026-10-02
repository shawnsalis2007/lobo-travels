import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Calendar,
  Users,
  Phone,
  Car,
  Hotel,
  MapPin,
  FileDown,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Plane,
  Train,
  CheckCircle,
  Coffee,
  UtensilsCrossed,
  Soup,
  Share2,
} from "lucide-react";
import ItineraryMap from "../components/ItineraryMap";
import LivePreview from "../components/LivePreview";
import {
  buildDriveLine,
  buildTransitLine,
  migrateLegacyDay,
  getDayAccommodation,
  getDayDateInfo,
  formatIndianRupee,
} from "../utils/routeUtils";
import { exportItineraryToPdf } from "../utils/pdfGenerator";
import { INITIAL_ITINERARY_DATA } from "../data/defaultItinerary";
import { API_BASE_URL } from "../utils/api";

export default function GuestItineraryView({ refNumber: propRef }) {
  // Extract reference number from URL if not provided via props: e.g. /view/LT-2026-0001
  const pathRef =
    typeof window !== "undefined"
      ? window.location.pathname.replace(/^\/view\/?/, "").trim()
      : "";
  const activeRef = propRef || pathRef || "LT-2026-0001";

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [isExporting, setIsExporting] = useState(false);

  const previewRef = useRef(null);

  const expandDays = (it) => {
    const initExpanded = {};
    (it?.days || []).forEach((d) => {
      initExpanded[d.id || d.dayNumber] = true;
    });
    setExpandedDays(initExpanded);
  };

  useEffect(() => {
    async function loadPublicItinerary() {
      setLoading(true);
      setError(null);

      // 1. Try public API endpoint
      try {
        const res = await fetch(`${API_BASE_URL}/api/itineraries/public/${encodeURIComponent(activeRef)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.itinerary) {
            setItinerary(data.itinerary);
            expandDays(data.itinerary);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Public API fetch error, trying secondary sources:", err.message);
      }

      // 2. Try list endpoint
      try {
        const listRes = await fetch(`${API_BASE_URL}/api/itinerary/list`);
        if (listRes.ok) {
          const listData = await listRes.json();
          const found = (listData.itineraries || []).find(
            (it) => it.refNumber === activeRef || it.id === activeRef
          );
          if (found) {
            setItinerary(found);
            expandDays(found);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore
      }

      // 3. Try LocalStorage draft stored on this device
      try {
        const cachedByRef = localStorage.getItem("lobo_itinerary_" + activeRef);
        if (cachedByRef) {
          const parsed = JSON.parse(cachedByRef);
          setItinerary(parsed);
          expandDays(parsed);
          setLoading(false);
          return;
        }

        const activeDraft = localStorage.getItem("lobo_active_itinerary");
        if (activeDraft) {
          const parsed = JSON.parse(activeDraft);
          const combined = { ...parsed, refNumber: activeRef };
          setItinerary(combined);
          expandDays(combined);
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }

      // 4. Default Interactive Template fallback (guarantees interactive map always loads)
      const fallbackTemplate = {
        ...INITIAL_ITINERARY_DATA,
        days: INITIAL_ITINERARY_DATA.days.map(migrateLegacyDay),
        refNumber: activeRef,
      };
      setItinerary(fallbackTemplate);
      expandDays(fallbackTemplate);
      setLoading(false);
    }

    if (activeRef) {
      loadPublicItinerary();
    }
  }, [activeRef]);

  const toggleDay = (dayKey) => {
    setExpandedDays((prev) => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      await exportItineraryToPdf(previewRef.current, itinerary.refNumber);
    } catch (err) {
      alert("PDF download failed: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: itinerary?.destinationTitle || "Lobo Travels Itinerary",
          text: `View my travel itinerary for ${itinerary?.destinationTitle}:`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Itinerary link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="h-14 w-auto p-1 bg-white rounded-xl border border-slate-200 shadow-sm mb-4">
          <img src="/lobo-logo.jpg" alt="Lobo Travels" className="h-12 w-auto object-contain" />
        </div>
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-xs font-semibold text-slate-600">Loading your travel proposal...</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Ref: {activeRef}</p>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <img src="/lobo-logo.jpg" alt="Lobo Travels" className="h-14 w-auto mx-auto mb-4 object-contain" />
          <h2 className="text-base font-bold text-slate-800 mb-1">Itinerary Not Found</h2>
          <p className="text-xs text-slate-500 mb-4">
            Could not find an active itinerary with reference <strong>{activeRef}</strong>.
          </p>
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-block shadow-xs"
          >
            Go to Itinerary Studio
          </a>
        </div>
      </div>
    );
  }

  const driverPhone =
    itinerary.confirmation?.driverPhone ||
    itinerary.selectedVehicle?.driverPhone ||
    "9811240072";

  const driverName =
    itinerary.confirmation?.driverName ||
    itinerary.selectedVehicle?.driverName ||
    "Dedicated Hill Chauffeur";

  const whatsappMessage = encodeURIComponent(
    `Hello Lobo Travels! I am viewing my itinerary (${itinerary.refNumber}) for "${itinerary.destinationTitle}". I have a query.`
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-24">
      {/* ── 1. Top Guest Header ───────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/lobo-logo.jpg" alt="Lobo Travels" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-xs font-extrabold uppercase tracking-tight text-blue-950">
                LOBO TRAVELS
              </h1>
              <p className="text-[10px] text-slate-500">Live Travel Companion</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 text-xs font-medium flex items-center space-x-1"
              title="Share Itinerary"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <span className="text-[11px] font-mono bg-blue-50 text-blue-800 px-2 py-1 rounded-md border border-blue-200 font-bold">
              {itinerary.refNumber}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ─────────────────────────────────────── */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-blue-950">
              Official Guest Itinerary
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {itinerary.destinationTitle}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/15 text-xs">
              <div>
                <span className="text-[10px] text-blue-200 uppercase block">Guest Name</span>
                <span className="font-semibold">{itinerary.clientName}</span>
              </div>
              <div>
                <span className="text-[10px] text-blue-200 uppercase block">Duration</span>
                <span className="font-semibold">{itinerary.tripDuration}</span>
              </div>
              {itinerary.travelDates && (
                <div>
                  <span className="text-[10px] text-blue-200 uppercase block">Travel Dates</span>
                  <span className="font-semibold">{itinerary.travelDates}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 2. Chauffeur & Vehicle Quick Contact Card ─────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Assigned Chauffeur & Vehicle
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                {driverName} • {itinerary.selectedVehicle?.name || "Toyota Innova Crysta"}
              </h3>
              {itinerary.selectedVehicle?.vehicleNo && (
                <p className="text-xs text-slate-500 font-mono">
                  Vehicle No: {itinerary.selectedVehicle.vehicleNo}
                </p>
              )}
            </div>
          </div>

          <a
            href={`tel:${driverPhone.replace(/[^\d+]/g, "")}`}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Call Driver ({driverPhone})</span>
          </a>
        </div>

        {/* ── 3. Full-Width Interactive Route Map ──────────────────────── */}
        <div>
          <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wide mb-2.5 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Live Interactive Route Map</span>
          </h3>
          <ItineraryMap
            days={itinerary.days}
            destinationTitle={itinerary.destinationTitle}
            isCollapsible={false}
          />
        </div>

        {/* ── 4. Day-by-Day Interactive Schedule ───────────────────────── */}
        <div>
          <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wide mb-3 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Day-by-Day Travel Schedule</span>
          </h3>

          <div className="space-y-4">
            {(itinerary.days || []).map((day, idx) => {
              const dayKey = day.id || day.dayNumber || idx + 1;
              const isExpanded = !!expandedDays[dayKey];
              const prevDay = idx > 0 ? itinerary.days[idx - 1] : null;
              const autoDrive = buildDriveLine(prevDay, day);
              const meals = day.meals || {};
              const hasMeals = meals.breakfast || meals.lunch || meals.dinner;

              return (
                <div
                  key={dayKey}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
                >
                  {/* Day Header Accordion Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleDay(dayKey)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-blue-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        D{day.dayNumber || idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{day.title}</h4>
                        <p className="text-xs text-slate-500 truncate">
                          {Array.isArray(day.stops)
                            ? day.stops.map((s) => s.locationName).filter(Boolean).join(" → ")
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {hasMeals && (
                        <div className="hidden sm:flex items-center space-x-1">
                          {meals.breakfast && (
                            <span className="p-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200 text-[10px] font-bold">
                              Breakfast
                            </span>
                          )}
                          {meals.dinner && (
                            <span className="p-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200 text-[10px] font-bold">
                              Dinner
                            </span>
                          )}
                        </div>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Day Content */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-4 text-xs">
                      {/* Transit Line */}
                      {autoDrive && (
                        <div className="mt-3 px-3 py-2 bg-indigo-50/80 border border-indigo-200/60 rounded-xl text-indigo-900 font-semibold flex items-center space-x-2">
                          <Compass className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>{autoDrive}</span>
                        </div>
                      )}

                      {/* Day Description */}
                      {day.description && (
                        <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                          {day.description}
                        </p>
                      )}

                      {/* Attractions Cards */}
                      {day.attractionDetails && day.attractionDetails.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Key Sightseeing & Attractions:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {day.attractionDetails.map((att, aIdx) => (
                              <div
                                key={aIdx}
                                className="border border-slate-200 rounded-xl p-2.5 flex items-center space-x-3 bg-slate-50/50"
                              >
                                <img
                                  src={
                                    att.imageUrl ||
                                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                                  }
                                  alt={att.name}
                                  className="w-20 h-20 object-cover rounded-lg overflow-hidden shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src =
                                      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-bold text-slate-900 truncate">{att.name}</h5>
                                  <a
                                    href={att.wikiUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center space-x-0.5 mt-1"
                                  >
                                    <span>Read Wikipedia Guide</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Day-Specific Accommodation Badge */}
                      {(() => {
                        const dayAcc = getDayAccommodation(day, itinerary);
                        const isLastDay = idx === (itinerary.days || []).length - 1;
                        const isCheckOutOnly = day.stops?.some((s) => s.isCheckOut && !s.isOvernight) || isLastDay;

                        return (
                          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50/40 rounded-xl p-3 border border-blue-100/80 text-xs">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                                <Hotel className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2 flex-wrap">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-1.5 py-0.2 rounded border border-blue-200">
                                    {isCheckOutOnly ? "Day Accommodation / Departure" : `Day ${day.dayNumber || idx + 1} Night Stay`}
                                  </span>
                                  <span className="font-bold text-slate-900">{dayAcc.name}</span>
                                  {dayAcc.city && (
                                    <span className="text-[11px] text-slate-500 font-medium">• {dayAcc.city}</span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-[11px] text-slate-600 mt-0.5 flex-wrap">
                                  <span>Room: <strong className="text-slate-800 font-semibold">{dayAcc.roomType}</strong></span>
                                  <span className="text-slate-300">•</span>
                                  <span>Plan: <strong className="text-emerald-700 font-semibold">{dayAcc.mealPlan}</strong></span>
                                </div>
                              </div>
                            </div>
                            {dayAcc.rating && (
                              <span className="text-[10px] font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200 shrink-0 self-start sm:self-center">
                                ★ {dayAcc.rating}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5. Comprehensive Accommodations Summary (All Days) & Chauffeur Fleet ─────────────────────────── */}
        <div className="space-y-6">
          {/* 5A. All Days Accommodation Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wide flex items-center space-x-2">
                <Hotel className="w-4 h-4 text-blue-600" />
                <span>Tour Accommodations Summary (All Days)</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {(itinerary.days || []).length} Days Schedule • {itinerary.selectedHotel?.nights || (itinerary.days || []).length - 1} Nights Stay
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-2.5 w-[14%]">Day / Date</th>
                    <th className="py-2 px-2.5 w-[15%]">Destination</th>
                    <th className="py-2 px-2.5 w-[27%]">Hotel / Property</th>
                    <th className="py-2 px-2.5 w-[18%]">Room Category</th>
                    <th className="py-2 px-2.5 w-[13%]">Meal Plan</th>
                    <th className="py-2 px-2.5 w-[13%] text-right">Stay Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
                  {(itinerary.days || []).map((day, dIdx) => {
                    const acc = getDayAccommodation(day, itinerary);
                    const dateInfo = getDayDateInfo(day, dIdx, itinerary.travelDates);
                    const isLastDay = dIdx === (itinerary.days || []).length - 1;
                    const isCheckOutOnly = day.stops?.some((s) => s.isCheckOut && !s.isOvernight) || isLastDay;

                    return (
                      <tr key={day.id || dIdx} className="hover:bg-slate-50/60 transition">
                        <td className="py-2 px-2.5 font-semibold align-top">
                          <span className="font-extrabold text-blue-950 block">Day {day.dayNumber || dIdx + 1}</span>
                          {dateInfo.date && (
                            <span className="block text-[10px] text-slate-400 font-normal">{dateInfo.date}</span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 font-semibold text-slate-900 align-top">
                          {acc.city || day.stops?.[0]?.locationName || "Manali"}
                        </td>
                        <td className="py-2 px-2.5 align-top">
                          <div className="font-bold text-slate-900 flex items-center space-x-1 flex-wrap">
                            <span>{acc.name}</span>
                            {acc.rating && <span className="text-[10px] text-amber-600 font-bold ml-1">★{acc.rating}</span>}
                          </div>
                          {acc.address && <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{acc.address}</div>}
                        </td>
                        <td className="py-2 px-2.5 text-slate-700 align-top">
                          {acc.roomType || "Deluxe Mountain View Room"}
                        </td>
                        <td className="py-2 px-2.5 align-top">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {acc.mealPlan || "MAP (Breakfast & Dinner)"}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-right align-top">
                          {isCheckOutOnly ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                              Check-out &amp; Departure
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                              Overnight Stay (Night {dIdx + 1})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5B. Dedicated Chauffeur Fleet Card */}
          {itinerary.selectedVehicle && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wide flex items-center space-x-2">
                  <Car className="w-4 h-4 text-indigo-600" />
                  <span>Dedicated Private Chauffeur &amp; Fleet Details</span>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-900 px-2 py-0.5 rounded border border-indigo-200">
                  100% Dedicated Vehicle
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Vehicle</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{itinerary.selectedVehicle.name}</p>
                  <p className="text-[11px] text-slate-500">{itinerary.selectedVehicle.category || "Premium MPV / SUV"}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Chauffeur / Driver</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {itinerary.confirmation?.driverName || itinerary.selectedVehicle.driverName || "Dedicated Hill Chauffeur"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {itinerary.confirmation?.driverPhone || itinerary.selectedVehicle.driverPhone || "+91 98112 40072"}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle Number</span>
                  <p className="font-mono font-bold text-blue-900 text-sm mt-0.5">
                    {itinerary.confirmation?.vehicleNo || itinerary.selectedVehicle.vehicleNo || "HP 01 CA 5566"}
                  </p>
                  <p className="text-[10px] text-slate-500">Commercial Tourist Permit</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Seating &amp; Capacity</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{itinerary.selectedVehicle.capacity || "6 Pax + 1 Driver"}</p>
                  <p className="text-[10px] text-emerald-700 font-medium">Luggage Boot Space</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 flex-wrap gap-2">
                <span className="text-emerald-700 font-medium">
                  ✓ Fuel, All State Toll Taxes, Green Tax, Parking &amp; Driver Night Allowances Included
                </span>
                <span className="text-slate-400">Duty Hours: 08:00 AM – 08:00 PM</span>
              </div>
            </div>
          )}

          {/* 5C. Payment Settlement Details Card */}
          {((itinerary.confirmation && (itinerary.confirmation.totalCost > 0 || itinerary.confirmation.advancePaid > 0)) || itinerary.status === "Confirmed" || itinerary.advancePaid) && (
            <div className="bg-white border border-emerald-300 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wide flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Official Booking &amp; Payment Settlement</span>
                </h3>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                  STATUS: CONFIRMED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Package Cost</span>
                  <p className="font-extrabold text-slate-900 text-base mt-0.5">
                    {formatIndianRupee(itinerary.confirmation?.totalCost || itinerary.estimatedCost)}
                  </p>
                  <p className="text-[10px] text-slate-500">All Taxes &amp; Inclusions</p>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Advance Paid</span>
                  <p className="font-extrabold text-emerald-800 text-base mt-0.5">
                    {formatIndianRupee(itinerary.confirmation?.advancePaid || itinerary.advancePaid || 0)}
                  </p>
                  <p className="text-[10px] text-emerald-600">
                    {itinerary.confirmation?.paymentMode || "Received"} {itinerary.confirmation?.advanceDate ? `• ${itinerary.confirmation.advanceDate}` : ""}
                  </p>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-amber-800 uppercase font-bold block">Pending Balance</span>
                  <p className="font-extrabold text-amber-900 text-base mt-0.5">
                    {formatIndianRupee(
                      itinerary.confirmation?.pendingAmount !== undefined
                        ? itinerary.confirmation.pendingAmount
                        : Math.max(
                            0,
                            (parseInt(String(itinerary.estimatedCost).replace(/[^\d]/g, ""), 10) || 0) -
                              (itinerary.confirmation?.advancePaid || itinerary.advancePaid || 0)
                          )
                    )}
                  </p>
                  <p className="text-[10px] text-amber-700 font-medium">Payable upon arrival</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Mode</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {itinerary.confirmation?.paymentMode || "UPI / Bank Transfer"}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">Advance Verified</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden preview container for client PDF export */}
        <div className="hidden">
          <LivePreview ref={previewRef} itineraryData={itinerary} onUpdateField={() => {}} />
        </div>
      </main>

      {/* ── 6. Floating Quick Actions Bar for Guests ───────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          {/* Download PDF button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            <span>{isExporting ? "Rendering PDF..." : "Download PDF"}</span>
          </button>

          {/* WhatsApp Support button */}
          <a
            href={`https://wa.me/919811240072?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
