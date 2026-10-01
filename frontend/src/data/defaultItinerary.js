export const COMPANY_DETAILS = {
  name: "Lobo Travels",
  tagline: "Your Trusted Gateway to Memorable Journeys",
  phones: ["9811240072", "9891240072", "9312640072"],
  email: "info@lobotravels.com",
  address: "Shop No. 12, NDMC Market Near CNG Pump, Mandir Marg, New Delhi - 110001",
  website: "lobotravels.com",
  websiteUrl: "https://lobotravels.com",
};

export const PRELOADED_HOTELS = [
  {
    id: "h1",
    name: "Snow Valley Resorts, Manali",
    city: "Manali",
    category: "4 Star Luxury",
    roomType: "Deluxe Valley View Room",
    mealPlan: "MAP (Breakfast & Dinner)",
    defaultNights: 3,
    rating: "4.5/5",
  },
  {
    id: "h2",
    name: "The Oberoi Cecil, Shimla",
    city: "Shimla",
    category: "5 Star Heritage",
    roomType: "Premier Heritage Room",
    mealPlan: "CP (Bed & Breakfast)",
    defaultNights: 2,
    rating: "4.9/5",
  },
  {
    id: "h3",
    name: "Radisson Blu Resort, Dharamshala",
    city: "Dharamshala",
    category: "5 Star Deluxe",
    roomType: "Superior Mountain Room",
    mealPlan: "MAP (Breakfast & Dinner)",
    defaultNights: 2,
    rating: "4.7/5",
  },
  {
    id: "h4",
    name: "Apple Country Resort, Manali",
    city: "Manali",
    category: "4 Star Boutique",
    roomType: "Honeymoon Suite / Executive",
    mealPlan: "AP (All Meals: B+L+D)",
    defaultNights: 3,
    rating: "4.4/5",
  },
  {
    id: "h5",
    name: "Hotel Combermere, The Mall Shimla",
    city: "Shimla",
    category: "3 Star Premium",
    roomType: "Luxury Valley Facing Room",
    mealPlan: "CP (Bed & Breakfast)",
    defaultNights: 2,
    rating: "4.3/5",
  },
  {
    id: "h6",
    name: "Umaid Bhawan Palace / Heritage Hotel, Jaipur",
    city: "Jaipur",
    category: "Heritage Grand",
    roomType: "Royal Palace Suite",
    mealPlan: "CP (Bed & Breakfast)",
    defaultNights: 2,
    rating: "4.8/5",
  },
  {
    id: "h7",
    name: "The Grand Dragon, Leh",
    city: "Leh",
    category: "4 Star Deluxe",
    roomType: "Superior Himalayan Room",
    mealPlan: "MAP (Breakfast & Dinner)",
    defaultNights: 3,
    rating: "4.6/5",
  },
  {
    id: "h8",
    name: "Custom Hotel (Editable)",
    city: "",
    category: "3-5 Star",
    roomType: "Standard Room",
    mealPlan: "EP (Room Only)",
    defaultNights: 1,
    rating: "4.0/5",
  }
];

export const MEAL_PLANS = [
  { code: "EP", label: "EP (Room Only - No Meals)" },
  { code: "CP", label: "CP (Continental Plan - Bed & Breakfast)" },
  { code: "MAP", label: "MAP (Modified American - Breakfast + Dinner)" },
  { code: "AP", label: "AP (American Plan - All Meals: Breakfast, Lunch, Dinner)" },
];

export const PRELOADED_VEHICLES = [
  {
    id: "v1",
    name: "Toyota Innova Crysta (AC)",
    category: "Premium MPV / SUV",
    capacity: "6 Passengers + 1 Chauffeur",
    luggage: "4 Large Bags",
    features: "Reclining Captain Seats, Dual AC, Highway Toll/Parking Included",
  },
  {
    id: "v2",
    name: "Maruti Suzuki Swift Dzire / Toyota Etios (AC)",
    category: "Sedan",
    capacity: "4 Passengers + 1 Chauffeur",
    luggage: "2-3 Medium Bags",
    features: "Comfortable, economical, AC, Dedicated Chauffeur",
  },
  {
    id: "v3",
    name: "Maruti Suzuki Ertiga (AC)",
    category: "Standard MUV",
    capacity: "5-6 Passengers + 1 Chauffeur",
    luggage: "3 Medium Bags",
    features: "Spacious family seating, fuel efficient, AC",
  },
  {
    id: "v4",
    name: "Force Tempo Traveller 12-Seater (AC)",
    category: "Mini Van / Group Vehicle",
    capacity: "12 Passengers + 1 Chauffeur",
    luggage: "Ample Overhead & Boot Space",
    features: "Push-back 1x1 Maharaja Seats, LED TV, Music System",
  },
  {
    id: "v5",
    name: "Force Urbania 15-Seater Luxury",
    category: "Executive Luxury Van",
    capacity: "15 Passengers + 1 Chauffeur",
    luggage: "Dedicated luggage bay",
    features: "Individual AC vents, panoramic windows, plush leatherette seats",
  },
  {
    id: "v6",
    name: "Luxury Coach 27-Seater",
    category: "Tour Coach",
    capacity: "27 Passengers + 2 Staff",
    luggage: "Under-floor luggage belly",
    features: "Air suspension, onboard PA mic, air-conditioned",
  }
];

export const DEFAULT_INCLUSIONS = [
  "Personalized greeting and assistance upon arrival at Airport / Railway Station.",
  "Private dedicated air-conditioned vehicle as per itinerary for all transfers & sightseeing.",
  "Accommodation on twin/triple sharing basis in selected premium hotels.",
  "Meal plan as specified (Daily Breakfast & Chef's Buffet Dinner as per hotel plan).",
  "All toll taxes, parking fees, interstate permits, fuel charges, and driver allowances.",
  "24x7 Lobo Travels dedicated travel concierge & emergency hotline support.",
  "Complimentary bottled water daily during sightseeing journeys.",
];

export const DEFAULT_EXCLUSIONS = [
  "Airfare or Train tickets unless specifically confirmed in booking voucher.",
  "Monument entry fees, camera charges, museum passes, and boating tickets.",
  "Adventure activities (paragliding, river rafting, zorbing, ropeway cable car).",
  "Personal expenses such as laundry, room service, telephone calls, and mini-bar.",
  "Early check-in or late check-out charges subject to hotel discretion.",
  "Mandatory Gala Dinner supplements during festive periods (Christmas / New Year).",
  "Government Goods & Services Tax (GST 5%) applicable on total package cost.",
];

export const INITIAL_ITINERARY_DATA = {
  refNumber: `LT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  voucherRef: "",
  generatedDate: new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }),
  status: "Draft", // Draft | Confirmed
  showCostOnItinerary: true,
  clientName: "Mr. Rajesh Sharma & Family",
  clientPhone: "+91 98112 40072",
  pax: "2 Adults + 1 Child",
  destinationTitle: "Scenic Himachal Mountain Escape (Manali & Solang Valley)",
  tripDuration: "4 Days / 3 Nights",
  travelDates: "15 Oct 2026 – 18 Oct 2026",
  arrivalInfo: "09:30 AM, Chandigarh / Bhuntar Airport",
  departureInfo: "06:00 PM, Chandigarh / Delhi Return Transfer",
  currency: "INR (₹)",
  estimatedCost: "₹ 48,500 / Total Package",
  notes: "Special Honeymoon / Family amenities arranged upon arrival. All mountain transfers executed by experienced hill drivers.",
  confirmation: null,
  coverPhoto: { mode: "auto", url: null },

  // Structured flight management
  managedFlightDetails: {
    isFlightBookedByLobo: true, // Toggle: "Flights Booked by Lobo Travels" vs "Self-Booked by Client"
    arrivalFlight: {
      airline: "IndiGo",
      flightNumber: "6E-204",
      pnr: "6E9XYZ",
      departureAirport: "Indira Gandhi Int'l Airport (DEL)",
      departureTime: "06:15 AM",
      arrivalAirport: "Kullu-Manali Airport (KUU)",
      arrivalTime: "07:35 AM",
      terminal: "T3",
      baggageAllowance: "15kg Check-in + 7kg Cabin",
    },
    departureFlight: {
      airline: "IndiGo",
      flightNumber: "6E-205",
      pnr: "6E9XYZ",
      departureAirport: "Kullu-Manali Airport (KUU)",
      departureTime: "02:40 PM",
      arrivalAirport: "Indira Gandhi Int'l Airport (DEL)",
      arrivalTime: "04:00 PM",
      terminal: "T1",
      baggageAllowance: "15kg Check-in + 7kg Cabin",
    },
  },

  selectedHotel: {
    name: "Snow Valley Resorts, Manali",
    city: "Manali",
    category: "4 Star Luxury",
    roomType: "Deluxe Mountain View Room",
    mealPlan: "MAP (Breakfast & Dinner Included)",
    nights: 3,
    checkIn: "15 Oct 2026",
    checkOut: "18 Oct 2026",
    confirmationNo: "SVR-88492",
    address: "Log Huts Area, Manali, Himachal Pradesh 175131",
    mapsUrl: "https://maps.google.com/?q=Snow+Valley+Resorts+Manali",
  },

  selectedVehicle: {
    name: "Toyota Innova Crysta (AC)",
    category: "Premium MPV",
    capacity: "6 Passengers + 1 Chauffeur",
    features: "Dual AC, Reclining seats, All toll & parking covered",
    driverName: "Ramesh Kumar",
    driverPhone: "+91 98112 33445",
    vehicleNo: "HP 01 CA 5566",
  },

  days: [
    {
      id: "day-1",
      dayNumber: 1,
      date: "15 Oct 2026",
      dayOfWeek: "Thursday",
      title: "Arrival at Bhuntar & Scenic Drive to Manali",
      description: "Warm welcome by Lobo Travels chauffeur upon arrival at Bhuntar Airport. Enjoy a picturesque mountain drive along the Beas River to Manali. Check into your resort, freshen up, and spend your relaxing evening visiting Hadimba Temple and shopping at the vibrant Mall Road.",
      stops: [
        {
          id: "stop-day1-a",
          locationName: "Manali",
          isOvernight: true,
          isCheckIn: true,
          isCheckOut: false,
          noSightseeing: false,
          attractionInput: "",
          attractions: ["Hadimba Temple", "Mall Road Manali"],
          intercityTransit: {
            type: "flight",
            carrierName: "IndiGo",
            transitNumber: "6E-204",
            departureLocation: "Delhi (DEL)",
            arrivalLocation: "Bhuntar Airport (KUU)",
            departureTime: "06:15 AM",
            arrivalTime: "07:35 AM",
          },
        }
      ],
      attractions: ["Hadimba Temple", "Mall Road Manali"],
      meals: { breakfast: false, lunch: false, dinner: true },
      attractionDetails: [
        {
          name: "Hadimba Temple",
          wikiUrl: "https://en.wikipedia.org/wiki/Hadimba_Temple",
          imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80",
          cached: true
        },
        {
          name: "Mall Road Manali",
          wikiUrl: "https://en.wikipedia.org/wiki/Manali,_Himachal_Pradesh",
          imageUrl: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=600&q=80",
          cached: true
        }
      ]
    },
    {
      id: "day-2",
      dayNumber: 2,
      date: "16 Oct 2026",
      dayOfWeek: "Friday",
      title: "Alpine Thrills at Solang Valley & Atal Tunnel",
      description: "Begin with a lavish buffet breakfast. Head towards Solang Valley, renowned for snow sports, paragliding, and cable car rides. Experience the marvel of modern engineering at the Atal Tunnel with panoramic snow-capped Himalayan peaks.",
      stops: [
        {
          id: "stop-day2-a",
          locationName: "Solang Valley",
          isOvernight: false,
          isCheckIn: false,
          isCheckOut: false,
          noSightseeing: false,
          attractionInput: "",
          attractions: ["Solang Valley", "Atal Tunnel"],
          intercityTransit: { type: "car" },
        },
        {
          id: "stop-day2-b",
          locationName: "Manali",
          isOvernight: true,
          isCheckIn: false,
          isCheckOut: false,
          noSightseeing: false,
          attractionInput: "",
          attractions: [],
          intercityTransit: { type: "car" },
        }
      ],
      attractions: ["Solang Valley", "Atal Tunnel"],
      meals: { breakfast: true, lunch: false, dinner: true },
      attractionDetails: [
        {
          name: "Solang Valley",
          wikiUrl: "https://en.wikipedia.org/wiki/Solang_Valley",
          imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80",
          cached: true
        },
        {
          name: "Atal Tunnel",
          wikiUrl: "https://en.wikipedia.org/wiki/Atal_Tunnel",
          imageUrl: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80",
          cached: true
        }
      ]
    },
    {
      id: "day-3",
      dayNumber: 3,
      date: "17 Oct 2026",
      dayOfWeek: "Saturday",
      title: "Heritage Exploration: Naggar Castle & Art Gallery",
      description: "Explore the historic timber-and-stone Naggar Castle overlooking the Kullu valley. Visit the Nicholas Roerich Art Gallery and stop by local shawls weaving centers. Return for a cozy candlelight dinner at your hotel.",
      stops: [
        {
          id: "stop-day3-a",
          locationName: "Naggar",
          isOvernight: false,
          isCheckIn: false,
          isCheckOut: false,
          noSightseeing: false,
          attractionInput: "",
          attractions: ["Naggar Castle", "Beas River"],
          intercityTransit: { type: "car" },
        },
        {
          id: "stop-day3-b",
          locationName: "Manali",
          isOvernight: true,
          isCheckIn: false,
          isCheckOut: false,
          noSightseeing: false,
          attractionInput: "",
          attractions: [],
          intercityTransit: { type: "car" },
        }
      ],
      attractions: ["Naggar Castle", "Beas River"],
      meals: { breakfast: true, lunch: false, dinner: true },
      attractionDetails: [
        {
          name: "Naggar Castle",
          wikiUrl: "https://en.wikipedia.org/wiki/Naggar_Castle",
          imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
          cached: true
        },
        {
          name: "Beas River",
          wikiUrl: "https://en.wikipedia.org/wiki/Beas_River",
          imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
          cached: true
        }
      ]
    },
    {
      id: "day-4",
      dayNumber: 4,
      date: "18 Oct 2026",
      dayOfWeek: "Sunday",
      title: "Souvenirs & Departure Flight Return Transfer",
      description: "Relish your final mountain breakfast. Pack your bags with souvenirs and handwoven shawls. Your private chauffeur transfers you to Bhuntar Airport for your onward flight with fond memories of Lobo Travels.",
      stops: [
        {
          id: "stop-day4-a",
          locationName: "Bhuntar Airport",
          isOvernight: false,
          isCheckIn: false,
          isCheckOut: true,
          noSightseeing: true,
          attractionInput: "",
          attractions: [],
          intercityTransit: {
            type: "flight",
            carrierName: "IndiGo",
            transitNumber: "6E-205",
            departureLocation: "Kullu-Manali (KUU)",
            arrivalLocation: "Delhi (DEL)",
            departureTime: "02:40 PM",
            arrivalTime: "04:00 PM",
          },
        }
      ],
      attractions: ["Vashisht Hot Water Springs"],
      meals: { breakfast: true, lunch: false, dinner: false },
      attractionDetails: [
        {
          name: "Vashisht Hot Water Springs",
          wikiUrl: "https://en.wikipedia.org/wiki/Vashisht,_Himachal_Pradesh",
          imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
          cached: true
        }
      ]
    }
  ],

  inclusions: [...DEFAULT_INCLUSIONS],
  exclusions: [...DEFAULT_EXCLUSIONS],
};

/**
 * Creates a clean, empty blank itinerary template.
 */
export function createBlankItinerary(seq = {}) {
  const currentYear = new Date().getFullYear();
  const refNumber =
    seq.itineraryRef || `LT-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;
  const voucherRef = seq.voucherRef || refNumber.replace("LT-", "LTV-");
  const todayStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return {
    refNumber,
    voucherRef,
    generatedDate: todayStr,
    status: "Draft",
    showCostOnItinerary: true,
    clientName: "",
    clientPhone: "",
    pax: "",
    destinationTitle: "",
    tripDuration: "",
    travelDates: "",
    startDate: "",
    endDate: "",
    arrivalInfo: "",
    departureInfo: "",
    currency: "INR (₹)",
    estimatedCost: "",
    notes: "",
    confirmation: null,
    coverPhoto: { mode: "auto", url: null },
    managedFlightDetails: {
      isFlightBookedByLobo: false,
      arrivalFlight: {
        airline: "",
        flightNumber: "",
        pnr: "",
        departureAirport: "",
        departureTime: "",
        arrivalAirport: "",
        arrivalTime: "",
        terminal: "",
        baggageAllowance: "",
      },
      departureFlight: {
        airline: "",
        flightNumber: "",
        pnr: "",
        departureAirport: "",
        departureTime: "",
        arrivalAirport: "",
        arrivalTime: "",
        terminal: "",
        baggageAllowance: "",
      },
    },
    selectedHotel: {
      name: "",
      city: "",
      category: "3-4 Star",
      roomType: "Standard / Deluxe Room",
      mealPlan: "CP (Bed & Breakfast)",
      nights: 1,
      checkIn: "",
      checkOut: "",
      confirmationNo: "",
      address: "",
      mapsUrl: "",
    },
    selectedVehicle: {
      name: "AC Private Vehicle",
      category: "Sedan / SUV",
      capacity: "4-6 Passengers",
      features: "AC, Dedicated Chauffeur",
      driverName: "",
      driverPhone: "",
      vehicleNo: "",
    },
    days: [
      {
        id: `day-${Date.now()}-1`,
        dayNumber: 1,
        title: "Day 1 - Arrival & Sightseeing",
        description: "",
        stops: [
          {
            id: `stop-${Date.now()}-1`,
            locationName: "",
            isOvernight: true,
            isCheckIn: true,
            isCheckOut: false,
            noSightseeing: false,
            attractionInput: "",
            attractions: [],
            intercityTransit: {
              type: "car",
              carrierName: "",
              transitNumber: "",
              departureLocation: "",
              arrivalLocation: "",
              departureTime: "",
              arrivalTime: "",
            },
          },
        ],
        attractions: [],
        attractionDetails: [],
        meals: { breakfast: false, lunch: false, dinner: false },
      },
    ],
    inclusions: [...DEFAULT_INCLUSIONS],
    exclusions: [...DEFAULT_EXCLUSIONS],
  };
}

