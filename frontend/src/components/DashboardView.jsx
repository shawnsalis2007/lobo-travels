import React, { useState } from "react";
import {
  CirclePlus,
  Ticket,
  Car,
  FileCheckCorner,
  Clock,
  CircleCheck,
  CircleX,
  IndianRupee,
  Search,
  Users,
  Eye,
  PenLine,
  Copy,
  Download,
  Trash2,
  Building2,
  MapPin,
  Settings,
} from "lucide-react";
import { formatIndianRupee } from "../utils/routeUtils";

export default function DashboardView({
  itineraries = [],
  onNewItinerary,
  onCreateItinerary,
  onLoadTemplate,
  onEditItinerary,
  onViewItinerary,
  onDuplicateItinerary,
  onDeleteItinerary,
  onExportPdf,
  onOpenVoucher,
  onExportVoucher,
  onSelectTab,
}) {
  const handleCreate = onCreateItinerary || onNewItinerary;
  const handleVoucher = onExportVoucher || onOpenVoucher;
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter list
  const filtered = itineraries.filter((it) => {
    const statusMatch =
      filterStatus === "All"
        ? true
        : filterStatus === "Confirmed"
        ? it.status === "Confirmed"
        : filterStatus === "Draft"
        ? it.status === "Draft" || !it.status
        : filterStatus === "Generated"
        ? it.status === "Generated"
        : true;

    const term = searchQuery.toLowerCase().trim();
    const textMatch =
      !term ||
      (it.refNumber || "").toLowerCase().includes(term) ||
      (it.clientName || "").toLowerCase().includes(term) ||
      (it.destinationTitle || "").toLowerCase().includes(term);

    return statusMatch && textMatch;
  });

  // Calculate KPI stats
  const totalTours = itineraries.length;
  const draftCount = itineraries.filter((i) => i.status === "Draft" || !i.status).length;
  const confirmedCount = itineraries.filter((i) => i.status === "Confirmed").length;
  const generatedCount = itineraries.filter((i) => i.status === "Generated").length;
  const cancelledCount = itineraries.filter((i) => i.status === "Cancelled").length;

  const totalValue = itineraries.reduce((sum, item) => {
    const rawCost = item.estimatedCost || item.confirmation?.totalCost || 0;
    const num = parseInt(String(rawCost).replace(/[^\d]/g, ""), 10);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* ── 1. Top Operations Hero Banner ──────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#151521] via-[#26214F] to-[#151521] rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-[#26214F] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-medium mb-3 backdrop-blur-xs border border-white/10">
            <span>Official Lobo Travels Tour Platform</span>
            <span>·</span>
            <span>Mandir Marg, New Delhi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Itinerary &amp; Fleet Operations
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
            Handcraft high-converting multi-day client travel brochures, automatically compute transfers,
            coordinate contracted hotels, and generate instant operations vouchers.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-md transition transform active:scale-95 cursor-pointer"
            >
              <CirclePlus className="w-4 h-4 text-slate-950" />
              <span>Create New Itinerary</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus("Confirmed")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition backdrop-blur-xs cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-amber-300" />
              <span>Confirmed Bookings ({confirmedCount})</span>
            </button>
          </div>
        </div>

        {/* Decorative Watermark Car Icon */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-8 opacity-10 pointer-events-none">
          <Car className="w-80 h-80 sm:w-96 sm:h-96 text-white" />
        </div>
      </div>

      {/* ── 2. Operations & Pipeline Metrics (6 KPI Cards) ──────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Tours */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Tours</span>
            <FileCheckCorner className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalTours}</p>
          <span className="text-[11px] text-slate-400">All registered records</span>
        </div>

        {/* Drafts */}
        <div
          onClick={() => setFilterStatus("Draft")}
          className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs hover:border-amber-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-medium">Drafts</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-900">{draftCount}</p>
          <span className="text-[11px] text-amber-600">In preparation</span>
        </div>

        {/* Generated / Sent */}
        <div
          onClick={() => setFilterStatus("Generated")}
          className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-xs hover:border-blue-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-xs font-medium">Generated / Sent</span>
            <FileCheckCorner className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{generatedCount}</p>
          <span className="text-[11px] text-blue-600">Client proposals</span>
        </div>

        {/* Confirmed */}
        <div
          onClick={() => setFilterStatus("Confirmed")}
          className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs hover:border-emerald-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-medium">Confirmed</span>
            <CircleCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-900">{confirmedCount}</p>
          <span className="text-[11px] text-emerald-600">Vouchers available</span>
        </div>

        {/* Cancelled */}
        <div
          onClick={() => setFilterStatus("Cancelled")}
          className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-xs hover:border-rose-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-medium">Cancelled</span>
            <CircleX className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-900">{cancelledCount}</p>
          <span className="text-[11px] text-rose-600">Void / Archived</span>
        </div>

        {/* Tour Value */}
        <div className="bg-gradient-to-br from-[#151521] to-[#26214F] p-4 rounded-xl border border-[#26214F] text-white shadow-xs">
          <div className="flex items-center justify-between text-amber-300 mb-2">
            <span className="text-xs font-medium">Tour Value</span>
            <IndianRupee className="w-4 h-4 text-amber-300" />
          </div>
          <p className="text-xl font-extrabold text-white truncate">
            {formatIndianRupee(totalValue)}
          </p>
          <span className="text-[11px] text-slate-300">Active portfolio</span>
        </div>
      </div>

      {/* ── 3. Tour Management Shortcuts ───────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Tour Management Shortcuts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={handleCreate}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center mb-2 transition">
              <CirclePlus className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-slate-900 group-hover:text-amber-700">New Itinerary</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Step-by-step wizard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("itinerary-search-input");
              if (el) el.focus();
            }}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-2 transition">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">Search Itinerary</span>
            <span className="text-[10px] text-slate-400 mt-0.5">By Ref / Name</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("Confirmed")}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center mb-2 transition">
              <Ticket className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700">Confirmed Tours</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Voucher issuance</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("hotels")}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center mb-2 transition">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-700">Hotels Directory</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Google place import</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("destinations")}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mb-2 transition">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-slate-900 group-hover:text-purple-700">Destinations</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Attractions catalog</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("settings")}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center mb-2 transition">
              <Settings className="w-5 h-5 text-slate-700" />
            </div>
            <span className="text-xs font-semibold text-slate-900 group-hover:text-slate-800">Settings &amp; Brand</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Prefix &amp; Contacts</span>
          </button>
        </div>
      </div>

      {/* ── 4. Recent Tour Itineraries Table ───────────────────────────── */}
      <div id="itinerary-table-section" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Tour Itineraries</h2>
            <p className="text-xs text-slate-500">
              Manage client records, print brochures, and issue operational travel vouchers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="itinerary-search-input"
                type="text"
                placeholder="Filter by ref, client, tour..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              {["All", "Confirmed", "Draft", "Generated"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    filterStatus === st
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Reference No.</th>
                <th className="py-3 px-4">Tour Name</th>
                <th className="py-3 px-4">Client Details</th>
                <th className="py-3 px-4">Travel Dates</th>
                <th className="py-3 px-4">Pax &amp; Vehicle</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tour Cost</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No itineraries match current filter. Click "+ Create Itinerary" to start.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isItemConfirmed = item.status === "Confirmed";
                  const isItemDraft = item.status === "Draft" || !item.status;

                  return (
                    <tr key={item.refNumber} className="hover:bg-slate-50/70 transition">
                      {/* Reference No */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onEditItinerary(item)}
                          className="hover:text-indigo-600 hover:underline cursor-pointer"
                        >
                          {item.refNumber}
                        </button>
                      </td>

                      {/* Tour Name */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="font-semibold text-slate-900 truncate" title={item.destinationTitle}>
                          {item.destinationTitle || "Untitled Itinerary"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.tripDuration || `${item.days?.length || 1} Days`}
                        </div>
                      </td>

                      {/* Client Details */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{item.clientName || "Lead Guest"}</div>
                        <div className="text-[11px] text-slate-400">{item.clientPhone || "—"}</div>
                      </td>

                      {/* Travel Dates */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.travelDates ? (
                          <div>
                            <div className="text-slate-900 font-medium">{item.travelDates}</div>
                            <div className="text-[11px] text-slate-400">{item.tripDuration || ""}</div>
                          </div>
                        ) : (
                          <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                            To Be Confirmed
                          </span>
                        )}
                      </td>

                      {/* Pax & Vehicle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-slate-800">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.pax || "2 Adults"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[160px]">
                          <Car className="w-3 h-3 text-slate-400" />
                          <span>{item.selectedVehicle?.name || "Toyota Innova Crysta"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isItemConfirmed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CircleCheck className="w-3 h-3 text-emerald-600" />
                            <span>Confirmed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Draft</span>
                          </span>
                        )}
                      </td>

                      {/* Tour Cost */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {item.estimatedCost ? formatIndianRupee(item.estimatedCost) : "—"}
                        </div>
                        {item.confirmation?.advancePaid > 0 && (
                          <div className="text-[10px] text-emerald-600">
                            Adv: {formatIndianRupee(item.confirmation.advancePaid)}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => onViewItinerary(item)}
                            title="View Itinerary"
                            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onEditItinerary(item)}
                            title="Edit Itinerary"
                            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-indigo-600 transition cursor-pointer"
                          >
                            <PenLine className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => onDuplicateItinerary(item)}
                            title="Duplicate Itinerary"
                            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-blue-600 transition cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* PDF Export */}
                          <button
                            type="button"
                            onClick={() => onExportPdf(item)}
                            title="Export PDF Itinerary"
                            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-emerald-600 transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Travel Voucher */}
                          <button
                            type="button"
                            onClick={() => handleVoucher(item)}
                            title={isItemConfirmed ? "View Travel Voucher" : "Generate Travel Voucher"}
                            className={`p-1.5 rounded-md transition cursor-pointer ${
                              isItemConfirmed
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                : "hover:bg-slate-200 text-slate-600 hover:text-amber-700"
                            }`}
                          >
                            <Ticket className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => onDeleteItinerary(item.refNumber)}
                            title="Delete Record"
                            className="p-1.5 rounded-md hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
