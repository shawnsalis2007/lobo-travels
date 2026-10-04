import React, { useState } from "react";
import { ExternalLink, Sparkles, Database, MapPin } from "lucide-react";

export default function AttractionCard({ attraction, isPrintMode = false }) {
  if (!attraction) return null;

  const { name, wikiUrl, imageUrl, cached, photoSource, photographer } = attraction;
  const [imageError, setImageError] = useState(false);

  // If no photo or image failed to load or has legacy placeholder, don't show any fake image
  const hasValidImage = Boolean(
    imageUrl &&
    !imageError &&
    !imageUrl.includes("photo-1506744038136-46273834b3fb") &&
    !imageUrl.includes("photo-1488646953014-85cb44e25828")
  );

  const wikiHref =
    wikiUrl ||
    `https://en.wikipedia.org/wiki/${encodeURIComponent((name || "").replace(/\s+/g, "_"))}`;

  return (
    <div className="group bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-xs hover:shadow-md transition-all flex items-center space-x-3 avoid-break">
      {hasValidImage ? (
        /* Square Attraction Thumbnail (Cropped w-24 h-24) wrapped in Wikipedia Link */
        <a
          href={wikiHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-24 h-24 shrink-0 rounded-lg overflow-hidden relative block bg-slate-100 group-hover:opacity-90 transition-opacity"
          title={`Click to read about ${name} on Wikipedia`}
        >
          <img
            src={imageUrl}
            alt={name}
            className="w-24 h-24 object-cover rounded-lg overflow-hidden"
            loading="lazy"
            crossOrigin="anonymous"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
          <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white p-0.5 rounded text-[8px] flex items-center space-x-0.5">
            <ExternalLink className="w-2.5 h-2.5" />
          </div>
        </a>
      ) : (
        /* Clean sightseeing badge when no verified photo is available (No fake photos added) */
        <a
          href={wikiHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-24 h-24 shrink-0 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-1.5 text-center group-hover:bg-blue-50/60 group-hover:border-blue-300 transition-colors relative"
          title={`Click to read about ${name} on Wikipedia`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-200/80 group-hover:bg-blue-100 flex items-center justify-center mb-1 text-slate-500 group-hover:text-blue-600 transition-colors">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-semibold text-slate-500 group-hover:text-blue-600 leading-none">
            Sightseeing
          </span>
          <div className="absolute top-1 right-1 text-slate-400 group-hover:text-blue-500">
            <ExternalLink className="w-2.5 h-2.5" />
          </div>
        </a>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-24 py-0.5">
        <div>
          <div className="flex items-center space-x-1 mb-1">
            {!isPrintMode && cached && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Database className="w-2 h-2 mr-0.5" /> Cached
              </span>
            )}
            {!isPrintMode && !cached && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <Sparkles className="w-2 h-2 mr-0.5" /> Gemini
              </span>
            )}
            {photoSource === "pexels" && hasValidImage && (
              <span className="text-[8px] text-slate-400 font-medium">Pexels</span>
            )}
            {!hasValidImage && (
              <span className="text-[8px] text-slate-400 font-medium">No Photo</span>
            )}
          </div>

          <h5 className="text-xs font-bold text-slate-900 truncate leading-tight" title={name}>
            {name}
          </h5>
          {photographer && hasValidImage && (
            <p className="text-[9px] text-slate-400 truncate">Photo: {photographer}</p>
          )}
        </div>

        {/* Clickable Wikipedia Hyperlink */}
        <a
          href={wikiHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
        >
          <span>Wikipedia Article</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}
