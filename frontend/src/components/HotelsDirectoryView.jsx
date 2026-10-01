import React, { useState } from "react";
import {
  Building2,
  Search,
  Plus,
  Sparkles,
  MapPin,
  Utensils,
  Moon,
  ExternalLink,
  CheckCircle2,
  Star,
  Hotel,
} from "lucide-react";
import { PRELOADED_HOTELS, MEAL_PLANS } from "../data/defaultItinerary";
import { autofillHotel } from "../utils/api";

export default function HotelsDirectoryView({ onSelectHotelForItinerary }) {
  const [hotels, setHotels] = useState(PRELOADED_HOTELS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Hotel Form State
  const [newHotelForm, setNewHotelForm] = useState({
    name: "",
    city: "",
    category: "4 Star Deluxe",
    roomType: "Deluxe Mountain View",
    mealPlan: "MAP (Breakfast & Dinner)",
    defaultNights: 2,
    rating: "4.5/5",
    address: "",
    mapsUrl: "",
  });

  const cities = ["All", ...new Set(hotels.map((h) => h.city).filter(Boolean))];

  const filteredHotels = hotels.filter((h) => {
    const cityMatch = selectedCity === "All" || h.city === selectedCity;
    const term = searchQuery.toLowerCase().trim();
    const textMatch =
      !term ||
      h.name.toLowerCase().includes(term) ||
      (h.city || "").toLowerCase().includes(term) ||
      (h.category || "").toLowerCase().includes(term);
    return cityMatch && textMatch;
  });

  const handleAutofillPlaces = async (hotelName, city) => {
    if (!hotelName) return;
    setIsAutofilling(true);
    try {
      const res = await autofillHotel(hotelName, city || "");
      if (res.success && res.hotel) {
        const updated = {
          id: `h-custom-${Date.now()}`,
          name: res.hotel.name || hotelName,
          city: res.hotel.city || city,
          category: "4 Star Verified",
          roomType: "Deluxe Valley Room",
          mealPlan: "MAP (Breakfast & Dinner)",
          defaultNights: 2,
          rating: `${res.hotel.rating || "4.5"}/5`,
          address: res.hotel.address,
          mapsUrl: res.hotel.mapsUrl,
          photos: res.hotel.photos || [],
        };
        setHotels((prev) => [updated, ...prev]);
        setShowAddModal(false);
      }
    } catch (err) {
      alert("Autofill places error: " + err.message);
    } finally {
      setIsAutofilling(false);
    }
  };

  const handleAddCustomHotel = (e) => {
    e.preventDefault();
    if (!newHotelForm.name.trim()) return;
    const newEntry = {
      ...newHotelForm,
      id: `h-custom-${Date.now()}`,
    };
    setHotels([newEntry, ...hotels]);
    setShowAddModal(false);
    setNewHotelForm({
      name: "",
      city: "",
      category: "4 Star Deluxe",
      roomType: "Deluxe Mountain View",
      mealPlan: "MAP (Breakfast & Dinner)",
      defaultNights: 2,
      rating: "4.5/5",
      address: "",
      mapsUrl: "",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-950 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-amber-300 text-xs font-semibold mb-2 border border-blue-400/30">
            <Hotel className="w-3.5 h-3.5" />
            <span>Contracted Accommodation Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Hotels &amp; Resorts Catalog</h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-1">
            Browse verified partner properties, import from Google Places, and assign directly to client itineraries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition transform active:scale-95 flex items-center space-x-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Partner Hotel</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search hotel name, location, room category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCity === city
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md mb-1.5">
                    {hotel.category || "Luxury Stay"}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {hotel.name}
                  </h3>
                </div>
                {hotel.rating && (
                  <span className="flex items-center space-x-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 shrink-0">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{hotel.rating}</span>
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                {hotel.city && (
                  <p className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{hotel.city}</span>
                  </p>
                )}
                <p className="flex items-center space-x-1.5">
                  <Hotel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Room: {hotel.roomType}</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-semibold text-emerald-700">{hotel.mealPlan}</span>
                </p>
                {hotel.address && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 pt-1">
                    {hotel.address}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              {hotel.mapsUrl ? (
                <a
                  href={hotel.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAutofillPlaces(hotel.name, hotel.city)}
                  disabled={isAutofilling}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span>Google Places</span>
                </button>
              )}

              {onSelectHotelForItinerary && (
                <button
                  type="button"
                  onClick={() => onSelectHotelForItinerary(hotel)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Apply to Tour</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Partner Hotel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-900">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold">Add Contracted Hotel</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomHotel} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hotel Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radisson Blu Resort"
                  value={newHotelForm.name}
                  onChange={(e) => setNewHotelForm({ ...newHotelForm, name: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Manali, Shimla"
                    value={newHotelForm.city}
                    onChange={(e) => setNewHotelForm({ ...newHotelForm, city: e.target.value })}
                    className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 Star Luxury"
                    value={newHotelForm.category}
                    onChange={(e) => setNewHotelForm({ ...newHotelForm, category: e.target.value })}
                    className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Deluxe Valley View"
                    value={newHotelForm.roomType}
                    onChange={(e) => setNewHotelForm({ ...newHotelForm, roomType: e.target.value })}
                    className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Meal Plan</label>
                  <select
                    value={newHotelForm.mealPlan}
                    onChange={(e) => setNewHotelForm({ ...newHotelForm, mealPlan: e.target.value })}
                    className="w-full text-xs rounded-lg border-slate-300 bg-slate-50 p-2.5 text-slate-800 focus:border-blue-500"
                  >
                    {MEAL_PLANS.map((plan) => (
                      <option key={plan.code} value={plan.label}>{plan.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleAutofillPlaces(newHotelForm.name, newHotelForm.city)}
                  disabled={isAutofilling || !newHotelForm.name}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAutofilling ? "Autofilling..." : "Autofill with Google Places"}</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                  >
                    Add Hotel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
