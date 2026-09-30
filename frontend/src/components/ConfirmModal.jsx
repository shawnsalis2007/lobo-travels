import React, { useState } from "react";
import { X, CheckCircle, AlertCircle, CreditCard, IndianRupee } from "lucide-react";
import { formatIndianRupee } from "../utils/routeUtils";

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Card", "Cheque"];

export default function ConfirmModal({ itineraryData, onClose, onConfirm }) {
  const [form, setForm] = useState({
    totalCost: itineraryData.estimatedCost?.replace(/[^\d]/g, "") || "",
    advancePaid: "",
    advanceDate: "",
    paymentMode: "UPI",
    driverName: itineraryData.selectedVehicle?.driverName || "",
    driverPhone: itineraryData.selectedVehicle?.driverPhone || "",
    vehicleNo: itineraryData.selectedVehicle?.vehicleNo || "",
  });

  const [error, setError] = useState("");

  const totalNum = parseInt(form.totalCost, 10) || 0;
  const advanceNum = parseInt(form.advancePaid, 10) || 0;
  const pendingAmount = totalNum - advanceNum;

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    if (!form.totalCost) { setError("Total cost is required."); return; }
    if (pendingAmount < 0) { setError("Advance paid cannot exceed total cost."); return; }
    setError("");
    onConfirm({
      status: "Confirmed",
      confirmation: {
        totalCost: totalNum,
        advancePaid: advanceNum,
        pendingAmount,
        advanceDate: form.advanceDate,
        paymentMode: form.paymentMode,
        driverName: form.driverName,
        driverPhone: form.driverPhone,
        vehicleNo: form.vehicleNo,
        confirmedAt: new Date().toISOString(),
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-emerald-200" />
            <div>
              <h2 className="text-base font-bold text-white">Mark as Confirmed</h2>
              <p className="text-xs text-emerald-200">Ref: {itineraryData.refNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Payment Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payment Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Total Package Cost (₹)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    value={form.totalCost}
                    onChange={(e) => set("totalCost", e.target.value)}
                    className="w-full text-xs rounded-lg border-slate-300 p-2 pl-7 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500 font-semibold"
                    placeholder="e.g. 48500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Advance Paid (₹)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    value={form.advancePaid}
                    onChange={(e) => set("advancePaid", e.target.value)}
                    className="w-full text-xs rounded-lg border-slate-300 p-2 pl-7 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="e.g. 10000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Advance Date</label>
                <input
                  type="date"
                  value={form.advanceDate}
                  onChange={(e) => set("advanceDate", e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Payment Mode</label>
                <select
                  value={form.paymentMode}
                  onChange={(e) => set("paymentMode", e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 bg-slate-50/50 p-2.5 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Real-time Pending Amount */}
            <div className={`mt-3 rounded-xl p-3.5 flex items-center justify-between text-sm font-bold ${
              pendingAmount < 0
                ? "bg-rose-50 border border-rose-200 text-rose-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}>
              <span className="text-xs font-semibold uppercase tracking-wide">Pending Balance</span>
              <span className="text-lg">{formatIndianRupee(Math.max(0, pendingAmount))}</span>
            </div>
          </div>

          {/* Driver Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Driver & Vehicle Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Driver Name</label>
                <input type="text" value={form.driverName}
                  onChange={(e) => set("driverName", e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. Ramesh Kumar" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Driver Phone</label>
                <input type="text" value={form.driverPhone}
                  onChange={(e) => set("driverPhone", e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="+91 98XXXXXXXX" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle No.</label>
                <input type="text" value={form.vehicleNo}
                  onChange={(e) => set("vehicleNo", e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="DL 01 CA 1234" />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-2 text-rose-700 text-xs bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 px-6 py-4 flex justify-end space-x-3">
          <button onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={pendingAmount < 0}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Mark as Confirmed</span>
          </button>
        </div>
      </div>
    </div>
  );
}
