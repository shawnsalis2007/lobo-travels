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
    name: "Dalhousie",
    region: "Himachal Pradesh",
    city: "Dalhousie",
    wikiUrl: "https://en.wikipedia.org/wiki/Dalhousie,_Himachal_Pradesh",
    imageUrl: "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80",
    description: "Quaint colonial hill station perched on five hills, offering panoramic Dhauladhar views and pine-scented trails.",
    highlights: ["Khajjiar Mini Switzerland", "Dainkund Peak", "Panchpula", "Kalatop Wildlife Sanctuary"],
  },
  {
    name: "Mcleodganj",
    region: "Himachal Pradesh",
    city: "Dharamshala",
    wikiUrl: "https://en.wikipedia.org/wiki/McLeod_Ganj",
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    description: "Little Lhasa of India and residence of His Holiness the Dalai Lama, surrounded by majestic cedars and Tibetan monasteries.",
    highlights: ["Tsuglagkhang Dalai Lama Complex", "Bhagsunag Waterfall", "Namgyal Monastery", "Triund Trek"],
  },
  {
    name: "Varanasi",
    region: "Uttar Pradesh",
    city: "Varanasi",
    wikiUrl: "https://en.wikipedia.org/wiki/Varanasi",
    imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    description: "Spiritual capital of India on the sacred banks of Mother Ganga, revered for timeless ghat rituals and divine evening Maha Aartis.",
    highlights: [
      "Dashashwamedh Ghat",
      "Assi Ghat",
      "Shri Kashi Vishwanath Temple",
      "Sankat Mochan Hanuman Temple",
      "Kaal Bhairav Temple",
      "Manikarnika Ghat"
    ],
  },
  {
    name: "Ayodhya",
    region: "Uttar Pradesh",
    city: "Ayodhya",
    wikiUrl: "https://en.wikipedia.org/wiki/Ayodhya",
    imageUrl: "https://images.unsplash.com/photo-1706696950948-285f1c247348?auto=format&fit=crop&w=800&q=80",
    description: "Sacred birthplace of Lord Rama on the banks of holy Saryu River, celebrating centuries of heritage and devotion.",
    highlights: [
      "Shree Ram Janmabhumi Temple",
      "Hanuman Garhi",
      "Ram Ki Paidi - Saryu River / Saryu Aarti"
    ],
  },
  {
    name: "Prayagraj",
    region: "Uttar Pradesh",
    city: "Prayagraj",
    wikiUrl: "https://en.wikipedia.org/wiki/Prayagraj",
    imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    description: "Holy Sangam city where Ganga, Yamuna, and Saraswati unite, host to the iconic Kumbh Mela and sacred pilgrimage shrines.",
    highlights: [
      "Triveni Sangam",
      "Shri Bade Hanuman Ji Mandir"
    ],
  },
  {
    name: "Chitrakoot",
    region: "Uttar Pradesh",
    city: "Chitrakoot",
    wikiUrl: "https://en.wikipedia.org/wiki/Chitrakoot,_Madhya_Pradesh",
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    description: "Forest sanctuary of deep spiritual lore where Lord Rama spent eleven years of exile among peaceful hills and Mandakini ghats.",
    highlights: [
      "Ramghat",
      "Kamadgiri Temple"
    ],
  },
  {
    name: "Bodh Gaya",
    region: "Bihar",
    city: "Bodh Gaya",
    wikiUrl: "https://en.wikipedia.org/wiki/Bodh_Gaya",
    imageUrl: "https://images.unsplash.com/photo-1562979314-bee7453e938c?auto=format&fit=crop&w=800&q=80",
    description: "The supreme cradle of Buddhism where Gautama Buddha attained enlightenment beneath the sacred Bodhi Tree.",
    highlights: [
      "Mahabodhi Temple",
      "Bodhi Tree",
      "Great Buddha Statue"
    ],
  },
  {
    name: "Gaya",
    region: "Bihar",
    city: "Gaya",
    wikiUrl: "https://en.wikipedia.org/wiki/Gaya_(India)",
    imageUrl: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
    description: "Ancient holy city on the banks of Falgu River, renowned for shraddha Pind Daan rituals and historic Shakti Peethas.",
    highlights: [
      "Vishnupad Temple",
      "Mangla Gauri Temple"
    ],
  },
  {
    name: "Jaisalmer",
    region: "Rajasthan",
    city: "Jaisalmer",
    wikiUrl: "https://en.wikipedia.org/wiki/Jaisalmer",
    imageUrl: "https://images.unsplash.com/photo-1713349881676-594b95a5742b?w=600&auto=format&fit=crop&q=60",
    description: "The Golden City of Thar desert renowned for yellow sandstone architecture, living fortresses, and sweeping sand dunes.",
    highlights: [
      "Jaisalmer Fort (Sonar Qila / Golden Fort)",
      "Sam Sand Dunes Camel Safari & Desert Camp",
      "Patwon Ki Haveli"
    ],
  },
  {
    name: "Delhi Heritage",
    region: "Golden Triangle",
    city: "New Delhi",
    wikiUrl: "https://en.wikipedia.org/wiki/Delhi",
    imageUrl: "https://images.unsplash.com/photo-1697729438410-d53c666e3810?w=600&auto=format&fit=crop&q=60",
    description: "Historical capital showcasing centuries of monumental architecture from Sultanates to Mughals and Lutyens grandeur.",
    highlights: [
      "Qutub Minar",
      "Humayun's Tomb",
      "India Gate",
      "Red Fort"
    ],
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

  const regions = [
    "All",
    "Himachal Pradesh",
    "Uttar Pradesh",
    "Bihar",
    "Rajasthan",
    "Golden Triangle",
    "Ladakh & Kashmir",
  ];

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
