import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  FileDown,
  ShieldCheck,
  RefreshCw,
  Database,
  CloudUpload,
  FolderOpen,
  CheckCircle,
  FileCheck,
  Image,
  Plus,
  ChevronDown,
  FilePlus,
} from "lucide-react";

export default function Header({
  onNewBlank,
  onGenerate,
  onExportPdf,
  onExportVoucher,
  onReset,
  onSave,
  onOpenSavedModal,
  onMarkConfirmed,
  onOpenCoverModal,
  isGenerating,
  isExporting,
  isExportingVoucher,
  isSaving,
  stats,
  backendStatus,
  itineraryStatus,
  voucherRef,
}) {
  const isConfirmed = itineraryStatus === "Confirmed";
  const [showNewMenu, setShowNewMenu] = useState(false);
  const newMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (newMenuRef.current && !newMenuRef.current.contains(event.target)) {
        setShowNewMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-0">
        {/* Main Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:h-20 gap-2 sm:gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center justify-between sm:justify-start space-x-3 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="h-10 sm:h-12 w-auto flex items-center justify-center p-1 bg-white rounded-xl border border-slate-200 shadow-xs">
                <img
                  src="/lobo-logo.jpg"
                  alt="Lobo Travels Logo"
                  className="h-8 sm:h-10 w-auto object-contain"
                />
              </div>
              <div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 bg-clip-text text-transparent">
                    LOBO TRAVELS
                  </span>
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Studio
                  </span>
                  {isConfirmed && (
                    <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Confirmed</span>
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                  Mandir Marg, New Delhi • 9811240072
                </p>
              </div>
            </div>

            {/* Mobile Status Dot */}
            <div className="flex items-center space-x-1.5 sm:hidden bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-[10px] text-slate-600">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus?.firestoreConnected ? "bg-emerald-500" : "bg-amber-400"
                }`}
              ></span>
              <span>{backendStatus?.firestoreConnected ? "Online" : "Local"}</span>
            </div>
          </div>

          {/* Desktop Cost-Saving & Cache Stats Pill */}
          <div className="hidden xl:flex items-center space-x-3 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-600 shadow-inner shrink-0">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-slate-700">Token Diet</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center space-x-1">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Cache: </span>
              <strong className="text-emerald-700 font-bold">{stats.cacheHits} Hits</strong>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center space-x-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus?.firestoreConnected ? "bg-emerald-500" : "bg-amber-400"
                }`}
              ></span>
              <span className="text-[11px] font-medium text-slate-500">
                {backendStatus?.firestoreConnected ? "Firestore Live" : "Memory Cache"}
              </span>
            </div>
          </div>

          {/* Action Buttons Toolbar (Smooth touch scroll on mobile) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar py-1 sm:py-0 w-full sm:w-auto shrink-0 touch-scroll">
            {/* + New Itinerary Dropdown Menu */}
            <div className="relative inline-block text-left shrink-0" ref={newMenuRef}>
              <button
                type="button"
                onClick={() => setShowNewMenu(!showNewMenu)}
                className="px-2.5 py-2 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center space-x-1 shrink-0 cursor-pointer active:scale-95 shadow-2xs"
                title="Create a new itinerary or load sample template"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>+ New</span>
                <ChevronDown className="w-3 h-3 text-blue-500 ml-0.5" />
              </button>

              {showNewMenu && (
                <div className="origin-top-left sm:origin-top-right absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-60 rounded-xl shadow-xl bg-white border border-slate-200 z-50 py-1.5 animate-scale-up">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewMenu(false);
                      onNewBlank();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <FilePlus className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">Blank Itinerary</div>
                      <div className="text-[10px] text-slate-400">Start from scratch with 1 clean day</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowNewMenu(false);
                      onReset();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center space-x-2.5 transition-colors border-t border-slate-100 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">Sample Himachal Tour</div>
                      <div className="text-[10px] text-slate-400">Pre-filled 4-day Manali template</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Cover Photo Button */}
            <button
              onClick={onOpenCoverModal}
              type="button"
              className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 bg-white rounded-lg border border-slate-200 transition-colors flex items-center space-x-1 shrink-0 cursor-pointer active:scale-95"
              title="Select Cover Photo for Itinerary"
            >
              <Image className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold">Cover</span>
            </button>

            {/* Open Saved Modal */}
            <button
              onClick={onOpenSavedModal}
              type="button"
              className="px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 bg-white rounded-lg border border-slate-200 transition-colors flex items-center space-x-1 shrink-0 cursor-pointer active:scale-95"
              title="View and load saved itineraries"
            >
              <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Saved</span>
            </button>

            {/* Save to Firestore */}
            <button
              onClick={onSave}
              disabled={isSaving}
              type="button"
              className="px-2.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 bg-emerald-50/80 rounded-lg border border-emerald-300 transition-colors flex items-center space-x-1 shrink-0 cursor-pointer disabled:opacity-50 active:scale-95"
              title="Save current itinerary to Firestore"
            >
              <CloudUpload className={`w-3.5 h-3.5 text-emerald-600 ${isSaving ? "animate-bounce" : ""}`} />
              <span>{isSaving ? "Saving…" : "Save"}</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              type="button"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 bg-white rounded-lg border border-slate-200 sm:border-transparent transition-colors shrink-0 cursor-pointer active:scale-95"
              title="Reset itinerary to default template"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Dedicated Generate Itinerary Button */}
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              type="button"
              id="generate-itinerary-btn"
              className="px-3 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xs transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50 active:scale-95"
              title="Resolve Wikipedia & photos with strict Token Diet"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-100 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Enriching…" : "Generate AI"}</span>
            </button>

            {/* Mark as Confirmed Button */}
            <button
              onClick={onMarkConfirmed}
              type="button"
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer active:scale-95 ${
                isConfirmed
                  ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
              }`}
              title="Confirm booking, record advance payment & generate travel voucher"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isConfirmed ? "Confirmed" : "Confirm"}</span>
            </button>

            {/* PDF Export Button (Itinerary) */}
            <button
              onClick={onExportPdf}
              disabled={isExporting}
              type="button"
              id="export-pdf-btn"
              className="px-3 py-2 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50 active:scale-95"
              title="Export client-side Itinerary PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-100" />
              <span>{isExporting ? "PDF…" : "PDF"}</span>
            </button>

            {/* Generate Travel Voucher Button */}
            <button
              onClick={onExportVoucher}
              disabled={!isConfirmed || isExportingVoucher}
              type="button"
              id="export-voucher-btn"
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 active:scale-95 ${
                isConfirmed
                  ? "bg-indigo-700 hover:bg-indigo-800 text-white shadow-xs cursor-pointer"
                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
              }`}
              title={
                isConfirmed
                  ? "Export official Travel Voucher PDF"
                  : "Click 'Confirm' first to unlock Travel Voucher generation"
              }
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{isExportingVoucher ? "Voucher…" : "Voucher"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
