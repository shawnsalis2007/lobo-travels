import React from "react";
import { X, Image, Check, Sparkles } from "lucide-react";

export default function CoverPhotoModal({ isOpen, onClose, days, coverPhoto, onSelectCoverPhoto }) {
  if (!isOpen) return null;

  // Gather all unique attraction images across all days
  const availableImages = [];
  const seenUrls = new Set();

  (days || []).forEach((day) => {
    (day.attractionDetails || []).forEach((att) => {
      if (att.imageUrl && !seenUrls.has(att.imageUrl)) {
        seenUrls.add(att.imageUrl);
        availableImages.push({
          title: att.name,
          url: att.imageUrl,
          dayNumber: day.dayNumber,
        });
      }
    });
  });

  const handleSelect = (url) => {
    onSelectCoverPhoto({ mode: "manual", url });
    onClose();
  };

  const handleSetAuto = () => {
    onSelectCoverPhoto({ mode: "auto", url: null });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Image className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold">Select Itinerary Cover Photo</h2>
              <p className="text-xs text-blue-200">
                Current: {coverPhoto?.mode === "manual" ? "Custom Selected" : "Auto (Day 1 First Attraction)"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600 font-medium">
              Click any photo to set it as the hero cover on the itinerary:
            </p>
            <button
              type="button"
              onClick={handleSetAuto}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center space-x-1.5 ${
                coverPhoto?.mode === "auto"
                  ? "bg-amber-50 text-amber-900 border-amber-300 font-bold"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Reset to Auto-Pick</span>
            </button>
          </div>

          {availableImages.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Image className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No attraction photos fetched yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Click "Generate Itinerary" first to resolve destination photos from Pexels & Gemini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableImages.map((img, i) => {
                const isSelected = coverPhoto?.url === img.url;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelect(img.url)}
                    className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-400 shadow-md"
                        : "border-slate-200 hover:border-blue-400 hover:shadow-sm"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <span className="text-[9px] bg-blue-600/80 px-1.5 py-0.5 rounded font-bold uppercase">
                        Day {img.dayNumber}
                      </span>
                      <p className="text-xs font-semibold truncate mt-0.5 drop-shadow">{img.title}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg border border-slate-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
