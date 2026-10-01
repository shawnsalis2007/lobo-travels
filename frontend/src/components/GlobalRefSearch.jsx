import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Users,
  Calendar,
  Sparkles,
  Ticket,
  Download,
  Loader2,
} from "lucide-react";
import { fetchItineraryByRef } from "../utils/api";

export default function GlobalRefSearch({
  itineraries = [],
  onSelectItinerary,
  onExportPdf,
  onExportVoucher,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchingServer, setIsSearchingServer] = useState(false);
  const [serverResult, setServerResult] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcut: Ctrl+K or Cmd+K or / to focus search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter local itineraries
  const trimmed = query.trim().toLowerCase();
  const localResults = trimmed
    ? itineraries.filter((item) => {
        const ref = (item.refNumber || "").toLowerCase();
        const vRef = (item.voucherRef || "").toLowerCase();
        const client = (item.clientName || "").toLowerCase();
        const phone = (item.clientPhone || "").toLowerCase();
        const title = (item.destinationTitle || "").toLowerCase();
        return (
          ref.includes(trimmed) ||
          vRef.includes(trimmed) ||
          client.includes(trimmed) ||
          phone.includes(trimmed) ||
          title.includes(trimmed)
        );
      })
    : [];

  // If query looks like a reference number (e.g. LT- or contains digits) and no local match, search backend
  useEffect(() => {
    if (!trimmed) {
      setServerResult(null);
      setServerError(null);
      return;
    }

    // If local match exists, don't auto-fetch from backend immediately
    if (localResults.length > 0) {
      setServerResult(null);
      setServerError(null);
      return;
    }

    // If it looks like a ref code (e.g., LT-2026-..., 2026-, LTV-)
    const isRefCandidate =
      trimmed.startsWith("lt") ||
      trimmed.includes("202") ||
      trimmed.startsWith("ltv") ||
      /^\d{4}/.test(trimmed);

    if (isRefCandidate && trimmed.length >= 4) {
      const timer = setTimeout(async () => {
        setIsSearchingServer(true);
        setServerError(null);
        try {
          // Normalize reference format
          let targetRef = query.trim();
          if (/^\d{4}/.test(targetRef) && !targetRef.toUpperCase().startsWith("LT-")) {
            targetRef = `LT-${targetRef}`;
          }

          const res = await fetchItineraryByRef(targetRef);
          if (res && res.itinerary) {
            setServerResult(res.itinerary);
          } else {
            setServerResult(null);
          }
        } catch (err) {
          setServerResult(null);
          // Check local storage for directly saved itinerary keys
          try {
            const raw = localStorage.getItem("lobo_itinerary_" + query.trim().toUpperCase());
            if (raw) {
              setServerResult(JSON.parse(raw));
            }
          } catch {
            // ignore
          }
        } finally {
          setIsSearchingServer(false);
        }
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [trimmed, query, localResults.length]);

  const allItems = [
    ...localResults,
    ...(serverResult && !localResults.some((l) => l.refNumber === serverResult.refNumber)
      ? [serverResult]
      : []),
  ];

  const handleSelect = (item) => {
    if (!item) return;
    onSelectItinerary(item);
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDownInput = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allItems.length > 0) {
        handleSelect(allItems[selectedIndex] || allItems[0]);
      } else if (trimmed) {
        // Direct attempt with query
        handleDirectLookup(query.trim());
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleDirectLookup = async (refStr) => {
    if (!refStr) return;
    setIsSearchingServer(true);
    try {
      let targetRef = refStr;
      if (!targetRef.toUpperCase().startsWith("LT-") && !targetRef.toUpperCase().startsWith("LTV-")) {
        targetRef = `LT-${targetRef}`;
      }
      const res = await fetchItineraryByRef(targetRef);
      if (res && res.itinerary) {
        handleSelect(res.itinerary);
      }
    } catch {
      // ignore
    } finally {
      setIsSearchingServer(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-[200px] sm:min-w-[280px] max-w-md">
      {/* ── Search Input Box (Matches User Screenshot media_1790870552631.png) ── */}
      <div
        className={`relative flex items-center bg-[#151926] hover:bg-[#1a2030] text-slate-100 rounded-xl border transition-all duration-150 shadow-inner group ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/25 bg-[#1a2030]"
            : "border-slate-700/80 hover:border-slate-600"
        }`}
      >
        <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-300 ml-3 shrink-0 pointer-events-none transition-colors" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDownInput}
          placeholder="Search Ref (e.g. LT-2026-0001), client, tour..."
          className="w-full bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-400 font-sans focus:outline-hidden"
        />

        {/* Clear Button or Spinner */}
        <div className="flex items-center gap-1.5 pr-2.5 shrink-0">
          {isSearchingServer && (
            <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          )}

          {query && !isSearchingServer && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setServerResult(null);
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded-md hover:bg-slate-800 transition cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Shortcut badge */}
          {!query && (
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 rounded-md select-none">
              Ctrl+K
            </span>
          )}
        </div>
      </div>

      {/* ── Dropdown Suggestions Menu (Floats over all content) ───────────────── */}
      {isOpen && (query || allItems.length > 0 || isSearchingServer) && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[min(96vw,560px)] min-w-[280px] sm:min-w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[9999] text-slate-900 animate-scale-up max-h-[440px] flex flex-col">
          {/* Dropdown Header */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Search className="w-3 h-3 text-blue-600" />
              <span>
                {allItems.length > 0
                  ? `Found ${allItems.length} matching tour${allItems.length > 1 ? "s" : ""}`
                  : isSearchingServer
                  ? "Searching Firestore database..."
                  : "No local results found"}
              </span>
            </span>
            <span className="text-[10px] text-slate-400">↑↓ to navigate • Enter to load</span>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-slate-100 p-1.5">
            {allItems.length > 0 ? (
              allItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const isConfirmed = item.status === "Confirmed";

                return (
                  <div
                    key={item.refNumber || idx}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-2.5 rounded-xl transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-blue-50/90 text-blue-950 shadow-2xs"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      {/* Top row: Reference Badge + Status */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-md tracking-wide">
                          {item.refNumber}
                        </span>

                        {item.voucherRef && (
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                            Voucher: {item.voucherRef}
                          </span>
                        )}

                        {isConfirmed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Confirmed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Draft</span>
                          </span>
                        )}
                      </div>

                      {/* Middle row: Tour Title */}
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {item.destinationTitle || "Untitled Itinerary"}
                      </div>

                      {/* Bottom row: Client & Details */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 truncate">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{item.clientName || "Lead Guest"}</span>
                        </span>

                        {item.clientPhone && (
                          <span className="text-slate-400">• {item.clientPhone}</span>
                        )}

                        {item.tripDuration && (
                          <span className="text-slate-400">• {item.tripDuration}</span>
                        )}
                      </div>
                    </div>

                    {/* Action Trigger Pill */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(item);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs flex items-center gap-1 transition cursor-pointer active:scale-95"
                        title="Load into Studio Editor"
                      >
                        <span>Load</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      {onExportPdf && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportPdf(item);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                          title="Quick Export PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isConfirmed && onExportVoucher && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportVoucher(item);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                          title="Quick Export Voucher"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : isSearchingServer ? (
              <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span>Searching database for reference "{query}"...</span>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 px-4">
                <div className="text-slate-400 mb-1 font-medium">
                  No itinerary found for <strong className="text-slate-700">"{query}"</strong>
                </div>
                <div className="text-[11px] text-slate-400 mb-3">
                  Check the reference number (e.g. <span className="font-mono font-semibold text-slate-600">LT-2026-0001</span>) or guest name.
                </div>
                <button
                  type="button"
                  onClick={() => handleDirectLookup(query.trim())}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
                >
                  <Search className="w-3 h-3 text-slate-500" />
                  <span>Force search backend for "{query}"</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
