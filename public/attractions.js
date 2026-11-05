/* =========================================================
   TOURENT — GOA ATTRACTIONS GUIDE (PURE INFORMATION FEATURE)
   Workflow: Attractions -> Select Taluka -> Places List -> Place Details
   Strictly for tourist reference and discovery across Goa.
   Zero connection to vehicle booking / checkout.
   ========================================================= */

/* ============ 12 TALUKAS DATA ============ */
const TALUKAS_DATA = [
  // North Goa (6 Talukas)
  {
    id: "bardez",
    name: "Bardez",
    region: "North Goa",
    icon: "🏖️",
    highlight: "Baga, Calangute, Anjuna & Fort Aguada",
    desc: "Famous coastal hub celebrated for iconic golden beaches, Portuguese fortresses, bohemian flea markets, and vibrant seaside dining.",
    center: [15.56, 73.77],
    zoom: 12
  },
  {
    id: "pernem",
    name: "Pernem",
    region: "North Goa",
    icon: "🌴",
    highlight: "Arambol, Morjim & Fort Tiracol",
    desc: "Goa's northernmost coastal paradise, renowned for Sweet Water Lake, Olive Ridley turtle nesting sands, and cliffside Fort Tiracol.",
    center: [15.68, 73.72],
    zoom: 12
  },
  {
    id: "bicholim",
    name: "Bicholim",
    region: "North Goa",
    icon: "🏞️",
    highlight: "Mayem Lake, Arvalem Waterfalls & Caves",
    desc: "Scenic hinterland district featuring tranquil freshwater lakes, ancient 6th-century rock-cut caves, and cascading monsoon waterfalls.",
    center: [15.58, 73.98],
    zoom: 12
  },
  {
    id: "sattari",
    name: "Sattari",
    region: "North Goa",
    icon: "🌿",
    highlight: "Chorla Ghats, Hivre Falls & Mhadei Forest",
    desc: "Untamed Western Ghats wilderness with misty mountain ghats, tiger sanctuary corridors, and hidden rainforest trekking trails.",
    center: [15.55, 74.15],
    zoom: 12
  },
  {
    id: "tiswadi",
    name: "Tiswadi",
    region: "North Goa",
    icon: "⛪",
    highlight: "Old Goa Heritage, Panaji & Fontainhas",
    desc: "The cultural heart of Goa, home to UNESCO World Heritage basilicas, the colorful Latin Quarter of Fontainhas, and Mandovi riverfront.",
    center: [15.49, 73.86],
    zoom: 12
  },
  {
    id: "ponda",
    name: "Ponda",
    region: "North Goa",
    icon: "🛕",
    highlight: "Shri Mangueshi, Shanta Durga & Bondla Wildlife",
    desc: "Goa's temple and cultural capital, celebrated for historic 16th-century Hindu shrines, ancient mosques, and family wildlife parks.",
    center: [15.42, 74.01],
    zoom: 12
  },

  // South Goa (6 Talukas)
  {
    id: "mormugao",
    name: "Mormugao",
    region: "South Goa",
    icon: "⚓",
    highlight: "Bogmalo Beach, Mormugao Fort & Naval Museum",
    desc: "Coastal peninsula featuring historic naval aviation exhibits, secluded scuba diving bays, cliffside gardens, and deep natural harbor views.",
    center: [15.38, 73.83],
    zoom: 12
  },
  {
    id: "salcete",
    name: "Salcete",
    region: "South Goa",
    icon: "🌊",
    highlight: "Colva, Benaulim, Majorda & Holy Spirit Church",
    desc: "Endless stretches of silky white sand, dolphin watching boat trips, historic Baroque squares, and authentic Goan bakery culture.",
    center: [15.27, 73.94],
    zoom: 12
  },
  {
    id: "quepem",
    name: "Quepem",
    region: "South Goa",
    icon: "🏛️",
    highlight: "Palacio do Deao, Chandreshwar & Rivona Caves",
    desc: "Heritage and spiritual enclave boasting 230-year-old Portuguese estates, ancient hilltop temples with 360° views, and Buddhist caves.",
    center: [15.20, 74.08],
    zoom: 12
  },
  {
    id: "canacona",
    name: "Canacona",
    region: "South Goa",
    icon: "🌅",
    highlight: "Palolem, Agonda, Butterfly Beach & Cabo de Rama",
    desc: "Goa's southernmost coastal crown, famed for world-class crescent bays, cliffside fortress panoramas, turtle sanctuaries, and lagoons.",
    center: [15.02, 74.02],
    zoom: 12
  },
  {
    id: "sanguem",
    name: "Sanguem",
    region: "South Goa",
    icon: "🌲",
    highlight: "Salaulim Dam, Tambdi Surla & Netravali Sanctuary",
    desc: "Pristine nature reserve with mysterious bubbling lakes, ancient 12th-century basalt temples, botanical gardens, and twin forest falls.",
    center: [15.20, 74.20],
    zoom: 12
  },
  {
    id: "dharbandora",
    name: "Dharbandora",
    region: "South Goa",
    icon: "💦",
    highlight: "Dudhsagar Falls & Mollem National Park",
    desc: "Home to India's majestic 310m Dudhsagar Waterfall, 4x4 jungle river safaris, prehistoric rock art, and core national park wildlife.",
    center: [15.33, 74.28],
    zoom: 12
  }
];

/* ============ CATEGORIES DATA ============ */
const CATEGORIES_DATA = [
  { id: "all", name: "All Categories", icon: "✨" },
  { id: "Beaches", name: "Beaches", icon: "🏖️" },
  { id: "Forts", name: "Forts", icon: "🏰" },
  { id: "Churches", name: "Churches", icon: "⛪" },
  { id: "Temples", name: "Temples", icon: "🛕" },
  { id: "Waterfalls", name: "Waterfalls", icon: "🌊" },
  { id: "Nature & Wildlife", name: "Nature & Wildlife", icon: "🌿" },
  { id: "Heritage", name: "Heritage", icon: "🏛️" },
  { id: "Culture", name: "Culture", icon: "🎭" },
  { id: "Adventure", name: "Adventure", icon: "🏄" },
  { id: "Markets", name: "Markets", icon: "🛍️" },
  { id: "Sunset Spots", name: "Sunset Spots", icon: "🌅" },
  { id: "Family Places", name: "Family Places", icon: "👨‍👩‍👧" }
];

/* ============ TOP FEATURED ATTRACTIONS ============ */
const FEATURED_ATTRACTIONS_IDS = [
  "dudhsagar-falls",
  "palolem-beach",
  "fort-aguada",
  "baga-beach",
  "calangute-beach",
  "chapora-fort",
  "basilica-bom-jesus",
  "agonda-beach",
  "colva-beach",
  "fontainhas",
  "cabo-de-rama-fort",
  "arambol-beach"
];

/* ============ COMPREHENSIVE ATTRACTIONS DATABASE (ALL 12 TALUKAS) ============ */
const ATTRACTIONS_DATA = [
  // -----------------------------------------------------------
  // 1. BARDEZ (NORTH GOA)
  // -----------------------------------------------------------
  {
    id: "baga-beach",
    name: "Baga Beach",
    taluka: "Bardez",
    region: "North Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Adventure", "Family Places"],
    image: "iconic/baga.png",
    shortDesc: "Goa's famous lively beach, celebrated for thrilling water sports, beachside shacks, evening entertainment and golden sunsets.",
    detailedDesc: "Baga Beach is one of the most vibrant coastal destinations in North Goa. Nestled between Calangute Beach and the scenic Baga Creek, it offers golden sands, parasailing, jet skiing, speed boats, and bustling beach shacks serving fresh Goan fish curry, calamari, and chilled beverages right by the waves.",
    location: "Baga, Bardez, North Goa",
    coordinates: [15.5553, 73.7517],
    bestTime: "October to March (4:00 PM – 10:00 PM for water sports & sunset dinners)",
    duration: "3–4 hours",
    thingsToDo: [
      "Parasailing, jet skiing, bumper rides & banana boat tours",
      "Fresh seafood dining at beachside shacks with candlelit tables",
      "Evening walks along the lively shoreline and Tito's Lane",
      "Shopping for beachwear, handicrafts and souvenirs"
    ],
    visitorInfo: {
      timings: "Open 24 hours (Water sports operate 9:00 AM – 6:00 PM)",
      entryFee: "Free entry",
      parking: "Paid public parking lots available near Baga Creek",
      tips: "Arrive around 4:00 PM to beat the midday sun and enjoy sunset shacks."
    },
    nearby: ["Calangute Beach", "Anjuna Beach", "Chapora Fort"]
  },
  {
    id: "calangute-beach",
    name: "Calangute Beach",
    taluka: "Bardez",
    region: "North Goa",
    category: "Beaches",
    categories: ["Beaches", "Family Places", "Adventure", "Markets"],
    image: "iconic/calangute.png",
    shortDesc: "Known as the 'Queen of Beaches', offering an expansive shoreline, safe swimming areas, handicraft shops and vibrant shacks.",
    detailedDesc: "Calangute Beach is the largest and most popular beach in North Goa, drawing visitors worldwide with its wide golden sand crescent. The beach is lined with eateries, clothing boutiques, Tibetan artisan stalls, and professional operators for parasailing and banana boat rides.",
    location: "Calangute, Bardez, North Goa",
    coordinates: [15.5439, 73.7553],
    bestTime: "November to March (Early morning or late afternoon)",
    duration: "2–4 hours",
    thingsToDo: [
      "Sunbathing and swimming in designated lifeguard-patrolled zones",
      "Browsing Tibetan handicraft and clothing markets along the promenade",
      "Exciting water sports including parasailing and jet-skis",
      "Beachfront dining with authentic Goan and continental menus"
    ],
    visitorInfo: {
      timings: "Open 24 hours (Lifeguards on duty 7:30 AM – 6:30 PM)",
      entryFee: "Free entry",
      parking: "Large pay-and-park lot near Calangute tourist residency",
      tips: "Always swim between the red-and-yellow flags indicated by lifeguards."
    },
    nearby: ["Baga Beach", "Candolim Beach", "Fort Aguada"]
  },
  {
    id: "anjuna-beach",
    name: "Anjuna Beach",
    taluka: "Bardez",
    region: "North Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Culture", "Markets"],
    image: "iconic/anjuna.png",
    shortDesc: "Historic bohemian haven flanked by laterite red rocks, coconut groves, scenic cafes and the legendary Wednesday flea market.",
    detailedDesc: "Anjuna Beach became famous during the 1960s hippie era and remains one of Goa's most atmospheric coastlines. Characterized by striking black-red volcanic rock outcrops, dramatic Arabian Sea surf, and sunset cafes perched on rocky ledges, it is a favorite for relaxed vibes and coastal photography.",
    location: "Anjuna, Bardez, North Goa",
    coordinates: [15.5733, 73.741],
    bestTime: "October to April (Sunset hours 4:30 PM – 7:30 PM)",
    duration: "2–3 hours",
    thingsToDo: [
      "Explore the famous Wednesday Anjuna Flea Market for eclectic finds",
      "Savor wood-fired pizzas and fresh juices at cliffside cafes",
      "Photography among the iconic red volcanic rock formations",
      "Experience serene sunset drum circles and acoustic evenings"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Street and designated open ground parking available",
      tips: "Wear sturdy footwear if exploring the rocky northern end of the beach."
    },
    nearby: ["Vagator Beach", "Chapora Fort", "Baga Beach"]
  },
  {
    id: "vagator-beach",
    name: "Vagator Beach",
    taluka: "Bardez",
    region: "North Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Nature & Wildlife"],
    image: "iconic/vagator.png",
    shortDesc: "A dramatic cliff-framed beach split into Big Vagator and Little Vagator (Ozran), celebrated for panoramic sunsets and iconic rock carvings.",
    detailedDesc: "Overlooked by the majestic ramparts of Chapora Fort, Vagator Beach boasts towering red laterite cliffs, swaying palm canopies, and soft golden sand. Little Vagator is also famous for the cliffside Shiva rock sculpture carved into the stone.",
    location: "Vagator, Bardez, North Goa",
    coordinates: [15.6028, 73.7336],
    bestTime: "October to May (Sunset 4:30 PM – 7:00 PM)",
    duration: "2–3 hours",
    thingsToDo: [
      "View the famous Shiva rock sculpture at Little Vagator",
      "Watch the sun dip behind the ocean from the cliffside viewpoints",
      "Hike up to Chapora Fort for a 360-degree panorama of the coastline",
      "Relax at bohemian cafes overlooking the bay"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Dedicated parking ground near Hilltop and Big Vagator entrance",
      tips: "The stone steps to Little Vagator can be steep; comfortable footwear is helpful."
    },
    nearby: ["Chapora Fort", "Anjuna Beach", "Morjim Beach"]
  },
  {
    id: "chapora-fort",
    name: "Chapora Fort",
    taluka: "Bardez",
    region: "North Goa",
    category: "Forts",
    categories: ["Forts", "Heritage", "Sunset Spots", "Culture"],
    image: "iconic/chapora.png",
    shortDesc: "Historic 17th-century bastion offering breathtaking panoramic vistas of the Chapora River estuary, Vagator and Morjim beaches.",
    detailedDesc: "Perched dramatically on a headland high above the Chapora River, this historic fort was constructed by the Portuguese in 1717 over an earlier Adil Shahi fortification. Its sweeping ramparts gained legendary pop-culture status from Bollywood's 'Dil Chahta Hai' and offer some of Goa's finest sunset views.",
    location: "Chapora, Bardez, North Goa",
    coordinates: [15.606, 73.7364],
    bestTime: "5:00 PM – 6:45 PM for magical golden-hour photography",
    duration: "1.5–2 hours",
    thingsToDo: [
      "Walk the perimeter ramparts and take iconic cliffside photos",
      "Look down across the Chapora River estuary meeting the ocean",
      "Gaze out across the broad sands of Morjim and Ozran",
      "Enjoy fresh coconut water and local snacks at the base"
    ],
    visitorInfo: {
      timings: "Open daily 6:00 AM – 6:30 PM",
      entryFee: "Free entry",
      parking: "Parking available at the base hill path",
      tips: "Requires a 10-minute walk on a paved uphill path. Carry water and wear sneakers."
    },
    nearby: ["Vagator Beach", "Anjuna Beach", "Morjim Beach"]
  },
  {
    id: "fort-aguada",
    name: "Fort Aguada & Lighthouse",
    taluka: "Bardez",
    region: "North Goa",
    category: "Forts",
    categories: ["Forts", "Heritage", "Sunset Spots", "Family Places"],
    image: "iconic/aguada.png",
    shortDesc: "Magnificent 17th-century Portuguese coastal fortress featuring a historic 4-tier freshwater reservoir and vintage lighthouse.",
    detailedDesc: "Erected in 1612 to defend against Dutch forces and Marathas, Fort Aguada ('Aguada' meaning watering place) was once the most prized Portuguese stronghold. It held a capacity of 2,376,000 gallons of freshwater used to replenish merchant ships, alongside a vintage four-tiered lighthouse overlooking the Arabian Sea and Mandovi estuary.",
    location: "Sinquerim, Bardez, North Goa",
    coordinates: [15.4925, 73.7736],
    bestTime: "9:00 AM – 11:00 AM or 4:00 PM – 6:00 PM",
    duration: "2 hours",
    thingsToDo: [
      "Explore the massive freshwater cistern and vaulted stone corridors",
      "Photograph the 19th-century vintage lighthouse tower",
      "Take in panoramic views of Sinquerim bay, Candolim and Panaji coast",
      "Visit the newly restored Aguada Jail Museum interactive galleries"
    ],
    visitorInfo: {
      timings: "9:30 AM – 6:00 PM daily",
      entryFee: "₹50 for Indian nationals, ₹300 for foreigners",
      parking: "Spacious parking lot near the upper fort entrance",
      tips: "Carry a hat and sunblock as the fort top is open and sunny."
    },
    nearby: ["Sinquerim Beach", "Candolim Beach", "Reis Magos Fort"]
  },
  {
    id: "candolim-beach",
    name: "Candolim Beach",
    taluka: "Bardez",
    region: "North Goa",
    category: "Beaches",
    categories: ["Beaches", "Family Places", "Adventure", "Sunset Spots"],
    image: "iconic/candolim.png",
    shortDesc: "A peaceful stretch of golden sand flanked by scenic dunes, scrubland, water sport operators and refined seaside eateries.",
    detailedDesc: "Candolim Beach offers a more relaxed and tranquil atmosphere than its northern neighbors while retaining access to top-notch dining, catamaran sailing, water sports, and beach shacks. The coastline is bordered by gentle dunes and heritage villas.",
    location: "Candolim, Bardez, North Goa",
    coordinates: [15.5178, 73.7628],
    bestTime: "October to April (Morning walks or peaceful sunsets)",
    duration: "2–3 hours",
    thingsToDo: [
      "Catamaran sailing, parasailing and jet-ski rides",
      "Quiet sunset strolls along the wide uncrowded shoreline",
      "Fine dining at beach restaurants serving Mediterranean and Goan cuisines",
      "Yoga and wellness sessions by the morning surf"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Multiple parking lanes connecting Candolim main road to the beach",
      tips: "Excellent spot for couples and families looking for clean, calmer beach vibes."
    },
    nearby: ["Fort Aguada", "Sinquerim Beach", "Calangute Beach"]
  },
  {
    id: "sinquerim-beach",
    name: "Sinquerim Beach",
    taluka: "Bardez",
    region: "North Goa",
    category: "Beaches",
    categories: ["Beaches", "Forts", "Adventure", "Sunset Spots"],
    image: "iconic/sinquerim.png",
    shortDesc: "Picture-perfect beach featuring historic fort battlements jutting directly into the turquoise sea, scuba diving and boat trips.",
    detailedDesc: "Sinquerim Beach is framed by the lower battlements of Fort Aguada. The juxtaposition of ancient laterite fort walls meeting gentle ocean waves makes it one of the most photographed beaches in Goa. It is also the premier launching point for dolphin spotting boat tours, scuba diving and windsurfing.",
    location: "Sinquerim, Bardez, North Goa",
    coordinates: [15.498, 73.768],
    bestTime: "October to May (Morning for boat tours, evening for sunset photos)",
    duration: "2 hours",
    thingsToDo: [
      "Walk alongside the sea-facing battlements of Lower Aguada",
      "Embark on morning dolphin spotting boat cruises",
      "Scuba diving and snorkeling introductory trips",
      "Sunbathing under palm trees overlooking the bay"
    ],
    visitorInfo: {
      timings: "Open 24 hours (Boat tours operate 8:30 AM – 5:00 PM)",
      entryFee: "Free entry",
      parking: "Dedicated parking lot near Lower Aguada entrance",
      tips: "Early morning is best for calm seas and dolphin sighting excursions."
    },
    nearby: ["Fort Aguada", "Candolim Beach", "Reis Magos Fort"]
  },
  {
    id: "reis-magos-fort",
    name: "Reis Magos Fort",
    taluka: "Bardez",
    region: "North Goa",
    category: "Forts",
    categories: ["Forts", "Heritage", "Culture"],
    image: "iconic/reismagos.png",
    shortDesc: "Beautifully restored 16th-century fortress on the Mandovi River with historic cannons, art galleries and panoramic river views.",
    detailedDesc: "Constructed in 1551, Reis Magos Fort is one of the oldest fortifications in Goa. Fully restored under the stewardship of INTACH and the Goa Government, it now functions as a vibrant cultural center and museum displaying Mario Miranda sketches, Portuguese historical artifacts, and cannons guarding the Mandovi River mouth.",
    location: "Reis Magos, Bardez, North Goa",
    coordinates: [15.4988, 73.8089],
    bestTime: "9:30 AM – 1:00 PM or 3:00 PM – 5:30 PM",
    duration: "1.5–2 hours",
    thingsToDo: [
      "Tour the restored stone bastions and cannon embrasures",
      "Browse the gallery showcasing famous cartoonist Mario Miranda's art",
      "Gaze across the river to Panaji city and the Mandovi estuary",
      "Visit the adjacent 1555 Reis Magos Church"
    ],
    visitorInfo: {
      timings: "9:30 AM – 5:30 PM (Closed on Mondays)",
      entryFee: "₹50 for adults, ₹25 for students, ₹10 for children",
      parking: "Free parking available outside the fort gates",
      tips: "A peaceful, educational heritage site with well-maintained washrooms."
    },
    nearby: ["Fort Aguada", "Panaji", "Candolim Beach"]
  },

  // -----------------------------------------------------------
  // 2. PERNEM (NORTH GOA)
  // -----------------------------------------------------------
  {
    id: "arambol-beach",
    name: "Arambol Beach & Sweet Water Lake",
    taluka: "Pernem",
    region: "North Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Nature & Wildlife", "Culture"],
    image: "iconic/arambol.png",
    shortDesc: "Bohemian paradise with soft powdery sands, cliffside trails, natural freshwater sweet lake, and evening drum circles.",
    detailedDesc: "Arambol Beach in northernmost Goa is world-renowned for its laid-back hippie spirit and pristine natural beauty. A scenic walk around the northern headland leads to the famous freshwater Sweet Water Lake (Vagkolam), surrounded by green jungle hills, and a path leading further to the legendary Banyan Tree.",
    location: "Arambol, Pernem, North Goa",
    coordinates: [15.6866, 73.7042],
    bestTime: "October to April (Late afternoons 4:00 PM – 7:00 PM)",
    duration: "3–4 hours",
    thingsToDo: [
      "Swim in the calm freshwater Sweet Water Lake just behind the beach",
      "Join the daily sunset drum circle on the beach as the sun sets",
      "Trek to the legendary Money Banyan Tree through the forest trail",
      "Explore cliffside stalls selling handmade jewelry and organic teas"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Paid parking grounds available near Arambol beach entrance",
      tips: "Wear flip-flops or water shoes for the short rocky walk to the Sweet Water Lake."
    },
    nearby: ["Mandrem Beach", "Ashvem Beach", "Querim Beach"]
  },
  {
    id: "ashvem-beach",
    name: "Ashvem Beach",
    taluka: "Pernem",
    region: "North Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Family Places"],
    image: "iconic/ashvem.png",
    shortDesc: "Upscale, serene beach with wide flat sands, gentle tides, chic beachfront boutiques and relaxed palm-fringed dining.",
    detailedDesc: "Ashvem Beach offers a sophisticated yet serene beach experience. With its expansive, flat sandy shoreline and shallow waters, it is ideal for long peaceful strolls, safe swimming for children, and lounging under thatched umbrellas at boutique beach resorts.",
    location: "Ashvem, Pernem, North Goa",
    coordinates: [15.6583, 73.7175],
    bestTime: "November to March (Full day or sunset)",
    duration: "2–4 hours",
    thingsToDo: [
      "Relax on quiet, uncrowded stretches of pristine white-gold sand",
      "Dine at chic open-air restaurants offering fresh organic cuisine",
      "Browse stylish resort-wear and designer beach fashion boutiques",
      "Enjoy gentle sea swimming during low tide"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Roadside and resort parking available",
      tips: "One of the cleanest and quietest beaches in North Goa."
    },
    nearby: ["Mandrem Beach", "Morjim Beach", "Arambol Beach"]
  },
  {
    id: "mandrem-beach",
    name: "Mandrem Beach",
    taluka: "Pernem",
    region: "North Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Nature & Wildlife", "Family Places"],
    image: "iconic/mandrem.png",
    shortDesc: "Tranquil coastal hideaway crossed by quaint bamboo bridges over a tidal creek, perfect for yoga, wellness and sunset walks.",
    detailedDesc: "Mandrem Beach is a peaceful haven tucked between Ashvem and Arambol. A small tidal stream runs parallel to the coast, crossed by picturesque bamboo bridges. It is renowned for its wellness retreats, yoga ashrams, and calm waters that reflect the pastel skies at sunset.",
    location: "Mandrem, Pernem, North Goa",
    coordinates: [15.6708, 73.7108],
    bestTime: "October to April (Morning yoga or sunset hours)",
    duration: "2–3 hours",
    thingsToDo: [
      "Cross the rustic bamboo footbridges over the tidal creek",
      "Attend beachside morning yoga and meditation classes",
      "Spot white-bellied sea eagles circling above the coastline",
      "Enjoy candlelit beach dinners at eco-friendly shacks"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Parking available near Mandrem bridge entrance",
      tips: "Ideal for travelers seeking quiet solitude and relaxation."
    },
    nearby: ["Ashvem Beach", "Arambol Beach", "Morjim Beach"]
  },
  {
    id: "morjim-beach",
    name: "Morjim Turtle Beach",
    taluka: "Pernem",
    region: "North Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Beaches", "Sunset Spots"],
    image: "iconic/morjim turtle beach.png",
    shortDesc: "Protected nesting habitat for Olive Ridley sea turtles along the Chapora River estuary, with birdwatching and wide sands.",
    detailedDesc: "Morjim Beach is often called 'Turtle Beach' because its southern stretch is a protected nesting ground for endangered Olive Ridley sea turtles. Located where the Chapora River meets the Arabian Sea, it also attracts migratory birds including sandpipers, gulls, and plovers.",
    location: "Morjim, Pernem, North Goa",
    coordinates: [15.6267, 73.7314],
    bestTime: "November to March (Early morning for birding, evenings for turtles during nesting season)",
    duration: "2–3 hours",
    thingsToDo: [
      "Learn about Olive Ridley turtle conservation at the forest department outpost",
      "Birdwatching along the Chapora River sand spit",
      "Kite surfing and paddle boarding in open wind zones",
      "Enjoy tranquil sunset views overlooking Chapora Fort across the river"
    ],
    visitorInfo: {
      timings: "Open 24 hours (Protected nesting area restrictions apply)",
      entryFee: "Free entry",
      parking: "Ample parking available at the main beach approach",
      tips: "Strictly avoid flash photography and loud music near turtle nesting zones."
    },
    nearby: ["Ashvem Beach", "Chapora Fort", "Vagator Beach"]
  },
  {
    id: "tiracol-fort",
    name: "Fort Tiracol (Tiracol Fort)",
    taluka: "Pernem",
    region: "North Goa",
    category: "Forts",
    categories: ["Forts", "Heritage", "Sunset Spots"],
    image: "iconic/fort tiracol.png",
    shortDesc: "Majestic 17th-century coastal fortress perched on a cliff at Goa's northern tip, accessible by river ferry with the historic St. Anthony Church.",
    detailedDesc: "Fort Tiracol is situated on the northern bank of the Tiracol River at the border of Goa and Maharashtra. Originally built by the Raja of Sawantwadi and later rebuilt by the Portuguese in 1746, this fortress offers dramatic cliff views over the Arabian Sea and houses the 17th-century Church of St. Anthony in its courtyard.",
    location: "Tiracol, Pernem, North Goa",
    coordinates: [15.7333, 73.6833],
    bestTime: "October to April (Daytime or sunset)",
    duration: "2 hours",
    thingsToDo: [
      "Take the scenic free vehicle ferry ride across the Tiracol River from Querim",
      "Admire the historic stone ramparts and cannons overlooking the sea",
      "Visit the 17th-century Church of St. Anthony inside the courtyard",
      "Enjoy lunch or coffee on the cliffside terrace restaurant"
    ],
    visitorInfo: {
      timings: "9:00 AM – 7:00 PM daily",
      entryFee: "Free entry to viewing areas",
      parking: "Parking available right outside the fort gate",
      tips: "The river ferry from Querim runs every 30 minutes and takes cars/bikes."
    },
    nearby: ["Querim Beach", "Arambol Beach", "Mandrem Beach"]
  },
  {
    id: "querim-beach",
    name: "Querim (Keri) Beach",
    taluka: "Pernem",
    region: "North Goa",
    category: "Beaches",
    categories: ["Beaches", "Nature & Wildlife", "Sunset Spots"],
    image: "iconic/Querim (Keri) Beach.png",
    shortDesc: "Goa's northernmost tranquil beach, distinguished by fir and casuarina pine groves, old Portuguese houses and the Tiracol river mouth.",
    detailedDesc: "Querim Beach is an untouched, pine-fringed coastal expanse at the northern tip of Goa. With dramatic casuarina groves providing shaded picnic spots and white sands extending to the mouth of the Tiracol River, it is perfect for escaping crowded tourist hubs.",
    location: "Querim, Pernem, North Goa",
    coordinates: [15.7183, 73.6933],
    bestTime: "October to May (Morning or late afternoon)",
    duration: "2 hours",
    thingsToDo: [
      "Relax under the shade of tall casuarina pine tree groves",
      "Explore the river mouth and watch fishing boats navigate the estuary",
      "Photograph the old Ajoba Temple near the beach",
      "Catch the ferry across to Fort Tiracol"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Open parking under the tree canopy near the beach entry",
      tips: "Strong undercurrents near the river mouth; swim only in designated calm zones."
    },
    nearby: ["Fort Tiracol", "Arambol Beach", "Mandrem Beach"]
  },

  // -----------------------------------------------------------
  // 3. BICHOLIM (NORTH GOA)
  // -----------------------------------------------------------
  {
    id: "mayem-lake",
    name: "Mayem Lake & Adventure Park",
    taluka: "Bicholim",
    region: "North Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Family Places", "Adventure"],
    image: "iconic/mayemlake.png",
    shortDesc: "Serene freshwater lake surrounded by lush green hills, featuring paddle boating, bungee jumping, and a tranquil promenade.",
    detailedDesc: "Mayem Lake is a picturesque freshwater lake nestled amidst rolling green hills and cashew plantations in Bicholim taluka. The recently revamped tourism park features pedal boating, India's first water-touch bungee jumping center, ziplining, and landscaped gardens.",
    location: "Mayem, Bicholim, North Goa",
    coordinates: [15.5806, 73.9181],
    bestTime: "9:00 AM – 5:30 PM (Year-round; lush post-monsoon)",
    duration: "2–3 hours",
    thingsToDo: [
      "Pedal boating and shikara boat rides on the calm lake waters",
      "Experience the thrilling 55-meter Bungee Jump with water dip",
      "Walk the paved lakeside promenade surrounded by birds and hills",
      "Enjoy family picnics in the landscaped lakeside gardens"
    ],
    visitorInfo: {
      timings: "9:00 AM – 6:00 PM daily",
      entryFee: "₹30 entry fee; Boating & Bungee charged separately",
      parking: "Designated parking area near the main ticket complex",
      tips: "Great weekend getaway for families, adventure lovers and photographers."
    },
    nearby: ["Arvalem Waterfalls", "Arvalem Caves", "Saptakoteshwar Temple"]
  },
  {
    id: "arvalem-waterfalls",
    name: "Arvalem Waterfalls (Harvalem Falls)",
    taluka: "Bicholim",
    region: "North Goa",
    category: "Waterfalls",
    categories: ["Waterfalls", "Nature & Wildlife", "Family Places"],
    image: "iconic/arvalem waterfall.png",
    shortDesc: "A 50-meter scenic waterfall cascading into a green pool, set in a peaceful forested valley near the ancient Rudreshwar temple.",
    detailedDesc: "Arvalem Waterfall is a 50-meter-high cascade where water tumbles down rocky tiers into a deep natural pool. Located just 1.5 km from Sanquelim town, it is surrounded by lush tropical vegetation and features a viewing park built by the Goa Tourism Department.",
    location: "Harvalem, Sanquelim, Bicholim, North Goa",
    coordinates: [15.5539, 74.025],
    bestTime: "July to December (Spectacular flow during and right after monsoon)",
    duration: "1–2 hours",
    thingsToDo: [
      "View the thunderous cascade from the paved observation bridge",
      "Visit the adjacent centuries-old Shri Rudreshwar Temple",
      "Photograph the lush green gorge and misty water spray",
      "Combine your visit with the nearby Arvalem Rock Cut Caves"
    ],
    visitorInfo: {
      timings: "8:00 AM – 6:00 PM daily",
      entryFee: "Free entry",
      parking: "Parking available outside the temple and waterfall gate",
      tips: "Swimming is restricted during peak monsoon due to strong currents."
    },
    nearby: ["Arvalem Caves", "Mayem Lake", "Shri Rudreshwar Temple"]
  },
  {
    id: "arvalem-caves",
    name: "Arvalem Rock Cut Caves (Pandava Caves)",
    taluka: "Bicholim",
    region: "North Goa",
    category: "Heritage",
    categories: ["Heritage", "Culture"],
    image: "iconic/arvalem cave.png",
    shortDesc: "Ancient 6th-century rock-cut cave complex carved into laterite stone, featuring five distinct compartments and Sanskrit inscriptions.",
    detailedDesc: "Also known as the Pandava Caves, this 6th-century archaeological marvel features five rock-hewn chambers carved out of a single laterite rock face. Historians attribute the architecture to early Buddhist monks and Kadamba-era Shaivite shrines, complete with ancient Shiva lingas and Brahmi inscriptions.",
    location: "Harvalem, Bicholim, North Goa",
    coordinates: [15.555, 74.026],
    bestTime: "9:00 AM – 5:00 PM daily",
    duration: "45 mins – 1 hour",
    thingsToDo: [
      "Examine the 1,400-year-old rock-cut chambers and stone-carved shrines",
      "Inspect the ancient Sanskrit Brahmi script carved on the lingas",
      "Learn about the legendary connection to the Pandavas' exile",
      "Stroll the quiet landscaped garden maintained by the ASI"
    ],
    visitorInfo: {
      timings: "9:00 AM – 5:00 PM daily",
      entryFee: "Free entry (ASI protected monument)",
      parking: "Roadside parking available right in front of the caves",
      tips: "Located just 500 meters from Arvalem Waterfall; visit both together."
    },
    nearby: ["Arvalem Waterfalls", "Shri Rudreshwar Temple", "Mayem Lake"]
  },
  {
    id: "saptakoteshwar-temple",
    name: "Shri Saptakoteshwar Temple, Narve",
    taluka: "Bicholim",
    region: "North Goa",
    category: "Temples",
    categories: ["Temples", "Heritage", "Culture"],
    image: "iconic/saptakoteshwar.png",
    shortDesc: "Historic temple of the Kadamba dynasty's patron deity, restored by Chhatrapati Shivaji Maharaj in 1668 with a grand deepastambha.",
    detailedDesc: "Shri Saptakoteshwar was the patron deity of the Kadamba kings who ruled Goa for over 300 years. When the Portuguese demolished the original temple on Divar Island in 1560, devotees smuggled the sacred Shiva linga across the river to Narve. In 1668, Maratha ruler Chhatrapati Shivaji Maharaj personally funded and constructed this temple, which was recently restored to its pristine heritage glory.",
    location: "Narve, Bicholim, North Goa",
    coordinates: [15.539, 73.948],
    bestTime: "8:00 AM – 12:30 PM & 4:00 PM – 7:30 PM",
    duration: "1 hour",
    thingsToDo: [
      "Admire the grand stone Deepastambha (lamp tower) in the courtyard",
      "Marvel at the restored Kaavi art murals and wooden carved ceiling",
      "Learn the fascinating history of Shivaji Maharaj's patronship",
      "Experience peaceful evening aarti rituals"
    ],
    visitorInfo: {
      timings: "6:00 AM – 8:30 PM daily",
      entryFee: "Free entry",
      parking: "Free temple parking available outside the gateway",
      tips: "Modest dress code required. Photography inside the inner sanctum is prohibited."
    },
    nearby: ["Mayem Lake", "Arvalem Waterfalls", "Old Goa"]
  },
  {
    id: "rudreshwar-temple",
    name: "Shri Rudreshwar Temple",
    taluka: "Bicholim",
    region: "North Goa",
    category: "Temples",
    categories: ["Temples", "Heritage", "Nature & Wildlife"],
    image: "iconic/rudreshwar.png",
    shortDesc: "Centuries-old Shiva temple adjacent to the Arvalem waterfalls, revered for peaceful rituals amidst lush green nature.",
    detailedDesc: "Shri Rudreshwar Temple is dedicated to Lord Shiva as the lord of sound and thunder. Facing directly toward the roaring cascade of the Harvalem waterfall, the temple holds deep religious significance for ancestral rites and Maha Shivaratri celebrations.",
    location: "Harvalem, Bicholim, North Goa",
    coordinates: [15.553, 74.024],
    bestTime: "Morning hours 7:00 AM – 11:00 AM",
    duration: "45 mins",
    thingsToDo: [
      "Offer prayers at the ancient Shiva shrine with waterfall sounds in the background",
      "Admire the traditional Goan temple architecture and stone steps",
      "Walk the bridge path leading directly to Arvalem Falls view"
    ],
    visitorInfo: {
      timings: "6:00 AM – 8:00 PM daily",
      entryFee: "Free entry",
      parking: "Temple parking lot at the entrance",
      tips: "Remove footwear before entering the temple compound."
    },
    nearby: ["Arvalem Waterfalls", "Arvalem Caves", "Mayem Lake"]
  },

  // -----------------------------------------------------------
  // 4. SATTARI (NORTH GOA)
  // -----------------------------------------------------------
  {
    id: "hivre-waterfalls",
    name: "Hivre Waterfalls",
    taluka: "Sattari",
    region: "North Goa",
    category: "Waterfalls",
    categories: ["Waterfalls", "Adventure", "Nature & Wildlife"],
    image: "iconic/hirve waterfall.png",
    shortDesc: "Spectacular hidden multi-tier waterfall tucked deep inside the dense rainforests of the Western Ghats, reachable via an exhilarating trek.",
    detailedDesc: "Hivre Waterfall is a breathtaking eco-tourism destination in Sattari taluka. Surrounded by dense semi-evergreen forests, the trail leads trekkers through streams, boulder beds, and lush canopy before opening up to three distinct roaring cascades falling over black granite cliffs.",
    location: "Hivre Village, Valpoi, Sattari, North Goa",
    coordinates: [15.528, 74.148],
    bestTime: "July to November (Post-monsoon for safe and lush trekking)",
    duration: "4–5 hours (including trek)",
    thingsToDo: [
      "Guided forest trek through pristine Sahyadri streams and woods",
      "Swim in the refreshing natural plunge pool beneath the cascade",
      "Spot rare Western Ghats butterflies, hornbills and orchids",
      "Experience village hospitality and fresh herbal tea in Hivre"
    ],
    visitorInfo: {
      timings: "Best started before 10:00 AM; return before sunset",
      entryFee: "Local guide fee (₹500–₹800 recommended)",
      parking: "Village parking in Hivre near the trail head",
      tips: "Engage a local village guide. Wear sturdy trekking shoes with good grip."
    },
    nearby: ["Charavane Waterfalls", "Mhadei Wildlife Sanctuary", "Chorla Ghats"]
  },
  {
    id: "charavane-waterfalls",
    name: "Charavane Waterfalls",
    taluka: "Sattari",
    region: "North Goa",
    category: "Waterfalls",
    categories: ["Waterfalls", "Nature & Wildlife", "Adventure"],
    image: "iconic/charavne waterfall.png",
    shortDesc: "A picturesque cascade set inside lush private and reserve forests, with crystal clear shallow pools and scenic trail walks.",
    detailedDesc: "Located near Charavane village in Sattari, this charming waterfall features cascading white water flowing over smooth rock formations into crystalline pools. The easy-to-moderate nature trail makes it popular among weekend nature lovers and families seeking tranquility.",
    location: "Charavane, Valpoi, Sattari, North Goa",
    coordinates: [15.512, 74.125],
    bestTime: "August to December",
    duration: "2–3 hours",
    thingsToDo: [
      "Short scenic 20-minute hike along the gurgling forest brook",
      "Dip your feet in the cool mountain water streams",
      "Birdwatching and photography amidst dense Sahyadri flora",
      "Picnicking on flat rock ledges surrounding the fall"
    ],
    visitorInfo: {
      timings: "8:00 AM – 5:00 PM daily",
      entryFee: "Free entry",
      parking: "Village parking at the Charavane trail base",
      tips: "Carry drinking water and avoid leaving any plastic in the forest."
    },
    nearby: ["Hivre Waterfalls", "Mhadei Wildlife Sanctuary", "Nanuz Fort"]
  },
  {
    id: "mhadei-wildlife-sanctuary",
    name: "Mhadei Wildlife Sanctuary",
    taluka: "Sattari",
    region: "North Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Adventure"],
    image: "iconic/mhadei wildlife.png",
    shortDesc: "Vast 208 sq km biodiversity hotspot in the Western Ghats, home to Bengal tigers, black panthers, hornbills and endemic amphibians.",
    detailedDesc: "Mhadei Wildlife Sanctuary is a premier ecological sanctuary declared as an International Bird Area. Covering 208 square kilometers of contiguous Western Ghats forest, it serves as a vital tiger corridor and boasts rich biodiversity, including the rare Malabar pit viper, flying squirrels, and bioluminescent fungi.",
    location: "Sattari Taluka, North Goa",
    coordinates: [15.55, 74.15],
    bestTime: "October to March (Early morning safari or nature walk)",
    duration: "3–4 hours",
    thingsToDo: [
      "Guided eco-trails and wildlife photography excursions",
      "Spot endemic birds including the Malabar Pied Hornbill and Nilgiri Wood Pigeon",
      "White-water rafting on the Mhadei River during monsoon months",
      "Learn about biodiversity conservation from forest guides"
    ],
    visitorInfo: {
      timings: "6:30 AM – 5:30 PM",
      entryFee: "Forest permit fees apply (₹50–₹100)",
      parking: "Forest range office at Valpoi",
      tips: "Always enter with an authorized forest guide. Stay on designated trails."
    },
    nearby: ["Chorla Ghats", "Hivre Waterfalls", "Charavane Waterfalls"]
  },
  {
    id: "chorla-ghats",
    name: "Chorla Ghats Nature Trail",
    taluka: "Sattari",
    region: "North Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Sunset Spots", "Adventure"],
    image: "iconic/chorla ghat nature.png",
    shortDesc: "High-altitude mountain pass in the Sahyadris offering misty cloud-covered peaks, deep green valleys and scenic winding roads.",
    detailedDesc: "Chorla Ghats is a breathtaking mountain pass situated at an elevation of over 800 meters at the intersection of Goa, Karnataka, and Maharashtra. Renowned for its misty subtropical montane forests, waterfalls tumbling down roadside cliffs, and cooler climate, it is a favorite for road-trippers and nature enthusiasts.",
    location: "Chorla Ghats, Sattari, North Goa",
    coordinates: [15.633, 74.133],
    bestTime: "June to February (Monsoon & winter for cloud mists)",
    duration: "3–4 hours",
    thingsToDo: [
      "Scenic mountain driving with sweeping valley viewpoints",
      "Photography of cloud-wrapped peaks and roadside waterfalls",
      "Trek to Lasni Temb peak for a 360-degree panorama of the Sahyadris",
      "Visit the Wildernest eco-resort vantage point"
    ],
    visitorInfo: {
      timings: "Open 24 hours (Daytime driving recommended)",
      entryFee: "Free access via SH-4 highway",
      parking: "Viewpoint laybys along the ghat road",
      tips: "Drive carefully on sharp hairpin bends, especially in foggy conditions."
    },
    nearby: ["Mhadei Wildlife Sanctuary", "Hivre Waterfalls", "Mayem Lake"]
  },
  {
    id: "nanuz-fort",
    name: "Nanuz Fort",
    taluka: "Sattari",
    region: "North Goa",
    category: "Forts",
    categories: ["Forts", "Heritage", "Culture"],
    image: "iconic/nanuz fort.png",
    shortDesc: "Historical military outpost built by Shivaji Maharaj and later captured during the historic 19th-century Rane Revolts.",
    detailedDesc: "Nanuz Fort is an intriguing historical landmark built by Maratha ruler Shivaji Maharaj in the 17th century. Later held by the Portuguese, it served as a primary base for the famous Rane rebellion led by Dipaji Rane in the 1850s. Today, stone walls and bastions overlook the surrounding dense jungle.",
    location: "Nanuz, Valpoi, Sattari, North Goa",
    coordinates: [15.534, 74.108],
    bestTime: "Morning or late afternoon",
    duration: "1 hour",
    thingsToDo: [
      "Explore the historic stone ramparts and watchtower remnants",
      "Read historical inscriptions detailing the Rane freedom struggles",
      "Enjoy peaceful views of the Valpoi valley and dense forest"
    ],
    visitorInfo: {
      timings: "8:00 AM – 6:00 PM daily",
      entryFee: "Free entry",
      parking: "Parking available near the fort approach",
      tips: "A quiet, off-the-beaten-track site with rich historical significance."
    },
    nearby: ["Mhadei Wildlife Sanctuary", "Charavane Waterfalls", "Valpoi Town"]
  },
  {
    id: "brahma-temple-valpoi",
    name: "Brahma Temple, Carambolim-Valpoi",
    taluka: "Sattari",
    region: "North Goa",
    category: "Temples",
    categories: ["Temples", "Heritage", "Culture"],
    image: "iconic/bramha temple.png",
    shortDesc: "One of the extremely rare temples in India dedicated to Lord Brahma, housing a magnificent 12th-century Kadamba black stone sculpture.",
    detailedDesc: "Temples dedicated to Lord Brahma are exceptionally rare worldwide. This sacred shrine in Sattari houses a stunning intricately carved 12th-century Kadamba-period stone idol of Lord Brahma, standing tall with four heads and holding ritual implements. The idol was rescued from Old Goa in the 16th century.",
    location: "Brahma Carambolim, Valpoi, Sattari, North Goa",
    coordinates: [15.541, 74.135],
    bestTime: "7:00 AM – 12:30 PM & 4:00 PM – 7:30 PM",
    duration: "45 mins",
    thingsToDo: [
      "Witness the rare and intricate 12th-century 4-faced idol of Lord Brahma",
      "Admire the black basalt stone carvings of the Kadamba dynasty",
      "Experience peaceful prayers in a tranquil rural village setting"
    ],
    visitorInfo: {
      timings: "6:00 AM – 8:00 PM daily",
      entryFee: "Free entry",
      parking: "Free parking in front of the temple complex",
      tips: "Modest attire required; remove footwear before entering the hall."
    },
    nearby: ["Nanuz Fort", "Hivre Waterfalls", "Mhadei Wildlife Sanctuary"]
  },

  // -----------------------------------------------------------
  // 5. TISWADI (NORTH GOA)
  // -----------------------------------------------------------
  {
    id: "basilica-bom-jesus",
    name: "Basilica of Bom Jesus",
    taluka: "Tiswadi",
    region: "North Goa",
    category: "Churches",
    categories: ["Churches", "Heritage", "Culture"],
    image: "iconic/bom.png",
    shortDesc: "UNESCO World Heritage Baroque landmark housing the sacred mortal remains of St. Francis Xavier, with iconic unplastered laterite facade.",
    detailedDesc: "Completed in 1605, the Basilica of Bom Jesus ('Good Jesus') is one of the finest examples of Jesuit Baroque architecture in Asia. It enshrines the sacred relics of St. Francis Xavier in a silver casket topped by a Florentine marble mausoleum. The unplastered red laterite facade and gilded altar are world-renowned.",
    location: "Old Goa, Tiswadi, North Goa",
    coordinates: [15.5008, 73.9116],
    bestTime: "9:00 AM – 11:30 AM (or after 2:30 PM on Sundays)",
    duration: "1.5–2 hours",
    thingsToDo: [
      "View the sacred silver casket of St. Francis Xavier and Italian marble tomb",
      "Admire the towering gilded altar dedicated to the infant Jesus and Ignatius Loyola",
      "Browse the modern art gallery on the second floor displaying religious paintings",
      "Walk across to the Church of St. Francis of Assisi"
    ],
    visitorInfo: {
      timings: "Monday–Saturday: 9:00 AM – 6:30 PM; Sunday: 10:30 AM – 6:30 PM",
      entryFee: "Free entry to basilica (small fee for museum gallery)",
      parking: "Large parking lot opposite the basilica complex",
      tips: "Shoulders and knees must be covered. Silence is respected inside."
    },
    nearby: ["Church of St. Francis of Assisi", "St. Augustine Tower", "Fontainhas"]
  },
  {
    id: "fontainhas",
    name: "Fontainhas Latin Quarter",
    taluka: "Tiswadi",
    region: "North Goa",
    category: "Heritage",
    categories: ["Heritage", "Culture", "Family Places"],
    image: "iconic/Fontainhas.png",
    shortDesc: "Asia's only surviving Latin Quarter, renowned for brightly painted Portuguese colonial houses, wrought-iron balconies and heritage bakeries.",
    detailedDesc: "Fontainhas is the historic Latin Quarter of Panaji, established in the late 18th century at the foot of Altinho Hill. Recognized by UNESCO as a heritage zone, its narrow cobblestone streets are lined with pastel-hued ochre, cobalt blue, and olive green villas with red-tiled roofs, azulejos tile nameplates, and heritage bakeries.",
    location: "Panaji, Tiswadi, North Goa",
    coordinates: [15.4989, 73.8311],
    bestTime: "7:30 AM – 9:30 AM or 4:30 PM – 6:30 PM for walking photography",
    duration: "2–3 hours",
    thingsToDo: [
      "Guided or self-guided heritage photo walk through the colorful lanes",
      "Taste fresh Portuguese custard tarts (Pasteis de Nata) and Bebinca at traditional bakeries",
      "Visit the charming 1818 St. Sebastian Chapel in the heart of the quarter",
      "Shop for authentic hand-painted Azulejos ceramic tiles"
    ],
    visitorInfo: {
      timings: "Open 24 hours (Bakeries & boutiques open 9:00 AM – 8:00 PM)",
      entryFee: "Free exploration",
      parking: "Park at Old Secretariat or EDC multi-level lot; walk into Fontainhas",
      tips: "Fontainhas is a quiet residential neighborhood; respect residents' privacy."
    },
    nearby: ["Immaculate Conception Church", "Miramar Beach", "Dona Paula"]
  },
  {
    id: "immaculate-conception-church",
    name: "Church of Our Lady of the Immaculate Conception",
    taluka: "Tiswadi",
    region: "North Goa",
    category: "Churches",
    categories: ["Churches", "Heritage", "Sunset Spots"],
    image: "iconic/church of our lady of immaculate.png",
    shortDesc: "Iconic gleaming white Baroque church overlooking Panaji with a famous zigzag double-flight staircase and second-largest bell in Goa.",
    detailedDesc: "First built in 1541 as a chapel for Portuguese sailors arriving after the long voyage from Lisbon, this church was rebuilt in 1619 with its iconic zig-zagging multi-tiered staircase. Perched on a hill overlooking Panaji's Church Square, its belfry houses the massive Augustinian bell.",
    location: "Church Square, Panaji, Tiswadi, North Goa",
    coordinates: [15.498, 73.8286],
    bestTime: "9:00 AM – 12:30 PM or 4:30 PM – 7:00 PM (Luminous when illuminated at night)",
    duration: "1 hour",
    thingsToDo: [
      "Climb the iconic symmetrical zigzag staircases for a panoramic view of Panaji",
      "Admire the gilded altars dedicated to Our Lady of the Immaculate Conception",
      "Photograph the church facade lit up with warm golden lights at twilight",
      "Stroll the surrounding tree-lined municipal garden and cafes"
    ],
    visitorInfo: {
      timings: "9:00 AM – 12:30 PM & 3:30 PM – 7:30 PM daily",
      entryFee: "Free entry",
      parking: "Paid parking available at Church Square & Garcia de Orta garden",
      tips: "Wear respectful clothing when entering the sanctuary."
    },
    nearby: ["Fontainhas", "Miramar Beach", "Goa State Museum"]
  },
  {
    id: "miramar-beach",
    name: "Miramar Beach",
    taluka: "Tiswadi",
    region: "North Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Family Places"],
    image: "iconic/miramar beach.png",
    shortDesc: "Panaji's scenic urban beach where the Mandovi River meets the Arabian Sea, featuring a wide palm-lined promenade and sunset views.",
    detailedDesc: "Miramar Beach (originally named 'Porta de Gaspar Dias') is a popular golden-sand beach located right in Panaji city. The beach looks across the Mandovi River mouth toward the ramparts of Fort Aguada and is famous for evening food stalls, walking tracks, and sunset strolls.",
    location: "Miramar, Panaji, Tiswadi, North Goa",
    coordinates: [15.4839, 73.8092],
    bestTime: "5:00 PM – 7:30 PM (Evening sunset & street food)",
    duration: "1.5–2 hours",
    thingsToDo: [
      "Evening beach walks along the wide flat sands",
      "Sample local street food including chaat, pav bhaji, and kulfi",
      "Gaze across the river mouth to Fort Aguada lighthouse across the bay",
      "Relax at the landscaped beach park and children's play area"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Large parking lot opposite the beach promenade",
      tips: "Swimming is restricted due to strong undercurrents where the river meets the sea."
    },
    nearby: ["Dona Paula Viewpoint", "Fontainhas", "Immaculate Conception Church"]
  },
  {
    id: "dona-paula-viewpoint",
    name: "Dona Paula Viewpoint",
    taluka: "Tiswadi",
    region: "North Goa",
    category: "Sunset Spots",
    categories: ["Sunset Spots", "Heritage", "Family Places"],
    image: "iconic/Dona paul.png",
    shortDesc: "Romantic rocky promontory overlooking the confluence of the Zuari and Mandovi rivers, featuring the famous 'Image of India' sculpture.",
    detailedDesc: "Named after the historic Portuguese noblewoman Dona Paula de Menezes, this rocky promontory offers magnificent sweeping views over the Arabian Sea and Mormugao Harbor. It features a whitewashed sculpture 'Image of India' created by Baroness Yrsa von Leistner and water sports along the jetty.",
    location: "Dona Paula, Tiswadi, North Goa",
    coordinates: [15.4533, 73.8042],
    bestTime: "4:30 PM – 6:45 PM for refreshing coastal breezes and sunset",
    duration: "1–2 hours",
    thingsToDo: [
      "Walk the promenade jetty out to the rocky viewing pavilion",
      "Watch cargo ships and ferries entering Mormugao Harbor across the bay",
      "Try water sports including jet-skis and speed boat tours from the jetty",
      "Shop for souvenirs and seashell jewelry along the jetty market"
    ],
    visitorInfo: {
      timings: "6:00 AM – 7:00 PM daily",
      entryFee: "₹50 entry fee",
      parking: "Designated multi-level parking area near the entrance circle",
      tips: "Sunset provides stunning photographic reflections across the Zuari estuary."
    },
    nearby: ["Miramar Beach", "Fontainhas", "Dr. Salim Ali Bird Sanctuary"]
  },
  {
    id: "salim-ali-bird-sanctuary",
    name: "Dr. Salim Ali Bird Sanctuary (Chorão Island)",
    taluka: "Tiswadi",
    region: "North Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Family Places"],
    image: "iconic/dr salim ali bird santuary.png",
    shortDesc: "Estuarine mangrove sanctuary on Chorão Island accessible by ferry, home to kingfishers, egrets, flying foxes and mudskippers.",
    detailedDesc: "Named in honor of India's preeminent ornithologist Dr. Salim Ali, this 1.8 sq km estuarine sanctuary is located along the Mandovi River on Chorão Island. A network of paved mangrove boardwalks and guided canoe rides takes visitors through lush mangrove forests teeming with migratory birds, fiddler crabs, and otters.",
    location: "Chorão Island, Tiswadi, North Goa",
    coordinates: [15.518, 73.865],
    bestTime: "October to April (Early morning 6:30 AM – 9:30 AM for bird activity)",
    duration: "2–3 hours",
    thingsToDo: [
      "Take the free river ferry from Ribandar to Chorão Island",
      "Walk through the elevated wooden boardwalks inside the mangrove canopy",
      "Climb the 3-story bird observation watchtower overlooking the wetlands",
      "Take a guided shallow-draft boat ride through narrow mangrove channels"
    ],
    visitorInfo: {
      timings: "6:00 AM – 6:00 PM daily",
      entryFee: "₹20 for Indians, ₹100 for foreigners (Boat rides extra)",
      parking: "Parking available at the Ribandar ferry jetty or Chorão sanctuary gate",
      tips: "Carry binoculars and mosquito repellent for early morning birdwatching."
    },
    nearby: ["Old Goa", "Basilica of Bom Jesus", "Fontainhas"]
  },
  {
    id: "st-augustine-tower",
    name: "Church of St. Augustine Ruins",
    taluka: "Tiswadi",
    region: "North Goa",
    category: "Heritage",
    categories: ["Heritage", "Churches"],
    image: "iconic/church of st augustine.png",
    shortDesc: "Evocative ruins of a 46-meter towering 16th-century Augustinian belfry and cathedral, featured in world history and cinema.",
    detailedDesc: "Built between 1572 and 1602 by Augustinian friars, the Church of St. Augustine was once one of the grandest religious edifices in the world. After the religious orders were expelled in 1835, the church fell into ruin, leaving the iconic 46-meter-high, four-story belfry tower standing proudly against the sky.",
    location: "Holy Hill, Old Goa, Tiswadi, North Goa",
    coordinates: [15.5003, 73.9058],
    bestTime: "9:00 AM – 5:30 PM (Great for afternoon heritage photography)",
    duration: "1 hour",
    thingsToDo: [
      "Stand before the towering 4-story stone belfry facade",
      "Explore the excavated foundations of the 8 chapels and convent cloisters",
      "Discover the historical site where Queen Ketevan's relics were found",
      "Photograph the majestic stone arches and skyward views"
    ],
    visitorInfo: {
      timings: "8:30 AM – 5:30 PM daily",
      entryFee: "Free entry (ASI protected monument)",
      parking: "Parking along the approach road on Holy Hill",
      tips: "Combine with nearby Basilica of Bom Jesus and Church of St. Francis of Assisi."
    },
    nearby: ["Basilica of Bom Jesus", "Church of St. Francis of Assisi", "Fontainhas"]
  },
  {
    id: "st-francis-assisi",
    name: "Church of St. Francis of Assisi",
    taluka: "Tiswadi",
    region: "North Goa",
    category: "Churches",
    categories: ["Churches", "Heritage", "Culture"],
    image: "iconic/church of st francis of assissi.png",
    shortDesc: "1661 Franciscan church featuring a rare Manueline carved entrance portal, painted wood panels, and an adjoining museum.",
    detailedDesc: "Established by eight Franciscan friars who landed in Goa in 1517, the current structure was completed in 1661. It is celebrated for retaining its original 1521 Manueline-style carved stone portal, painted woodwork depicting the life of Saint Francis, and its attached convent housing the Archaeological Museum of Goa.",
    location: "Old Goa, Tiswadi, North Goa",
    coordinates: [15.5042, 73.9131],
    bestTime: "9:00 AM – 5:00 PM",
    duration: "1 hour",
    thingsToDo: [
      "Admire the rare 1521 Manueline entrance portal preserved from the original church",
      "Inspect the large painted wooden panels depicting scenes from St. Francis's life",
      "Visit the adjoining Archaeological Museum containing Portuguese viceroy portraits",
      "View ancient hero stones and Kadamba stone sculptures in the courtyard"
    ],
    visitorInfo: {
      timings: "9:00 AM – 5:00 PM (Museum closed on Fridays)",
      entryFee: "Free entry to church (₹25 for Archaeological Museum)",
      parking: "Old Goa main tourist parking area",
      tips: "Located right near Basilica of Bom Jesus in the central Old Goa square."
    },
    nearby: ["Basilica of Bom Jesus", "St. Augustine Tower", "Fontainhas"]
  },
  {
    id: "goa-state-museum",
    name: "Goa State Museum & Adil Shah Palace",
    taluka: "Tiswadi",
    region: "North Goa",
    category: "Heritage",
    categories: ["Heritage", "Culture", "Family Places"],
    image: "iconic/goa meuseum and adil shah palace.png",
    shortDesc: "Goa's premier state museum housing thousands of artifacts, ancient sculptures, Goa's freedom struggle exhibits and coin collections.",
    detailedDesc: "The Goa State Museum preserves the multifaceted heritage of Goa through dedicated galleries spanning ancient Kadamba sculptures, Christian art, freedom struggle archives, geology, numismatics, and traditional Goan crafts.",
    location: "Panaji / Old Secretariat, Tiswadi, North Goa",
    coordinates: [15.495, 73.824],
    bestTime: "9:30 AM – 5:00 PM (Closed on Saturdays & Sundays)",
    duration: "1.5–2 hours",
    thingsToDo: [
      "Explore the Kadamba stone sculpture and Hindu iconography galleries",
      "Learn about Goa's liberation struggle against Portuguese rule",
      "Examine antique wooden furniture, palanquins, and vintage coins",
      "Walk along the Mandovi River waterfront outside the museum"
    ],
    visitorInfo: {
      timings: "9:30 AM – 5:00 PM (Monday to Friday)",
      entryFee: "Free entry",
      parking: "City parking along the promenade",
      tips: "Great cultural stop for history buffs and school/college students."
    },
    nearby: ["Fontainhas", "Immaculate Conception Church", "Miramar Beach"]
  },

  // -----------------------------------------------------------
  // 6. PONDA (NORTH GOA)
  // -----------------------------------------------------------
  {
    id: "mangueshi-temple",
    name: "Shri Mangueshi Temple, Priol",
    taluka: "Ponda",
    region: "North Goa",
    category: "Temples",
    categories: ["Temples", "Heritage", "Culture"],
    image: "iconic/shri mangueshi temple.png",
    shortDesc: "Goa's most renowned Hindu temple, featuring a magnificent seven-story white Deepastambha, sacred water tank and ornate chandeliers.",
    detailedDesc: "Dedicated to Lord Manguesh (an incarnation of Shiva), this iconic temple was built in 1560 when devotees smuggled the deity from Cortalim across the Zuari River to safe sanctuary in Ponda. It features distinctive Goan temple architecture blending Hindu, Christian, and Islamic motifs, an octagonal seven-tier lamp tower (Deepastambha), and crystal chandeliers.",
    location: "Priol, Ponda, North Goa",
    coordinates: [15.4344, 73.9683],
    bestTime: "7:00 AM – 11:30 AM & 4:30 PM – 7:30 PM",
    duration: "1–1.5 hours",
    thingsToDo: [
      "Admire the grand 7-story whitewashed Deepastambha (lamp tower)",
      "View the sacred water tank (Tali) surrounded by temple arcades",
      "Marvel at the silver-embossed sanctum door and crystal chandeliers",
      "Experience the peaceful spiritual chants and morning aarti"
    ],
    visitorInfo: {
      timings: "6:00 AM – 8:30 PM daily",
      entryFee: "Free entry",
      parking: "Large parking lot available near the entrance arch",
      tips: "Strict dress code: shoulders and legs below knees must be covered."
    },
    nearby: ["Shanta Durga Temple", "Mahalsa Narayani Temple", "Safa Masjid"]
  },
  {
    id: "shanta-durga-temple",
    name: "Shri Shanta Durga Temple, Kavlem",
    taluka: "Ponda",
    region: "North Goa",
    category: "Temples",
    categories: ["Temples", "Heritage", "Culture"],
    image: "iconic/shri shantadurga temple kavlem.png",
    shortDesc: "Revered temple dedicated to the goddess of peace who reconciled Vishnu and Shiva, featuring a striking terracotta-red facade.",
    detailedDesc: "Constructed during the reign of Maratha ruler Shahu Raje in the 1730s, this revered temple is dedicated to Goddess Shanta Durga, who mediated a fierce battle between Lord Shiva and Lord Vishnu. The temple complex features red-tiled pyramid roofs, Italian marble flooring, and Roman-arched windows.",
    location: "Kavlem, Ponda, North Goa",
    coordinates: [15.3986, 73.9878],
    bestTime: "8:00 AM – 12:00 PM & 4:00 PM – 7:30 PM",
    duration: "1–1.5 hours",
    thingsToDo: [
      "Offer prayers to Goddess Shanta Durga holding two serpents",
      "Photograph the ornate deepastambha and palanquin halls",
      "Admire the harmonious blend of Goan, Maratha and Portuguese architecture",
      "Stroll around the peaceful forested foothills surrounding the temple"
    ],
    visitorInfo: {
      timings: "6:00 AM – 9:00 PM daily",
      entryFee: "Free entry",
      parking: "Free parking available in front of the temple complex",
      tips: "Modest attire required. Photography inside the inner sanctum is not allowed."
    },
    nearby: ["Mangueshi Temple", "Nagesh Temple", "Safa Masjid"]
  },
  {
    id: "safa-masjid",
    name: "Safa Masjid (Safa Shahouri Mosque)",
    taluka: "Ponda",
    region: "North Goa",
    category: "Heritage",
    categories: ["Heritage", "Culture"],
    image: "iconic/safa masjid.png",
    shortDesc: "Historical 1560 mosque built by Ali Adil Shah with a massive masonry water tank and pointed Islamic arches.",
    detailedDesc: "Constructed in 1560 by Sultan Ali Adil Shah of Bijapur, Safa Masjid ('Pure Mosque') is one of the oldest surviving mosques in Goa. The elegant single-chambered structure features pointed arches, terracotta tiled roofing, and a massive adjacent masonry tank with ornate mihrab carvings.",
    location: "Shahpur, Ponda, North Goa",
    coordinates: [15.405, 74.015],
    bestTime: "8:00 AM – 11:30 AM & 3:30 PM – 5:30 PM",
    duration: "45 mins",
    thingsToDo: [
      "Admire the ancient masonry water tank with carved stone arches",
      "Explore the 16th-century Adil Shahi architecture set in manicured lawns",
      "Photograph the peaceful reflection of the mosque in the water tank",
      "Enjoy the quiet heritage garden maintained by the ASI"
    ],
    visitorInfo: {
      timings: "8:00 AM – 6:00 PM daily",
      entryFee: "Free entry (ASI protected monument)",
      parking: "Free parking space available outside the mosque grounds",
      tips: "Modest attire required. Remove footwear before stepping onto the prayer platform."
    },
    nearby: ["Shanta Durga Temple", "Mangueshi Temple", "Nagesh Temple"]
  },
  {
    id: "bondla-wildlife-sanctuary",
    name: "Bondla Wildlife Sanctuary",
    taluka: "Ponda",
    region: "North Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Family Places"],
    image: "iconic/bondla wildlife santuary.png",
    shortDesc: "Goa's most popular family eco-park, featuring a zoo, deer safari park, botanical garden, nature trails and elephant rehabilitation.",
    detailedDesc: "Covering 8 square kilometers in the foothills of the Western Ghats, Bondla Wildlife Sanctuary is Goa's most accessible and family-friendly wildlife reserve. It features a zoological park housing leopards, sloth bears, and sambar deer, a botanical rose garden, and nature trails.",
    location: "Usgao-Ganjem, Ponda, North Goa",
    coordinates: [15.441, 74.103],
    bestTime: "9:00 AM – 4:00 PM (Closed on Thursdays)",
    duration: "3–4 hours",
    thingsToDo: [
      "Explore the zoo and deer rescue park",
      "Walk the botanical garden and watch butterfly species",
      "Hike the guided nature interpretation trails through deciduous forests",
      "Family picnics on the shaded park lawns"
    ],
    visitorInfo: {
      timings: "9:00 AM – 5:00 PM (Closed on Thursdays)",
      entryFee: "₹50 for adults, ₹20 for children",
      parking: "Ample parking available at the sanctuary entrance",
      tips: "Ideal day trip for families with young children."
    },
    nearby: ["Mangueshi Temple", "Shanta Durga Temple", "Dudhsagar Falls"]
  },
  {
    id: "nagesh-temple",
    name: "Shri Nagesh Temple, Bandora",
    taluka: "Ponda",
    region: "North Goa",
    category: "Temples",
    categories: ["Temples", "Heritage", "Culture"],
    image: "iconic/shri nagueshi temple.png",
    shortDesc: "Ancient 15th-century Shiva temple situated in a lush areca palm valley with wood carvings depicting the Ramayana.",
    detailedDesc: "Shri Nagesh Maharudra Temple in Bandora is one of the few Hindu temples in Goa that stood in its original location without being destroyed during the Portuguese inquisition. A stone inscription dating back to 1413 confirms its antiquity. The temple features exquisite wood carvings depicting scenes from the Ramayana and Mahabharata.",
    location: "Bandora, Ponda, North Goa",
    coordinates: [15.409, 73.992],
    bestTime: "7:00 AM – 11:30 AM & 4:00 PM – 7:30 PM",
    duration: "45 mins",
    thingsToDo: [
      "Examine the 600-year-old stone inscription from the Vijayanagara era",
      "Admire the intricate carved wooden ceiling depicting the Ramayana",
      "Gaze at the large clear water tank populated with sacred fish",
      "Enjoy the peaceful palm-fringed village ambiance of Bandora"
    ],
    visitorInfo: {
      timings: "6:00 AM – 8:30 PM daily",
      entryFee: "Free entry",
      parking: "Free parking in front of the temple gate",
      tips: "Combine with nearby Mahalasa Narayani and Shanta Durga temples."
    },
    nearby: ["Mahalsa Narayani Temple", "Shanta Durga Temple", "Mangueshi Temple"]
  },
  {
    id: "mahalsa-temple",
    name: "Shri Mahalsa Narayani Temple, Mardol",
    taluka: "Ponda",
    region: "North Goa",
    category: "Temples",
    categories: ["Temples", "Heritage", "Culture"],
    image: "iconic/shri mahalsa narayani temple.png",
    shortDesc: "Famous temple dedicated to Lord Vishnu's Mohini avatar, featuring a 40-foot brass lamp tower (Deepastambha) with 150 oil lamps.",
    detailedDesc: "Shri Mahalsa Narayani Temple is dedicated to the female Mohini incarnation of Lord Vishnu. The temple is famous for its 40-foot-tall brass Deepastambha, which holds 150 oil lamps and looks spectacular when lit during festivals. The main hall contains 21 wood-carved pillars depicting the Dashavatara.",
    location: "Mardol, Ponda, North Goa",
    coordinates: [15.432, 73.978],
    bestTime: "7:30 AM – 12:00 PM & 4:00 PM – 8:00 PM",
    duration: "1 hour",
    thingsToDo: [
      "Marvel at the 40-foot brass Deepastambha standing in the courtyard",
      "Inspect the 21 finely carved wooden pillars showing the 10 avatars of Vishnu",
      "Participate in the Sunday palanquin (palkhi) procession",
      "Taste the temple sweet prasad offered to visitors"
    ],
    visitorInfo: {
      timings: "6:00 AM – 8:30 PM daily",
      entryFee: "Free entry",
      parking: "Parking available outside the temple courtyard",
      tips: "Sunday evenings feature a colorful palanquin procession."
    },
    nearby: ["Mangueshi Temple", "Nagesh Temple", "Shanta Durga Temple"]
  },

  // -----------------------------------------------------------
  // 7. MORMUGAO (SOUTH GOA)
  // -----------------------------------------------------------
  {
    id: "bogmalo-beach",
    name: "Bogmalo Beach",
    taluka: "Mormugao",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Adventure"],
    image: "iconic/bogmalo beach.png",
    shortDesc: "Curved sandy bay located just 4 km from Dabolim airport, famous for scuba diving, beachside cafes and tranquil sunsets.",
    detailedDesc: "Bogmalo Beach is a charming, crescent-shaped bay sheltered between two headlands just 10 minutes from Dabolim Airport. Known for its clean golden sands, accredited PADI scuba diving centers, and relaxed beachside restaurants, it is a favorite spot for arriving or departing travelers.",
    location: "Bogmalo, Mormugao, South Goa",
    coordinates: [15.3817, 73.8344],
    bestTime: "October to May (Great for an early arrival or sunset before a flight)",
    duration: "2–3 hours",
    thingsToDo: [
      "PADI certified scuba diving and open-water discover dives",
      "Dine at beachside shacks serving fresh kingfish and butter garlic prawns",
      "Stroll the compact curving sandy cove and watch aircraft on distant approach",
      "Visit the nearby Naval Aviation Museum"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Parking area available near Bogmalo beach circle",
      tips: "Perfect stop if you have 3–4 hours to spare near Dabolim airport."
    },
    nearby: ["Naval Aviation Museum", "Hollant Beach", "Baina Beach"]
  },
  {
    id: "naval-aviation-museum",
    name: "Naval Aviation Museum, Dabolim",
    taluka: "Mormugao",
    region: "South Goa",
    category: "Heritage",
    categories: ["Heritage", "Culture", "Family Places"],
    image: "iconic/naval aviation museum.png",
    shortDesc: "One of only two military aviation museums in India, featuring decommissioned naval fighter jets, maritime aircraft and torpedoes.",
    detailedDesc: "Located on Bogmalo Road overlooking the sea, the Naval Aviation Museum is a fascinating exhibition showcasing the history of the Indian Naval Air Arm. The outdoor park features 14 giant decommissioned aircraft—including the Sea Harrier jump jet, Sea King helicopter, and Super Constellation—while the indoor galleries display cockpits, torpedoes, and naval war history.",
    location: "Bogmalo Road, Dabolim, Mormugao, South Goa",
    coordinates: [15.3853, 73.8394],
    bestTime: "10:00 AM – 5:00 PM (Closed on Mondays)",
    duration: "1.5–2 hours",
    thingsToDo: [
      "Walk among historic naval aircraft including the iconic Sea Harrier fighter",
      "Step inside a flight simulator and view vintage cockpit instruments",
      "Inspect naval torpedoes, anti-ship missiles, and war memorabilia",
      "Browse the souvenir shop for naval badges and scale model aircraft"
    ],
    visitorInfo: {
      timings: "10:00 AM – 5:30 PM (Closed on Mondays)",
      entryFee: "₹50 for adults, ₹20 for children",
      parking: "Free parking inside the museum compound",
      tips: "Fascinating and educational experience for children and aviation enthusiasts."
    },
    nearby: ["Bogmalo Beach", "Hollant Beach", "Mormugao Fort"]
  },
  {
    id: "mormugao-fort",
    name: "Mormugao Fort",
    taluka: "Mormugao",
    region: "South Goa",
    category: "Forts",
    categories: ["Forts", "Heritage", "Sunset Spots"],
    image: "iconic/mormugao fort.png",
    shortDesc: "Strategic 1624 coastal fort guarding Mormugao Harbor with grand ramparts, historic chapel and deep harbor views.",
    detailedDesc: "Built in 1624 near the mouth of the Zuari River, Mormugao Fort once commanded the defense of Goa's premier natural deep-water port. It includes old stone bulwarks, historic cannons, and an ancient chapel with views of the bustling commercial harbor and open Arabian Sea.",
    location: "Headland Sada, Vasco da Gama, Mormugao, South Goa",
    coordinates: [15.419, 73.801],
    bestTime: "4:00 PM – 6:30 PM (Scenic sunset)",
    duration: "1–1.5 hours",
    thingsToDo: [
      "Walk the cliffside ramparts overlooking Mormugao Port and Zuari River",
      "Watch cargo ships and international cruise liners entering the harbor",
      "Explore the old stone chapel and cannon battlements",
      "Photograph the vast ocean horizon from the headland"
    ],
    visitorInfo: {
      timings: "8:00 AM – 6:00 PM daily",
      entryFee: "Free entry",
      parking: "Roadside parking at Headland Sada",
      tips: "Combine with a visit to the nearby Japanese Garden at Sada."
    },
    nearby: ["Baina Beach", "Bogmalo Beach", "Naval Aviation Museum"]
  },
  {
    id: "baina-beach",
    name: "Baina Beach & Japanese Garden",
    taluka: "Mormugao",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Family Places"],
    image: "iconic/baina beach and japanese garden.png",
    shortDesc: "Revitalized crescent beach in Vasco with a cliffside Japanese Garden offering sweeping views of the Arabian Sea and Grand Island.",
    detailedDesc: "Baina Beach is a sweeping sandy beach located in Vasco da Gama. On the cliff above at Headland Sada sits the beautifully landscaped Japanese Garden, featuring paved walking paths, cliffside gazebos, and panoramic vistas overlooking Grand Island and the Zuari mouth.",
    location: "Vasco da Gama, Mormugao, South Goa",
    coordinates: [15.395, 73.811],
    bestTime: "5:00 PM – 7:00 PM for sunset",
    duration: "1.5 hours",
    thingsToDo: [
      "Walk through the cliffside Japanese Garden overlooking the sea",
      "Take the stone steps down from the garden to the quiet rocky beach below",
      "Water sports and evening family strolls on Baina Beach promenade",
      "Photograph Grand Island across the sea during sunset"
    ],
    visitorInfo: {
      timings: "Garden open 6:00 AM – 8:00 PM; Beach open 24 hours",
      entryFee: "Free entry",
      parking: "Parking available at the Japanese Garden entrance",
      tips: "The Japanese Garden is a top scenic photo spot in Vasco."
    },
    nearby: ["Mormugao Fort", "Bogmalo Beach", "Naval Aviation Museum"]
  },
  {
    id: "hollant-beach",
    name: "Hollant Beach",
    taluka: "Mormugao",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Nature & Wildlife", "Sunset Spots"],
    image: "iconic/hollant beach.png",
    shortDesc: "Sheltered shallow bay known for exceptionally calm waters, safe swimming, kayaking and rare sunrise views over the bay.",
    detailedDesc: "Hollant Beach is tucked away in a quiet cove bordered by the foothills of the Western Ghats. Its unique curved geography creates calm, wave-free waters with gentle sloping sands, making it one of the safest beaches for swimming and kayaking in Goa.",
    location: "Hollant, Mormugao, South Goa",
    coordinates: [15.367, 73.848],
    bestTime: "October to May (Early morning or quiet afternoon)",
    duration: "2 hours",
    thingsToDo: [
      "Safe and wave-free swimming in clear, shallow waters",
      "Kayaking and stand-up paddleboarding along the sheltered bay",
      "Explore the rock pools during low tide to spot colorful crabs and fish",
      "Relax at quaint local beachside shacks"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Small parking area near the beach approach road",
      tips: "One of the few beaches in Goa where you can watch the sunrise over water."
    },
    nearby: ["Bogmalo Beach", "Naval Aviation Museum", "Heart Shaped Lake"]
  },
  {
    id: "heart-shaped-lake",
    name: "Heart Shaped Lake, Chicalim",
    taluka: "Mormugao",
    region: "South Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Sunset Spots"],
    image: "iconic/heart shaped lake.png",
    shortDesc: "Naturally heart-shaped saltwater lagoon on a cliff overlooking the Arabian Sea, popular for drone and couple photography.",
    detailedDesc: "Perched along the coastal cliffs of Chicalim near Vasco, this naturally formed heart-shaped water body is fed by sea waves during high tide. The emerald water surrounded by red laterite rocks and sea views has made it an Instagram sensation.",
    location: "Chicalim / Bogmalo Coast, Mormugao, South Goa",
    coordinates: [15.389, 73.831],
    bestTime: "4:30 PM – 6:30 PM",
    duration: "1 hour",
    thingsToDo: [
      "Photograph the naturally heart-shaped lagoon from the cliff trail",
      "Enjoy breathtaking ocean views of the Arabian Sea horizon",
      "Relax on the sea-breeze cliff walk"
    ],
    visitorInfo: {
      timings: "Open during daylight hours (6:00 AM – 6:30 PM)",
      entryFee: "Free",
      parking: "Park near the Coast Guard residential gate and walk 5 mins",
      tips: "Wear sneakers; cliff edges require cautious footing."
    },
    nearby: ["Bogmalo Beach", "Naval Aviation Museum", "Hollant Beach"]
  },
  {
    id: "velsao-beach",
    name: "Velsao Beach & Sunset Coast",
    taluka: "Mormugao",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Nature & Wildlife"],
    image: "iconic/velsao beach.png",
    shortDesc: "Endless stretch of untouched white sand bordered by coconut groves, lily ponds and old Portuguese chapel hills.",
    detailedDesc: "Velsao Beach marks the northern beginning of South Goa's continuous 26-kilometer strip of soft white sand. Far removed from commercial noise, it is fringed with coconut palms, fishing boats, and peaceful seaside paths.",
    location: "Velsao, Mormugao, South Goa",
    coordinates: [15.353, 73.882],
    bestTime: "October to April (Late afternoon for sunset)",
    duration: "1.5–2 hours",
    thingsToDo: [
      "Enjoy peaceful walks on wide, uncrowded white sands",
      "Visit the nearby Three Kings Chapel atop Cansaulim Hill for 360° views",
      "Watch local fishermen haul in their evening catch using traditional nets",
      "Photography of sunset reflections across wet tidal sands"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Parking available near Velsao beach road end",
      tips: "Carry your own snacks and water as commercial shacks are minimal."
    },
    nearby: ["Hollant Beach", "Bogmalo Beach", "Majorda Beach"]
  },

  // -----------------------------------------------------------
  // 8. SALCETE (SOUTH GOA)
  // -----------------------------------------------------------
  {
    id: "colva-beach",
    name: "Colva Beach",
    taluka: "Salcete",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Family Places", "Sunset Spots", "Adventure"],
    image: "iconic/colva.png",
    shortDesc: "South Goa's oldest and most iconic white-sand beach, featuring a vibrant promenade, water sports, beach shacks and the Menino Jesus church.",
    detailedDesc: "Colva Beach is the pride of Salcete and one of the earliest developed beaches in Goa. Stretching for kilometers with soft powdery white sands, it features a lively central circle with ice cream parlors, seafood shacks, parasailing, and speedboats.",
    location: "Colva, Salcete, South Goa",
    coordinates: [15.2789, 73.9167],
    bestTime: "October to March (Afternoon & evening)",
    duration: "2–4 hours",
    thingsToDo: [
      "Parasailing, jet skiing, speed boat cruises and banana rides",
      "Relax on sun loungers enjoying fresh coconut water and Goan seafood",
      "Visit the historic 1630 Church of Our Lady of Mercy (Nossa Senhora das Mercês)",
      "Evening beach walks and shopping for souvenirs on the promenade"
    ],
    visitorInfo: {
      timings: "Open 24 hours (Lifeguards present 7:30 AM – 6:30 PM)",
      entryFee: "Free entry",
      parking: "Extensive paid municipal parking area near the circle",
      tips: "Walking 200 meters north or south from the central circle leads to peaceful sands."
    },
    nearby: ["Benaulim Beach", "Majorda Beach", "Holy Spirit Church Margao"]
  },
  {
    id: "benaulim-beach",
    name: "Benaulim Beach",
    taluka: "Salcete",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Adventure", "Sunset Spots", "Culture"],
    image: "iconic/benaulim beach.png",
    shortDesc: "Serene white-sand beach famed for dolphin spotting boat tours, water sports, peaceful shacks and traditional rosewood carpentry.",
    detailedDesc: "According to Hindu mythology, Benaulim (Banavali) is the sacred spot where Lord Parashurama's arrow landed to create the land of Goa. Today, it is a serene beach with silky white sands, thriving beach shacks, and daily morning boat excursions for dolphin watching in the open sea.",
    location: "Benaulim, Salcete, South Goa",
    coordinates: [15.2611, 73.9181],
    bestTime: "October to April (Morning for dolphins, evening for sunsets)",
    duration: "2–3 hours",
    thingsToDo: [
      "Board morning boat tours for dolphin spotting in the bay",
      "Windsurfing, parasailing and jet-skis with licensed operators",
      "Feast on authentic Goan fish curry thali at beachfront shacks",
      "Visit the historic St. John the Baptist Church on the hill"
    ],
    visitorInfo: {
      timings: "Open 24 hours (Dolphin boat tours 8:00 AM – 4:30 PM)",
      entryFee: "Free entry",
      parking: "Paved parking area at the main Benaulim beach entrance",
      tips: "Quieter alternative to Colva, very popular among European long-stay tourists."
    },
    nearby: ["Colva Beach", "Varca Beach", "Cavelossim Beach"]
  },
  {
    id: "majorda-beach",
    name: "Majorda & Betalbatim Beach (Glow Beach)",
    taluka: "Salcete",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Family Places"],
    image: "iconic/majorda and betalbatim beach.png",
    shortDesc: "Pristine white sand coastline famed for Goan toddy bread (poi), calm waters, pine groves and seasonal bioluminescent waves.",
    detailedDesc: "Majorda Beach is renowned for its bakery heritage—where Goan bakers first learned to ferment bread using toddy. Flanked by Betalbatim Beach (often called the 'Sunset Beach' and known for occasional bioluminescence in calm winter nights), this coastline offers powdery sands and palm-shaded restaurants.",
    location: "Majorda, Salcete, South Goa",
    coordinates: [15.3094, 73.9083],
    bestTime: "October to April (Peaceful all day, magical at sunset)",
    duration: "2–3 hours",
    thingsToDo: [
      "Stroll the expansive, spotless white shoreline with gentle waves",
      "Taste authentic freshly baked Goan Poi and European dishes at legendary shacks",
      "Watch magnificent golden-pink sunsets over the calm Arabian Sea",
      "Spot shorebirds along the tree line"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Parking available at Majorda & Betalbatim beach approaches",
      tips: "One of South Goa's cleanest and most relaxing family beaches."
    },
    nearby: ["Colva Beach", "Velsao Beach", "Benaulim Beach"]
  },
  {
    id: "holy-spirit-church-margao",
    name: "Church of the Holy Spirit, Margao",
    taluka: "Salcete",
    region: "South Goa",
    category: "Churches",
    categories: ["Churches", "Heritage", "Culture"],
    image: "iconic/holy spirit church margao.png",
    shortDesc: "Magnificent 1675 Baroque church dominating Margao's historic square, featuring a towering whitewashed facade and gilded altars.",
    detailedDesc: "Rebuilt in 1675, the Church of the Holy Spirit stands in the heritage square of Old Market in Margao. Framed by mango trees and palatial 17th-century mansions (such as the Seven Gables House), it features an imposing Baroque facade, stucco embellishments, and a gilded high altar.",
    location: "Old Market, Margao, Salcete, South Goa",
    coordinates: [15.279, 73.962],
    bestTime: "8:30 AM – 12:00 PM & 3:30 PM – 6:00 PM",
    duration: "1 hour",
    thingsToDo: [
      "Marvel at the majestic 17th-century Portuguese Baroque facade",
      "Inspect the gilded carved wooden high altar and painted ceiling",
      "Walk around the historic Holy Spirit Square lined with colonial mansions",
      "Visit the nearby historic Monte Hill Chapel for views of Margao city"
    ],
    visitorInfo: {
      timings: "7:00 AM – 6:30 PM daily",
      entryFee: "Free entry",
      parking: "Parking available along the church square perimeter",
      tips: "Combine with an architecture walk around the heritage houses of Margao."
    },
    nearby: ["Rachol Seminary", "Colva Beach", "Benaulim Beach"]
  },
  {
    id: "rachol-seminary",
    name: "Rachol Seminary & Rachol Fort Gate",
    taluka: "Salcete",
    region: "South Goa",
    category: "Heritage",
    categories: ["Heritage", "Churches", "Culture"],
    image: "iconic/rachol seminary and rachol fort gate.png",
    shortDesc: "Historic 16th-century fortress and prestigious Jesuit seminary where the first printing press of Goa and Bible translations were produced.",
    detailedDesc: "The Patriarchal Seminary of Rachol, established in 1574, was built on the site of an earlier Adil Shahi fort. It was a major center of learning in the East, housing Goa's first printing press and producing the iconic Christian Puranna in 1616. The fortress gate and ancient underground corridors still stand.",
    location: "Rachol, Salcete, South Goa",
    coordinates: [15.315, 73.995],
    bestTime: "9:00 AM – 1:00 PM & 3:00 PM – 5:00 PM",
    duration: "1.5 hours",
    thingsToDo: [
      "Walk through the historic archway of the 16th-century Rachol Fort",
      "Visit the Church of St. Ignatius Loyola inside the seminary complex",
      "View antique religious murals, portraits of archbishops, and rare manuscripts",
      "Admire the scenic Zuari River ferry crossing nearby"
    ],
    visitorInfo: {
      timings: "9:00 AM – 5:00 PM (Prior permission helpful for library archives)",
      entryFee: "Free entry",
      parking: "Free parking outside the seminary gateway",
      tips: "Quiet, peaceful countryside location along the Zuari riverbanks."
    },
    nearby: ["Holy Spirit Church Margao", "Palacio do Deao", "Shri Damodar Temple"]
  },
  {
    id: "varca-beach",
    name: "Varca Beach",
    taluka: "Salcete",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Family Places"],
    image: "iconic/varca beach.png",
    shortDesc: "Quiet luxury shoreline with immaculate white sand, wooden fishing boats, luxury beach resorts and calm clear water.",
    detailedDesc: "Varca Beach is renowned for its silky white sands and uncrowded, pristine coastline. Dotted with luxury five-star resorts, traditional wooden fishing boats (dhonis), and laid-back beach shacks, it offers an exclusive and tranquil seaside escape.",
    location: "Varca, Salcete, South Goa",
    coordinates: [15.228, 73.924],
    bestTime: "October to May (Peaceful daytime and sunset)",
    duration: "2–3 hours",
    thingsToDo: [
      "Relax on immaculate uncrowded white sands with luxury beach loungers",
      "Morning boat cruises for dolphin sightings with local fishermen",
      "Water skiing, speed boat rides and windsurfing",
      "Sunset dinners overlooking the tranquil ocean"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Parking available at Varca public beach access points",
      tips: "Excellent destination for honeymooners and travelers wanting peaceful luxury."
    },
    nearby: ["Benaulim Beach", "Cavelossim Beach", "Colva Beach"]
  },
  {
    id: "cavelossim-beach",
    name: "Cavelossim Beach & Sal Estuary",
    taluka: "Salcete",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Adventure", "Sunset Spots", "Nature & Wildlife"],
    image: "iconic/cavelossim beach and sal esturay.png",
    shortDesc: "Pristine white sand beach where black lava rocks meet the sea, plus scenic Sal River boat cruises and dolphin excursions.",
    detailedDesc: "Cavelossim Beach is tucked between the Arabian Sea and the scenic Sal River. Known for its stark contrast of black volcanic rocks against pristine white sands, gentle surf, and boat trips into the Sal River estuary for dolphin and bird watching, it is one of South Goa's most scenic destinations.",
    location: "Cavelossim, Salcete, South Goa",
    coordinates: [15.178, 73.942],
    bestTime: "October to April",
    duration: "2–3 hours",
    thingsToDo: [
      "Sal River boat safari for dolphin watching and bird spotting",
      "Parasailing, jet-skiing and speed boat rides",
      "Browse boutique craft, leather, and jewelry shops in Cavelossim town",
      "Fine dining at beachfront shacks and seafood grills"
    ],
    visitorInfo: {
      timings: "Open 24 hours (Water sports & cruises 8:30 AM – 5:30 PM)",
      entryFee: "Free entry",
      parking: "Dedicated beach parking area with paved pathway",
      tips: "Combine the beach visit with an afternoon boat cruise on the River Sal."
    },
    nearby: ["Varca Beach", "Cabo de Rama Fort", "Benaulim Beach"]
  },

  // -----------------------------------------------------------
  // 9. QUEPEM (SOUTH GOA)
  // -----------------------------------------------------------
  {
    id: "palacio-do-deao",
    name: "Palacio do Deao",
    taluka: "Quepem",
    region: "South Goa",
    category: "Heritage",
    categories: ["Heritage", "Culture", "Family Places"],
    image: "iconic/palacio do deao.png",
    shortDesc: "230-year-old historic mansion built by the founder of Quepem, featuring Portuguese-Hindu architecture, pleasure gardens and authentic cuisine.",
    detailedDesc: "Built in 1798 by Jose Paulo de Almeida (Dean of the church and founder of Quepem town), Palacio do Deao is a 230-year-old estate blending Portuguese and Hindu architecture. Overlooking the Kushavati River, it boasts lush pleasure gardens with belvederes, historic artifacts, and curated multi-course Goan-Portuguese meals.",
    location: "Quepem Town, Quepem, South Goa",
    coordinates: [15.221, 74.075],
    bestTime: "11:00 AM – 4:00 PM (Prior table reservation recommended for lunch)",
    duration: "2 hours",
    thingsToDo: [
      "Guided walk through the restored mansion, antique library and bedrooms",
      "Stroll the historic garden with stone belvederes, ponds and riverfront",
      "Enjoy an authentic 5-course Goan-Portuguese lunch prepared by the hosts",
      "Learn the history of the founding of Quepem town"
    ],
    visitorInfo: {
      timings: "10:00 AM – 5:00 PM daily (Prior booking required for dining)",
      entryFee: "₹150 for tour; Lunch charged separately",
      parking: "Parking available on property grounds",
      tips: "Book your lunch slot a few days in advance as seating is limited."
    },
    nearby: ["Chandreshwar Bhootnath Temple", "Rivona Caves", "Shri Damodar Temple"]
  },
  {
    id: "chandreshwar-bhootnath",
    name: "Chandreshwar Bhootnath Temple (Paroda Hill)",
    taluka: "Quepem",
    region: "South Goa",
    category: "Temples",
    categories: ["Temples", "Heritage", "Sunset Spots", "Nature & Wildlife"],
    image: "iconic/chandreshwar bhoothnath temple.png",
    shortDesc: "Ancient Bhoja-era hilltop temple perched 350 meters high on Chandranath Hill, with ancient Shiva linga and 360° views across South Goa.",
    detailedDesc: "Dating back to the ancient Bhoja dynasty (4th to 8th century AD), this temple sits atop the 350-meter-high Chandranath Hill near Paroda. The sanctum holds a Shiva linga carved from rock that is said to glow with moonlight during the full moon. The hilltop provides panoramic views of Salcete and Quepem.",
    location: "Paroda Hill, Quepem, South Goa",
    coordinates: [15.208, 74.038],
    bestTime: "Early morning (sunrise) or late afternoon (4:00 PM – 6:30 PM)",
    duration: "1.5–2 hours",
    thingsToDo: [
      "Drive or hike the scenic winding hill road through teak and cashew forests",
      "Offer prayers at the ancient Shiva shrine of the Lord of the Moon",
      "Take in 360-degree panoramic views of South Goa's coastline and valley",
      "Visit the adjacent historic Bhootnath shrine"
    ],
    visitorInfo: {
      timings: "6:30 AM – 7:30 PM daily",
      entryFee: "Free entry",
      parking: "Parking lot available at the hilltop temple gate",
      tips: "Sunset from the hilltop is one of South Goa's most magnificent vistas."
    },
    nearby: ["Palacio do Deao", "Rivona Caves", "Margao"]
  },
  {
    id: "rivona-caves",
    name: "Rivona Buddhist Caves",
    taluka: "Quepem",
    region: "South Goa",
    category: "Heritage",
    categories: ["Heritage", "Culture"],
    image: "iconic/rivona buddhist caves.png",
    shortDesc: "6th-century rock-cut Buddhist caves carved out of laterite stone, featuring a stepped freshwater spring and meditation pitha.",
    detailedDesc: "The Rivona Caves (also called Pandava Caves of Rivona) are 6th-century rock-cut laterite caves associated with early Buddhist monks in Goa. The site includes a stepped well, a meditation seat (pitha), and two tiers of carved stone chambers amidst peaceful tamarind and banyan trees.",
    location: "Rivona, Quepem, South Goa",
    coordinates: [15.178, 74.112],
    bestTime: "9:00 AM – 5:00 PM",
    duration: "45 mins – 1 hour",
    thingsToDo: [
      "Examine the 1,500-year-old rock-hewn meditation chambers",
      "See the stepped natural spring water tank inside the rock",
      "Discover the ancient Buddhist heritage of coastal and hinterland Goa",
      "Photograph the peaceful rural landscape of Rivona village"
    ],
    visitorInfo: {
      timings: "Open daylight hours 8:00 AM – 6:00 PM",
      entryFee: "Free entry (ASI monument)",
      parking: "Roadside village parking near the cave path",
      tips: "Combine with a visit to the nearby Usgalimal rock carvings."
    },
    nearby: ["Palacio do Deao", "Chandreshwar Temple", "Usgalimal Rock Art"]
  },
  {
    id: "damodar-temple-zambaulim",
    name: "Shri Damodar Temple, Zambaulim",
    taluka: "Quepem",
    region: "South Goa",
    category: "Temples",
    categories: ["Temples", "Heritage", "Culture"],
    image: "iconic/shri damodar temple zambaulim.png",
    shortDesc: "Beloved temple of Lord Damodar on the banks of the sacred Kushavati River, famous for the grand Shigmo Gulal festival.",
    detailedDesc: "Revered by both Hindus and Christians across Goa, Shri Damodar Temple was relocated from Margao to the serene banks of the Kushavati River in 1565. The river water is believed to hold medicinal healing properties. The temple is famous for its Shigmotsov Gulal festival.",
    location: "Zambaulim, Quepem, South Goa",
    coordinates: [15.195, 74.128],
    bestTime: "8:00 AM – 12:30 PM & 4:00 PM – 8:00 PM",
    duration: "1 hour",
    thingsToDo: [
      "Offer prayers to Lord Damodar (an incarnation of Shiva)",
      "Dip hands in the sacred Kushavati River flowing alongside the temple",
      "Admire the traditional Goan temple architecture and brass fixtures",
      "Experience the peaceful spiritual energy of the forested river valley"
    ],
    visitorInfo: {
      timings: "6:00 AM – 8:30 PM daily",
      entryFee: "Free entry",
      parking: "Spacious temple parking lot",
      tips: "Respectful dress code required inside the main prayer hall."
    },
    nearby: ["Rivona Caves", "Palacio do Deao", "Salaulim Dam"]
  },
  {
    id: "mainapi-waterfall",
    name: "Mainapi Waterfall (Kuske Valley)",
    taluka: "Quepem",
    region: "South Goa",
    category: "Waterfalls",
    categories: ["Waterfalls", "Nature & Wildlife", "Adventure"],
    image: "iconic/mainipai waterfall.png",
    shortDesc: "Untamed multi-tiered jungle waterfall hidden in the Netravali-Quepem border, reached through a lush 4 km forest trek.",
    detailedDesc: "Mainapi Waterfall is one of South Goa's most pristine hidden cascades. Located in the forested hills bordering Quepem and Sanguem, this dramatic waterfall drops into a crystal-clear blue pool surrounded by untouched Western Ghats flora.",
    location: "Kuske / Netravali border, Quepem, South Goa",
    coordinates: [15.115, 74.218],
    bestTime: "July to December (Peak flow post-monsoon)",
    duration: "4–5 hours (including trek)",
    thingsToDo: [
      "Trek through lush forest paths and cross natural streams",
      "Swim in the pristine natural freshwater plunge pool",
      "Spot vibrant jungle butterflies, tree frogs and forest birds",
      "Experience untouched wilderness away from commercial crowds"
    ],
    visitorInfo: {
      timings: "Best started before 10:30 AM; exit before 5:00 PM",
      entryFee: "Forest entry fee (₹50–₹100)",
      parking: "Parking at the base village / forest checkpoint",
      tips: "Hire a local guide from the village. Wear trekking shoes with strong grip."
    },
    nearby: ["Savari Waterfalls", "Netravali Lake", "Palacio do Deao"]
  },

  // -----------------------------------------------------------
  // 10. CANACONA (SOUTH GOA)
  // -----------------------------------------------------------
  {
    id: "palolem-beach",
    name: "Palolem Beach",
    taluka: "Canacona",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Adventure", "Family Places"],
    image: "iconic/palolem.png",
    shortDesc: "World-famous crescent-shaped paradise with calm turquoise waters, colorful beach huts, sea kayaking and scenic Monkey Island.",
    detailedDesc: "Palolem Beach is universally regarded as one of Goa's most idyllic beaches. Shaped like a gentle crescent and framed by headlands with leaning coconut palms, its calm, sheltered waters are ideal for swimming, sea kayaking to Monkey Island, and watching dolphin pods at sunrise.",
    location: "Palolem, Canacona, South Goa",
    coordinates: [15.01, 74.023],
    bestTime: "October to April (Full day or afternoon into sunset)",
    duration: "3–5 hours",
    thingsToDo: [
      "Rent a sea kayak and paddle out to Monkey Island or Butterfly Beach",
      "Early morning boat trips for close-up dolphin sightings",
      "Safe and calm ocean swimming in the sheltered bay",
      "Experience the famous silent headphone parties (Silent Noise) on weekends"
    ],
    visitorInfo: {
      timings: "Open 24 hours (Water sports & kayaks 8:00 AM – 6:00 PM)",
      entryFee: "Free entry",
      parking: "Paid public parking lots near Palolem main street",
      tips: "The southern end of the beach is especially calm and family-friendly."
    },
    nearby: ["Agonda Beach", "Butterfly Beach", "Patnem Beach"]
  },
  {
    id: "agonda-beach",
    name: "Agonda Beach",
    taluka: "Canacona",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Nature & Wildlife"],
    image: "iconic/agonda.png",
    shortDesc: "Pristine, wide 3 km white-sand beach known as a sanctuary for Olive Ridley turtles, wellness retreats and peaceful sunsets.",
    detailedDesc: "Consistently ranked among Asia's best beaches by TripAdvisor, Agonda is a 3-kilometer stretch of pristine white sand where peace and quiet reign. As an official Olive Ridley turtle nesting sanctuary, motorized water sports and loud music are prohibited, preserving its serene natural charm.",
    location: "Agonda, Canacona, South Goa",
    coordinates: [15.0456, 73.9878],
    bestTime: "November to March (Ideal for relaxing day or sunset stroll)",
    duration: "2–4 hours",
    thingsToDo: [
      "Unwind on long, peaceful walks along the 3-kilometer quiet shoreline",
      "Visit the turtle nesting conservation site at the northern end",
      "Attend yoga and sound meditation sessions at beachside shala",
      "Dine on fresh seafood and healthy smoothie bowls at bohemian cafes"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Roadside and designated parking areas along Agonda beach road",
      tips: "No motorized water sports allowed, guaranteeing absolute peacefulness."
    },
    nearby: ["Palolem Beach", "Cabo de Rama Fort", "Cola Beach"]
  },
  {
    id: "butterfly-beach",
    name: "Butterfly Beach",
    taluka: "Canacona",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Nature & Wildlife", "Adventure", "Sunset Spots"],
    image: "iconic/butterfly beach.png",
    shortDesc: "Secluded butterfly-shaped cove surrounded by dense forest cliffs, accessible by boat or jungle hike, famous for dolphins and seclusion.",
    detailedDesc: "Named for its unique semi-circular butterfly shape and the millions of colorful butterflies that inhabit the surrounding forest, Butterfly Beach is a hidden jewel. Accessible only via boat from Palolem or Agonda or an adventurous 2-hour jungle trek, it boasts crystal-clear waters and playful dolphins.",
    location: "Near Palolem, Canacona, South Goa",
    coordinates: [15.029, 74.004],
    bestTime: "October to April (Morning or late afternoon via boat)",
    duration: "2–3 hours",
    thingsToDo: [
      "Scenic 15-minute boat ride from Palolem with dolphin sightings along the cliffs",
      "Swim in the pristine, crystal-clear turquoise waters of the cove",
      "Spot colorful butterflies and sea anemones on the rocks",
      "Climb the headland rocks for a panoramic photo of the butterfly cove"
    ],
    visitorInfo: {
      timings: "Daylight hours (8:00 AM – 5:30 PM)",
      entryFee: "Free entry; Boat ride from Palolem/Agonda costs ₹1,000–₹1,500 per boat",
      parking: "Park at Palolem or Agonda and take a boat",
      tips: "No commercial shacks on the beach; bring your own drinking water and snacks."
    },
    nearby: ["Palolem Beach", "Agonda Beach", "Patnem Beach"]
  },
  {
    id: "cabo-de-rama-fort",
    name: "Cabo de Rama Fort & Beach",
    taluka: "Canacona",
    region: "South Goa",
    category: "Forts",
    categories: ["Forts", "Heritage", "Sunset Spots", "Beaches"],
    image: "iconic/cabo.png",
    shortDesc: "Massive cliffside fortress where Lord Rama is said to have stayed during exile, offering dramatic 180° views of the Arabian Sea.",
    detailedDesc: "Spread across 379 acres on a rugged cliff promontory, Cabo de Rama is one of the oldest forts in Goa, pre-dating Portuguese arrival. Named after Lord Rama, who according to legend took shelter here with Sita during his 14-year exile, its ramparts offer sweeping views of the turquoise Arabian Sea and the secluded Cabo de Rama Beach below.",
    location: "Cabo de Rama, Canacona, South Goa",
    coordinates: [15.0917, 73.9214],
    bestTime: "4:00 PM – 6:30 PM for spectacular sunset vistas",
    duration: "2 hours",
    thingsToDo: [
      "Walk the ancient stone ramparts and examine rusted Portuguese cannons",
      "Visit the 18th-century whitewashed Church of St. Anthony inside the fort",
      "Take in the breathtaking 180-degree panoramic ocean views from the cliff edge",
      "Hike down the palm-lined path to the pristine Cabo de Rama beach below"
    ],
    visitorInfo: {
      timings: "9:00 AM – 6:00 PM daily",
      entryFee: "Free entry",
      parking: "Open parking ground outside the main moat bridge",
      tips: "Sunset from Cabo de Rama is considered by many as the single best in Goa."
    },
    nearby: ["Cola Beach", "Agonda Beach", "Cavelossim Beach"]
  },
  {
    id: "cola-beach",
    name: "Cola Beach & Blue Lagoon",
    taluka: "Canacona",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Nature & Wildlife", "Sunset Spots"],
    image: "iconic/cola beach and blue lagoon.png",
    shortDesc: "Stunning hidden beach featuring a natural emerald freshwater lagoon separated from the crashing sea by a narrow sandbar.",
    detailedDesc: "Cola Beach is one of South Goa's most exotic landscapes. Tucked beneath steep volcanic cliffs, it features an emerald-green freshwater lagoon that flows parallel to the sea, separated only by a golden sandbank. Visitors can kayak in calm freshwater or swim in the ocean waves.",
    location: "Cola, Canacona, South Goa",
    coordinates: [15.059, 73.967],
    bestTime: "October to April (Daytime or sunset)",
    duration: "2–4 hours",
    thingsToDo: [
      "Kayak in the calm, emerald freshwater lagoon",
      "Swim in both fresh and saltwater within steps of each other",
      "Relax in secluded luxury Rajasthani tents on the beach",
      "Enjoy cliffside refreshments overlooking the double-water landscape"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry (Kayak rentals ₹200–₹300)",
      parking: "Cliff-top parking; 10-minute walk down dirt steps to the beach",
      tips: "The dirt trail from the main road is unpaved; drive slowly."
    },
    nearby: ["Agonda Beach", "Cabo de Rama Fort", "Palolem Beach"]
  },
  {
    id: "cotigao-wildlife-sanctuary",
    name: "Cotigao Wildlife Sanctuary",
    taluka: "Canacona",
    region: "South Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Adventure", "Family Places"],
    image: "iconic/cotigao wildlife santuary.png",
    shortDesc: "Dense 86 sq km multi-tier rainforest with a famous 25-meter treetop watchtower overlooking a jungle watering hole.",
    detailedDesc: "Established in 1968, Cotigao Wildlife Sanctuary protects 86 square kilometers of dense semi-evergreen and moist deciduous forest where tall tree canopies reach up to 30 meters high. A highlight is the 25-meter-high treetop watchtower overlooking a forest waterhole frequented by flying lizards, leopards, and four-horned antelopes.",
    location: "Poinguinim, Canacona, South Goa",
    coordinates: [14.996, 74.148],
    bestTime: "October to March (Early morning 7:00 AM – 10:00 AM)",
    duration: "3 hours",
    thingsToDo: [
      "Climb the 25-meter wooden ladder to the canopy watchtower overlooking the waterhole",
      "Hike designated 3 km to 8 km nature trails through virgin forest",
      "Visit the Nature Interpretation Centre at the entrance",
      "Spot the Draco (flying lizard), Malabar trogon and giant squirrels"
    ],
    visitorInfo: {
      timings: "7:00 AM – 5:30 PM daily",
      entryFee: "₹50 for adults, ₹25 for children, vehicle fees extra",
      parking: "Parking available at the forest gate and watchtower trailhead",
      tips: "Early morning visits are essential for spotting wildlife and avoiding heat."
    },
    nearby: ["Galgibaga Beach", "Palolem Beach", "Patnem Beach"]
  },
  {
    id: "galgibaga-beach",
    name: "Galgibaga Turtle Beach",
    taluka: "Canacona",
    region: "South Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Beaches", "Sunset Spots"],
    image: "iconic/galgibag turtle beach.png",
    shortDesc: "One of Goa's cleanest and most secluded beaches, strictly protected as a primary nesting ground for Olive Ridley turtles.",
    detailedDesc: "Galgibaga Beach, located south of Talpona River, is celebrated as one of the cleanest and least developed coastal stretches in all of India. Guarded by the forest department as a major Olive Ridley turtle nesting site, it is bordered by whispering casuarina pine trees and crystal-clear waters.",
    location: "Galgibaga, Canacona, South Goa",
    coordinates: [14.966, 74.048],
    bestTime: "November to April (Nesting season Nov–March)",
    duration: "2 hours",
    thingsToDo: [
      "Experience pristine solitude on an untouched 1.5 km shoreline",
      "Visit the Olive Ridley turtle conservation hatchery",
      "Dine on fresh oysters and grilled seafood at rustic local shacks near the river",
      "Photography of casuarina pine groves and pristine sand dunes"
    ],
    visitorInfo: {
      timings: "Open 24 hours (Hatchery zone restricted)",
      entryFee: "Free entry",
      parking: "Open parking under pine trees near the southern approach",
      tips: "Strict zero-litter policy; no commercial night parties or bright lights allowed."
    },
    nearby: ["Cotigao Wildlife Sanctuary", "Palolem Beach", "Patnem Beach"]
  },
  {
    id: "patnem-beach",
    name: "Patnem Beach",
    taluka: "Canacona",
    region: "South Goa",
    category: "Beaches",
    categories: ["Beaches", "Sunset Spots", "Family Places"],
    image: "iconic/patnem beach.png",
    shortDesc: "A relaxed, low-key neighbor to Palolem with soft sands, safe swimming, yoga shalas and beachfront seafood restaurants.",
    detailedDesc: "Just 1 km south of Palolem, Patnem Beach offers all of the scenic beauty of its famous neighbor with a much calmer, quieter vibe. Perfect for travelers seeking a balance between delicious beach dining and uninterrupted relaxation with a book on a sunbed.",
    location: "Patnem, Canacona, South Goa",
    coordinates: [15.003, 74.032],
    bestTime: "October to April",
    duration: "2–3 hours",
    thingsToDo: [
      "Relax on quiet sunbeds with fresh tropical juice or coconut water",
      "Safe swimming in gentle waves suitable for all ages",
      "Attend drop-in yoga and wellness classes along the beach",
      "Enjoy beachfront dining with acoustic music at sunset"
    ],
    visitorInfo: {
      timings: "Open 24 hours",
      entryFee: "Free entry",
      parking: "Parking available at the entrance of Patnem beach road",
      tips: "A 10-minute walk along the rocky headland connects Patnem directly to Palolem."
    },
    nearby: ["Palolem Beach", "Butterfly Beach", "Galgibaga Beach"]
  },

  // -----------------------------------------------------------
  // 11. SANGUEM (SOUTH GOA)
  // -----------------------------------------------------------
  {
    id: "salaulim-dam",
    name: "Salaulim Dam & Botanical Garden",
    taluka: "Sanguem",
    region: "South Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Family Places"],
    image: "iconic/selaulim dam and botanical garden.png",
    shortDesc: "Architectural wonder featuring a unique duckbill spillway where water cascades into a misty 140-foot abyss, set in sprawling gardens.",
    detailedDesc: "The Salaulim Dam, built across the Salaulim River, is famous for its unique semi-circular 'duckbill' spillway. During monsoon and post-monsoon months, overflow water drops into a dramatic 140-foot vortex creating a mist cloud. The surrounding botanical garden is inspired by Mysore's Brindavan Gardens.",
    location: "Sirvoi, Sanguem, South Goa",
    coordinates: [15.225, 74.186],
    bestTime: "July to December (Spillway overflow is most dramatic in monsoon)",
    duration: "2–3 hours",
    thingsToDo: [
      "Witness the mesmerizing water vortex at the duckbill spillway",
      "Walk the vast botanical gardens with manicured lawns and fountains",
      "Climb the observation tower for a panoramic view of the vast reservoir",
      "Picnic with family in shaded groves overlooking the lake"
    ],
    visitorInfo: {
      timings: "9:00 AM – 5:30 PM daily",
      entryFee: "₹30 for adults, ₹15 for children",
      parking: "Spacious dedicated parking area at the main entrance",
      tips: "Monsoon and post-monsoon (July–Nov) provide the most spectacular spillway views."
    },
    nearby: ["Tambdi Surla Temple", "Netravali Lake", "Damodar Temple"]
  },
  {
    id: "tambdi-surla-temple",
    name: "Tambdi Surla Mahadev Temple (12th Century)",
    taluka: "Sanguem",
    region: "South Goa",
    category: "Temples",
    categories: ["Temples", "Heritage", "Nature & Wildlife"],
    image: "iconic/tambdi surla.png",
    shortDesc: "Goa's oldest standing temple, carved from weather-resistant black basalt stone in 12th-century Kadamba-Yadava style inside dense forest.",
    detailedDesc: "Dedicated to Lord Shiva, the Mahadev Temple at Tambdi Surla was constructed in the 12th century by the Kadamba Queen Kamladevi. Survived untouched through centuries because of its remote forest location at the base of the Anmod Ghat, it is carved entirely from weather-resistant black basalt rock with intricate lotus motifs and relief carvings.",
    location: "Tambdi Surla, Sanguem, South Goa",
    coordinates: [15.4397, 74.2542],
    bestTime: "8:30 AM – 5:00 PM (Year-round; surrounded by lush green nature)",
    duration: "1.5–2 hours",
    thingsToDo: [
      "Marvel at the 900-year-old intricately carved basalt stone mandapa and lingam",
      "Inspect the headless Nandi bull statue in the central pillared pavilion",
      "Trek the 90-minute scenic nature trail to Tambdi Surla Waterfall nearby",
      "Dip your feet in the crystal-clear Surla river stream behind the temple"
    ],
    visitorInfo: {
      timings: "7:30 AM – 5:30 PM daily",
      entryFee: "Free entry (ASI protected national monument)",
      parking: "Free parking space at the garden entry",
      tips: "Combine with the Tambdi Surla waterfall nature trek if arriving in the morning."
    },
    nearby: ["Dudhsagar Falls", "Bhagwan Mahaveer Sanctuary", "Salaulim Dam"]
  },
  {
    id: "netravali-bubbling-lake",
    name: "Netravali Bubbling Lake (Budbudyanchi Tali)",
    taluka: "Sanguem",
    region: "South Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Temples", "Culture"],
    image: "iconic/netravali bubbling lake.png",
    shortDesc: "Mysterious sacred stepwell pond where methane bubbles continuously rise to the surface and accelerate when you clap your hands.",
    detailedDesc: "Located in the quiet village of Netravali, this ancient laterite stepped tank sits adjacent to the Gopinath Temple. The water continuously produces mysterious, rhythmic bubbles from underwater springs—an acoustic and geochemical phenomenon where clapping hands causes the bubbles to rise even faster.",
    location: "Netravali, Sanguem, South Goa",
    coordinates: [15.105, 74.218],
    bestTime: "9:00 AM – 5:00 PM daily",
    duration: "1 hour",
    thingsToDo: [
      "Clap your hands along the edge of the pond and watch the bubbles accelerate",
      "Visit the adjacent historic 14th-century Gopinath Temple",
      "Sit peacefully by the ancient stepped laterite banks surrounded by palm trees",
      "Explore spice and organic fruit farms in Netravali village"
    ],
    visitorInfo: {
      timings: "7:00 AM – 6:30 PM daily",
      entryFee: "Free entry",
      parking: "Village parking space available outside the temple arch",
      tips: "A unique natural curiosity that delights children and adults alike."
    },
    nearby: ["Savari Waterfalls", "Netravali Wildlife Sanctuary", "Salaulim Dam"]
  },
  {
    id: "savari-waterfalls",
    name: "Savari Waterfalls, Netravali",
    taluka: "Sanguem",
    region: "South Goa",
    category: "Waterfalls",
    categories: ["Waterfalls", "Nature & Wildlife", "Adventure"],
    image: "iconic/savari waterfall.png",
    shortDesc: "Majestic twin waterfalls deep inside Netravali Wildlife Sanctuary, featuring a suspension bridge walk and refreshing pool.",
    detailedDesc: "Savari Waterfall is a stunning twin-cascade waterfall located inside Netravali Wildlife Sanctuary. Reached via a picturesque forest hike that includes crossing a thrilling hanging suspension bridge and trekking through dense jungle, the fall drops into a crystal-clear natural pool perfect for swimming.",
    location: "Netravali Wildlife Sanctuary, Sanguem, South Goa",
    coordinates: [15.092, 74.241],
    bestTime: "July to January",
    duration: "3–4 hours (including trek)",
    thingsToDo: [
      "Walk across the thrilling jungle suspension bridge above the river",
      "Trek through lush evergreen canopy accompanied by forest sounds",
      "Swim in the refreshing, clean mountain water pool beneath the falls",
      "Photography of pristine twin streams cascading over black rock"
    ],
    visitorInfo: {
      timings: "8:30 AM – 4:30 PM daily",
      entryFee: "₹100 per person forest sanctuary permit",
      parking: "Parking at the Netravali forest checkpoint",
      tips: "Requires a 3 km forest walk; wear trekking sandals or shoes."
    },
    nearby: ["Netravali Bubbling Lake", "Mainapi Waterfall", "Salaulim Dam"]
  },
  {
    id: "netravali-wildlife-sanctuary",
    name: "Netravali Wildlife Sanctuary",
    taluka: "Sanguem",
    region: "South Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Adventure"],
    image: "iconic/netravali wildlife santuary.png",
    shortDesc: "Sprawling 211 sq km protected sanctuary vital for tiger corridors, medicinal plant reserves, waterfalls and giant squirrels.",
    detailedDesc: "Netravali Wildlife Sanctuary encompasses 211 square kilometers of pristine Western Ghats forest. Linking Bhagwan Mahaveer Sanctuary to Cotigao, it serves as a critical habitat for leopards, black panthers, giant flying squirrels, and the Great Pied Hornbill while protecting pristine river sources.",
    location: "Netravali, Sanguem, South Goa",
    coordinates: [15.08, 74.23],
    bestTime: "October to March (Winter months for comfortable trekking)",
    duration: "3–4 hours",
    thingsToDo: [
      "Guided wildlife and botanical treks along Sahyadri ridge trails",
      "Visit spectacular hidden waterfalls including Savari and Mainapi",
      "Spot the Malabar Giant Squirrel leaping through high tree canopies",
      "Discover rare orchids and medicinal flora"
    ],
    visitorInfo: {
      timings: "8:00 AM – 5:00 PM daily",
      entryFee: "₹100 forest entry fee",
      parking: "Sanctuary gate parking area",
      tips: "Enlist an authorized forest eco-guide for safe and informative trekking."
    },
    nearby: ["Savari Waterfalls", "Netravali Bubbling Lake", "Salaulim Dam"]
  },

  // -----------------------------------------------------------
  // 12. DHARBANDORA (SOUTH GOA)
  // -----------------------------------------------------------
  {
    id: "dudhsagar-falls",
    name: "Dudhsagar Waterfalls",
    taluka: "Dharbandora",
    region: "South Goa",
    category: "Waterfalls",
    categories: ["Waterfalls", "Adventure", "Nature & Wildlife"],
    image: "iconic/dudhsagar.png",
    shortDesc: "One of India's tallest four-tiered waterfalls (310m), resembling a sea of milk cascading down the Western Ghats with a railway bridge across.",
    detailedDesc: "Dudhsagar ('Sea of Milk') is India's fifth tallest waterfall, plunging 310 meters (1,017 feet) down the sheer granite cliffs of the Western Ghats inside Bhagwan Mahaveer Wildlife Sanctuary. Famous for the railway bridge that passes right across the center of the falls and the exhilarating 4x4 jeep safari through forest rivers, it is Goa's crown inland attraction.",
    location: "Sonaulim, Dharbandora, South Goa",
    coordinates: [15.3144, 74.3144],
    bestTime: "October to May (Jeep safaris open Oct–May; most dramatic flow post-monsoon)",
    duration: "4–6 hours (Half-day excursion)",
    thingsToDo: [
      "Exhilarating 45-minute 4x4 jeep safari crossing jungle rivers and streams",
      "Swim in the massive, deep natural plunge pool with mandatory life jackets",
      "Watch trains cross the railway viaduct directly through the misty waterfall spray",
      "Feed the friendly wild monkeys along the rocky forest pool path"
    ],
    visitorInfo: {
      timings: "Jeep booking counter at Kulem opens 6:00 AM – 2:00 PM",
      entryFee: "Jeep safari package (approx ₹3,500 per 7-seater jeep) + forest entry & life jacket fees",
      parking: "Large parking lot at Kulem Jeep Safari Association base",
      tips: "Book your jeep slot online or arrive early at Kulem by 7:00 AM to avoid long queues."
    },
    nearby: ["Mollem National Park", "Tambdi Surla Temple", "Bhagwan Mahaveer Sanctuary"]
  },
  {
    id: "bhagwan-mahaveer-sanctuary",
    name: "Bhagwan Mahaveer Wildlife Sanctuary",
    taluka: "Dharbandora",
    region: "South Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Adventure"],
    image: "iconic/bhagwan mahavir wildlife santuary.png",
    shortDesc: "Goa's largest wildlife sanctuary (240 sq km) protecting pristine Sahyadri forests, leopards, barking deer, and historic trails.",
    detailedDesc: "Encompassing 240 square kilometers along the eastern border of Goa, Bhagwan Mahaveer Wildlife Sanctuary is the state's largest protected nature reserve. It contains virgin tropical evergreen forests, ancient Kadamba temples, Dudhsagar Falls, and healthy populations of gaurs (Indian bison), leopards, cobras, and hornbills.",
    location: "Mollem, Dharbandora, South Goa",
    coordinates: [15.366, 74.25],
    bestTime: "October to March",
    duration: "3–4 hours",
    thingsToDo: [
      "Wildlife safaris through pristine deciduous and semi-evergreen forests",
      "Birdwatching for over 120 species including emerald doves and fairy bluebirds",
      "Visit the famous Devil's Canyon canyon and gorge",
      "Trek to Tambdi Surla waterfall and ancient temple"
    ],
    visitorInfo: {
      timings: "8:00 AM – 5:30 PM daily",
      entryFee: "₹50 for adults, ₹20 for children",
      parking: "Forest department office in Mollem",
      tips: "Forest permits are obtained at the Mollem checkpost."
    },
    nearby: ["Dudhsagar Falls", "Mollem National Park", "Tambdi Surla Temple"]
  },
  {
    id: "mollem-national-park",
    name: "Mollem National Park & Devil's Canyon",
    taluka: "Dharbandora",
    region: "South Goa",
    category: "Nature & Wildlife",
    categories: ["Nature & Wildlife", "Adventure"],
    image: "iconic/Mollem national park and devils canyon.png",
    shortDesc: "107 sq km core national park featuring the mysterious Devil's Canyon (Devcharacho Kund), dense canopy and trekking trails.",
    detailedDesc: "The core 107 sq km area of Bhagwan Mahaveer Sanctuary was designated as Mollem National Park in 1978. A highlight within the park is Devil's Canyon, an eerie, picturesque river gorge where the Khandepar River carves deeply through underwater rock crevices and caverns.",
    location: "Mollem, Dharbandora, South Goa",
    coordinates: [15.378, 74.238],
    bestTime: "October to April",
    duration: "3 hours",
    thingsToDo: [
      "Hike to the scenic Devil's Canyon gorge and rock formations",
      "Spot the state animal of Goa, the majestic Gaur (Indian Bison)",
      "Explore quiet forest streams and canopy nature trails",
      "Visit the Nature Education Centre in Mollem"
    ],
    visitorInfo: {
      timings: "8:30 AM – 5:00 PM daily",
      entryFee: "₹50 entry fee",
      parking: "Mollem forest department parking",
      tips: "Devil's Canyon has strong underwater currents; swimming is strictly forbidden there."
    },
    nearby: ["Dudhsagar Falls", "Tambdi Surla Temple", "Bhagwan Mahaveer Sanctuary"]
  },
  {
    id: "usgalimal-rock-art",
    name: "Usgalimal Prehistoric Rock Art (Petroglyphs)",
    taluka: "Dharbandora",
    region: "South Goa",
    category: "Heritage",
    categories: ["Heritage", "Culture"],
    image: "iconic/usgalmail prehistoric rock art.png",
    shortDesc: "Astonishing 10,000-year-old Upper Paleolithic rock carvings discovered on the Kushavati riverbed, depicting bulls, deer and spirals.",
    detailedDesc: "Discovered in 1993 on a laterite plateau along the banks of the Kushavati River, the Usgalimal petroglyphs are among the most important prehistoric rock art sites in South Asia. Over 100 distinct engravings dating back to 8,000–10,000 BC depict bulls, labyrinth spirals, deer, mother goddesses, and hunting symbols.",
    location: "Usgalimal, Kushavati Riverbank, Dharbandora, South Goa",
    coordinates: [15.215, 74.156],
    bestTime: "November to May (When river water level is low to see all carvings)",
    duration: "1.5 hours",
    thingsToDo: [
      "Observe the 10,000-year-old petroglyphs carved into the laterite riverbed",
      "Examine the giant labyrinth spiral and prehistoric animal engravings",
      "Walk along the serene Kushavati River bank surrounded by nature",
      "Learn about Stone Age human settlements in the Indian subcontinent"
    ],
    visitorInfo: {
      timings: "9:00 AM – 5:30 PM daily",
      entryFee: "Free entry (ASI protected monument)",
      parking: "Open parking space at the village trail entry",
      tips: "During peak monsoon the carvings are submerged; best visited Nov–May."
    },
    nearby: ["Rivona Caves", "Salaulim Dam", "Damodar Temple"]
  }
];

/* ============ ATTRACTIONS STATE ============ */
let activeRegionTab = "all";
let currentSelectedTaluka = null; // null = Step 1 (Talukas View), string = Step 2 (Selected Taluka Places View)
let activeCategoryFilter = "all";
let currentSearchTerm = "";
let leafletMapInstance = null;
let mapMarkersGroup = null;

/* Safe image URL helper with SVG fallback */
function getAttractionImg(place) {
  return place.image || "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80";
}

/* ============ STEP 1: RENDER TALUKAS GRID ============ */
function renderTalukasGrid() {
  const container = document.getElementById("talukasGrid");
  if (!container) return;

  const filteredTalukas = activeRegionTab === "all"
    ? TALUKAS_DATA
    : TALUKAS_DATA.filter(t => t.region === activeRegionTab);

  container.innerHTML = filteredTalukas.map(t => {
    const placeCount = ATTRACTIONS_DATA.filter(p => p.taluka.toLowerCase() === t.name.toLowerCase()).length;
    const isNorth = t.region === "North Goa";

    return `
      <div
        class="taluka-card"
        data-taluka="${t.name}"
        tabindex="0"
        role="button"
        aria-label="Explore ${t.name} taluka, ${placeCount} places"
      >
        <div class="taluka-card-top">
          <span class="taluka-region-badge ${isNorth ? 'north' : 'south'}">${isNorth ? 'North Goa' : 'South Goa'}</span>
          <span class="taluka-card-icon">${t.icon}</span>
        </div>
        <div class="taluka-card-name">${t.name}</div>
        <div class="taluka-card-highlight">${t.highlight}</div>
        <div class="taluka-card-foot">
          <span class="taluka-card-count">${placeCount} Places</span>
          <span class="taluka-card-action">Explore Places →</span>
        </div>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".taluka-card").forEach(card => {
    card.addEventListener("click", () => {
      selectTaluka(card.dataset.taluka);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectTaluka(card.dataset.taluka);
      }
    });
  });
}

/* ============ STEP 1: TOP FEATURED SHOWCASE ============ */
function renderFeaturedAttractions() {
  const container = document.getElementById("featuredAttractionsList");
  if (!container) return;

  const featuredPlaces = FEATURED_ATTRACTIONS_IDS
    .map(id => ATTRACTIONS_DATA.find(p => p.id === id))
    .filter(Boolean);

  container.innerHTML = featuredPlaces.map(p => `
    <div class="featured-card" data-attr-id="${p.id}" data-taluka="${p.taluka}" tabindex="0" role="button" aria-label="View ${p.name}">
      <img
        class="featured-card-img"
        src="${getAttractionImg(p)}"
        alt="${p.name}"
        loading="lazy"
        decoding="async"
        onerror="this.src='https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80'"
      >
      <div class="featured-card-gradient"></div>
      <div class="featured-card-top-tags">
        <span class="featured-tag cat">${p.category}</span>
        <span class="featured-tag taluka">${p.taluka}</span>
      </div>
      <div class="featured-card-content">
        <h4>${p.name}</h4>
        <p>${p.shortDesc}</p>
        <span class="featured-card-cta">Explore Details →</span>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".featured-card").forEach(card => {
  card.addEventListener("click", () => {
  const placeId = card.dataset.attrId;

  // Only open place details.
  // Do NOT switch the Taluka view.
  openAttractionDetails(placeId);
});

    card.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    const placeId = card.dataset.attrId;

    // Only open place details.
    openAttractionDetails(placeId);
  }
});
  });
}

/* ============ STEP 2: TALUKA VIEW SWITCHER ============ */
function selectTaluka(talukaName, autoScroll = true) {
  currentSelectedTaluka = talukaName;

  const talukaObj = TALUKAS_DATA.find(t => t.name.toLowerCase() === talukaName.toLowerCase()) || TALUKAS_DATA[0];

  const talukasView = document.getElementById("attractionsTalukasView");
  const placesView = document.getElementById("attractionsPlacesView");

  if (talukasView) talukasView.hidden = true;
  if (placesView) placesView.hidden = false;

  // Update Breadcrumb & Header Info
  const bcRegion = document.getElementById("breadcrumbRegion");
  const bcTaluka = document.getElementById("breadcrumbTaluka");
  const heroTitle = document.getElementById("activeTalukaTitle");
  const heroDesc = document.getElementById("activeTalukaDesc");
  const heroRegionBadge = document.getElementById("activeTalukaRegionBadge");
  const heroCountBadge = document.getElementById("activeTalukaPlacesCount");
  const mapSectionTitle = document.getElementById("mapSectionTitle");

  const talukaPlaces = ATTRACTIONS_DATA.filter(p => p.taluka.toLowerCase() === talukaName.toLowerCase());

  if (bcRegion) bcRegion.textContent = talukaObj.region;
  if (bcTaluka) bcTaluka.textContent = talukaObj.name;
  if (heroTitle) heroTitle.textContent = `${talukaObj.name} Taluka`;
  if (heroDesc) heroDesc.textContent = talukaObj.desc || talukaObj.highlight;
  if (heroRegionBadge) heroRegionBadge.textContent = talukaObj.region;
  if (heroCountBadge) heroCountBadge.textContent = `${talukaPlaces.length} Places to Visit`;
  if (mapSectionTitle) mapSectionTitle.textContent = `${talukaObj.name} Map`;

  // Populate quick-switcher dropdown
  populateTalukaDropdown(talukaObj.name);

  // Render grid & map for this taluka
  renderAttractionsGrid();
  updateMapForTaluka(talukaObj);

  if (autoScroll) {
    const attractionsSection = document.getElementById("attractions");
    if (attractionsSection) {
      attractionsSection.scrollIntoView({ behavior: "smooth" });
    }
  }
}

function returnToTalukasView() {
  currentSelectedTaluka = null;
  const talukasView = document.getElementById("attractionsTalukasView");
  const placesView = document.getElementById("attractionsPlacesView");

  if (placesView) placesView.hidden = true;
  if (talukasView) talukasView.hidden = false;

  const attractionsSection = document.getElementById("attractions");
  if (attractionsSection) {
    attractionsSection.scrollIntoView({ behavior: "smooth" });
  }
}

function populateTalukaDropdown(selectedName) {
  const dropdown = document.getElementById("talukaDropdownSelect");
  if (!dropdown) return;

  dropdown.innerHTML = TALUKAS_DATA.map(t => `
    <option value="${t.name}" ${t.name.toLowerCase() === selectedName.toLowerCase() ? 'selected' : ''}>
      ${t.name} (${t.region})
    </option>
  `).join("");

  dropdown.onchange = (e) => {
    selectTaluka(e.target.value, false);
  };
}

/* ============ STEP 2: PLACES GRID ============ */
function getFilteredTalukaAttractions() {
  if (!currentSelectedTaluka) return [];
  return ATTRACTIONS_DATA.filter(p => p.taluka.toLowerCase() === currentSelectedTaluka.toLowerCase());
}

function renderAttractionsGrid() {
  const grid = document.getElementById("attractionsGrid");
  const emptyState = document.getElementById("attractionsEmptyState");
  if (!grid) return;

  const places = getFilteredTalukaAttractions();

  if (places.length === 0) {
    grid.innerHTML = "";
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;

  grid.innerHTML = places.map(p => `
    <div class="attraction-card reveal" data-attr-id="${p.id}" tabindex="0" role="button" aria-label="View details for ${p.name}">
      <div class="attr-card-media">
        <span class="attr-card-badge-cat">${p.category}</span>
        <span class="attr-card-badge-taluka">${p.taluka}</span>
        <img
          class="attr-card-img"
          src="${getAttractionImg(p)}"
          alt="${p.name}"
          loading="lazy"
          decoding="async"
          onerror="this.src='https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80'"
        >
      </div>
      <div class="attr-card-body">
        <h4>${p.name}</h4>
        <div class="attr-card-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${p.location}</span>
        </div>
        <p class="attr-card-desc">${p.shortDesc}</p>
        <div class="attr-card-foot">
          <span class="attr-card-meta">${p.region}</span>
          <button type="button" class="attr-view-btn" data-attr-id="${p.id}">View Details</button>
        </div>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".attraction-card").forEach(card => {
    card.addEventListener("click", () => {
      openAttractionDetails(card.dataset.attrId);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openAttractionDetails(card.dataset.attrId);
      }
    });
  });

  if (typeof observeReveals === "function") {
    observeReveals();
  }
}

/* ============ STEP 2: LEAFLET MAP CONTROLLER ============ */
function initAttractionsMap() {
  const mapElement = document.getElementById("attractionsMap");
  if (!mapElement || typeof L === "undefined") return;

  if (leafletMapInstance) return;

  try {
    leafletMapInstance = L.map("attractionsMap", {
      center: [15.56, 73.77],
      zoom: 12,
      minZoom: 9,
      maxZoom: 16,
      scrollWheelZoom: false
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMapInstance);

    mapMarkersGroup = L.layerGroup().addTo(leafletMapInstance);

    const recenterBtn = document.getElementById("mapRecenterBtn");
    if (recenterBtn) {
      recenterBtn.addEventListener("click", () => {
        if (currentSelectedTaluka) {
          const tObj = TALUKAS_DATA.find(t => t.name.toLowerCase() === currentSelectedTaluka.toLowerCase());
          if (tObj && tObj.center) {
            leafletMapInstance.flyTo(tObj.center, tObj.zoom || 12);
          }
        }
      });
    }
  } catch (err) {
    console.warn("Leaflet map setup skipped:", err);
  }
}

function updateMapForTaluka(talukaObj) {
  if (!leafletMapInstance) {
    initAttractionsMap();
  }
  if (!leafletMapInstance) return;

  setTimeout(() => {
    leafletMapInstance.invalidateSize();
    if (talukaObj && talukaObj.center) {
      leafletMapInstance.setView(talukaObj.center, talukaObj.zoom || 12);
    }
    syncMapMarkers();
  }, 100);
}

function syncMapMarkers() {
  if (!leafletMapInstance || !mapMarkersGroup) return;

  mapMarkersGroup.clearLayers();

  const places = getFilteredTalukaAttractions();

  const customPinHtml = `
    <div style="
      background:#0e3552;
      color:#fffdf8;
      width:28px;
      height:28px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 3px 8px rgba(0,0,0,0.35);
      border:2px solid #e3a23d;
    ">
      <div style="transform:rotate(45deg);font-size:11px;font-weight:700;">📍</div>
    </div>
  `;

  const customIcon = L.divIcon({
    html: customPinHtml,
    className: "custom-map-pin",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });

  places.forEach(p => {
    if (p.coordinates && p.coordinates.length === 2) {
      const marker = L.marker(p.coordinates, { icon: customIcon });
      const popupContent = `
        <div class="map-popup-card">
          <img class="map-popup-img" src="${getAttractionImg(p)}" alt="${p.name}" loading="lazy" decoding="async" onerror="this.src='https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80'">
          <div class="map-popup-body">
            <div class="map-popup-tags">
              <span class="map-popup-tag cat">${p.category}</span>
              <span class="map-popup-tag taluka">${p.taluka}</span>
            </div>
            <h5>${p.name}</h5>
            <p>${p.shortDesc}</p>
            <button type="button" class="map-popup-btn" onclick="openAttractionDetails('${p.id}')">View Details</button>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
      mapMarkersGroup.addLayer(marker);
    }
  });
}

/* ============ STEP 3: PLACE DETAILS MODAL ============ */
const attractionModalOverlay = document.getElementById("attractionModalOverlay");
const attractionModalClose = document.getElementById("attractionModalClose");
const attractionModalBackBtn = document.getElementById("attractionModalBackBtn");

function openAttractionDetails(placeId) {
  const place = ATTRACTIONS_DATA.find(p => p.id === placeId);
  if (!place || !attractionModalOverlay) return;

  // Hero Section
  const imgEl = document.getElementById("attrModalImg");
  if (imgEl) {
    imgEl.src = getAttractionImg(place);
    imgEl.alt = place.name;
  }

  document.getElementById("attrModalTitle").textContent = place.name;
  document.getElementById("attrModalLocation").textContent = place.location;
  document.getElementById("attrModalCategoryTag").textContent = place.category;
  document.getElementById("attrModalTalukaTag").textContent = place.taluka;
  document.getElementById("attrModalRegionTag").textContent = place.region;

  // Quick Facts
  document.getElementById("attrModalTimings").textContent = (place.visitorInfo && place.visitorInfo.timings) || "Open daily";
  document.getElementById("attrModalEntryFee").textContent = (place.visitorInfo && place.visitorInfo.entryFee) || "Free entry";
  document.getElementById("attrModalDuration").textContent = place.duration || "2–3 hours";
  document.getElementById("attrModalBestTime").textContent = place.bestTime || "October to March";

  // Description
  document.getElementById("attrModalDescription").textContent = place.detailedDesc || place.shortDesc;

  // Things To Do List
  const thingsList = document.getElementById("attrModalThingsToDo");
  if (thingsList) {
    if (place.thingsToDo && place.thingsToDo.length) {
      thingsList.innerHTML = place.thingsToDo.map(item => `<li>${item}</li>`).join("");
    } else {
      thingsList.innerHTML = `<li>Explore the scenic natural landscapes and photography vantage points</li>`;
    }
  }

  // Visitor Tips & Parking
  const parkingEl = document.getElementById("attrModalParking");
  const tipsEl = document.getElementById("attrModalTips");
  if (parkingEl) parkingEl.textContent = (place.visitorInfo && place.visitorInfo.parking) || "General parking available nearby.";
  if (tipsEl) tipsEl.textContent = (place.visitorInfo && place.visitorInfo.tips) || "Wear comfortable walking footwear and carry drinking water.";

  // Nearby Attractions
  const nearbyList = document.getElementById("attrModalNearbyList");
  const nearbySection = document.getElementById("attrModalNearbySection");
  if (nearbyList && nearbySection) {
    if (place.nearby && place.nearby.length) {
      nearbySection.hidden = false;
      nearbyList.innerHTML = place.nearby.map(nearbyName => {
        const matchingPlace = ATTRACTIONS_DATA.find(p => p.name.toLowerCase() === nearbyName.toLowerCase() || p.name.toLowerCase().includes(nearbyName.toLowerCase()));
        if (matchingPlace) {
          return `<button type="button" class="attr-nearby-btn" onclick="openAttractionDetails('${matchingPlace.id}')">📍 ${matchingPlace.name}</button>`;
        }
        return `<span class="attr-nearby-btn" style="cursor:default;">📍 ${nearbyName}</span>`;
      }).join("");
    } else {
      nearbySection.hidden = true;
    }
  }

  // Update Back Button Label in modal
  if (attractionModalBackBtn) {
    if (currentSelectedTaluka) {
      attractionModalBackBtn.textContent = `← Back to ${place.taluka} Places`;
    } else {
      attractionModalBackBtn.textContent = `← Back to Attractions`;
    }
  }

  // Open Modal
  if (typeof openModal === "function") {
    openModal(attractionModalOverlay);
  } else {
    attractionModalOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  const modalBody = attractionModalOverlay.querySelector(".attr-modal-body");
  if (modalBody) modalBody.scrollTop = 0;
}

function closeAttractionDetails() {
  if (!attractionModalOverlay) return;
  if (typeof closeModal === "function") {
    closeModal(attractionModalOverlay);
  } else {
    attractionModalOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }
}

// Global hooks for map popup onclick handlers
window.openAttractionDetails = openAttractionDetails;
window.closeAttractionDetails = closeAttractionDetails;

/* ============ EVENT LISTENERS ============ */
function setupAttractionsEvents() {
  // Step 1: Region Tabs (All / North / South)
  const regionTabs = document.querySelectorAll("#regionTabBar .region-tab");
  regionTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      regionTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeRegionTab = tab.dataset.region;
      renderTalukasGrid();
    });
  });

  // Step 2: Back to All Talukas Button
  const backToTalukasBtn = document.getElementById("backToTalukasBtn");
  if (backToTalukasBtn) {
    backToTalukasBtn.addEventListener("click", returnToTalukasView);
  }

  // Modal Close & Back
  if (attractionModalClose) attractionModalClose.addEventListener("click", closeAttractionDetails);
  if (attractionModalBackBtn) attractionModalBackBtn.addEventListener("click", closeAttractionDetails);

  if (attractionModalOverlay) {
    attractionModalOverlay.addEventListener("click", (e) => {
      if (e.target === attractionModalOverlay) {
        closeAttractionDetails();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && attractionModalOverlay && attractionModalOverlay.classList.contains("open")) {
      closeAttractionDetails();
    }
  });

  // Nav link click smooth handler
  const navAttractionsLinks = document.querySelectorAll('a[href="#attractions"], a[href="attractions.html"], a[href="attractions.html#attractions"]');
  navAttractionsLinks.forEach(link => {
    link.addEventListener("click", () => {
      const placesView = document.getElementById("attractionsPlacesView");
      if (placesView && !placesView.hidden) {
        returnToTalukasView();
      }
    });
  });
}

/* ============ INITIALIZATION ============ */
document.addEventListener("DOMContentLoaded", () => {
  renderFeaturedAttractions();
  renderTalukasGrid();
  setupAttractionsEvents();
});

if (document.readyState === "complete" || document.readyState === "interactive") {
  renderFeaturedAttractions();
  renderTalukasGrid();
  setupAttractionsEvents();
}

