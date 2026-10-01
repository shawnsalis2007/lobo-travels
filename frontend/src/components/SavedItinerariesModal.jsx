import React, { useState, useEffect } from "react";
import { FolderOpen, X, Clock, User, MapPin, CheckCircle, RefreshCw, Plus } from "lucide-react";
import { fetchSavedItineraries } from "../utils/api";

export default function SavedItinerariesModal({ isOpen, onClose, onLoadItinerary, onNewBlank }) {
  const [loading, setLoading] = useState(false);
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSavedItineraries();
      const list = Array.isArray(data) ? data : data?.itineraries || [];

      // Also ensure local storage records are merged
      let localItems = [];
      try {
        const localSaved = localStorage.getItem("lobo_all_itineraries");
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed)) localItems = parsed;
        }
      } catch {
        // ignore
      }

      const map = new Map();
      [...localItems, ...list].forEach((item) => {
        if (item && item.refNumber) {
          map.set(item.refNumber, item);
        }
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.updatedAt || b.savedAt || 0) - new Date(a.updatedAt || a.savedAt || 0)
      );

      setItineraries(merged);
    } catch (err) {
      setError(err.message);
      try {
        const localSaved = localStorage.getItem("lobo_all_itineraries");
        if (localSaved) setItineraries(JSON.parse(localSaved));
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadList();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = itineraries.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.refNumber || "").toLowerCase().includes(term) ||
      (item.clientName || "").toLowerCase().includes(term) ||
      (item.destinationTitle || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Saved Tour Itineraries
              </h3>
              <p className="text-xs text-slate-500">
                Database &amp; Operations Registry • Load or review any saved tour
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & New Button */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center space-x-2.5">
          <input
            type="text"
            placeholder="Search by Ref #, Client Name, Destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 text-xs border border-slate-300 rounded-xl p-2.5 focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            onClick={loadList}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-xl text-xs flex items-center space-x-1 shrink-0 cursor-pointer"
            title="Refresh list from database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {onNewBlank && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNewBlank();
              }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shrink-0 shadow-xs transition-colors cursor-pointer"
              title="Create a new blank itinerary"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Itinerary</span>
            </button>
          )}
        </div>

        {/* Itinerary List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {loading && (
            <div className="py-12 text-center text-xs text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              <span>Fetching saved itineraries...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs">
              {error}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No itineraries found in the database. Click &ldquo;Save Tour&rdquo; to store your first itinerary!
            </div>
          )}

          {!loading &&
            filtered.map((item) => (
              <div
                key={item.refNumber}
                className="border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all rounded-xl p-4 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                      {item.refNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {item.destinationTitle || "Untitled Itinerary"}
                    </span>
                    {item.status === "Confirmed" && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                        Confirmed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[140px]">{item.clientName || "Guest"}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{item.tripDuration || `${item.days?.length || 1} Days`}</span>
                    </span>
                    {item.estimatedCost && (
                      <span className="font-semibold text-emerald-700">
                        {item.estimatedCost}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onLoadItinerary(item);
                    onClose();
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 flex items-center space-x-1.5 cursor-pointer active:scale-95"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Load Tour</span>
                </button>
              </div>
            ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Total Saved: {itineraries.length} tour records</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
