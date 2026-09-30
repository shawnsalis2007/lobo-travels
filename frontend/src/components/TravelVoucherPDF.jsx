import React, { useRef } from "react";
import { formatIndianRupee, formatTransitHeadline } from "../utils/routeUtils";
import { exportVoucherToPdf } from "../utils/pdfGenerator";
import { Plane, Ticket, Luggage, Building, Train } from "lucide-react";

// ── Hardcoded Footer ───────────────────────────────────────────────────────
const PDF_FOOTER = () => (
  <div className="pdf-footer text-xs text-gray-600 border-t pt-2 mt-auto text-center avoid-break">
    <p>
      <strong>Lobo Travels</strong> | Contact: 9811240072, 9891240072, 9312640072 | Email: info@lobotravels.com
    </p>
    <p>
      Address: Shop No. 12, NDMC Market Near CNG Pump, Mandir Marg, New Delhi - 110001 | Website: lobotravels.com
    </p>
  </div>
);

// ── Voucher stamp ─────────────────────────────────────────────────────────
const ConfirmedStamp = () => (
  <div className="inline-block border-4 border-emerald-600 text-emerald-700 rounded-xl px-4 py-1.5 text-xl font-extrabold tracking-widest uppercase opacity-80 rotate-[-6deg] shadow-sm">
    CONFIRMED
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────
export default function TravelVoucherPDF({ itineraryData }) {
  const voucherRef = useRef(null);
  const {
    confirmation,
    selectedHotel,
    selectedVehicle,
    days = [],
    inclusions = [],
    exclusions = [],
    managedFlightDetails,
  } = itineraryData;

  const itRef = itineraryData.refNumber || "LT-2026-0001";
  const voucherRefStr = itineraryData.voucherRef || itRef.replace("LT-", "LTV-");
  const issueDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const totalCost = confirmation?.totalCost || 0;
  const advancePaid = confirmation?.advancePaid || 0;
  const pendingAmount = confirmation?.pendingAmount ?? (totalCost - advancePaid);

  const isFlightBooked = !!managedFlightDetails?.isFlightBookedByLobo;
  const arrFlight = managedFlightDetails?.arrivalFlight;
  const depFlight = managedFlightDetails?.departureFlight;
  const hasFlightData =
    arrFlight?.flightNumber ||
    arrFlight?.airline ||
    depFlight?.flightNumber ||
    depFlight?.airline ||
    itineraryData.arrivalInfo ||
    itineraryData.departureInfo;

  return (
    <div className="bg-slate-200/80 p-4 sm:p-6 rounded-2xl flex justify-center">
      {/* PDF Target — Strict A4 Layout */}
      <div
        ref={voucherRef}
        id="voucher-pdf-target"
        className="pdf-page bg-white text-slate-800 shadow-xl rounded-xl font-sans flex flex-col justify-between"
      >
        <div>
          {/* ─── 1. Header ──────────────────────────────────────────────── */}
          <div className="avoid-break border-b-2 border-blue-900 pb-5 mb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <img src="/lobo-logo.jpg" alt="Lobo Travels" className="h-16 w-auto object-contain" />
                <div>
                  <h1 className="text-2xl font-extrabold text-blue-950 uppercase tracking-widest">
                    TRAVEL VOUCHER
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized Booking Confirmation & Service Voucher
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <ConfirmedStamp />
                <div className="text-right text-xs text-slate-600 space-y-0.5 mt-2">
                  <p>
                    <span className="font-semibold text-slate-400">Voucher Ref:</span>{" "}
                    <strong className="text-blue-900">{voucherRefStr}</strong>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">Itinerary Ref:</span>{" "}
                    <strong className="text-blue-900">{itRef}</strong>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">Issue Date:</span> {issueDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 2. Trip Details ─────────────────────────────────────────── */}
          <div className="avoid-break mb-5">
            <h2 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2.5 border-b border-slate-200 pb-1 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
              <span>1. Guest & Chauffeur Details</span>
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl p-3.5">
              {[
                ["Client Name", itineraryData.clientName],
                ["Phone", itineraryData.clientPhone || "—"],
                [
                  "Travel Dates",
                  itineraryData.travelDates ||
                    `${itineraryData.arrivalInfo || ""} → ${itineraryData.departureInfo || ""}`,
                ],
                ["Duration", itineraryData.tripDuration],
                ["Adults / Kids", itineraryData.pax],
                ["Assigned Vehicle", selectedVehicle?.name],
                ["Chauffeur Name", confirmation?.driverName || selectedVehicle?.driverName || "Dedicated Hill Chauffeur"],
                ["Chauffeur Phone", confirmation?.driverPhone || selectedVehicle?.driverPhone || "—"],
                ["Vehicle No.", confirmation?.vehicleNo || selectedVehicle?.vehicleNo || "—"],
              ].map(([label, value]) =>
                value ? (
                  <div key={label} className="flex">
                    <span className="w-28 text-slate-500 font-medium shrink-0">{label}:</span>
                    <span className="font-semibold text-slate-800">{value}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* ─── 3. Day-wise Plan Table (Rendered BEFORE Hotel details) ───── */}
          <div className="avoid-break mb-5">
            <h2 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2.5 border-b border-slate-200 pb-1 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
              <span>2. Day-Wise Itinerary & Route Schedule</span>
            </h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white">
                  {["Day", "Date", "Route, Transit & Highlights", "Overnight", "Meals"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 font-semibold text-[11px] uppercase tracking-wide first:rounded-tl-lg last:rounded-tr-lg"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, idx) => {
                  const meals = day.meals || {};
                  const mealStr =
                    [meals.breakfast && "B", meals.lunch && "L", meals.dinner && "D"]
                      .filter(Boolean)
                      .join("+") || "—";

                  const overnight = Array.isArray(day.stops)
                    ? day.stops.find((s) => s.isOvernight)?.locationName || "—"
                    : "—";

                  // Extract transit / sightseeing summary
                  const transitDetails = (day.stops || [])
                    .map((s) => {
                      if (s.intercityTransit && s.intercityTransit.type !== "car") {
                        const icon = s.intercityTransit.type === "flight" ? "✈️" : "🚆";
                        return `${icon} ${formatTransitHeadline(s.intercityTransit, "", s.locationName)}`;
                      }
                      if (s.noSightseeing) {
                        return `🚗 Transit → ${s.locationName}`;
                      }
                      return (s.attractions || []).join(", ");
                    })
                    .filter(Boolean)
                    .join(" • ");

                  const routeSummary = transitDetails || day.title;

                  return (
                    <tr key={day.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-3 py-2 font-bold text-blue-900 whitespace-nowrap">
                        Day {day.dayNumber || idx + 1}
                      </td>
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{day.date || "—"}</td>
                      <td className="px-3 py-2 text-slate-700">{routeSummary}</td>
                      <td className="px-3 py-2 font-semibold text-slate-800">{overnight}</td>
                      <td className="px-3 py-2 font-semibold text-emerald-700">{mealStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ─── 4. Flight Details & Electronic Ticket Information ───────── */}
          {hasFlightData && (
            <div className="avoid-break mb-5">
              <h2 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2.5 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Plane className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    3. {isFlightBooked ? "Flight Details & Electronic Ticket Information" : "Flight Schedule for Chauffeur Coordination"}
                  </span>
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isFlightBooked
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "bg-slate-100 text-slate-600 border-slate-300"
                  }`}
                >
                  {isFlightBooked ? "Booked by Lobo Travels" : "Self-Booked by Guest"}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Onbound Flight */}
                {(arrFlight?.flightNumber || itineraryData.arrivalInfo) && (
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-1.5">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
                      <span className="font-bold text-slate-800 flex items-center space-x-1">
                        <span>✈️ Arrival Flight:</span>
                        <strong className="text-blue-900">
                          {arrFlight?.airline || ""} {arrFlight?.flightNumber || ""}
                        </strong>
                      </span>
                      {arrFlight?.pnr && (
                        <span className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700">
                          PNR: {arrFlight.pnr}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <div>
                        <span className="text-slate-500">Route: </span>
                        <span className="font-medium text-slate-800">
                          {arrFlight?.departureAirport || "DEL"} → {arrFlight?.arrivalAirport || "KUU"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Timings: </span>
                        <span className="font-semibold text-slate-800">
                          {arrFlight?.departureTime || ""} - {arrFlight?.arrivalTime || ""}
                        </span>
                      </div>
                      {arrFlight?.terminal && (
                        <div>
                          <span className="text-slate-500">Terminal: </span>
                          <span className="font-medium text-slate-800">{arrFlight.terminal}</span>
                        </div>
                      )}
                      {arrFlight?.baggageAllowance && (
                        <div>
                          <span className="text-slate-500">Baggage: </span>
                          <span className="font-medium text-slate-800">{arrFlight.baggageAllowance}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Return Flight */}
                {(depFlight?.flightNumber || itineraryData.departureInfo) && (
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-1.5">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
                      <span className="font-bold text-slate-800 flex items-center space-x-1">
                        <span>✈️ Departure Flight:</span>
                        <strong className="text-blue-900">
                          {depFlight?.airline || ""} {depFlight?.flightNumber || ""}
                        </strong>
                      </span>
                      {depFlight?.pnr && (
                        <span className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700">
                          PNR: {depFlight.pnr}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <div>
                        <span className="text-slate-500">Route: </span>
                        <span className="font-medium text-slate-800">
                          {depFlight?.departureAirport || "KUU"} → {depFlight?.arrivalAirport || "DEL"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Timings: </span>
                        <span className="font-semibold text-slate-800">
                          {depFlight?.departureTime || ""} - {depFlight?.arrivalTime || ""}
                        </span>
                      </div>
                      {depFlight?.terminal && (
                        <div>
                          <span className="text-slate-500">Terminal: </span>
                          <span className="font-medium text-slate-800">{depFlight.terminal}</span>
                        </div>
                      )}
                      {depFlight?.baggageAllowance && (
                        <div>
                          <span className="text-slate-500">Baggage: </span>
                          <span className="font-medium text-slate-800">{depFlight.baggageAllowance}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── 5. Hotel Details Section ────────────────────────────────── */}
          {selectedHotel && (
            <div className="avoid-break mb-5">
              <h2 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2.5 border-b border-slate-200 pb-1 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                <span>4. Confirmed Accommodation</span>
              </h2>
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
                  {[
                    ["Hotel Name", selectedHotel.name],
                    ["City", selectedHotel.city],
                    ["Room Category", selectedHotel.roomType],
                    ["Meal Plan", selectedHotel.mealPlan],
                    ["Check-in", selectedHotel.checkIn],
                    ["Check-out", selectedHotel.checkOut],
                    ["Duration", selectedHotel.nights ? `${selectedHotel.nights} Night(s)` : undefined],
                    ["Confirmation No.", selectedHotel.confirmationNo || "Confirmed as per Group Block"],
                  ].map(([label, value]) =>
                    value ? (
                      <div key={label} className="flex">
                        <span className="w-32 text-slate-500 font-medium shrink-0">{label}:</span>
                        <span className="font-semibold text-slate-800">{value}</span>
                      </div>
                    ) : null
                  )}
                </div>
                {selectedHotel.address && (
                  <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200">
                    <strong>Address:</strong> {selectedHotel.address}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ─── 6. Payment Summary ──────────────────────────────────────── */}
          <div className="avoid-break mb-5">
            <h2 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2.5 border-b border-slate-200 pb-1 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
              <span>5. Financial & Settlement Summary</span>
            </h2>
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Total Agreed Package Cost:</span>
                <span className="font-bold text-slate-900">
                  {totalCost ? formatIndianRupee(totalCost) : "As per agreed quotation"}
                </span>
              </div>
              {advancePaid > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>
                    Advance Received ({confirmation?.advanceDate || ""} via {confirmation?.paymentMode || "UPI"}):
                  </span>
                  <span className="font-semibold text-emerald-700">{formatIndianRupee(advancePaid)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
                <span className="text-slate-800">Pending Balance upon Arrival:</span>
                <span className={pendingAmount > 0 ? "text-rose-700" : "text-emerald-700"}>
                  {formatIndianRupee(pendingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* ─── 7. Terms & Sign-off ─────────────────────────────────────── */}
          <div className="avoid-break mb-5 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-1.5">
                Key Inclusions
              </h3>
              <ul className="text-xs space-y-1 text-slate-700">
                {(inclusions || []).slice(0, 5).map((item, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-1.5">
                Important Terms
              </h3>
              <ul className="text-xs space-y-1 text-slate-700">
                {(exclusions || []).slice(0, 4).map((item, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-rose-500 font-bold mt-0.5">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Signature Box */}
          <div className="avoid-break mb-6 flex justify-end">
            <div className="text-center border-t border-slate-400 pt-2.5 w-48">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">Authorized Signatory</p>
              <p className="text-xs text-slate-500">For Lobo Travels</p>
            </div>
          </div>
        </div>

        {/* ─── Mandatory Hardcoded Footer ─────────────────────────────────── */}
        <PDF_FOOTER />
      </div>
    </div>
  );
}
