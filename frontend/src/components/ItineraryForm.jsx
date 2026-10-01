import React, { useState, useEffect } from "react";
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
  Luggage,
  Car,
  DollarSign,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Check,
  ShieldCheck,
  Building,
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
  onOpenCoverModal,
  onMarkConfirmed,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTentativeDates, setIsTentativeDates] = useState(!itineraryData.startDate);

  // Helper to calculate duration from startDate and endDate
  const handleDateChange = (type, val) => {
    const nextStart = type === "start" ? val : itineraryData.startDate;
    const nextEnd = type === "end" ? val : itineraryData.endDate;

    onChangeField(type === "start" ? "startDate" : "endDate", val);

    if (nextStart && nextEnd) {
      const s = new Date(nextStart);
      const e = new Date(nextEnd);
      const diffTime = e.getTime() - s.getTime();
      if (!isNaN(diffTime) && diffTime >= 0) {
        const nights = Math.round(diffTime / (1000 * 60 * 60 * 24));
        const days = nights + 1;
        const durationText = `${nights} Nights / ${days} Days`;
        const dateRangeText = `${s.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })} – ${e.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`;

        onChangeField("tripDuration", durationText);
        onChangeField("travelDates", dateRangeText);
      }
    }
  };

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
    if (updated.flightNumber || updated.departureAirport || updated.departureTime) {
      const summary = `${updated.departureTime || ""} ${updated.airline || ""} ${
        updated.flightNumber || ""
      }, ${updated.arrivalAirport || updated.departureAirport || ""}`.trim();
      onChangeField("arrivalInfo", summary);
    }
  };

  const updateDepartureFlight = (patch) => {
    const updated = {
      ...(flightDetails.departureFlight || {}),
      ...patch,
    };
    updateFlightDetails({ departureFlight: updated });
    if (updated.flightNumber || updated.departureAirport || updated.departureTime) {
      const summary = `${updated.departureTime || ""} ${updated.airline || ""} ${
        updated.flightNumber || ""
      }, ${updated.departureAirport || updated.arrivalAirport || ""}`.trim();
      onChangeField("departureInfo", summary);
    }
  };

  const steps = [
    { num: 1, title: "Client & Dates", icon: Calendar },
    { num: 2, title: "Vehicle & Flights", icon: Plane },
    { num: 3, title: `Days (${itineraryData.days.length})`, icon: Clock },
    { num: 4, title: "Stay & Inclusions", icon: Building },
    { num: 5, title: "Cover & Pricing", icon: DollarSign },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
      {/* ── 5-STEP STEPPER HEADER ────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-slate-900 text-white px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/60">
              5-Step Studio Wizard
            </span>
            <span className="text-xs text-slate-300 font-semibold hidden sm:inline">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Ref: <strong className="text-white">{itineraryData.refNumber}</strong>
          </span>
        </div>

        {/* Stepper Pills Navigation */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {steps.map(({ num, title, icon: StepIcon }) => {
            const isActive = currentStep === num;
            const isCompleted = currentStep > num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setCurrentStep(num)}
                className={`flex items-center justify-center sm:justify-start space-x-1.5 p-1.5 sm:px-2.5 sm:py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-400"
                    : isCompleted
                    ? "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                    : "bg-slate-800/60 hover:bg-slate-800 text-slate-400 border border-slate-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isActive
                      ? "bg-white text-blue-700"
                      : isCompleted
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : num}
                </div>
                <span className="truncate hidden md:inline">{title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STEP CONTENT AREA ────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5">
        {/* ─────────────────────────────────────────────────────────────
            STEP 1: CLIENT, DATES & TRIP ESSENTIALS
        ───────────────────────────────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Step 1: Client & Date Specifications</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Select start and end dates to calculate exact tour duration automatically, or toggle tentative dates.
                </p>
              </div>
            </div>

            {/* Tour Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Itinerary Title / Tour Heading <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={itineraryData.destinationTitle || ""}
                onChange={(e) => onChangeField("destinationTitle", e.target.value)}
                placeholder="e.g. Scenic Himachal Mountain Escape (Manali & Solang)"
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Client / Guest Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={itineraryData.clientName || ""}
                    onChange={(e) => onChangeField("clientName", e.target.value)}
                    placeholder="e.g. Mr. Rajesh Sharma & Family"
                    className="w-full text-xs rounded-lg border-slate-300 p-2.5 pl-8 text-slate-800 focus:border-blue-500 focus:ring-blue-500 font-medium"
                  />
                  <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Client Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={itineraryData.clientPhone || ""}
                  onChange={(e) => onChangeField("clientPhone", e.target.value)}
                  placeholder="e.g. +91 9811240072"
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Client Email Address
                </label>
                <input
                  type="email"
                  value={itineraryData.clientEmail || ""}
                  onChange={(e) => onChangeField("clientEmail", e.target.value)}
                  placeholder="e.g. guest@example.com"
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Number of Travelers (Pax)
                </label>
                <input
                  type="text"
                  value={itineraryData.pax || ""}
                  onChange={(e) => onChangeField("pax", e.target.value)}
                  placeholder="e.g. 2 Adults + 1 Child"
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Date Pickers Card with Duration Auto-Computation */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Tour Dates & Duration</span>
                </span>

                <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={isTentativeDates}
                    onChange={(e) => setIsTentativeDates(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Tentative / Flexible Dates</span>
                </label>
              </div>

              {!isTentativeDates ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={itineraryData.startDate || ""}
                      onChange={(e) => handleDateChange("start", e.target.value)}
                      className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={itineraryData.endDate || ""}
                      onChange={(e) => handleDateChange("end", e.target.value)}
                      className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Travel Dates / Season Description
                  </label>
                  <input
                    type="text"
                    value={itineraryData.travelDates || ""}
                    onChange={(e) => onChangeField("travelDates", e.target.value)}
                    placeholder="e.g. October 2026 (Tentative / Flexible)"
                    className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>
              )}

              {/* Calculated Duration Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Duration (Nights / Days)
                  </label>
                  <input
                    type="text"
                    value={itineraryData.tripDuration || ""}
                    onChange={(e) => onChangeField("tripDuration", e.target.value)}
                    placeholder="e.g. 4 Days / 3 Nights"
                    className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 font-semibold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Reference Code
                  </label>
                  <input
                    type="text"
                    value={itineraryData.refNumber || ""}
                    onChange={(e) => onChangeField("refNumber", e.target.value)}
                    placeholder="LT-2026-XXXX"
                    className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 font-mono bg-white font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 2: VEHICLE FLEET & DETAILED FLIGHT BOOKINGS
        ───────────────────────────────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <Car className="w-4 h-4 text-blue-600" />
                <span>Dedicated Vehicle & Transport Fleet</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Vehicle Type / Model
                  </label>
                  <input
                    type="text"
                    value={itineraryData.selectedVehicle?.name || ""}
                    onChange={(e) =>
                      onChangeField("selectedVehicle", {
                        ...itineraryData.selectedVehicle,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. AC Toyota Innova Crysta"
                    className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Seating Capacity / Service Note
                  </label>
                  <input
                    type="text"
                    value={itineraryData.selectedVehicle?.capacity || ""}
                    onChange={(e) =>
                      onChangeField("selectedVehicle", {
                        ...itineraryData.selectedVehicle,
                        capacity: e.target.value,
                      })
                    }
                    placeholder="e.g. 6+1 Seater Private Cab with Driver"
                    className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Flight Bookings Card */}
            <div className="border-t border-slate-200 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Plane className="w-4 h-4 text-blue-600" />
                    <span>Flight Bookings & Electronic Ticket Info</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Auto-populates airport arrival coordination and official Travel Vouchers.
                  </p>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer select-none bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1">
                  <input
                    type="checkbox"
                    checked={!!flightDetails.isFlightBookedByLobo}
                    onChange={(e) =>
                      updateFlightDetails({ isFlightBookedByLobo: e.target.checked })
                    }
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-blue-900">Booked by Lobo</span>
                </label>
              </div>

              {/* Arrival Flight */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                  <PlaneLanding className="w-4 h-4 text-emerald-600" />
                  <span>Arrival Flight (Inbound)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Airline
                    </label>
                    <input
                      type="text"
                      value={flightDetails.arrivalFlight?.airline || ""}
                      onChange={(e) => updateArrivalFlight({ airline: e.target.value })}
                      placeholder="e.g. IndiGo"
                      className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Flight Number
                    </label>
                    <input
                      type="text"
                      value={flightDetails.arrivalFlight?.flightNumber || ""}
                      onChange={(e) => updateArrivalFlight({ flightNumber: e.target.value })}
                      placeholder="e.g. 6E-204"
                      className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      PNR / E-Ticket Code
                    </label>
                    <input
                      type="text"
                      value={flightDetails.arrivalFlight?.pnr || ""}
                      onChange={(e) => updateArrivalFlight({ pnr: e.target.value })}
                      placeholder="e.g. 6E9XYZ"
                      className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Departure Airport & Time
                    </label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={flightDetails.arrivalFlight?.departureAirport || ""}
                        onChange={(e) => updateArrivalFlight({ departureAirport: e.target.value })}
                        placeholder="DEL"
                        className="w-2/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        value={flightDetails.arrivalFlight?.departureTime || ""}
                        onChange={(e) => updateArrivalFlight({ departureTime: e.target.value })}
                        placeholder="06:15 AM"
                        className="w-1/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Arrival Airport & Time
                    </label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={flightDetails.arrivalFlight?.arrivalAirport || ""}
                        onChange={(e) => updateArrivalFlight({ arrivalAirport: e.target.value })}
                        placeholder="KUU"
                        className="w-2/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        value={flightDetails.arrivalFlight?.arrivalTime || ""}
                        onChange={(e) => updateArrivalFlight({ arrivalTime: e.target.value })}
                        placeholder="07:35 AM"
                        className="w-1/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Terminal & Baggage
                    </label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={flightDetails.arrivalFlight?.terminal || ""}
                        onChange={(e) => updateArrivalFlight({ terminal: e.target.value })}
                        placeholder="T3"
                        className="w-1/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        value={flightDetails.arrivalFlight?.baggageAllowance || ""}
                        onChange={(e) => updateArrivalFlight({ baggageAllowance: e.target.value })}
                        placeholder="15kg Check-in"
                        className="w-2/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Departure Flight */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
                  <PlaneTakeoff className="w-4 h-4 text-blue-600" />
                  <span>Return / Departure Flight (Outbound)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Airline
                    </label>
                    <input
                      type="text"
                      value={flightDetails.departureFlight?.airline || ""}
                      onChange={(e) => updateDepartureFlight({ airline: e.target.value })}
                      placeholder="e.g. IndiGo"
                      className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Flight Number
                    </label>
                    <input
                      type="text"
                      value={flightDetails.departureFlight?.flightNumber || ""}
                      onChange={(e) => updateDepartureFlight({ flightNumber: e.target.value })}
                      placeholder="e.g. 6E-205"
                      className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      PNR / E-Ticket Code
                    </label>
                    <input
                      type="text"
                      value={flightDetails.departureFlight?.pnr || ""}
                      onChange={(e) => updateDepartureFlight({ pnr: e.target.value })}
                      placeholder="e.g. 6E9XYZ"
                      className="w-full text-xs rounded border-slate-300 p-1.5 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Departure Airport & Time
                    </label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={flightDetails.departureFlight?.departureAirport || ""}
                        onChange={(e) => updateDepartureFlight({ departureAirport: e.target.value })}
                        placeholder="KUU"
                        className="w-2/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        value={flightDetails.departureFlight?.departureTime || ""}
                        onChange={(e) => updateDepartureFlight({ departureTime: e.target.value })}
                        placeholder="02:40 PM"
                        className="w-1/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Arrival Airport & Time
                    </label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={flightDetails.departureFlight?.arrivalAirport || ""}
                        onChange={(e) => updateDepartureFlight({ arrivalAirport: e.target.value })}
                        placeholder="DEL"
                        className="w-2/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        value={flightDetails.departureFlight?.arrivalTime || ""}
                        onChange={(e) => updateDepartureFlight({ arrivalTime: e.target.value })}
                        placeholder="04:00 PM"
                        className="w-1/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      Terminal & Baggage
                    </label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={flightDetails.departureFlight?.terminal || ""}
                        onChange={(e) => updateDepartureFlight({ terminal: e.target.value })}
                        placeholder="T1"
                        className="w-1/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        value={flightDetails.departureFlight?.baggageAllowance || ""}
                        onChange={(e) => updateDepartureFlight({ baggageAllowance: e.target.value })}
                        placeholder="15kg Check-in"
                        className="w-2/3 text-xs rounded border-slate-300 p-1.5 text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 3: DAY-BY-DAY SCHEDULE & TOKEN DIET AI ENRICHMENT
        ───────────────────────────────────────────────────────────── */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Day-by-Day Schedule Builder</h3>
                <p className="text-xs text-slate-500">
                  Configure stops, intercity transit routes, and attractions.
                </p>
              </div>
              <button
                type="button"
                onClick={onAddDay}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center space-x-1 border border-blue-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Day {itineraryData.days.length + 1}</span>
              </button>
            </div>

            {/* AI Generator Banner */}
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-lg shadow-xs shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Enrich Attractions with AI</h4>
                  <p className="text-[11px] text-amber-700">
                    Zero-cost Token Diet: fetches verified Wikipedia links and high-res photos.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onGenerate}
                disabled={isGenerating}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 disabled:opacity-50 shrink-0 cursor-pointer active:scale-95"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                <span>{isGenerating ? "Enriching…" : "Generate AI"}</span>
              </button>
            </div>

            {/* Day Cards List */}
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
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 4: HOTELS & INCLUSIONS / EXCLUSIONS
        ───────────────────────────────────────────────────────────── */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fade-in">
            {/* Hotel & Vehicle Selector component */}
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

            {/* Inclusions & Exclusions Checklist */}
            <div className="border-t border-slate-200 pt-4">
              <InclusionsExclusionsEditor
                inclusions={itineraryData.inclusions}
                exclusions={itineraryData.exclusions}
                onUpdateInclusions={(updated) => onChangeField("inclusions", updated)}
                onUpdateExclusions={(updated) => onChangeField("exclusions", updated)}
              />
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 5: COVER PHOTO, PRICING & SPECIAL REMARKS
        ───────────────────────────────────────────────────────────── */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            {/* Pricing Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Pricing & Payment Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Total Estimated Package Cost
                  </label>
                  <input
                    type="text"
                    value={itineraryData.estimatedCost || ""}
                    onChange={(e) => onChangeField("estimatedCost", e.target.value)}
                    placeholder="e.g. ₹ 48,500 / Total Package"
                    className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 font-bold text-emerald-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Advance Payment Received (for Vouchers)
                  </label>
                  <input
                    type="text"
                    value={itineraryData.advancePaid || ""}
                    onChange={(e) => onChangeField("advancePaid", e.target.value)}
                    placeholder="e.g. ₹ 20,000 (Transferred via UPI)"
                    className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Cover Photo Selection Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Cover Photo</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenCoverModal}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Choose from Gallery →
                </button>
              </div>

              {itineraryData.coverPhoto?.url && (
                <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200 group">
                  <img
                    src={itineraryData.coverPhoto.url}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={onOpenCoverModal}
                      className="px-3 py-1 bg-white text-slate-900 rounded-md text-xs font-bold shadow cursor-pointer"
                    >
                      Change Cover
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">
                  Custom Cover Photo URL
                </label>
                <input
                  type="text"
                  value={itineraryData.coverPhoto?.url || ""}
                  onChange={(e) =>
                    onChangeField("coverPhoto", { mode: "custom", url: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 bg-white"
                />
              </div>
            </div>

            {/* Special Remarks / Honeymoon / Dietary Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Remarks / Notes / Honeymoon Inclusions
              </label>
              <textarea
                rows={3}
                value={itineraryData.notes || ""}
                onChange={(e) => onChangeField("notes", e.target.value)}
                placeholder="e.g. Complimentary honeymoon cake & flower bed decoration in Manali. Vegetarian meals preferred."
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Status & Confirmation Box */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-950">
                  Ready to confirm client booking?
                </div>
                <div className="text-[11px] text-emerald-700">
                  Confirming unlocks official Travel Voucher PDF and records advance payment.
                </div>
              </div>
              <button
                type="button"
                onClick={onMarkConfirmed}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow cursor-pointer active:scale-95"
              >
                {itineraryData.status === "Confirmed" ? "Update Confirmation" : "Confirm Booking"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── STEPPER FOOTER CONTROLS ──────────────────────────────────────── */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-400">
          <span>
            Step {currentStep} of {steps.length}
          </span>
        </div>

        {currentStep < steps.length ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
            className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center space-x-1 cursor-pointer"
          >
            <span>Next Step</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="px-4 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-xs flex items-center space-x-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? "Enriching…" : "Finish & AI Enrich"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
