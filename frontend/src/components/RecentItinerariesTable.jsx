import React, { useState } from "react";
import {
  Search,
  Users,
  Car,
  CheckCircle2,
  Clock,
  Eye,
  PenLine,
  Copy,
  Download,
  Ticket,
  Trash2,
} from "lucide-react";
import { formatIndianRupee } from "../utils/routeUtils";

export default function RecentItinerariesTable({
  itineraries = [],
  onEdit,
  onView,
  onDuplicate,
  onDelete,
  onExportPdf,
  onExportVoucher,
}) {
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden mt-6">
      {/* ── Table Header & Controls ────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Recent Tour Itineraries
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Manage client records, print brochures, and issue operational travel vouchers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by ref, client, tour..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            {["All", "Confirmed", "Draft", "Generated"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer text-xs ${
                  filterStatus === st
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table Content ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
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
                  No itineraries match current filter. Click "+ Create Blank Itinerary" above to add one.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isConfirmed = item.status === "Confirmed";

                return (
                  <tr key={item.refNumber} className="hover:bg-slate-50/80 transition group">
                    {/* Reference No */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="hover:text-blue-600 hover:underline cursor-pointer"
                      >
                        {item.refNumber}
                      </button>
                    </td>

                    {/* Tour Name */}
                    <td className="py-3 px-4 max-w-[200px]">
                      <div
                        className="font-semibold text-slate-900 truncate"
                        title={item.destinationTitle}
                      >
                        {item.destinationTitle || "Untitled Itinerary"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.tripDuration || `${item.days?.length || 1} Days Itinerary`}
                      </div>
                    </td>

                    {/* Client Details */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {item.clientName || "Lead Guest"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.clientPhone || "—"}
                      </div>
                    </td>

                    {/* Travel Dates */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.travelDates ? (
                        <div>
                          <div className="text-slate-900 font-medium">{item.travelDates}</div>
                          <div className="text-[11px] text-slate-400">{item.tripDuration || ""}</div>
                        </div>
                      ) : (
                        <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md text-[11px] border border-amber-200">
                          To Be Confirmed
                        </span>
                      )}
                    </td>

                    {/* Pax & Vehicle */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.pax || "2 Adults"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[160px]">
                        <Car className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{item.selectedVehicle?.name || "Private Cab"}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Confirmed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>

                    {/* Tour Cost */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-extrabold text-slate-900">
                        {item.estimatedCost ? formatIndianRupee(item.estimatedCost) : "—"}
                      </div>
                      {item.advancePaid ? (
                        <div className="text-[10px] font-semibold text-emerald-700">
                          Adv: {formatIndianRupee(item.advancePaid)}
                        </div>
                      ) : item.confirmation?.advancePaid > 0 ? (
                        <div className="text-[10px] font-semibold text-emerald-700">
                          Adv: {formatIndianRupee(item.confirmation.advancePaid)}
                        </div>
                      ) : null}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => onView(item)}
                          title="View / Load Itinerary"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          title="Edit Itinerary in Studio"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-700 transition cursor-pointer"
                        >
                          <PenLine className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => onDuplicate(item)}
                          title="Duplicate Itinerary"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* PDF */}
                        <button
                          type="button"
                          onClick={() => onExportPdf(item)}
                          title="Export PDF Itinerary"
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Travel Voucher */}
                        <button
                          type="button"
                          onClick={() => onExportVoucher(item)}
                          title={isConfirmed ? "Export Travel Voucher" : "Confirm Tour to Export Voucher"}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isConfirmed
                              ? "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200"
                              : "hover:bg-slate-100 text-slate-400 hover:text-amber-800"
                          }`}
                        >
                          <Ticket className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDelete(item.refNumber)}
                          title="Delete Record"
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
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
  );
}
