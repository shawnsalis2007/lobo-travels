import React, { useState, useEffect } from "react";
import { FolderOpen, X, Clock, User, MapPin, CheckCircle, RefreshCw } from "lucide-react";
import { fetchSavedItineraries } from "../utils/api";

export default function SavedItinerariesModal({ isOpen, onClose, onLoadItinerary }) {
  const [loading, setLoading] = useState(false);
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSavedItineraries();
      setItineraries(data.itineraries || []);
    } catch (err) {
      setError(err.message);
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
                Saved Itineraries (Firebase Firestore)
              </h3>
              <p className="text-xs text-slate-500">
                Select any stored itinerary to load into the builder & preview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center space-x-3">
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
            className="p-2.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-xl text-xs flex items-center space-x-1"
            title="Refresh list from Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Itinerary List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {loading && (
            <div className="py-12 text-center text-xs text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              <span>Fetching itineraries from Firebase Firestore...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs">
              {error}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No itineraries found in Firestore database. Click "Save to Cloud" to store your first itinerary!
            </div>
          )}

          {!loading &&
            filtered.map((item) => (
              <div
                key={item.refNumber}
                className="border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all rounded-xl p-4 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.refNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[280px]">
                      {item.destinationTitle || "Untitled Itinerary"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{item.clientName || "Guest"}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.tripDuration || "N/A"}</span>
                    </span>
                    {item.updatedAt && (
                      <span className="text-slate-400">
                        {new Date(item.updatedAt).toLocaleDateString()}
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
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 flex items-center space-x-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Load Itinerary</span>
                </button>
              </div>
            ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Total Saved: {itineraries.length} itinerary documents</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
