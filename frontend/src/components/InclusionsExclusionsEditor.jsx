import React, { useState } from "react";
import { CheckCircle2, XCircle, Plus, Trash2, RotateCcw } from "lucide-react";
import { DEFAULT_INCLUSIONS, DEFAULT_EXCLUSIONS } from "../data/defaultItinerary";

export default function InclusionsExclusionsEditor({
  inclusions,
  exclusions,
  onUpdateInclusions,
  onUpdateExclusions,
}) {
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");

  const handleAddInclusion = () => {
    if (!newInclusion.trim()) return;
    onUpdateInclusions([...inclusions, newInclusion.trim()]);
    setNewInclusion("");
  };

  const handleAddExclusion = () => {
    if (!newExclusion.trim()) return;
    onUpdateExclusions([...exclusions, newExclusion.trim()]);
    setNewExclusion("");
  };

  const handleRemoveInclusion = (index) => {
    onUpdateInclusions(inclusions.filter((_, i) => i !== index));
  };

  const handleRemoveExclusion = (index) => {
    onUpdateExclusions(exclusions.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Inclusions Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center space-x-2 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold">Package Inclusions</h3>
          </div>
          <button
            type="button"
            onClick={() => onUpdateInclusions([...DEFAULT_INCLUSIONS])}
            className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center space-x-1"
            title="Reset to default inclusions"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Inclusions List */}
        <div className="space-y-2 mb-3 max-h-60 overflow-y-auto pr-1">
          {inclusions.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between text-xs text-slate-700 bg-emerald-50/40 p-2 rounded-lg border border-emerald-100/60 group"
            >
              <span className="flex-1 pr-2 leading-relaxed">{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveInclusion(idx)}
                className="text-slate-400 hover:text-red-600 opacity-60 group-hover:opacity-100 p-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Inclusion */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newInclusion}
            onChange={(e) => setNewInclusion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddInclusion()}
            placeholder="Add new inclusion..."
            className="flex-1 text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleAddInclusion}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center space-x-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Exclusions Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center space-x-2 text-rose-800">
            <XCircle className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold">Package Exclusions</h3>
          </div>
          <button
            type="button"
            onClick={() => onUpdateExclusions([...DEFAULT_EXCLUSIONS])}
            className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center space-x-1"
            title="Reset to default exclusions"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Exclusions List */}
        <div className="space-y-2 mb-3 max-h-60 overflow-y-auto pr-1">
          {exclusions.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between text-xs text-slate-700 bg-rose-50/40 p-2 rounded-lg border border-rose-100/60 group"
            >
              <span className="flex-1 pr-2 leading-relaxed">{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveExclusion(idx)}
                className="text-slate-400 hover:text-red-600 opacity-60 group-hover:opacity-100 p-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Exclusion */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newExclusion}
            onChange={(e) => setNewExclusion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddExclusion()}
            placeholder="Add new exclusion..."
            className="flex-1 text-xs rounded-lg border-slate-300 p-2 text-slate-800 focus:border-rose-500 focus:ring-rose-500"
          />
          <button
            type="button"
            onClick={handleAddExclusion}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg flex items-center space-x-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
