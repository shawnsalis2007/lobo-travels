import React from "react";
import {
  Sparkles,
  FileDown,
  ShieldCheck,
  Database,
  FolderOpen,
  CheckCircle,
  FileCheck,
  Image,
  Settings,
  FileText,
  MapPin,
  Building2,
  Compass,
} from "lucide-react";
import GlobalRefSearch from "./GlobalRefSearch";

export default function Header({
  itineraries = [],
  onLoadItinerary,
  onNewBlank,
  onGenerate,
  onExportPdf,
  onExportVoucher,
  onReset,
  onSave,
  onOpenSavedModal,
  onOpenSettingsModal,
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
  currentTab = "itinerary",
  onSelectTab,
}) {
  const isConfirmed = itineraryStatus === "Confirmed";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs w-full max-w-full">
      <div className="max-w-[1700px] w-full mx-auto px-2 sm:px-4 lg:px-6">
        {/* Main Row */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between min-h-[4.25rem] py-2 xl:py-0 gap-2.5">
          {/* Brand Logo & Title */}
          <div className="flex items-center justify-between xl:justify-start space-x-2.5 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="h-9 sm:h-10 w-auto flex items-center justify-center p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <img
                  src="/lobo-logo.jpg"
                  alt="Lobo Travels Logo"
                  className="h-7 sm:h-8 w-auto object-contain"
                />
              </div>
              <div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 bg-clip-text text-transparent whitespace-nowrap">
                    LOBO TRAVELS
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                    Operations TMS
                  </span>
                  {isConfirmed && (
                    <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Confirmed</span>
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium whitespace-nowrap">
                  Dynamic Itinerary Engine • Dispatch &amp; Operations
                </p>
              </div>
            </div>

            {/* Mobile Status Dot */}
            <div className="flex items-center space-x-1.5 xl:hidden bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-[10px] text-slate-600">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus?.firestoreConnected ? "bg-emerald-500" : "bg-amber-400"
                }`}
              ></span>
              <span>{backendStatus?.firestoreConnected ? "Online" : "Local"}</span>
            </div>
          </div>

          {/* ── Global Reference Number & Itinerary Search Bar ── */}
          <div className="flex-1 min-w-[180px] sm:min-w-[240px] max-w-sm lg:max-w-md mx-0 xl:mx-2 flex items-center justify-center">
            <GlobalRefSearch
              itineraries={itineraries}
              onSelectItinerary={onLoadItinerary}
              onExportPdf={onExportPdf}
              onExportVoucher={onExportVoucher}
            />
          </div>

          {/* Desktop Cost-Saving & Cache Stats Pill */}
          <div className="hidden 2xl:flex items-center space-x-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1 text-xs text-slate-600 shadow-inner shrink-0">
            <div className="flex items-center space-x-1">
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

          {/* Action Buttons Toolbar */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1 xl:py-0 w-full xl:w-auto shrink-0 touch-scroll">
            {/* Cover Photo Button */}
            <button
              onClick={onOpenCoverModal}
              type="button"
              className="px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 bg-white rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer active:scale-95 shadow-2xs min-h-[38px]"
              title="Select Cover Photo for Itinerary"
            >
              <Image className="w-4 h-4 text-blue-600" />
              <span>Cover</span>
            </button>

            {/* Open Saved Modal */}
            <button
              onClick={onOpenSavedModal}
              type="button"
              className="px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 bg-white rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer active:scale-95 shadow-2xs min-h-[38px]"
              title="View and load saved itineraries"
            >
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>Saved</span>
            </button>

            {/* Dedicated Generate Itinerary Button */}
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              type="button"
              id="generate-itinerary-btn"
              className="px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-2xs transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50 active:scale-95 min-h-[38px]"
              title="Resolve Wikipedia & photos with strict Token Diet"
            >
              <Sparkles className={`w-4 h-4 text-amber-100 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Enriching…" : "AI Generate"}</span>
            </button>

            {/* Mark as Confirmed Button */}
            <button
              onClick={onMarkConfirmed}
              type="button"
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer active:scale-95 shadow-2xs min-h-[38px] ${
                isConfirmed
                  ? "bg-emerald-700 text-white border-emerald-800"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
              }`}
              title="Confirm booking, record advance payment & generate travel voucher"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isConfirmed ? "Confirmed" : "Confirm"}</span>
            </button>

            {/* PDF Export Button (Itinerary) */}
            <button
              onClick={onExportPdf}
              disabled={isExporting}
              type="button"
              id="export-pdf-btn"
              className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-2xs transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50 active:scale-95 min-h-[38px]"
              title="Export client-side Itinerary PDF"
            >
              <FileDown className="w-4 h-4 text-blue-100" />
              <span>{isExporting ? "PDF…" : "PDF"}</span>
            </button>

            {/* Generate Travel Voucher Button */}
            <button
              onClick={onExportVoucher}
              disabled={!isConfirmed || isExportingVoucher}
              type="button"
              id="export-voucher-btn"
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 active:scale-95 shadow-2xs min-h-[38px] ${
                isConfirmed
                  ? "bg-indigo-700 hover:bg-indigo-800 text-white shadow-2xs cursor-pointer"
                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
              }`}
              title={
                isConfirmed
                  ? "Export official Travel Voucher PDF"
                  : "Click 'Confirm' first to unlock Travel Voucher generation"
              }
            >
              <FileCheck className="w-4 h-4" />
              <span>{isExportingVoucher ? "Voucher…" : "Voucher"}</span>
            </button>

            {/* Settings Button */}
            {onOpenSettingsModal && (
              <button
                onClick={onOpenSettingsModal}
                type="button"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 bg-white rounded-xl border border-slate-200 transition-colors flex items-center justify-center shrink-0 cursor-pointer active:scale-95 shadow-2xs min-h-[38px] min-w-[38px]"
                title="Agency Branding & Settings"
              >
                <Settings className="w-4 h-4 text-slate-600" />
              </button>
            )}
          </div>
        </div>

        {/* Primary View Navigation Tabs */}
        {onSelectTab && (
          <div className="flex items-center space-x-1 border-t border-slate-100 py-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => onSelectTab("itinerary")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                currentTab === "itinerary"
                  ? "bg-blue-700 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Itinerary Studio</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab("destinations")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                currentTab === "destinations"
                  ? "bg-purple-700 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Curated Destinations</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ml-1 ${
                currentTab === "destinations" ? "bg-purple-900 text-purple-200" : "bg-purple-100 text-purple-800"
              }`}>
                Updated
              </span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab("hotels")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                currentTab === "hotels"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hotels Directory</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab("dashboard")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                currentTab === "dashboard"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Operations Dashboard</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
