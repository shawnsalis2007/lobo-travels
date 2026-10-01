import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  Sparkles,
  CloudDownload,
  Star,
  MapPin,
  Check,
  Building2,
  ExternalLink,
  Loader2,
  DollarSign,
  PlusCircle,
} from "lucide-react";
import { searchHotelGoogle } from "../utils/api";

const HOTEL_SUGGESTIONS = [
  { name: "The Oberoi Amarvilas", city: "Agra" },
  { name: "Taj Palace", city: "New Delhi" },
  { name: "Rambagh Palace", city: "Jaipur" },
  { name: "Taj Lake Palace", city: "Udaipur" },
];

export default function GoogleHotelImportModal({
  isOpen,
  onClose,
  onImportHotel,
  onOpenManualEdit,
}) {
  const [hotelName, setHotelName] = useState("");
  const [city, setCity] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (overrideName, overrideCity) => {
    const targetName = (overrideName || hotelName).trim();
    const targetCity = (overrideCity !== undefined ? overrideCity : city).trim();

    if (!targetName) {
      setSearchError("Please enter a hotel name.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const res = await searchHotelGoogle(targetName, targetCity);
      if (res && res.hotel) {
        setSearchResult(res.hotel);
      } else {
        setSearchError("No hotel details found for this search.");
      }
    } catch (err) {
      setSearchError(err.message || "Failed to search Google Places.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (sug) => {
    setHotelName(sug.name);
    setCity(sug.city);
    handleSearch(sug.name, sug.city);
  };

  const handleSaveAndUse = (hotel) => {
    const formatted = {
      id: hotel.id || `google-${Date.now()}`,
      name: hotel.name,
      city: hotel.city || city || "",
      state: hotel.state || "",
      category: hotel.category || "4 Star Luxury",
      roomType: hotel.roomType || "Deluxe Valley / City View Room",
      mealPlan: hotel.mealPlan || "MAP (Breakfast & Dinner Included)",
      rating: hotel.rating ? `${hotel.rating}/5` : "4.5/5",
      address: hotel.address || "",
      mapsUrl: hotel.mapsUrl || "",
      photoUrl: hotel.photoUrl || (hotel.photos && hotel.photos[0]) || "",
      contractRate: hotel.contractRate || "₹ 6,500 / night",
      description: hotel.description || "",
      source: "Google Places / Verified",
      isCustom: true,
    };

    onImportHotel(formatted);
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
        {/* ── Modal Header (Matches Screenshot media_1790871333917.png) ── */}
        <div className="p-5 sm:p-6 border-b border-slate-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 text-[#7c5dfa]">
            <CloudDownload className="w-6 h-6 stroke-[2]" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Search &amp; Import Hotel from Google
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enter hotel name and city to retrieve verified ratings, address, and public profile.
          </p>
        </div>

        {/* ── Search Form (Matches Screenshot) ── */}
        <div className="p-5 sm:p-6 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-3.5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  placeholder="Hotel Name (e.g. The Oberoi Amarvilas, Rambagh Palace)"
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#7c5dfa]/20 focus:border-[#7c5dfa] transition"
                  autoFocus
                />
              </div>
              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City (e.g. Agra, Jaipur)"
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#7c5dfa]/20 focus:border-[#7c5dfa] transition"
                />
              </div>
            </div>

            {/* Purple Action Button */}
            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-3 bg-[#9080fc] hover:bg-[#7c5dfa] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Searching Google Places...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-white" />
                  <span>Search Google Places</span>
                </>
              )}
            </button>
          </form>

          {/* Suggestions Bar (Matches Screenshot) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Suggestions:</span>
            {HOTEL_SUGGESTIONS.map((sug) => (
              <button
                key={sug.name}
                type="button"
                onClick={() => handleSuggestionClick(sug)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#7c5dfa]/10 hover:text-[#7c5dfa] text-slate-600 font-medium text-[11px] transition cursor-pointer border border-transparent hover:border-[#7c5dfa]/20"
              >
                {sug.name}
              </button>
            ))}
          </div>

          {/* Error notice */}
          {searchError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {searchError}
            </div>
          )}

          {/* ── Search Result Card (When Found) ── */}
          {searchResult && (
            <div className="mt-4 bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 animate-scale-up">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Photo Preview */}
                {searchResult.photoUrl ? (
                  <div className="w-full sm:w-28 h-24 rounded-xl overflow-hidden bg-slate-200 shrink-0 shadow-2xs">
                    <img
                      src={searchResult.photoUrl}
                      alt={searchResult.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full sm:w-28 h-24 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-400 shrink-0">
                    <Building2 className="w-8 h-8" />
                    <span className="text-[10px] mt-1">Verified Hotel</span>
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {searchResult.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{searchResult.rating || "4.8"}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 text-blue-800">
                      {searchResult.category || "Luxury Hotel"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-start gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{searchResult.address}</span>
                  </div>

                  {searchResult.contractRate && (
                    <div className="text-xs font-semibold text-emerald-700 mt-1.5">
                      Rate: {searchResult.contractRate}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenManualEdit && onOpenManualEdit(searchResult);
                  }}
                  className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
                >
                  Edit Before Saving
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveAndUse(searchResult)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Import &amp; Add to Recommended</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
