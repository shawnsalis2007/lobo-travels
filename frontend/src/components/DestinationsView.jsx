import React, { useState } from "react";
import { MapPin, Search, ExternalLink, Sparkles, Navigation } from "lucide-react";

const POPULAR_DESTINATIONS = [
  {
    name: "Solang Valley",
    region: "Himachal Pradesh",
    city: "Manali",
    wikiUrl: "https://en.wikipedia.org/wiki/Solang_Valley",
    imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
    description: "Renowned alpine side valley famous for snow sports, zorbing, paragliding, and cable car ropeway.",
    highlights: ["Paragliding", "Snow Point", "Anjani Mahadev", "Ropeway"],
  },
  {
    name: "Hadimba Temple",
    region: "Himachal Pradesh",
    city: "Manali",
    wikiUrl: "https://en.wikipedia.org/wiki/Hadimba_Temple",
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    description: "Ancient 1553 CE wooden pagoda temple surrounded by towering Himalayan cedar deodar forest.",
    highlights: ["Wooden Pagoda Architecture", "Dhungri Van Vihar", "Ghatotkach Shrine"],
  },
  {
    name: "Atal Tunnel & Sissu",
    region: "Himachal Pradesh",
    city: "Lahaul Valley",
    wikiUrl: "https://en.wikipedia.org/wiki/Atal_Tunnel",
    imageUrl: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
    description: "World's longest highway tunnel above 10,000 ft connecting Manali to the breathtaking Lahaul valley and Sissu waterfall.",
    highlights: ["Sissu Waterfall", "Pir Panjal Panorama", "Chandra River"],
  },
  {
    name: "Rohtang Pass",
    region: "Himachal Pradesh",
    city: "Manali",
    wikiUrl: "https://en.wikipedia.org/wiki/Rohtang_Pass",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    description: "High mountain pass at 13,058 ft offering 360-degree snow peaks, glaciers, and panoramic Himalayan vistas.",
    highlights: ["Glacial Snow", "High Altitude Vistas", "Beas Kund Trail"],
  },
  {
    name: "Mall Road & The Ridge",
    region: "Himachal Pradesh",
    city: "Shimla",
    wikiUrl: "https://en.wikipedia.org/wiki/The_Ridge,_Shimla",
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    description: "Colonial-era pedestrian esplanade lined with heritage Tudor architecture, Christ Church, and cafes.",
    highlights: ["Christ Church", "Gaiety Theatre", "Lakkar Bazaar", "Jakhoo Hill"],
  },
  {
    name: "Taj Mahal",
    region: "Golden Triangle",
    city: "Agra",
    wikiUrl: "https://en.wikipedia.org/wiki/Taj_Mahal",
    imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    description: "UNESCO World Heritage ivory-white marble mausoleum on the banks of Yamuna River.",
    highlights: ["Mughal Architecture", "Mehtab Bagh", "Agra Fort"],
  },
  {
    name: "Amber Fort & Palace",
    region: "Rajasthan",
    city: "Jaipur",
    wikiUrl: "https://en.wikipedia.org/wiki/Amer_Fort",
    imageUrl: "https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?auto=format&fit=crop&w=800&q=80",
    description: "Magnificent hilltop fortress overlooking Maota Lake, famous for Sheesh Mahal (Mirror Palace).",
    highlights: ["Sheesh Mahal", "Elephant Ride", "Light & Sound Show"],
  },
  {
    name: "Pangong Lake",
    region: "Ladakh & Kashmir",
    city: "Leh Ladakh",
    wikiUrl: "https://en.wikipedia.org/wiki/Pangong_Tso",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    description: "Endorheic Himalayan salt water lake at 14,270 ft known for shifting azure and turquoise colors.",
    highlights: ["Color-changing Lake", "Chang La Pass", "Himalayan Wildlife"],
  },
  {
    name: "Gulmarg Gondola & Meadow",
    region: "Ladakh & Kashmir",
    city: "Gulmarg",
    wikiUrl: "https://en.wikipedia.org/wiki/Gulmarg",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    description: "Asia's highest cable car project rising to Mount Apharwat (13,780 ft) amidst pristine snow meadows.",
    highlights: ["Phase 1 & 2 Gondola", "Ski Slopes", "Apharwat Peak"],
  },
];

export default function DestinationsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");

  const regions = ["All", "Himachal Pradesh", "Golden Triangle", "Rajasthan", "Ladakh & Kashmir"];

  const filtered = POPULAR_DESTINATIONS.filter((d) => {
    const regionMatch = selectedRegion === "All" || d.region === selectedRegion;
    const term = searchQuery.toLowerCase().trim();
    const textMatch =
      !term ||
      d.name.toLowerCase().includes(term) ||
      d.city.toLowerCase().includes(term) ||
      d.description.toLowerCase().includes(term);
    return regionMatch && textMatch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 shadow-md">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-400/30">
          <MapPin className="w-3.5 h-3.5" />
          <span>Curated Attractions &amp; Destinations Catalog</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Popular Tour Destinations</h1>
        <p className="text-purple-200 text-xs sm:text-sm mt-1">
          Explore tourist attractions with pre-verified Wikipedia guides, coordinates, and photo assets.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search destination, city, activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {regions.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedRegion === reg
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 hover:border-purple-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Destination Image */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-900/90 text-purple-200 px-2.5 py-1 rounded-md backdrop-blur-xs border border-purple-400/30">
                    {item.city} • {item.region}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base font-bold drop-shadow-xs">{item.name}</h3>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                {/* Highlight Pills */}
                {item.highlights && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.highlights.map((hl, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                      >
                        {hl}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[11px] font-medium text-slate-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Wikipedia Verified</span>
              </span>

              <a
                href={item.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1 hover:underline"
              >
                <span>Read Guide</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
