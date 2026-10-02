import React from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck,
  FilePlus,
  RefreshCw,
  CloudUpload,
} from "lucide-react";

export default function KPICardsBar({
  itineraries = [],
  onCreateBlank,
  onReset,
  onSave,
  isSaving,
  onFilterClick,
}) {
  const totalTours = itineraries.length;
  const draftCount = itineraries.filter((i) => i.status === "Draft" || !i.status).length;
  const generatedCount = itineraries.filter((i) => i.status === "Generated").length;
  const confirmedCount = itineraries.filter((i) => i.status === "Confirmed").length;
  const cancelledCount = itineraries.filter((i) => i.status === "Cancelled").length;

  return (
    <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 pt-4 pb-1">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* 5 KPI Cards Grid / Mobile Horizontal Swipe Strip */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 flex-1 overflow-x-auto no-scrollbar touch-scroll snap-x pb-1 sm:pb-0">
          {/* Card 1: Total Tours */}
          <div
            onClick={() => onFilterClick && onFilterClick("All")}
            className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between shrink-0 min-w-[130px] sm:min-w-0 snap-start active:scale-95"
          >
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700">Total Tours</span>
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 stroke-[1.75]" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{totalTours}</p>
            <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-medium">All records</span>
          </div>

          {/* Card 2: Drafts */}
          <div
            onClick={() => onFilterClick && onFilterClick("Draft")}
            className="bg-white p-3 sm:p-4 rounded-2xl border border-amber-200/90 shadow-2xs hover:shadow-sm hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between shrink-0 min-w-[130px] sm:min-w-0 snap-start active:scale-95"
          >
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-[11px] sm:text-xs font-semibold text-amber-800">Drafts</span>
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 stroke-[1.75]" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-900 tracking-tight">{draftCount}</p>
            <span className="text-[10px] sm:text-[11px] text-amber-600/90 mt-0.5 font-medium">In preparation</span>
          </div>

          {/* Card 3: Generated / Sent */}
          <div
            onClick={() => onFilterClick && onFilterClick("Generated")}
            className="bg-white p-3 sm:p-4 rounded-2xl border border-blue-200/90 shadow-2xs hover:shadow-sm hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between shrink-0 min-w-[130px] sm:min-w-0 snap-start active:scale-95"
          >
            <div className="flex items-center justify-between text-blue-700 mb-1">
              <span className="text-[11px] sm:text-xs font-semibold text-blue-800 truncate">Generated</span>
              <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 stroke-[1.75]" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-blue-900 tracking-tight">{generatedCount}</p>
            <span className="text-[10px] sm:text-[11px] text-blue-600/90 mt-0.5 font-medium">Proposals</span>
          </div>

          {/* Card 4: Confirmed */}
          <div
            onClick={() => onFilterClick && onFilterClick("Confirmed")}
            className="bg-white p-3 sm:p-4 rounded-2xl border border-emerald-200/90 shadow-2xs hover:shadow-sm hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between shrink-0 min-w-[130px] sm:min-w-0 snap-start active:scale-95"
          >
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-800">Confirmed</span>
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 stroke-[1.75]" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-900 tracking-tight">{confirmedCount}</p>
            <span className="text-[10px] sm:text-[11px] text-emerald-600/90 mt-0.5 font-medium">With Vouchers</span>
          </div>

          {/* Card 5: Cancelled */}
          <div
            onClick={() => onFilterClick && onFilterClick("Cancelled")}
            className="bg-white p-3 sm:p-4 rounded-2xl border border-rose-200/90 shadow-2xs hover:shadow-sm hover:border-rose-400 transition-all cursor-pointer flex flex-col justify-between shrink-0 min-w-[130px] sm:min-w-0 snap-start active:scale-95"
          >
            <div className="flex items-center justify-between text-rose-700 mb-1">
              <span className="text-[11px] sm:text-xs font-semibold text-rose-800">Cancelled</span>
              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 stroke-[1.75]" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-rose-900 tracking-tight">{cancelledCount}</p>
            <span className="text-[10px] sm:text-[11px] text-rose-600/90 mt-0.5 font-medium">Archived</span>
          </div>
        </div>

        {/* Action Buttons: Reset + Save + Dedicated "+ Create Blank Itinerary" CTA */}
        <div className="shrink-0 flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="bg-white hover:bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2 text-left group active:scale-95 min-h-[44px]"
            title="Reset itinerary to default template"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800 transition-colors shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                Reset
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Template
              </div>
            </div>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="bg-emerald-50 hover:bg-emerald-100/80 p-2.5 sm:p-3 rounded-2xl border border-emerald-300 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-2 text-left group active:scale-95 disabled:opacity-50 min-h-[44px]"
            title="Save current itinerary to Firestore database"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-200 transition-colors shrink-0">
              <CloudUpload className={`w-4 h-4 text-emerald-700 ${isSaving ? "animate-bounce" : ""}`} />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-extrabold text-emerald-900 transition-colors">
                {isSaving ? "Saving..." : "Save Tour"}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">
                To Database
              </div>
            </div>
          </button>

          {/* Dedicated "+ Create Blank Itinerary" CTA Button */}
          <button
            type="button"
            onClick={onCreateBlank}
            className="flex-1 sm:flex-initial w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-2xl shadow-sm hover:shadow-md transition-all transform active:scale-95 flex items-center justify-center space-x-2 cursor-pointer border border-amber-400/40 min-h-[44px]"
            title="Create a completely blank itinerary and add all information manually"
          >
            <FilePlus className="w-4 h-4 text-amber-100 shrink-0" />
            <div className="text-left">
              <div className="font-extrabold tracking-wide uppercase text-[11px]">
                + Create Blank Itinerary
              </div>
              <div className="text-[10px] text-amber-100/90 font-normal">
                Enter all info manually
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
