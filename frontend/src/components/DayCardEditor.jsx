import React, { useState } from "react";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  MapPin,
  Plus,
  X,
  Navigation,
  Moon,
  Hotel,
  AlertCircle,
  Coffee,
  UtensilsCrossed,
  Soup,
  Plane,
  Train,
  Car,
} from "lucide-react";
import { createStop, buildTransitLine, createIntercityTransit } from "../utils/routeUtils";

// ─── Stop Row ────────────────────────────────────────────────────────────────
function StopRow({ stop, stopIndex, totalStops, dayId, onUpdateStop, onDeleteStop, onMoveStop }) {
  const [attInput, setAttInput] = useState("");

  const transit = stop.intercityTransit || createIntercityTransit("car");

  const update = (patch) => onUpdateStop({ ...stop, ...patch });

  const updateTransit = (transitPatch) => {
    update({
      intercityTransit: {
        ...transit,
        ...transitPatch,
      },
    });
  };

  const addAttraction = () => {
    if (!attInput.trim()) return;
    const existing = stop.attractions || [];
    if (!existing.includes(attInput.trim())) {
      update({ attractions: [...existing, attInput.trim()] });
    }
    setAttInput("");
  };

  const removeAttraction = (i) => {
    update({ attractions: (stop.attractions || []).filter((_, idx) => idx !== i) });
  };

  const toggleTransitOnly = (checked) => {
    const patch = { noSightseeing: checked };
    if (checked) {
      patch.transitLine = buildTransitLine("", stop.locationName, transit);
    }
    update(patch);
  };

  return (
    <div
      className={`relative border rounded-xl p-4 transition-colors space-y-3.5 ${
        stop.noSightseeing
          ? "border-amber-200 bg-amber-50/40"
          : stop.isOvernight
          ? "border-blue-300 bg-blue-50/30"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Stop header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center space-x-2 flex-1 min-w-[140px]">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
              stop.isOvernight ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            {stopIndex + 1}
          </span>
          <input
            type="text"
            value={stop.locationName}
            onChange={(e) => update({ locationName: e.target.value })}
            placeholder="Stop location (e.g. Shimla, Manali)"
            className="text-xs font-semibold rounded-lg border-slate-300 p-1.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500 w-full sm:w-52"
          />
        </div>

        {/* Reorder + Delete */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onMoveStop(stopIndex, "up")}
            disabled={stopIndex === 0}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
            title="Move stop up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveStop(stopIndex, "down")}
            disabled={stopIndex === totalStops - 1}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
            title="Move stop down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {totalStops > 1 && (
            <button
              type="button"
              onClick={() => onDeleteStop(stop.id)}
              className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50"
              title="Remove stop"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Flags row: Overnight, Check-in, Check-out, Transit-only */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        {/* Overnight radio */}
        <label className="flex items-center space-x-1.5 cursor-pointer select-none">
          <div
            onClick={() => onUpdateStop({ ...stop, isOvernight: true }, true /* markOvernightExclusive */)}
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
              stop.isOvernight
                ? "border-blue-600 bg-blue-600"
                : "border-slate-300 bg-white hover:border-blue-400"
            }`}
          >
            {stop.isOvernight && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          <Moon className="w-3.5 h-3.5 text-blue-600" />
          <span className={stop.isOvernight ? "font-semibold text-blue-700" : "text-slate-500"}>
            Overnight here
          </span>
        </label>

        {/* Check-in */}
        <label className="flex items-center space-x-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!stop.isCheckIn}
            onChange={(e) => update({ isCheckIn: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <Hotel className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-slate-500">Check-in</span>
        </label>

        {/* Check-out */}
        <label className="flex items-center space-x-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!stop.isCheckOut}
            onChange={(e) => update({ isCheckOut: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
          />
          <Navigation className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-slate-500">Check-out</span>
        </label>

        {/* Transit-only flag */}
        <label className="flex items-center space-x-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!stop.noSightseeing}
            onChange={(e) => toggleTransitOnly(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-amber-700 font-medium">Transit only (no sightseeing)</span>
        </label>
      </div>

      {/* ── Intercity Transit Mode Selector ── */}
      <div className="bg-slate-50/90 border border-slate-200/80 rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
            {transit.type === "flight" ? (
              <Plane className="w-3.5 h-3.5 text-blue-600" />
            ) : transit.type === "train" ? (
              <Train className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Car className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Transit Mode to Stop</span>
          </label>

          <select
            value={transit.type || "car"}
            onChange={(e) => updateTransit({ type: e.target.value })}
            className="text-xs font-semibold rounded-md border-slate-300 bg-white p-1 text-slate-700 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="car">🚗 Car Transfer (Default)</option>
            <option value="flight">✈️ Intercity Flight</option>
            <option value="train">🚆 Intercity Train</option>
          </select>
        </div>

        {/* Expanded fields when Flight or Train is selected */}
        {(transit.type === "flight" || transit.type === "train") && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1.5 border-t border-slate-200/60 text-xs">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                {transit.type === "flight" ? "Airline / Carrier" : "Train Name / Carrier"}
              </label>
              <input
                type="text"
                value={transit.carrierName || ""}
                onChange={(e) => updateTransit({ carrierName: e.target.value })}
                placeholder={transit.type === "flight" ? "e.g. IndiGo, Air India" : "e.g. Vande Bharat Express"}
                className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                {transit.type === "flight" ? "Flight Number" : "Train Number"}
              </label>
              <input
                type="text"
                value={transit.transitNumber || ""}
                onChange={(e) => updateTransit({ transitNumber: e.target.value })}
                placeholder={transit.type === "flight" ? "e.g. 6E-204" : "e.g. 22436"}
                className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800 focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                Timings (Dep - Arr)
              </label>
              <div className="flex space-x-1">
                <input
                  type="text"
                  value={transit.departureTime || ""}
                  onChange={(e) => updateTransit({ departureTime: e.target.value })}
                  placeholder="06:15 AM"
                  className="w-1/2 text-[11px] rounded border-slate-300 p-1 text-slate-800"
                />
                <span className="self-center text-slate-400">-</span>
                <input
                  type="text"
                  value={transit.arrivalTime || ""}
                  onChange={(e) => updateTransit({ arrivalTime: e.target.value })}
                  placeholder="07:35 AM"
                  className="w-1/2 text-[11px] rounded border-slate-300 p-1 text-slate-800"
                />
              </div>
            </div>

            <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                  {transit.type === "flight" ? "Departure Airport" : "Departure Station"}
                </label>
                <input
                  type="text"
                  value={transit.departureLocation || ""}
                  onChange={(e) => updateTransit({ departureLocation: e.target.value })}
                  placeholder={transit.type === "flight" ? "e.g. Delhi (DEL)" : "e.g. New Delhi (NDLS)"}
                  className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                  {transit.type === "flight" ? "Arrival Airport" : "Arrival Station"}
                </label>
                <input
                  type="text"
                  value={transit.arrivalLocation || ""}
                  onChange={(e) => updateTransit({ arrivalLocation: e.target.value })}
                  placeholder={transit.type === "flight" ? "e.g. Kullu-Manali (KUU)" : "e.g. Chandigarh (CDG)"}
                  className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Attractions (hidden for transit-only stops) */}
      {!stop.noSightseeing && (
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-blue-600" />
            <span>Key Attractions (for AI & Wikipedia linking)</span>
          </label>

          {/* Chips */}
          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px] p-1.5 bg-slate-50/70 rounded-lg border border-slate-200">
            {(stop.attractions || []).length === 0 && (
              <span className="text-[10px] text-slate-400 italic py-0.5 px-1">
                No attractions yet. Type below.
              </span>
            )}
            {(stop.attractions || []).map((att, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-100/80 text-blue-800 border border-blue-200/60"
              >
                {att}
                <button
                  type="button"
                  onClick={() => removeAttraction(i)}
                  className="ml-1 text-blue-500 hover:text-blue-800"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex space-x-1.5">
            <input
              type="text"
              value={attInput}
              onChange={(e) => setAttInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAttraction();
                }
              }}
              placeholder="e.g. Solang Valley, Rohtang Pass…"
              className="flex-1 text-xs rounded-lg border-slate-300 p-1.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addAttraction}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        </div>
      )}

      {/* Transit-only: show auto-generated text hint */}
      {stop.noSightseeing && stop.locationName && (
        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1">
          Auto-line: "{buildTransitLine("", stop.locationName, transit)}"
        </p>
      )}
    </div>
  );
}

// ─── Main DayCardEditor ──────────────────────────────────────────────────────
export default function DayCardEditor({
  day,
  index,
  totalDays,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddDayBelow,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const stops = Array.isArray(day.stops) ? day.stops : [];
  const meals = day.meals || { breakfast: false, lunch: false, dinner: false };

  // Update a single stop; if markOvernightExclusive, clear isOvernight on all others
  const handleUpdateStop = (updatedStop, markOvernightExclusive = false) => {
    let updatedStops = stops.map((s) => {
      if (s.id !== updatedStop.id) {
        return markOvernightExclusive ? { ...s, isOvernight: false } : s;
      }
      return updatedStop;
    });
    const allAttractions = updatedStops
      .filter((s) => !s.noSightseeing)
      .flatMap((s) => s.attractions || []);
    onUpdate({ ...day, stops: updatedStops, attractions: allAttractions });
  };

  const handleDeleteStop = (stopId) => {
    const remaining = stops.filter((s) => s.id !== stopId);
    if (remaining.length > 0 && !remaining.some((s) => s.isOvernight)) {
      remaining[remaining.length - 1].isOvernight = true;
    }
    const allAttractions = remaining
      .filter((s) => !s.noSightseeing)
      .flatMap((s) => s.attractions || []);
    onUpdate({ ...day, stops: remaining, attractions: allAttractions });
  };

  const handleMoveStop = (stopIndex, dir) => {
    const arr = [...stops];
    const target = dir === "up" ? stopIndex - 1 : stopIndex + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[stopIndex], arr[target]] = [arr[target], arr[stopIndex]];
    const allAttractions = arr.filter((s) => !s.noSightseeing).flatMap((s) => s.attractions || []);
    onUpdate({ ...day, stops: arr, attractions: allAttractions });
  };

  const handleAddStop = () => {
    const newStop = createStop("");
    onUpdate({ ...day, stops: [...stops, newStop] });
  };

  const handleMealChange = (meal, checked) => {
    onUpdate({ ...day, meals: { ...meals, [meal]: checked } });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-slate-300 transition-all overflow-hidden">
      {/* Day Header Bar - Clickable on Mobile to Expand/Collapse */}
      <div className="flex items-center justify-between border-b border-slate-100 px-3 sm:px-5 py-3 bg-slate-50/50 hover:bg-slate-100/60 transition-colors">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center space-x-2.5 flex-1 min-w-0 text-left cursor-pointer"
        >
          <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
            D{day.dayNumber || index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 truncate">
                Day {day.dayNumber || index + 1}
              </span>
              {day.date && (
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  • {day.date}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium truncate">
              {day.title || "Untitled Day Route"}
            </p>
          </div>
          <div className="p-1 text-slate-400 hover:text-slate-600 shrink-0 mr-1">
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveUp(index)}
            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-200 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Move Day Up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={index === totalDays - 1}
            onClick={() => onMoveDown(index)}
            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-200 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Move Day Down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(day.id)}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Delete Day"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-4">
        {/* Date and Day of Week */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <span>📅 Tour Date</span>
              <span className="text-[10px] text-slate-400 font-normal">(e.g. 15 Oct 2026)</span>
            </label>
            <input
              type="text"
              value={day.date || ""}
              onChange={(e) => {
                const val = e.target.value;
                const parsed = new Date(val);
                let computedDay = day.dayOfWeek || "";
                if (!isNaN(parsed.getTime()) && val.length >= 6) {
                  computedDay = parsed.toLocaleDateString("en-US", { weekday: "long" });
                }
                onUpdate({ ...day, date: val, dayOfWeek: computedDay });
              }}
              placeholder="e.g. 15 Oct 2026"
              className="w-full text-xs font-semibold rounded-lg border border-slate-300 p-2 text-slate-900 bg-white focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Day of Week
            </label>
            <input
              type="text"
              value={day.dayOfWeek || ""}
              onChange={(e) => onUpdate({ ...day, dayOfWeek: e.target.value })}
              placeholder="e.g. Thursday, Friday"
              className="w-full text-xs font-semibold rounded-lg border border-slate-300 p-2 text-slate-900 bg-white focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Day Title */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Day Headline / Route
          </label>
          <input
            type="text"
            value={day.title || ""}
            onChange={(e) => onUpdate({ ...day, title: e.target.value })}
            placeholder="e.g. Arrival & Leisure Stroll on Mall Road"
            className="w-full text-xs font-medium rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Day Description */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Activities Description
          </label>
          <textarea
            rows={3}
            value={day.description || ""}
            onChange={(e) => onUpdate({ ...day, description: e.target.value })}
            placeholder="Describe sightseeing, scenic stops, meal arrangements, airport/train transfers..."
            className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        {/* Meal Badges - Large Touch-Friendly Pill Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Meals Included</label>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {[
              {
                key: "breakfast",
                label: "Breakfast",
                Icon: Coffee,
                activeBg: "bg-amber-500 text-white border-amber-600 shadow-xs",
                inactiveBg: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100",
              },
              {
                key: "lunch",
                label: "Lunch",
                Icon: UtensilsCrossed,
                activeBg: "bg-emerald-600 text-white border-emerald-700 shadow-xs",
                inactiveBg: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100",
              },
              {
                key: "dinner",
                label: "Dinner",
                Icon: Soup,
                activeBg: "bg-blue-600 text-white border-blue-700 shadow-xs",
                inactiveBg: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100",
              },
            ].map(({ key, label, Icon, activeBg, inactiveBg }) => {
              const isSelected = !!meals[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleMealChange(key, !isSelected)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 min-h-[40px] ${
                    isSelected ? activeBg : inactiveBg
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {isSelected && <span className="text-[10px] ml-1 font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Accommodation / Night Stay Hotel */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Hotel className="w-3.5 h-3.5 text-blue-600" />
              <span>Day Accommodation / Night Stay Hotel</span>
            </label>
            <span className="text-[10px] text-slate-400">
              Shows on Day {day.dayNumber || index + 1} &amp; aggregated in bottom summary
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
            {/* Hotel Name */}
            <div className="sm:col-span-6">
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                Hotel / Property Name
              </label>
              <input
                type="text"
                value={day.hotel?.name || ""}
                onChange={(e) =>
                  onUpdate({
                    ...day,
                    hotel: { ...(day.hotel || {}), name: e.target.value },
                  })
                }
                placeholder="e.g. Snow Valley Resorts, Manali (or default)"
                className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 bg-white min-h-[40px]"
              />
            </div>

            {/* Room Category */}
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                Room Category
              </label>
              <input
                type="text"
                value={day.hotel?.roomType || ""}
                onChange={(e) =>
                  onUpdate({
                    ...day,
                    hotel: { ...(day.hotel || {}), roomType: e.target.value },
                  })
                }
                placeholder="e.g. Deluxe Room"
                className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 bg-white min-h-[40px]"
              />
            </div>

            {/* Meal Plan */}
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                Meal Plan
              </label>
              <input
                type="text"
                value={day.hotel?.mealPlan || ""}
                onChange={(e) =>
                  onUpdate({
                    ...day,
                    hotel: { ...(day.hotel || {}), mealPlan: e.target.value },
                  })
                }
                placeholder="e.g. MAP (Breakfast & Dinner)"
                className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 bg-white min-h-[40px]"
              />
            </div>
          </div>
        </div>

        {/* Multi-Stop Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <Navigation className="w-3.5 h-3.5 text-indigo-600" />
              <span>Stops & Intercity Transfers ({stops.length})</span>
            </label>
            <button
              type="button"
              onClick={handleAddStop}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl flex items-center space-x-1 border border-indigo-200 min-h-[36px] active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stop</span>
            </button>
          </div>

          <div className="space-y-3">
            {stops.map((stop, i) => (
              <StopRow
                key={stop.id}
                stop={stop}
                stopIndex={i}
                totalStops={stops.length}
                dayId={day.id}
                onUpdateStop={handleUpdateStop}
                onDeleteStop={handleDeleteStop}
                onMoveStop={handleMoveStop}
              />
            ))}
          </div>
        </div>
      </div>
      )}

      {/* "+ Add Day Below" inline button */}
      <div className="border-t border-slate-100 px-4 sm:px-5 py-3 flex justify-center bg-slate-50/30">
        <button
          type="button"
          onClick={() => onAddDayBelow(index)}
          className="px-4 py-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl flex items-center space-x-1.5 border border-blue-200 transition-colors min-h-[40px] active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Day {(day.dayNumber || index + 1) + 1} Below</span>
        </button>
      </div>
    </div>
  );
}
