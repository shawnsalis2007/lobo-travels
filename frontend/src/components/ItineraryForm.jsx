import React, { useState } from "react";
import {
  FileText,
  Calendar,
  Users,
  PlaneLanding,
  PlaneTakeoff,
  Plus,
  Sparkles,
  Layers,
  CheckCircle,
  Info,
  Plane,
  Ticket,
  Luggage,
} from "lucide-react";
import DayCardEditor from "./DayCardEditor";
import HotelVehicleSelector from "./HotelVehicleSelector";
import InclusionsExclusionsEditor from "./InclusionsExclusionsEditor";

export default function ItineraryForm({
  itineraryData,
  onChangeField,
  onAddDay,
  onAddDayBelow,
  onUpdateDay,
  onDeleteDay,
  onMoveDayUp,
  onMoveDayDown,
  onGenerate,
  isGenerating,
}) {
  const [activeTab, setActiveTab] = useState("days");

  const flightDetails = itineraryData.managedFlightDetails || {
    isFlightBookedByLobo: false,
    arrivalFlight: {
      airline: "",
      flightNumber: "",
      pnr: "",
      departureAirport: "",
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
      arrivalAirport: "",
      arrivalTime: "",
      terminal: "",
      baggageAllowance: "",
    },
  };

  const updateFlightDetails = (patch) => {
    onChangeField("managedFlightDetails", {
      ...flightDetails,
      ...patch,
    });
  };

  const updateArrivalFlight = (patch) => {
    const updated = {
      ...(flightDetails.arrivalFlight || {}),
      ...patch,
    };
    updateFlightDetails({ arrivalFlight: updated });
    // Keep arrivalInfo string synced for backwards compatibility
    if (updated.flightNumber || updated.departureAirport || updated.departureTime) {
      const summary = `${updated.departureTime || ""} ${updated.airline || ""} ${updated.flightNumber || ""}, ${updated.arrivalAirport || updated.departureAirport || ""}`.trim();
      onChangeField("arrivalInfo", summary);
    }
  };

  const updateDepartureFlight = (patch) => {
    const updated = {
      ...(flightDetails.departureFlight || {}),
      ...patch,
    };
    updateFlightDetails({ departureFlight: updated });
    // Keep departureInfo string synced for backwards compatibility
    if (updated.flightNumber || updated.departureAirport || updated.departureTime) {
      const summary = `${updated.departureTime || ""} ${updated.airline || ""} ${updated.flightNumber || ""}, ${updated.departureAirport || updated.arrivalAirport || ""}`.trim();
      onChangeField("departureInfo", summary);
    }
  };

  const tabs = [
    { id: "days", label: `Day-wise Plan (${itineraryData.days.length})`, Icon: Calendar },
    { id: "stay", label: "Hotels & Fleet", Icon: Layers },
    { id: "inclusions", label: "Inclusions & Exclusions", Icon: CheckCircle },
    { id: "general", label: "Trip Details & Flights", Icon: FileText },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-3 space-x-1 overflow-x-auto text-xs font-semibold">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === id
                ? "border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        {/* ── TAB: GENERAL TRIP INFO & FLIGHT DETAILS ──────────────────── */}
        {activeTab === "general" && (
          <div className="space-y-4">
            <div className="bg-blue-50/60 border border-blue-200/70 rounded-xl p-3.5 text-xs text-blue-800 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p>Configure trip headers and electronic flight booking information. All updates sync with live preview and travel voucher.</p>
            </div>

            {/* Destination Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Itinerary Title / Tour Heading</label>
              <input
                type="text"
                value={itineraryData.destinationTitle}
                onChange={(e) => onChangeField("destinationTitle", e.target.value)}
                placeholder="e.g. Scenic Himachal Mountain Escape"
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client / Guest Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={itineraryData.clientName}
                    onChange={(e) => onChangeField("clientName", e.target.value)}
                    placeholder="e.g. Mr. Rajesh Sharma & Family"
                    className="w-full text-xs rounded-lg border-slate-300 p-2.5 pl-8 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client Phone</label>
                <input
                  type="text"
                  value={itineraryData.clientPhone || ""}
                  onChange={(e) => onChangeField("clientPhone", e.target.value)}
                  placeholder="+91 98XXXXXXXX"
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Pax (Travelers)</label>
                <input
                  type="text"
                  value={itineraryData.pax}
                  onChange={(e) => onChangeField("pax", e.target.value)}
                  placeholder="e.g. 2 Adults + 1 Child"
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Days / Nights)</label>
                <input
                  type="text"
                  value={itineraryData.tripDuration}
                  onChange={(e) => onChangeField("tripDuration", e.target.value)}
                  placeholder="e.g. 4 Days / 3 Nights"
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Travel Dates</label>
                <input
                  type="text"
                  value={itineraryData.travelDates || ""}
                  onChange={(e) => onChangeField("travelDates", e.target.value)}
                  placeholder="e.g. 15 Oct – 18 Oct 2026"
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Total Cost</label>
                <input
                  type="text"
                  value={itineraryData.estimatedCost}
                  onChange={(e) => onChangeField("estimatedCost", e.target.value)}
                  placeholder="e.g. ₹ 48,500 / Total Package"
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500 font-bold text-emerald-700"
                />
              </div>
            </div>

            {/* ── FEATURE 2: DETAILED FLIGHT MANAGEMENT SECTION ── */}
            <div className="border-t border-slate-200 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Plane className="w-4 h-4 text-blue-600" />
                    <span>Flight Bookings & Electronic Ticket Info</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Manage arrival and return flight details for airport coordination and travel vouchers.
                  </p>
                </div>

                {/* Booked By Lobo Toggle */}
                <label className="flex items-center space-x-2 cursor-pointer select-none bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
                  <input
                    type="checkbox"
                    checked={!!flightDetails.isFlightBookedByLobo}
                    onChange={(e) => updateFlightDetails({ isFlightBookedByLobo: e.target.checked })}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-blue-900">
                    Booked by Lobo Travels
                  </span>
                </label>
              </div>

              {/* Arrival Flight Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                  <PlaneLanding className="w-4 h-4 text-emerald-600" />
                  <span>Onbound / Arrival Flight</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Airline</label>
                    <input
                      type="text"
                      value={flightDetails.arrivalFlight?.airline || ""}
                      onChange={(e) => updateArrivalFlight({ airline: e.target.value })}
                      placeholder="e.g. IndiGo, Air India"
                      className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Flight Number</label>
                    <input
                      type="text"
                      value={flightDetails.arrivalFlight?.flightNumber || ""}
                      onChange={(e) => updateArrivalFlight({ flightNumber: e.target.value })}
                      placeholder="e.g. 6E-204"
                      className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">PNR / E-Ticket Code</label>
                    <input
                      type="text"
                      value={flightDetails.arrivalFlight?.pnr || ""}
                      onChange={(e) => updateArrivalFlight({ pnr: e.target.value })}
                      placeholder="e.g. 6E9XYZ"
                      className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Departure Airport & Time</label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={flightDetails.arrivalFlight?.departureAirport || ""}
                        onChange={(e) => updateArrivalFlight({ departureAirport: e.target.value })}
                        placeholder="Delhi (DEL)"
                        className="w-2/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        value={flightDetails.arrivalFlight?.departureTime || ""}
                        onChange={(e) => updateArrivalFlight({ departureTime: e.target.value })}
                        placeholder="06:15 AM"
                        className="w-1/3 text-xs rounded border-slate-300 p-1.5 text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Arrival Airport & Time</label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={flightDetails.arrivalFlight?.arrivalAirport || ""}
                        onChange={(e) => updateArrivalFlight({ arrivalAirport: e.target.value })}
                        placeholder="Kullu-Manali (KUU)"
                        className="w-2/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        value={flightDetails.arrivalFlight?.arrivalTime || ""}
                        onChange={(e) => updateArrivalFlight({ arrivalTime: e.target.value })}
                        placeholder="07:35 AM"
                        className="w-1/3 text-xs rounded border-slate-300 p-1.5 text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Terminal & Baggage</label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={flightDetails.arrivalFlight?.terminal || ""}
                        onChange={(e) => updateArrivalFlight({ terminal: e.target.value })}
                        placeholder="Term T3"
                        className="w-1/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        value={flightDetails.arrivalFlight?.baggageAllowance || ""}
                        onChange={(e) => updateArrivalFlight({ baggageAllowance: e.target.value })}
                        placeholder="15kg + 7kg Cabin"
                        className="w-2/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Departure Flight Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
                  <PlaneTakeoff className="w-4 h-4 text-blue-600" />
                  <span>Return / Departure Flight</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Airline</label>
                    <input
                      type="text"
                      value={flightDetails.departureFlight?.airline || ""}
                      onChange={(e) => updateDepartureFlight({ airline: e.target.value })}
                      placeholder="e.g. IndiGo, Air India"
                      className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Flight Number</label>
                    <input
                      type="text"
                      value={flightDetails.departureFlight?.flightNumber || ""}
                      onChange={(e) => updateDepartureFlight({ flightNumber: e.target.value })}
                      placeholder="e.g. 6E-205"
                      className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">PNR / E-Ticket Code</label>
                    <input
                      type="text"
                      value={flightDetails.departureFlight?.pnr || ""}
                      onChange={(e) => updateDepartureFlight({ pnr: e.target.value })}
                      placeholder="e.g. 6E9XYZ"
                      className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Departure Airport & Time</label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={flightDetails.departureFlight?.departureAirport || ""}
                        onChange={(e) => updateDepartureFlight({ departureAirport: e.target.value })}
                        placeholder="Kullu-Manali (KUU)"
                        className="w-2/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        value={flightDetails.departureFlight?.departureTime || ""}
                        onChange={(e) => updateDepartureFlight({ departureTime: e.target.value })}
                        placeholder="02:40 PM"
                        className="w-1/3 text-xs rounded border-slate-300 p-1.5 text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Arrival Airport & Time</label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={flightDetails.departureFlight?.arrivalAirport || ""}
                        onChange={(e) => updateDepartureFlight({ arrivalAirport: e.target.value })}
                        placeholder="Delhi (DEL)"
                        className="w-2/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        value={flightDetails.departureFlight?.arrivalTime || ""}
                        onChange={(e) => updateDepartureFlight({ arrivalTime: e.target.value })}
                        placeholder="04:00 PM"
                        className="w-1/3 text-xs rounded border-slate-300 p-1.5 text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Terminal & Baggage</label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={flightDetails.departureFlight?.terminal || ""}
                        onChange={(e) => updateDepartureFlight({ terminal: e.target.value })}
                        placeholder="Term T1"
                        className="w-1/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        value={flightDetails.departureFlight?.baggageAllowance || ""}
                        onChange={(e) => updateDepartureFlight({ baggageAllowance: e.target.value })}
                        placeholder="15kg + 7kg Cabin"
                        className="w-2/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Special Remarks / Notes</label>
              <textarea
                rows={2}
                value={itineraryData.notes}
                onChange={(e) => onChangeField("notes", e.target.value)}
                placeholder="e.g. Complimentary honeymoon amenities…"
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* ── TAB: DAY-WISE PLAN BUILDER ──────────────────────────────── */}
        {activeTab === "days" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Day-by-Day Schedule</h3>
                <p className="text-xs text-slate-500">
                  Configure stops, intercity transit (Car/Flight/Train), and key attractions.
                </p>
              </div>
              {/* Top "+ Add Day" button */}
              <button
                type="button"
                onClick={onAddDay}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center space-x-1 border border-blue-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Day {itineraryData.days.length + 1}</span>
              </button>
            </div>

            {/* Day Cards */}
            <div className="space-y-4">
              {itineraryData.days.map((day, idx) => (
                <DayCardEditor
                  key={day.id || idx}
                  day={day}
                  index={idx}
                  totalDays={itineraryData.days.length}
                  onUpdate={onUpdateDay}
                  onDelete={onDeleteDay}
                  onMoveUp={onMoveDayUp}
                  onMoveDown={onMoveDayDown}
                  onAddDayBelow={onAddDayBelow}
                />
              ))}
            </div>

            {/* Bottom "+ Add Day" button */}
            <button
              type="button"
              onClick={onAddDay}
              className="w-full py-2.5 border-2 border-dashed border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-800 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Day {itineraryData.days.length + 1}</span>
            </button>

            {/* Generate Banner */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-lg shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Ready to Fetch Wikipedia Links & Photos?</h4>
                  <p className="text-[11px] text-amber-700">
                    Token Diet: only attraction names sent to Gemini Flash. Transit stops excluded.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onGenerate}
                disabled={isGenerating}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                <span>{isGenerating ? "Resolving…" : "Generate Itinerary"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: HOTELS & VEHICLES ──────────────────────────────────── */}
        {activeTab === "stay" && (
          <HotelVehicleSelector
            selectedHotel={itineraryData.selectedHotel}
            onUpdateHotel={(updated) =>
              onChangeField("selectedHotel", { ...itineraryData.selectedHotel, ...updated })
            }
            selectedVehicle={itineraryData.selectedVehicle}
            onUpdateVehicle={(updated) =>
              onChangeField("selectedVehicle", { ...itineraryData.selectedVehicle, ...updated })
            }
            showCostOnItinerary={itineraryData.showCostOnItinerary}
            onToggleCostVisibility={() =>
              onChangeField("showCostOnItinerary", !itineraryData.showCostOnItinerary)
            }
          />
        )}

        {/* ── TAB: INCLUSIONS & EXCLUSIONS ────────────────────────────── */}
        {activeTab === "inclusions" && (
          <InclusionsExclusionsEditor
            inclusions={itineraryData.inclusions}
            exclusions={itineraryData.exclusions}
            onUpdateInclusions={(updated) => onChangeField("inclusions", updated)}
            onUpdateExclusions={(updated) => onChangeField("exclusions", updated)}
          />
        )}
      </div>
    </div>
  );
}
