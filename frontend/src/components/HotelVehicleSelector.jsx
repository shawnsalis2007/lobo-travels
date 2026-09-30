import React, { useState } from "react";
import { Hotel, Car, Utensils, Moon, Users, ShieldAlert, ChevronDown } from "lucide-react";
import { PRELOADED_HOTELS, PRELOADED_VEHICLES, MEAL_PLANS } from "../data/defaultItinerary";
import { VEHICLE_BRANDS, VEHICLE_MODELS_BY_BRAND } from "../utils/routeUtils";

export default function HotelVehicleSelector({
  selectedHotel,
  onUpdateHotel,
  selectedVehicle,
  onUpdateVehicle,
  showCostOnItinerary,
  onToggleCostVisibility,
}) {
  // Vehicle brand/model state
  const [vehicleBrand, setVehicleBrand] = useState(() => {
    // Try to guess brand from existing vehicle name
    for (const brand of VEHICLE_BRANDS) {
      if (brand !== "Other" && (selectedVehicle?.name || "").includes(brand)) return brand;
    }
    return "";
  });
  const [vehicleModel, setVehicleModel] = useState("");
  const [isOtherVehicle, setIsOtherVehicle] = useState(false);

  const handleHotelSelect = (hotelId) => {
    const found = PRELOADED_HOTELS.find((h) => h.id === hotelId);
    if (found) {
      onUpdateHotel({
        name: found.name,
        category: found.category,
        roomType: found.roomType,
        mealPlan: found.mealPlan,
        nights: found.defaultNights || selectedHotel.nights || 2,
        city: found.city || "",
      });
    }
  };

  const handleBrandChange = (brand) => {
    setVehicleBrand(brand);
    setVehicleModel("");
    const isOther = brand === "Other";
    setIsOtherVehicle(isOther);
    if (!isOther) {
      onUpdateVehicle({ name: "", category: brand });
    }
  };

  const handleModelChange = (model) => {
    setVehicleModel(model);
    onUpdateVehicle({
      name: `${vehicleBrand} ${model} (AC)`,
      category: vehicleBrand,
    });
  };

  const models = vehicleBrand ? (VEHICLE_MODELS_BY_BRAND[vehicleBrand] || []) : [];

  return (
    <div className="space-y-6">
      {/* ── Hotel Card ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center space-x-2.5 mb-4 text-blue-900 border-b border-slate-100 pb-3">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <Hotel className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Hotel & Accommodation</h3>
            <p className="text-xs text-slate-500">Select pre-loaded hotel or configure custom stay</p>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Preloaded Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Pre-Loaded Hotel
            </label>
            <select
              className="w-full text-xs rounded-lg border-slate-300 bg-slate-50/50 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
              onChange={(e) => handleHotelSelect(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>-- Choose Recommended Hotel --</option>
              {PRELOADED_HOTELS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.category}){h.city ? ` • ${h.city}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Editable Hotel Name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Hotel Name & Location
            </label>
            <input
              type="text"
              value={selectedHotel.name || ""}
              onChange={(e) => onUpdateHotel({ name: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g. Snow Valley Resorts, Manali"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">City / Location</label>
            <input
              type="text"
              value={selectedHotel.city || ""}
              onChange={(e) => onUpdateHotel({ city: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g. Manali, Shimla, Leh"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Room Type */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Room Category</label>
              <input
                type="text"
                value={selectedHotel.roomType || ""}
                onChange={(e) => onUpdateHotel({ roomType: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. Deluxe Valley View"
              />
            </div>

            {/* Nights */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Number of Nights</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={selectedHotel.nights || 1}
                  onChange={(e) => onUpdateHotel({ nights: Number(e.target.value) })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2 pl-8 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                />
                <Moon className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Check-in / Check-out Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Check-in Date</label>
              <input
                type="text"
                value={selectedHotel.checkIn || ""}
                onChange={(e) => onUpdateHotel({ checkIn: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. 01 Oct 2026"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Check-out Date</label>
              <input
                type="text"
                value={selectedHotel.checkOut || ""}
                onChange={(e) => onUpdateHotel({ checkOut: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. 04 Oct 2026"
              />
            </div>
          </div>

          {/* Meal Plan Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Utensils className="w-3.5 h-3.5 text-amber-600" />
                <span>Meal Plan</span>
              </span>
              <span className="text-[10px] text-slate-400">EP / CP / MAP / AP</span>
            </label>
            <select
              value={selectedHotel.mealPlan || "MAP (Breakfast & Dinner Included)"}
              onChange={(e) => onUpdateHotel({ mealPlan: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 bg-slate-50/50 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
            >
              {MEAL_PLANS.map((plan) => (
                <option key={plan.code} value={plan.label}>{plan.label}</option>
              ))}
            </select>
          </div>

          {/* Confirmation Number */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Confirmation Number (optional)</label>
            <input
              type="text"
              value={selectedHotel.confirmationNo || ""}
              onChange={(e) => onUpdateHotel({ confirmationNo: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Hotel booking / confirmation number"
            />
          </div>
        </div>
      </div>

      {/* ── Vehicle Card ────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center space-x-2.5 mb-4 text-blue-900 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Chauffeur & Vehicle</h3>
            <p className="text-xs text-slate-500">2-tier brand → model selector</p>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Brand Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Brand</label>
              <select
                value={vehicleBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 bg-slate-50/50 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">-- Select Brand --</option>
                {VEHICLE_BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Model Selector (dynamic, hidden for Other) */}
            {vehicleBrand && !isOtherVehicle && models.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
                <select
                  value={vehicleModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 bg-slate-50/50 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">-- Select Model --</option>
                  {models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Preloaded Vehicle Dropdown (always visible) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Or Select Pre-Loaded Vehicle</label>
            <select
              className="w-full text-xs rounded-lg border-slate-300 bg-slate-50/50 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
              onChange={(e) => {
                const found = PRELOADED_VEHICLES.find((v) => v.id === e.target.value);
                if (found) {
                  onUpdateVehicle({ name: found.name, category: found.category, capacity: found.capacity, features: found.features });
                  setVehicleBrand(""); setVehicleModel(""); setIsOtherVehicle(false);
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>-- Choose Recommended Vehicle --</option>
              {PRELOADED_VEHICLES.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.capacity})</option>
              ))}
            </select>
          </div>

          {/* Editable Vehicle Name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle Model / Class</label>
            <input
              type="text"
              value={selectedVehicle.name || ""}
              onChange={(e) => onUpdateVehicle({ name: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g. Toyota Innova Crysta (AC)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Passenger Capacity</label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedVehicle.capacity || ""}
                  onChange={(e) => onUpdateVehicle({ capacity: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2 pl-8 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. 6 Pax + Driver"
                />
                <Users className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle Type</label>
              <input
                type="text"
                value={selectedVehicle.category || ""}
                onChange={(e) => onUpdateVehicle({ category: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. Premium MPV"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Features & Inclusions</label>
            <input
              type="text"
              value={selectedVehicle.features || ""}
              onChange={(e) => onUpdateVehicle({ features: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g. Dual AC, Reclining seats, All toll & parking covered"
            />
          </div>

          {/* Driver Details */}
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Driver Details (optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Driver Name</label>
                <input
                  type="text"
                  value={selectedVehicle.driverName || ""}
                  onChange={(e) => onUpdateVehicle({ driverName: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Driver Phone</label>
                <input
                  type="text"
                  value={selectedVehicle.driverPhone || ""}
                  onChange={(e) => onUpdateVehicle({ driverPhone: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="+91 98XXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle No.</label>
                <input
                  type="text"
                  value={selectedVehicle.vehicleNo || ""}
                  onChange={(e) => onUpdateVehicle({ vehicleNo: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. DL 01 CA 1234"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cost Visibility Toggle ──────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Show Cost on Itinerary</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toggle OFF to hide pricing from the preview & exported PDF
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleCostVisibility}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              showCostOnItinerary ? "bg-blue-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                showCostOnItinerary ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
