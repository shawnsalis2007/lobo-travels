import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle,
  Image as ImageIcon,
  Mail,
  Globe,
  MapPin,
  Phone,
  Hash,
  X,
  Plus,
} from "lucide-react";

export const DEFAULT_AGENCY_SETTINGS = {
  name: "Lobo Travels",
  tagline: "Travel packages, fleet operations, and all travel related solutions.",
  logoUrl: "https://github.com/VensonLobo/Logo-hoasting/blob/main/Untitled%20design%20(10).png?raw=true",
  email: "info@lobotravels.com",
  website: "lobotravels.com",
  address: "Shop No. 12, NDMC Market Near CNG Pump, Mandir Marg, New Delhi - 110001",
  phones: ["9811240072", "9891240072", "9312640072"],
  refPrefix: "LT-2026-",
  voucherPrefix: "LTV-2026-",
  voucherTerms:
    "Please reconfirm all hotel, sightseeing and transfer arrangements before the start of the tour. Valid government-issued photo ID is mandatory at all hotel check-ins and monument entrances. Chauffeur duty hours: 08:00 AM to 08:00 PM for local transfers except early morning scheduled transfers.",
};

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetDemoData,
}) {
  const [formData, setFormData] = useState(DEFAULT_AGENCY_SETTINGS);
  const [newPhoneInput, setNewPhoneInput] = useState("");
  const [showAddPhone, setShowAddPhone] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        ...DEFAULT_AGENCY_SETTINGS,
        ...settings,
        phones: Array.isArray(settings.phones)
          ? settings.phones
          : typeof settings.phones === "string"
          ? settings.phones.split(",").map((p) => p.trim()).filter(Boolean)
          : DEFAULT_AGENCY_SETTINGS.phones,
      });
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleRemovePhone = (index) => {
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index),
    }));
  };

  const handleAddPhone = (e) => {
    e.preventDefault();
    if (!newPhoneInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      phones: [...prev.phones, newPhoneInput.trim()],
    }));
    setNewPhoneInput("");
    setShowAddPhone(false);
  };

  const handlePhoneInputChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.phones];
      updated[index] = value;
      return { ...prev, phones: updated };
    });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-up">
        {/* Top Header Card */}
        <div className="bg-white border-b border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span>Lobo Travels Company Settings &amp; Configuration</span>
              </h2>
              <p className="text-xs text-slate-500">
                Configure agency details, logo URL, reference number sequencing, and voucher statements.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            {onResetDemoData && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Reset demo data and load default itinerary list?")) {
                    onResetDemoData();
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo DB</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm transition transform active:scale-95 flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-6 py-2.5 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Company settings and branding saved successfully!</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Card 1: Company Identity & Logo */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Company Identity &amp; Logo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Lobo Travels"
                  className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Travel packages, fleet operations, and all travel related solutions."
                  className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Agency Logo Image URL (Used across UI, Itinerary PDF &amp; Voucher)
              </label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full text-xs font-mono rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <span className="text-xs font-semibold text-slate-500">Live Logo Preview:</span>
              <div className="h-12 w-auto bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl flex items-center justify-center">
                <img
                  src={formData.logoUrl || "/lobo-logo.jpg"}
                  alt="Logo Preview"
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/lobo-logo.jpg";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Contact Coordinates (Displayed in Footers) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Contact Coordinates (Displayed in Footers)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@lobotravels.com"
                  className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Website URL
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="lobotravels.com"
                  className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Shop No. 12, NDMC Market Near CNG Pump, Mandir Marg, New Delhi - 110001"
                className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Telephone / Operations Helplines with dynamic Tag Inputs */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Telephone / Operations Helplines
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddPhone(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Phone</span>
                </button>
              </div>

              {/* Phone Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {formData.phones.map((phone, idx) => (
                  <div key={idx} className="relative flex items-center">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => handlePhoneInputChange(idx, e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="w-full text-xs rounded-lg border-slate-300 p-2 pr-7 text-slate-800 font-medium focus:border-blue-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhone(idx)}
                      className="absolute right-2 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Remove phone number"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Phone Popover */}
              {showAddPhone && (
                <div className="mt-2 flex items-center space-x-2 bg-blue-50 p-2 rounded-lg border border-blue-200">
                  <input
                    type="text"
                    value={newPhoneInput}
                    onChange={(e) => setNewPhoneInput(e.target.value)}
                    placeholder="Enter phone number (e.g. 9811240072)"
                    className="text-xs p-1.5 rounded border-slate-300 bg-white flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddPhone(e);
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddPhone}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPhone(false)}
                    className="px-2 py-1.5 text-slate-500 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Reference Number Sequencing & Voucher Terms */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Reference Number Sequencing &amp; Voucher Terms
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Reference Number Prefix (e.g. LT-2026-)
              </label>
              <input
                type="text"
                value={formData.refPrefix}
                onChange={(e) => setFormData({ ...formData, refPrefix: e.target.value })}
                placeholder="LT-2026-"
                className="w-full max-w-sm text-xs font-mono font-bold rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Next generated record will appear as: {formData.refPrefix}000X
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Travel Voucher Terms &amp; Reconfirmation Statement
              </label>
              <textarea
                rows={3}
                value={formData.voucherTerms}
                onChange={(e) => setFormData({ ...formData, voucherTerms: e.target.value })}
                placeholder="Please reconfirm all hotel, sightseeing and transfer arrangements..."
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 text-slate-800 focus:border-blue-500 bg-white leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 p-4 px-6 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition transform active:scale-95 flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
