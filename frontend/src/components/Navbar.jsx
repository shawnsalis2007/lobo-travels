import React, { useState } from "react";
import {
  Compass,
  FileText,
  Building2,
  MapPin,
  Settings,
  CirclePlus,
  Search,
  Menu,
  X,
  CheckCircle,
  Database,
  ShieldCheck,
  Image,
  FileDown,
  FileCheck,
  CloudUpload,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function Navbar({
  currentTab,
  onSelectTab,
  onNewItinerary,
  searchQuery,
  onSearchChange,
  companySettings,
  itineraryData,
  onSave,
  onExportPdf,
  onExportVoucher,
  onGenerate,
  isSaving,
  isExporting,
  isExportingVoucher,
  isGenerating,
  backendStatus,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isConfirmed = itineraryData?.status === "Confirmed";

  const navItems = [
    { id: "dashboard", label: "Dashboard", Icon: Compass },
    { id: "itinerary", label: "Itineraries", Icon: FileText },
    { id: "hotels", label: "Hotels", Icon: Building2 },
    { id: "destinations", label: "Destinations", Icon: MapPin },
    { id: "settings", label: "Settings", Icon: Settings },
  ];

  return (
    <header className="no-print sticky top-0 z-40 bg-[#151521] text-white border-b border-[#26214F]/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Tagline */}
          <div
            onClick={() => onSelectTab("dashboard")}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-white/10 p-1 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
              <img
                src={companySettings?.logoUrl || "/lobo-logo.jpg"}
                alt="Lobo Travels"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/lobo-logo.jpg";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-amber-200 transition-colors">
                  {companySettings?.name || "LOBO TRAVELS"}
                </span>
                <span className="hidden md:inline-block text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-[#26214F] text-amber-300 border border-amber-400/20">
                  Tour Operations
                </span>
              </div>
              <p className="text-[11px] text-[#9899A1] hidden sm:block truncate max-w-[260px]">
                {companySettings?.tagline || "Travel packages, fleet operations, and all travel related solutions."}
              </p>
            </div>
          </div>

          {/* Universal Quick Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-[#9899A1] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Ref (e.g. LT-2026-0001), client..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#26214F]/60 text-white placeholder-[#9899A1] rounded-lg border border-[#26214F] focus:outline-hidden focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition"
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(({ id, label, Icon }) => {
              const isActive = currentTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#26214F] text-amber-300 shadow-xs border border-amber-400/20"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-300" : "text-[#9899A1]"}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Primary CTA / Actions */}
          <div className="flex items-center gap-2">
            {/* Create Itinerary Primary Button */}
            <button
              type="button"
              onClick={onNewItinerary}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <CirclePlus className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Create Itinerary</span>
              <span className="sm:hidden">New</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1a1927] border-b border-[#26214F] px-4 py-3 space-y-2 animate-scale-up">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-[#9899A1] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Ref, client, tour..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#26214F]/80 text-white placeholder-[#9899A1] rounded-lg border border-[#26214F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map(({ id, label, Icon }) => {
              const isActive = currentTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onSelectTab(id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold ${
                    isActive
                      ? "bg-[#26214F] text-amber-300 border border-amber-400/30"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
