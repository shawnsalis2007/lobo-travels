import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Calendar,
  Hash,
  Users,
  PlaneLanding,
  PlaneTakeoff,
  Hotel,
  Car,
  CheckCircle,
  XCircle,
  MapPin,
  Coffee,
  UtensilsCrossed,
  Soup,
  Navigation,
  ExternalLink,
  Plane,
  Train,
} from "lucide-react";
import AttractionCard from "./AttractionCard";
import { buildDriveLine, buildTransitLine } from "../utils/routeUtils";

const ItineraryPDF = forwardRef(({ itineraryData, mapImageBase64, onUpdateField = () => {} }, ref) => {
  const {
    refNumber = "LT-2026-0001",
    generatedDate = new Date().toLocaleDateString("en-GB"),
    clientName = "",
    clientPhone = "",
    pax = "",
    destinationTitle = "",
    tripDuration = "",
    travelDates = "",
    arrivalInfo = "",
    departureInfo = "",
    estimatedCost = "",
    showCostOnItinerary = true,
    notes = "",
    selectedHotel = {},
    selectedVehicle = {},
    days = [],
    inclusions = [],
    exclusions = [],
    coverPhoto,
    managedFlightDetails,
  } = itineraryData || {};

  const guestUrl = `${
    import.meta.env.VITE_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  }/view/${encodeURIComponent(refNumber)}`;

  const heroCoverUrl =
    coverPhoto?.url ||
    days[0]?.attractionDetails?.[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";

  const arrFlight = managedFlightDetails?.arrivalFlight;
  const depFlight = managedFlightDetails?.departureFlight;
  const hasStructuredFlights = arrFlight?.flightNumber || depFlight?.flightNumber;

  return (
    <div
      ref={ref}
      id="itinerary-pdf-target"
      className="pdf-page bg-white text-slate-800 shadow-xl rounded-xl w-full max-w-[850px] border border-slate-300 font-sans print-page flex flex-col justify-between"
    >
      <div>
        {/* ─── 1. Header & Branding ────────────────────────────────────── */}
        <div className="avoid-break border-b-2 border-blue-900 pb-5 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <img src="/lobo-logo.jpg" alt="Lobo Travels" className="h-16 w-auto object-contain" />
              <div className="border-l border-slate-200 pl-3.5 py-0.5">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Premium Holiday & Chauffeur Services
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Shop No. 12, NDMC Market Near CNG Pump, Mandir Marg, New Delhi - 110001
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Contact: 9811240072, 9891240072, 9312640072
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-right shrink-0">
              <div className="flex items-center justify-end space-x-1.5 text-xs text-slate-500">
                <Hash className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-400">Ref:</span>
                <span className="font-bold text-blue-900 px-1">{refNumber}</span>
              </div>
              <div className="flex items-center justify-end space-x-1.5 text-xs text-slate-500 mt-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold text-slate-400">Date:</span>
                <span className="font-semibold text-slate-800 px-1">{generatedDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="avoid-break relative bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-xl overflow-hidden mb-5 shadow-sm">
          <div className="absolute inset-0 opacity-20 overflow-hidden">
            <img
              src={heroCoverUrl}
              alt="Tour Cover"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=60";
              }}
            />
          </div>

          <div className="relative z-10 p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-blue-950 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  Custom Tailored Itinerary
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">{destinationTitle}</h2>
              </div>

              {showCostOnItinerary !== false && (
                <div className="bg-white/10 border border-white/20 rounded-lg px-3.5 py-2 text-right shrink-0 backdrop-blur-xs">
                  <span className="text-[10px] uppercase tracking-wider text-blue-200 block">Package Estimate</span>
                  <span className="text-sm font-extrabold text-amber-300">{estimatedCost}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/15 text-xs">
              <div>
                <span className="text-[10px] text-blue-200 uppercase block font-medium">Guest / Client</span>
                <span className="font-semibold text-white">{clientName}</span>
                {clientPhone && <span className="block text-[10px] text-blue-200">{clientPhone}</span>}
              </div>
              <div>
                <span className="text-[10px] text-blue-200 uppercase block font-medium">Travelers (Pax)</span>
                <span className="font-semibold text-white">{pax}</span>
              </div>
              <div>
                <span className="text-[10px] text-blue-200 uppercase block font-medium">Duration</span>
                <span className="font-semibold text-white">{tripDuration}</span>
                {travelDates && <span className="block text-[10px] text-blue-200">{travelDates}</span>}
              </div>
              <div>
                <span className="text-[10px] text-blue-200 uppercase block font-medium">Prepared By</span>
                <span className="font-semibold text-white">Lobo Travels Concierge</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3. Flight & Transfer Summary ───────────────────────────── */}
        {(hasStructuredFlights || arrivalInfo || departureInfo) && (
          <div className="avoid-break bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(arrFlight?.flightNumber || arrivalInfo) && (
              <div className="flex items-start space-x-2.5">
                <PlaneLanding className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Arrival Transfer / Flight</span>
                  {arrFlight?.flightNumber ? (
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">
                        {arrFlight.airline} {arrFlight.flightNumber}
                        {arrFlight.pnr && (
                          <span className="ml-1 text-[10px] font-mono bg-white px-1 py-0.2 rounded border border-slate-200">
                            PNR: {arrFlight.pnr}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {arrFlight.departureAirport || "DEL"} ({arrFlight.departureTime || ""}) →{" "}
                        {arrFlight.arrivalAirport || "KUU"} ({arrFlight.arrivalTime || ""})
                      </p>
                    </div>
                  ) : (
                    <span className="font-semibold text-slate-800">{arrivalInfo}</span>
                  )}
                </div>
              </div>
            )}

            {(depFlight?.flightNumber || departureInfo) && (
              <div className="flex items-start space-x-2.5">
                <PlaneTakeoff className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Departure Transfer / Flight</span>
                  {depFlight?.flightNumber ? (
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">
                        {depFlight.airline} {depFlight.flightNumber}
                        {depFlight.pnr && (
                          <span className="ml-1 text-[10px] font-mono bg-white px-1 py-0.2 rounded border border-slate-200">
                            PNR: {depFlight.pnr}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {depFlight.departureAirport || "KUU"} ({depFlight.departureTime || ""}) →{" "}
                        {depFlight.arrivalAirport || "DEL"} ({depFlight.arrivalTime || ""})
                      </p>
                    </div>
                  ) : (
                    <span className="font-semibold text-slate-800">{departureInfo}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── 4. Dedicated Route Overview Map & QR Code Card ─────────── */}
        <div className="avoid-break bg-slate-50/90 border border-slate-200 rounded-xl p-4 mb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Map snapshot image or preview */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center space-x-2 mb-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Route Overview & Live GPS Map
                </h4>
              </div>

              {mapImageBase64 ? (
                <img
                  src={mapImageBase64}
                  alt="Route Overview Map"
                  className="w-full h-48 object-cover rounded-lg border border-slate-200 my-2 shadow-xs"
                />
              ) : (
                <div className="w-full h-36 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 flex flex-col items-center justify-center text-center p-3 my-2">
                  <Navigation className="w-6 h-6 text-blue-600 mb-1" />
                  <p className="text-xs font-bold text-blue-900">
                    Interactive Multi-Stop Route Plotted
                  </p>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    {days.map((d) => d.stops?.map((s) => s.locationName).filter(Boolean).join(" → ")).filter(Boolean).join(" • ")}
                  </p>
                </div>
              )}
            </div>

            {/* Dynamic SVG QR Code & Clickable Link */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shrink-0 flex flex-col items-center text-center max-w-[200px] shadow-xs">
              <div className="bg-white p-1 rounded-lg border border-slate-100">
                <QRCodeSVG value={guestUrl} size={72} level="M" />
              </div>
              <a
                href={guestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-600 hover:text-blue-800 underline font-semibold mt-2 block"
              >
                Tap to Open Live Map
              </a>
              <p className="text-[9px] text-slate-500 mt-1 leading-tight">
                Scan QR code or click link above for mobile-friendly live GPS navigation & itinerary.
              </p>
            </div>
          </div>
        </div>

        {/* ─── 5. Day-Wise Tour Itinerary ──────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
            <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wide flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
              <span>Day-Wise Tour Itinerary</span>
            </h3>
          </div>

          <div className="space-y-4">
            {days.map((day, idx) => {
              const prevDay = idx > 0 ? days[idx - 1] : null;
              const autoDrive = buildDriveLine(prevDay, day);
              const meals = day.meals || {};
              const hasMeals = meals.breakfast || meals.lunch || meals.dinner;

              return (
                <div key={day.id || idx} className="day-card avoid-break border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="px-2.5 py-1 rounded-md bg-blue-900 text-white font-extrabold text-xs shrink-0 tracking-wider">
                        DAY {day.dayNumber || idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{day.title}</h4>
                    </div>

                    {hasMeals && (
                      <div className="flex items-center space-x-1.5">
                        {meals.breakfast && (
                          <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Coffee className="w-3 h-3 text-amber-600" />
                            <span>Breakfast</span>
                          </span>
                        )}
                        {meals.lunch && (
                          <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <UtensilsCrossed className="w-3 h-3 text-emerald-600" />
                            <span>Lunch</span>
                          </span>
                        )}
                        {meals.dinner && (
                          <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <Soup className="w-3 h-3 text-blue-600" />
                            <span>Dinner</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {autoDrive && (
                    <div className="mb-2 px-3 py-1.5 bg-indigo-50/80 border border-indigo-200/60 rounded-lg text-xs font-semibold text-indigo-900 flex items-center space-x-1.5">
                      {autoDrive.startsWith("Flight") ? (
                        <Plane className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      ) : autoDrive.startsWith("Train") ? (
                        <Train className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Navigation className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      )}
                      <span>{autoDrive}</span>
                    </div>
                  )}

                  {day.description && (
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{day.description}</p>
                  )}

                  {day.attractionDetails && day.attractionDetails.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-500 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Key Highlights (Click photo for Wikipedia article):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {day.attractionDetails.map((att, aIdx) => (
                          <AttractionCard key={aIdx} attraction={att} isPrintMode={true} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 6. Accommodation & Vehicle Details ──────────────────────── */}
        <div className="hotel-vehicle-card avoid-break mb-6">
          <div className="border-b border-slate-200 pb-2 mb-3">
            <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wide flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>Accommodation & Chauffeur Fleet</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 text-xs space-y-1.5">
              <div className="flex items-center space-x-2 text-blue-900 font-bold uppercase mb-2">
                <Hotel className="w-4 h-4 text-blue-700" />
                <span>Hotel Details</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1">
                <span className="text-slate-500">Hotel:</span>
                <span className="font-bold text-slate-800">{selectedHotel.name}</span>
              </div>
              {selectedHotel.city && (
                <div className="flex justify-between border-b border-slate-200/80 pb-1">
                  <span className="text-slate-500">City:</span>
                  <span className="font-medium text-slate-800">{selectedHotel.city}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-200/80 pb-1">
                <span className="text-slate-500">Room Type:</span>
                <span className="font-medium text-slate-800">{selectedHotel.roomType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1">
                <span className="text-slate-500">Meal Plan:</span>
                <span className="font-semibold text-emerald-700">{selectedHotel.mealPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nights:</span>
                <span className="font-medium text-slate-800">{selectedHotel.nights} Night(s)</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 text-xs space-y-1.5">
              <div className="flex items-center space-x-2 text-indigo-900 font-bold uppercase mb-2">
                <Car className="w-4 h-4 text-indigo-700" />
                <span>Vehicle & Transport</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1">
                <span className="text-slate-500">Assigned Vehicle:</span>
                <span className="font-bold text-slate-800">{selectedVehicle.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1">
                <span className="text-slate-500">Class:</span>
                <span className="font-medium text-slate-800">{selectedVehicle.category}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1">
                <span className="text-slate-500">Capacity:</span>
                <span className="font-medium text-slate-800">{selectedVehicle.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chauffeur:</span>
                <span className="font-semibold text-blue-700">Dedicated Hill Chauffeur Included</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 7. Inclusions & Exclusions ───────────────────────────────── */}
        <div className="terms-box avoid-break mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30 text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-800 font-bold uppercase mb-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Package Inclusions</span>
            </div>
            <ul className="space-y-1 text-slate-700">
              {inclusions.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/30 text-xs">
            <div className="flex items-center space-x-1.5 text-rose-800 font-bold uppercase mb-2.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Package Exclusions</span>
            </div>
            <ul className="space-y-1 text-slate-700">
              {exclusions.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {notes && (
          <div className="avoid-break mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Important Tour Notes:</span>
            <p>{notes}</p>
          </div>
        )}
      </div>

      {/* ─── Mandatory Hardcoded Footer ─────────────────────────────────── */}
      <div className="pdf-footer text-xs text-gray-600 border-t pt-2 mt-auto text-center avoid-break">
        <p>
          <strong>Lobo Travels</strong> | Contact: 9811240072, 9891240072, 9312640072 | Email: info@lobotravels.com
        </p>
        <p>
          Address: Shop No. 12, NDMC Market Near CNG Pump, Mandir Marg, New Delhi - 110001 | Website: lobotravels.com
        </p>
      </div>
    </div>
  );
});

ItineraryPDF.displayName = "ItineraryPDF";

export default ItineraryPDF;
