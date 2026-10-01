import React, { useState } from "react";
import { Settings, Save, RotateCcw, CheckCircle, Image, Mail, Globe, MapPin, Phone, Hash } from "lucide-react";

export default function SettingsView({ settings, onSaveSettings, onResetDemoData }) {
  const [formData, setFormData] = useState(settings || {
    name: "Lobo Travels",
    tagline: "Travel packages, fleet operations, and all travel related solutions.",
    logoUrl: "https://github.com/VensonLobo/Logo-hoasting/blob/main/Untitled%20design%20(10).png?raw=true",
    email: "info@lobotravels.com",
    website: "lobotravels.com",
    address: "Shop No. 12, NDMC Market Near CNG Pump, Mandir Marg, New Delhi - 110001",
    phones: "9811240072, 9891240072, 9312640072",
    itineraryPrefix: "LT-",
    voucherPrefix: "LTV-",
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Lobo Travels Company Settings &amp; Configuration
            </h1>
            <p className="text-xs text-slate-500">
              Configure agency details, logo URL, reference number sequencing, and voucher statements.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={onResetDemoData}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition transform active:scale-95 flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-scale-up">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Company settings and branding saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Company Identity & Logo */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center space-x-2">
            <Image className="w-4 h-4 text-blue-600" />
            <span>Company Identity &amp; Logo</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Agency Logo Image URL (Used across UI, Itinerary PDF &amp; Voucher)
            </label>
            <input
              type="text"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full text-xs font-mono rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4 pt-2">
            <span className="text-xs font-semibold text-slate-500">Live Logo Preview:</span>
            <div className="h-12 w-auto bg-slate-50 border border-slate-200 p-1.5 rounded-xl flex items-center justify-center">
              <img
                src={formData.logoUrl || "/lobo-logo.jpg"}
                alt="Logo Preview"
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/lobo-logo.jpg";
                }}
              />
            </div>
          </div>
        </div>

        {/* 2. Contact Coordinates (Displayed in Footers) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center space-x-2">
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>Contact Coordinates (Displayed in Footers)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Helpline / Contact Phone Numbers (comma separated)
            </label>
            <input
              type="text"
              value={formData.phones}
              onChange={(e) => setFormData({ ...formData, phones: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 3. Numbering Sequence & Operational Defaults */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center space-x-2">
            <Hash className="w-4 h-4 text-purple-600" />
            <span>Document Numbering Sequences</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Itinerary Ref Prefix</label>
              <input
                type="text"
                value={formData.itineraryPrefix || "LT-"}
                onChange={(e) => setFormData({ ...formData, itineraryPrefix: e.target.value })}
                className="w-full text-xs font-mono font-bold rounded-lg border-slate-300 p-2.5 text-slate-800"
                placeholder="LT-"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Output: LT-2026-0001</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Travel Voucher Prefix</label>
              <input
                type="text"
                value={formData.voucherPrefix || "LTV-"}
                onChange={(e) => setFormData({ ...formData, voucherPrefix: e.target.value })}
                className="w-full text-xs font-mono font-bold rounded-lg border-slate-300 p-2.5 text-slate-800"
                placeholder="LTV-"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Output: LTV-2026-0001</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
