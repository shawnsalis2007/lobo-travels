import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Building, Image as ImageIcon, Star, DollarSign, Check } from "lucide-react";

const STAR_CATEGORIES = [
  "3 Star",
  "3 Star Premium",
  "4 Star",
  "4 Star Boutique",
  "4 Star Luxury",
  "5 Star",
  "5 Star Deluxe",
  "5 Star Heritage",
  "5 Star Luxury",
  "Heritage Grand",
  "Luxury Boutique Resort",
  "Standard Comfort",
];

export default function HotelManualModal({
  isOpen,
  initialHotel = null,
  onClose,
  onSaveHotel,
}) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("Delhi");
  const [state, setState] = useState("Delhi");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("4 Star");
  const [rating, setRating] = useState("4.5");
  const [contractRate, setContractRate] = useState("₹6,500/night");
  const [photoUrl, setPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
  );
  const [description, setDescription] = useState("");
  const [mealPlan, setMealPlan] = useState("MAP (Breakfast & Dinner Included)");
  const [roomType, setRoomType] = useState("Deluxe Room");

  useEffect(() => {
    if (initialHotel) {
      setName(initialHotel.name || "");
      setCity(initialHotel.city || "Delhi");
      setState(initialHotel.state || initialHotel.city || "Delhi");
      setAddress(initialHotel.address || "");
      setCategory(initialHotel.category || "4 Star");
      setRating(initialHotel.rating ? String(initialHotel.rating).replace("/5", "") : "4.5");
      setContractRate(initialHotel.contractRate || "₹6,500/night");
      setPhotoUrl(
        initialHotel.photoUrl ||
          initialHotel.imageUrl ||
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
      );
      setDescription(initialHotel.description || "");
      setMealPlan(initialHotel.mealPlan || "MAP (Breakfast & Dinner Included)");
      setRoomType(initialHotel.roomType || "Deluxe Room");
    } else {
      setName("");
      setCity("Delhi");
      setState("Delhi");
      setAddress("");
      setCategory("4 Star");
      setRating("4.5");
      setContractRate("₹6,500/night");
      setPhotoUrl(
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
      );
      setDescription("");
      setMealPlan("MAP (Breakfast & Dinner Included)");
      setRoomType("Deluxe Room");
    }
  }, [initialHotel, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedHotel = {
      id: initialHotel?.id || `custom-hotel-${Date.now()}`,
      name: name.trim(),
      city: city.trim(),
      state: state.trim(),
      address: address.trim(),
      category: category,
      rating: rating ? `${rating}/5` : "4.5/5",
      contractRate: contractRate.trim(),
      photoUrl: photoUrl.trim(),
      imageUrl: photoUrl.trim(),
      description: description.trim(),
      mealPlan,
      roomType,
      isCustom: true,
      source: "Manual Entry / Lobo Verified",
    };

    onSaveHotel(savedHotel);
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-up max-h-[92vh] flex flex-col">
        {/* ── Modal Header (Matches Screenshot media_1790871361471.png) ── */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {initialHotel ? "Edit Hotel Details" : "Add Hotel Manually"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Form Body (Matches Screenshot) ── */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Hotel Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hotel Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Snow Valley Resorts, Manali"
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#6355ee]/20 focus:border-[#6355ee] focus:outline-hidden"
              autoFocus
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Delhi, Manali"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:ring-2 focus:ring-[#6355ee]/20 focus:border-[#6355ee] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Delhi, Himachal Pradesh"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:ring-2 focus:ring-[#6355ee]/20 focus:border-[#6355ee] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address, landmark, PIN code"
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:ring-2 focus:ring-[#6355ee]/20 focus:border-[#6355ee] focus:outline-hidden"
            />
          </div>

          {/* Star Category, Google Rating, Contract Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Star Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-[#6355ee]/20 focus:border-[#6355ee] focus:outline-hidden"
              >
                {STAR_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Rating
              </label>
              <input
                type="text"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="4.5"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:ring-2 focus:ring-[#6355ee]/20 focus:border-[#6355ee] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contract Rate
              </label>
              <input
                type="text"
                value={contractRate}
                onChange={(e) => setContractRate(e.target.value)}
                placeholder="₹6,500/night"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:ring-2 focus:ring-[#6355ee]/20 focus:border-[#6355ee] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Photo Image URL with Live Thumbnail */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Photo Image URL
              </label>
              {photoUrl && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <Check className="w-3 h-3" />
                  <span>Preview active</span>
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:ring-2 focus:ring-[#6355ee]/20 focus:border-[#6355ee] focus:outline-hidden truncate"
              />
              {photoUrl && (
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe resort amenities, views, location advantages..."
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:ring-2 focus:ring-[#6355ee]/20 focus:border-[#6355ee] focus:outline-hidden resize-y"
            />
          </div>

          {/* ── Footer Buttons (Matches Screenshot) ── */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#5542f6] hover:bg-[#4330ea] rounded-xl shadow-xs hover:shadow-md transition cursor-pointer active:scale-95 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Hotel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
