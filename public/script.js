    /* =========================================================
      TOURENT — site logic
      Sections: data, fleet render, estimator, reveal/header/nav,
      booking modal, my-bookings, toast helper
      ========================================================= */

    /* ============ API BASE & CONFIG ============ */
    const API_BASE = (window.location.protocol === 'file:' || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port && window.location.port !== '5001')) ? 'http://localhost:5001' : '';

    /* ============ DATA ============ */
    const ICONS = {
      hatch: `<svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 68 Q22 40 55 36 L130 36 Q158 38 172 62 L178 68 L178 78 L14 78 L14 68 Z" fill="#1d6e96"/><rect x="60" y="42" width="60" height="20" rx="4" fill="#e7f0f2"/><circle cx="52" cy="80" r="12" fill="#0e3552"/><circle cx="146" cy="80" r="12" fill="#0e3552"/><circle cx="52" cy="80" r="5" fill="#e7f0f2"/><circle cx="146" cy="80" r="5" fill="#e7f0f2"/></svg>`,
      suv: `<svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 70 Q16 34 45 30 L145 30 Q176 34 186 66 L186 76 L10 76 L10 70Z" fill="#b4472e"/><rect x="48" y="36" width="44" height="22" rx="4" fill="#e7f0f2"/><rect x="100" y="36" width="42" height="22" rx="4" fill="#e7f0f2"/><circle cx="54" cy="80" r="13" fill="#0e3552"/><circle cx="150" cy="80" r="13" fill="#0e3552"/><circle cx="54" cy="80" r="5.5" fill="#e7f0f2"/><circle cx="150" cy="80" r="5.5" fill="#e7f0f2"/></svg>`,
      two: `<svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="46" cy="76" r="16" stroke="#0e3552" stroke-width="6"/><circle cx="154" cy="76" r="16" stroke="#0e3552" stroke-width="6"/><path d="M46 76 L88 40 L112 40 L100 76 L154 76" stroke="#e3a23d" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M88 40 L70 40" stroke="#e3a23d" stroke-width="6" stroke-linecap="round"/></svg>`,
      lux: `<svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 70 Q18 36 50 32 L150 32 Q182 36 188 66 L188 76 L10 76 L10 70Z" fill="#0e3552"/><rect x="52" y="38" width="46" height="20" rx="4" fill="#f0c179"/><rect x="104" y="38" width="42" height="20" rx="4" fill="#f0c179"/><circle cx="56" cy="80" r="13" fill="#e3a23d"/><circle cx="150" cy="80" r="13" fill="#e3a23d"/></svg>`
    };

    /* Keywords used to pull a representative web photo for each model.
      If the photo fails to load (network restrictions, offline hosting, etc.)
      the hand-drawn category icon above stays visible underneath — the site
      never shows a broken image. */
    const VEHICLE_IMAGES = {
      "Maruti Swift": "images/swift.png",
      "Maruti Baleno": "images/baleno.png",
      "Hyundai i20": "images/i20.png",
      "Toyota Glanza": "images/glanza.png",

      "Maruti Ertiga": "images/ertiga.png",
      "Hyundai Creta (2nd Gen)": "images/creta 2nd gen.png",
      "Hyundai Creta 2nd Gen": "images/creta 2nd gen.png",
      "Creta 2nd Gen": "images/creta 2nd gen.png",
      "Hyundai Creta (3rd Gen)": "images/creta 3rd gen.png",
      "Hyundai Creta 3rd Gen": "images/creta 3rd gen.png",
      "Creta 3rd Gen": "images/creta 3rd gen.png",
      "Hyundai Alcazar": "images/alcazar.png",
      "Alcazar": "images/alcazar.png",
      "Kia Carens": "images/carens.png",
      "Carens": "images/carens.png",
      "Toyota Innova Crysta": "images/crysta.png",
      "Toyota Innova Hycross": "images/hycross.png",
      "Toyota Fortuner": "images/fortuner.png",
      "Mahindra Thar": "images/thar.png",
      "Toyota Hyryder": "images/hyryder.png",
      "Maruti Brezza": "images/brezza.png",
      "Hyundai Venue": "images/venue.png",
      "Venue": "images/venue.png",

      "Yamaha Fascino": "images/fascino.png",
      "Honda Activa": "images/activa.png",
      "Royal Enfield Hunter 350": "images/hunter.png",
      "Royal Enfield Himalayan": "images/himalayan.png",

      "Land Rover Defender": "images/defender.png",
      "Mini Cooper": "images/mini.png",
      "BMW 3 Series": "images/bmw.png",
      "BMW Z4 Convertible": "images/bmwz4.png",
      "BMW Z4": "images/bmwz4.png",
      "BMWZ4": "images/bmwz4.png",
      "Audi A4": "images/audi.png"
    };

    /* =========================================================
       DYNAMIC FLEET & SEASONAL PRICING STORAGE ENGINE
       ========================================================= */
    const FLEET_STORAGE_KEY = "tourent_custom_fleet";
    const PRICING_STORAGE_KEY = "tourent_pricing_rules";
    const SEASON_STORAGE_KEY = "tourent_season_config";

    const DEFAULT_PRICING_RULES = {
      globalSurge: {
        enabled: false,
        multiplier: 1.0,
        label: "Standard Rates"
      },
      seasons: [
        {
          id: "season_new_year",
          name: "Christmas & New Year Peak",
          multiplier: 1.8,
          startMonth: 12,
          startDay: 20,
          endMonth: 1,
          endDay: 5,
          badge: "🔥 Peak Festive Tariff (+80%)",
          active: true
        },
        {
          id: "season_diwali",
          name: "Diwali Vacation Surge",
          multiplier: 1.35,
          startMonth: 10,
          startDay: 25,
          endMonth: 11,
          endDay: 5,
          badge: "✨ Diwali Festive Rate (+35%)",
          active: true
        },
        {
          id: "season_republic_day",
          name: "Republic Day Long Weekend",
          multiplier: 1.3,
          startMonth: 1,
          startDay: 22,
          endMonth: 1,
          endDay: 27,
          badge: "🏖️ Holiday Weekend Surge (+30%)",
          active: true
        },
        {
          id: "season_winter_peak",
          name: "Goa Winter Season",
          multiplier: 1.2,
          startMonth: 11,
          startDay: 6,
          endMonth: 2,
          endDay: 28,
          badge: "🌴 Peak Season Rate (+20%)",
          active: true
        },
        {
          id: "season_summer",
          name: "Summer Holidays",
          multiplier: 1.15,
          startMonth: 4,
          startDay: 10,
          endMonth: 5,
          endDay: 31,
          badge: "☀️ Summer Holiday Tariff (+15%)",
          active: true
        }
      ]
    };

    function getStoredPricingRules() {
      try {
        const raw = localStorage.getItem(PRICING_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            return {
              globalSurge: parsed.globalSurge || DEFAULT_PRICING_RULES.globalSurge,
              seasons: Array.isArray(parsed.seasons) ? parsed.seasons : DEFAULT_PRICING_RULES.seasons
            };
          }
        }
      } catch (e) {}
      return DEFAULT_PRICING_RULES;
    }

    let LIVE_PRICING_RULES = getStoredPricingRules();

    function isDateInSeason(d, s) {
      if (!s || s.active === false) return false;
      const month = d.getMonth() + 1; // 1-12
      const day = d.getDate(); // 1-31

      // Direct ISO string match if season has explicit dates
      const y = d.getFullYear();
      const mStr = String(month).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const curISO = `${y}-${mStr}-${dStr}`;

      if (s.startDate && s.endDate) {
        if (curISO >= s.startDate && curISO <= s.endDate) {
          return true;
        }
      }

      const sM = Number(s.startMonth);
      const sD = Number(s.startDay);
      const eM = Number(s.endMonth);
      const eD = Number(s.endDay);

      if (sM && sD && eM && eD) {
        if (sM < eM || (sM === eM && sD <= eD)) {
          // Same year window (e.g. Oct 25 to Nov 15)
          if (month > sM && month < eM) return true;
          if (month === sM && month === eM) return day >= sD && day <= eD;
          if (month === sM) return day >= sD;
          if (month === eM) return day <= eD;
          return false;
        } else {
          // Year crossover window (e.g. Dec 20 to Jan 5)
          if (month > sM || month < eM) return true;
          if (month === sM) return day >= sD;
          if (month === eM) return day <= eD;
          return false;
        }
      }
      return false;
    }

    function getSurgeRuleForDate(dateInput) {
      const rules = LIVE_PRICING_RULES || getStoredPricingRules();
      let d = new Date();
      if (dateInput) {
        if (dateInput instanceof Date) {
          d = dateInput;
        } else if (typeof dateInput === 'string' && dateInput.trim()) {
          // Handle 'YYYY-MM-DD' cleanly without timezone shift
          const parts = dateInput.split('-');
          if (parts.length === 3) {
            d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          } else {
            d = new Date(dateInput);
          }
        }
      }
      const validDate = isNaN(d.getTime()) ? new Date() : d;

      let seasonMatch = null;
      if (Array.isArray(rules.seasons)) {
        const matching = rules.seasons
          .filter(s => s.active !== false && isDateInSeason(validDate, s))
          .sort((a, b) => (Number(b.multiplier) || 1) - (Number(a.multiplier) || 1));
        if (matching.length > 0) {
          seasonMatch = matching[0];
        }
      }

      const globalSurge = rules.globalSurge || rules.globalOverride || { enabled: false, multiplier: 1.0 };
      const globalActive = (globalSurge.enabled || globalSurge.active) && Number(globalSurge.multiplier) > 1.0;

      let finalMultiplier = 1.0;
      let ruleName = "Standard";
      let badge = "";

      if (seasonMatch && globalActive) {
        if (Number(globalSurge.multiplier) >= Number(seasonMatch.multiplier)) {
          finalMultiplier = Number(globalSurge.multiplier);
          ruleName = globalSurge.label || "Demand Surge";
          badge = `⚡ ${ruleName} (+${Math.round((finalMultiplier - 1) * 100)}%)`;
        } else {
          finalMultiplier = Number(seasonMatch.multiplier);
          ruleName = seasonMatch.name;
          badge = seasonMatch.badge || seasonMatch.badgeText || `🔥 ${seasonMatch.name} (+${Math.round((finalMultiplier - 1) * 100)}%)`;
        }
      } else if (seasonMatch) {
        finalMultiplier = Number(seasonMatch.multiplier) || 1.0;
        ruleName = seasonMatch.name;
        badge = seasonMatch.badge || seasonMatch.badgeText || `🔥 ${seasonMatch.name} (+${Math.round((finalMultiplier - 1) * 100)}%)`;
      } else if (globalActive) {
        finalMultiplier = Number(globalSurge.multiplier) || 1.0;
        ruleName = globalSurge.label || "Demand Surge";
        badge = `⚡ ${ruleName} (+${Math.round((finalMultiplier - 1) * 100)}%)`;
      }

      return {
        multiplier: finalMultiplier,
        name: ruleName,
        badge: badge,
        isSurged: finalMultiplier > 1.001
      };
    }

    const DEFAULT_VEHICLES = [
      {id: "v_swift", name:"Maruti Swift", cat:"hatch", price:1800, priceManual:1800, priceAuto:2200, mileage:20, fuel:"petrol", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/swift.png", totalUnits:15, active:true},
      {id: "v_baleno", name:"Maruti Baleno", cat:"hatch", price:2000, priceManual:2000, priceAuto:2400, mileage:21, fuel:"petrol", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/baleno.png", totalUnits:20, active:true},
      {id: "v_i20", name:"Hyundai i20", cat:"hatch", price:2000, priceManual:2000, priceAuto:2400, mileage:19, fuel:"petrol", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/i20.png", totalUnits:15, active:true},
      {id: "v_glanza", name:"Toyota Glanza", cat:"hatch", price:2100, priceManual:2100, priceAuto:2500, mileage:21, fuel:"petrol", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/glanza.png", totalUnits:12, active:true},

      {id: "v_ertiga", name:"Maruti Ertiga", cat:"suv", price:2800, priceManual:2800, priceAuto:3300, mileage:18, fuel:"petrol", seats:7, trans:"Manual & Automatic", tag:"Self-drive", image:"images/ertiga.png", totalUnits:15, active:true},
      {id: "v_creta_2nd", name:"Hyundai Creta (2nd Gen)", cat:"suv", price:2800, priceManual:2800, priceAuto:3300, mileage:18, fuel:"diesel", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/creta 2nd gen.png", totalUnits:12, active:true},
      {id: "v_creta_3rd", name:"Hyundai Creta (3rd Gen)", cat:"suv", price:3200, priceManual:3200, priceAuto:3600, mileage:17, fuel:"petrol", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/creta 3rd gen.png", totalUnits:10, active:true},
      {id: "v_alcazar", name:"Hyundai Alcazar", cat:"suv", price:3800, priceManual:3800, priceAuto:4300, mileage:17, fuel:"diesel", seats:7, trans:"Manual & Automatic", tag:"Self-drive", image:"images/alcazar.png", totalUnits:8, active:true},
      {id: "v_carens", name:"Kia Carens", cat:"suv", price:3200, priceManual:3200, priceAuto:3700, mileage:16, fuel:"diesel", seats:7, trans:"Manual & Automatic", tag:"Self-drive", image:"images/carens.png", totalUnits:10, active:true},
      {id: "v_crysta", name:"Toyota Innova Crysta", cat:"suv", price:4500, priceManual:4500, priceAuto:5200, mileage:13, fuel:"diesel", seats:7, trans:"Manual & Automatic", tag:"Self-drive", image:"images/crysta.png", totalUnits:10, active:true},
      {id: "v_hycross", name:"Toyota Innova Hycross", cat:"suv", price:5200, priceManual:null, priceAuto:5200, mileage:20, fuel:"petrol", seats:7, trans:"Hybrid CVT", tag:"Self-drive", image:"images/hycross.png", totalUnits:8, active:true},
      {id: "v_fortuner", name:"Toyota Fortuner", cat:"suv", price:8500, priceManual:null, priceAuto:8500, mileage:12, fuel:"diesel", seats:7, trans:"Automatic", tag:"Self-drive", image:"images/fortuner.png", totalUnits:6, active:true},
      {id: "v_thar", name:"Mahindra Thar", cat:"suv", price:3500, priceManual:3500, priceAuto:4200, mileage:14, fuel:"diesel", seats:4, trans:"Manual & Automatic 4x4", tag:"Self-drive", image:"images/thar.png", totalUnits:6, active:true},
      {id: "v_hyryder", name:"Toyota Hyryder", cat:"suv", price:3200, priceManual:null, priceAuto:3200, mileage:20, fuel:"petrol", seats:5, trans:"Hybrid CVT", tag:"Self-drive", image:"images/hyryder.png", totalUnits:8, active:true},
      {id: "v_brezza", name:"Maruti Brezza", cat:"suv", price:2600, priceManual:2600, priceAuto:3000, mileage:17, fuel:"petrol", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/brezza.png", totalUnits:10, active:true},

      {id: "v_defender", name:"Land Rover Defender", cat:"lux", price:15000, priceManual:null, priceAuto:15000, mileage:10, fuel:"diesel", seats:5, trans:"Automatic", tag:"Luxury", image:"images/defender.png", totalUnits:3, active:true},
      {id: "v_mini", name:"Mini Cooper", cat:"lux", price:9500, priceManual:null, priceAuto:9500, mileage:15, fuel:"petrol", seats:4, trans:"Automatic", tag:"Luxury", image:"images/mini.png", totalUnits:4, active:true},
      {id: "v_bmw", name:"BMW 3 Series", cat:"lux", price:12000, priceManual:null, priceAuto:12000, mileage:12, fuel:"petrol", seats:5, trans:"Automatic", tag:"Luxury", image:"images/bmw.png", totalUnits:4, active:true},
      {id: "v_bmw_z4", name:"BMW Z4 Convertible", cat:"lux", price:18000, priceManual:null, priceAuto:18000, mileage:12, fuel:"petrol", seats:2, trans:"Automatic", tag:"Luxury", image:"images/bmwz4.png", totalUnits:2, active:true},
      {id: "v_audi", name:"Audi A4", cat:"lux", price:13000, priceManual:null, priceAuto:13000, mileage:12, fuel:"petrol", seats:5, trans:"Automatic", tag:"Luxury", image:"images/audi.png", totalUnits:4, active:true},

      {id: "v_fascino", name:"Yamaha Fascino", cat:"two", price:400, priceManual:null, priceAuto:400, mileage:47, fuel:"petrol", seats:2, trans:"Automatic", tag:"Scooter", image:"images/fascino.png", totalUnits:25, active:true},
      {id: "v_activa", name:"Honda Activa", cat:"two", price:450, priceManual:null, priceAuto:450, mileage:45, fuel:"petrol", seats:2, trans:"Automatic", tag:"Scooter", image:"images/activa.png", totalUnits:25, active:true},
      {id: "v_hunter", name:"Royal Enfield Hunter 350", cat:"two", price:900, priceManual:900, priceAuto:null, mileage:35, fuel:"petrol", seats:2, trans:"Manual", tag:"Motorcycle", image:"images/hunter.png", totalUnits:10, active:true},
      {id: "v_himalayan", name:"Royal Enfield Himalayan", cat:"two", price:1400, priceManual:1400, priceAuto:null, mileage:30, fuel:"petrol", seats:2, trans:"Manual", tag:"Adventure bike", image:"images/himalayan.png", totalUnits:8, active:true}
    ];

    const DEFAULT_ORDER = [
      "v_swift", "v_baleno", "v_i20", "v_glanza",
      "v_ertiga", "v_creta_2nd", "v_creta_3rd", "v_alcazar", "v_carens", "v_crysta", "v_hycross", "v_fortuner", "v_thar", "v_hyryder", "v_brezza",
      "v_defender", "v_mini", "v_bmw", "v_bmw_z4", "v_audi",
      "v_fascino", "v_activa", "v_hunter", "v_himalayan"
    ];
    const CAT_ORDER = { hatch: 1, sedan: 1, suv: 2, lux: 3, two: 4 };

    function sortVehiclesInOriginalOrder(list) {
      if (!Array.isArray(list)) return [];
      return [...list].sort((a, b) => {
        const catA = (a.cat || '').toLowerCase().trim();
        const catB = (b.cat || '').toLowerCase().trim();
        const cA = CAT_ORDER[catA] || 99;
        const cB = CAT_ORDER[catB] || 99;

        // 1. Group by Category first: Hatchbacks/Self-Drive (1) -> SUVs (2) -> Luxury (3) -> Two-Wheelers (4)
        if (cA !== cB) return cA - cB;

        // 2. Within the same category, keep factory default sequence first
        const idxA = DEFAULT_ORDER.indexOf(a.id);
        const idxB = DEFAULT_ORDER.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;

        // 3. For multiple new vehicles in same category, keep by price or addition
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      });
    }

    function getStoredFleetRaw() {
      try {
        const raw = localStorage.getItem(FLEET_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const merged = parsed.map(v => {
              const def = DEFAULT_VEHICLES.find(d => d.id === v.id || (d.name && v.name && d.name.toLowerCase() === v.name.toLowerCase()));
              const pManual = (v.priceManual !== undefined && v.priceManual !== null && !isNaN(Number(v.priceManual))) 
                ? Number(v.priceManual) 
                : (def?.priceManual || Number(v.price) || 1800);
              const pAuto = (v.priceAuto !== undefined && v.priceAuto !== null && !isNaN(Number(v.priceAuto))) 
                ? Number(v.priceAuto) 
                : (def?.priceAuto || (def?.priceManual ? Math.round((def.priceManual * 1.2)/50)*50 : (Number(v.price) || 2200)));
              const totalUnits = (v.totalUnits !== undefined && v.totalUnits !== null && !isNaN(Number(v.totalUnits)))
                ? Number(v.totalUnits)
                : (def?.totalUnits || (def?.id === 'v_baleno' ? 20 : 10));
              return {
                ...def,
                ...v,
                totalUnits,
                price: Number(v.price) || pManual || pAuto || 1800,
                priceManual: pManual,
                priceAuto: pAuto
              };
            });

            // Ensure any new default vehicles are appended if not yet in stored fleet
            DEFAULT_VEHICLES.forEach(def => {
              const exists = merged.some(v => v.id === def.id || (v.name && def.name && v.name.toLowerCase() === def.name.toLowerCase()));
              if (!exists) {
                merged.push({ ...def });
              }
            });

            return sortVehiclesInOriginalOrder(merged);
          }
        }
      } catch (e) {}
      return DEFAULT_VEHICLES;
    }

    function getActiveVehicles() {
      const fleet = getStoredFleetRaw();
      const active = (Array.isArray(fleet) ? fleet : []).filter(v => v.active !== false);
      const list = active.length > 0 ? active : DEFAULT_VEHICLES;
      return list.map(v => {
        const price = Number(v.price) || 1000;
        return {
          ...v,
          totalUnits: Number(v.totalUnits) || (v.id === 'v_baleno' ? 20 : 10),
          basePrice: price,
          price: price,
          isSurged: false,
          isDiscounted: false
        };
      });
    }

    let VEHICLES = getActiveVehicles();

    function refreshLiveFleet() {
      VEHICLES = getActiveVehicles();
      if (typeof renderFleet === 'function') {
        const activeTab = document.querySelector('.tab.active');
        renderFleet(activeTab ? activeTab.dataset.cat : 'all');
      }
      if (typeof populateEstimatorVehicles === 'function') {
        populateEstimatorVehicles();
      }
    }

    window.addEventListener('storage', (e) => {
      if (e.key === FLEET_STORAGE_KEY || e.key === PRICING_STORAGE_KEY || !e.key) {
        LIVE_PRICING_RULES = getStoredPricingRules();
        refreshLiveFleet();
      }
    });

    window.addEventListener('focus', () => {
      LIVE_PRICING_RULES = getStoredPricingRules();
      refreshLiveFleet();
      syncFleetFromServer();
      syncPricingRulesFromServer();
    });

    async function syncPricingRulesFromServer() {
      try {
        const res = await fetch(`${API_BASE}/api/pricing-rules`);
        const data = await res.json();
        if (data.success && (data.data || data.rules || data.seasons)) {
          LIVE_PRICING_RULES = data.data || data.rules || {
            globalSurge: data.globalSurge || data.globalOverride,
            globalOverride: data.globalOverride || data.globalSurge,
            seasons: data.seasons
          };
          localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(LIVE_PRICING_RULES));
          refreshLiveFleet();
        }
      } catch (err) {
        // Fallback to local cache / defaults
      }
    }
    syncPricingRulesFromServer();

    async function syncFleetFromServer() {
      try {
        const res = await fetch(`${API_BASE}/api/fleet`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const sorted = sortVehiclesInOriginalOrder(data.data);
          localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(sorted));
          refreshLiveFleet();
        }
      } catch (err) {
        // Fallback to local cache / defaults
      }
    }
    syncFleetFromServer();

    // ==========================================
    // ⚡ REAL-TIME FLEET AVAILABILITY ENGINE
    // ==========================================
    let LIVE_AVAILABILITY = null;
    let LIVE_AVAILABILITY_DATES = {
      pickupDate: todayISO(1),
      returnDate: todayISO(4)
    };

    async function fetchFleetAvailability(pickupDate, returnDate) {
      const pDate = pickupDate || LIVE_AVAILABILITY_DATES.pickupDate || todayISO(1);
      const rDate = returnDate || LIVE_AVAILABILITY_DATES.returnDate || todayISO(4);
      LIVE_AVAILABILITY_DATES = { pickupDate: pDate, returnDate: rDate };

      try {
        const res = await fetch(`${API_BASE}/api/fleet/availability?pickupDate=${encodeURIComponent(pDate)}&returnDate=${encodeURIComponent(rDate)}`);
        const data = await res.json();
        if (data.success && data.availability) {
          LIVE_AVAILABILITY = data.availability;
        }
      } catch (err) {
        // Fallback to local default calculation
      }

      if (!LIVE_AVAILABILITY) {
        LIVE_AVAILABILITY = {};
        VEHICLES.forEach(v => {
          const total = Number(v.totalUnits) || (v.id === 'v_baleno' ? 20 : 10);
          LIVE_AVAILABILITY[v.id] = {
            id: v.id,
            name: v.name,
            totalUnits: total,
            bookedUnits: 0,
            availableUnits: total,
            status: 'Available'
          };
        });
      }

      // Re-render fleet grid cards with live badges
      if (typeof renderFleet === 'function') {
        const activeTab = document.querySelector('.tab.active');
        renderFleet(activeTab ? activeTab.dataset.cat : 'all');
      }

      // If booking modal is open, re-render vehicle dropdown with updated stock labels
      if (document.getElementById('bookingModal')?.classList.contains('open') && typeof renderBookingVehiclesList === 'function') {
        renderBookingVehiclesList();
      }
    }
    fetchFleetAvailability();

    function photoUrlFor(name){
      const found = VEHICLES.find(v => v.name === name);
      if (found && found.image && !found.image.startsWith('data:image') && !found.image.includes('default-car')) {
        return found.image;
      }
      const lower = (name || '').toLowerCase().trim();
      if (lower.includes('venue')) return 'images/venue.png';
      if (lower.includes('swift')) return 'images/swift.png';
      if (lower.includes('baleno')) return 'images/baleno.png';
      if (lower.includes('i20')) return 'images/i20.png';
      if (lower.includes('glanza')) return 'images/glanza.png';
      if (lower.includes('ertiga')) return 'images/ertiga.png';
      if (lower.includes('carens')) return 'images/carens.png';
      if (lower.includes('alcazar')) return 'images/alcazar.png';
      if (lower.includes('creta 3rd') || lower.includes('creta (3rd') || lower.includes('creta 3') || lower.includes('creta facelift') || lower.includes('creta 2024')) return 'images/creta 3rd gen.png';
      if (lower.includes('creta')) return 'images/creta 2nd gen.png';
      if (lower.includes('crysta')) return 'images/crysta.png';
      if (lower.includes('hycross')) return 'images/hycross.png';
      if (lower.includes('fortuner')) return 'images/fortuner.png';
      if (lower.includes('thar')) return 'images/thar.png';
      if (lower.includes('brezza')) return 'images/brezza.png';
      if (lower.includes('hyryder')) return 'images/hyryder.png';
      if (lower.includes('defender')) return 'images/defender.png';
      if (lower.includes('mini')) return 'images/mini.png';
      if (lower.includes('z4') || lower.includes('bmwz4')) return 'images/bmwz4.png';
      if (lower.includes('bmw')) return 'images/bmw.png';
      if (lower.includes('audi')) return 'images/audi.png';
      if (lower.includes('fascino')) return 'images/fascino.png';
      if (lower.includes('activa')) return 'images/activa.png';
      if (lower.includes('hunter')) return 'images/hunter.png';
      if (lower.includes('himalayan')) return 'images/himalayan.png';

      if (found && found.image) return found.image;
      return VEHICLE_IMAGES[name] || "images/default-car.jpg";
    }

    const DESTINATIONS = [
      {name:"Panaji / Old Goa"},
      {name:"Calangute Beach"},
      {name:"Baga Beach"},
      {name:"Anjuna Beach"},
      {name:"Vagator & Chapora Fort"},
      {name:"Dabolim Airport"},
      {name:"Arambol"},
      {name:"Mopa Airport"},
      {name:"Dudhsagar Falls"},
      {name:"Palolem Beach"},
    ];

    /* Real road-distance estimates (km, one-way), grounded against
      published driving distances rather than a single guessed
      figure — previously every destination used one fixed distance
      regardless of pickup point, which was the main accuracy bug:
      Palolem is 76km from a Panaji pickup but only 37km from Margao,
      for example. Rounded to sensible planning precision; exact
      routes vary with traffic and road closures, so treat these as
      solid estimates, not survey-grade figures. */
    const PICKUP_POINTS = [
      // ✈️ Goa Airports
      { name: "Manohar International Airport, Mopa (GOX)", group: "✈️ Goa Airports", dist: {
        "Panaji / Old Goa":42, "Calangute Beach":28, "Baga Beach":27, "Anjuna Beach":22,
        "Vagator & Chapora Fort":20, "Dabolim Airport":85, "Arambol":16, "Mopa Airport":0,
        "Dudhsagar Falls":95, "Palolem Beach":108
      }},
      { name: "Dabolim International Airport (GOI)", group: "✈️ Goa Airports", dist: {
        "Panaji / Old Goa":28, "Calangute Beach":38, "Baga Beach":39, "Anjuna Beach":42,
        "Vagator & Chapora Fort":44, "Dabolim Airport":0, "Arambol":65, "Mopa Airport":85,
        "Dudhsagar Falls":55, "Palolem Beach":42
      }},

      // 🚆 Railway Stations
      { name: "Madgaon Railway Station (MAO)", group: "🚆 Railway Stations", dist: {
        "Panaji / Old Goa":33, "Calangute Beach":45, "Baga Beach":46, "Anjuna Beach":48,
        "Vagator & Chapora Fort":50, "Dabolim Airport":24, "Arambol":72, "Mopa Airport":78,
        "Dudhsagar Falls":42, "Palolem Beach":36
      }},
      { name: "Thivim Railway Station (THVM - North Goa)", group: "🚆 Railway Stations", dist: {
        "Panaji / Old Goa":24, "Calangute Beach":18, "Baga Beach":17, "Anjuna Beach":19,
        "Vagator & Chapora Fort":20, "Dabolim Airport":48, "Arambol":25, "Mopa Airport":22,
        "Dudhsagar Falls":75, "Palolem Beach":92
      }},
      { name: "Karmali Railway Station (KRMI - Central Goa)", group: "🚆 Railway Stations", dist: {
        "Panaji / Old Goa":8, "Calangute Beach":24, "Baga Beach":25, "Anjuna Beach":27,
        "Vagator & Chapora Fort":29, "Dabolim Airport":26, "Arambol":50, "Mopa Airport":48,
        "Dudhsagar Falls":52, "Palolem Beach":65
      }},
      { name: "Vasco da Gama Railway Station (VSG)", group: "🚆 Railway Stations", dist: {
        "Panaji / Old Goa":29, "Calangute Beach":39, "Baga Beach":40, "Anjuna Beach":43,
        "Vagator & Chapora Fort":45, "Dabolim Airport":4, "Arambol":67, "Mopa Airport":88,
        "Dudhsagar Falls":56, "Palolem Beach":44
      }},

      // 🏨 Doorstep Delivery (Anywhere in Goa)
      { name: "Hotel / Resort Delivery", label: "Hotel / Resort Delivery (Enter Name Below)", group: "🏨 Doorstep Delivery (Anywhere in Goa)", dist: {
        "Panaji / Old Goa":15, "Calangute Beach":8, "Baga Beach":8, "Anjuna Beach":12,
        "Vagator & Chapora Fort":14, "Dabolim Airport":35, "Arambol":30, "Mopa Airport":35,
        "Dudhsagar Falls":65, "Palolem Beach":70
      }},
      { name: "Airbnb / Private Villa Delivery", label: "Airbnb / Private Villa Delivery (Enter Name Below)", group: "🏨 Doorstep Delivery (Anywhere in Goa)", dist: {
        "Panaji / Old Goa":15, "Calangute Beach":8, "Baga Beach":8, "Anjuna Beach":12,
        "Vagator & Chapora Fort":14, "Dabolim Airport":35, "Arambol":30, "Mopa Airport":35,
        "Dudhsagar Falls":65, "Palolem Beach":70
      }},
      { name: "Custom Landmark / Location", label: "Custom Landmark / Location", group: "🏨 Doorstep Delivery (Anywhere in Goa)", dist: {
        "Panaji / Old Goa":15, "Calangute Beach":10, "Baga Beach":10, "Anjuna Beach":15,
        "Vagator & Chapora Fort":16, "Dabolim Airport":35, "Arambol":32, "Mopa Airport":38,
        "Dudhsagar Falls":65, "Palolem Beach":70
      }}
    ];

    const FUEL_PRICE = {petrol:104, diesel:96}; // current Goa average, ₹/L (petrol ~₹104.1, diesel ~₹95.9)
    const BOOKINGS_KEY = "tourent_bookings";

    /* =========================================================
      BACKEND SYNC — real bookings database (Supabase, via the
      serverless functions in /api). See the setup comments at
      the top of api/bookings.js for the ~10-minute setup.

      Until BOOKINGS_API_URL is set, everything still works exactly
      as before: bookings save to this browser only (localStorage),
      visible under "My Bookings" on this device, and there's no
      central place you (the business) can see them except via the
      email/WhatsApp confirmations already wired up. Once you deploy
      the backend and set this URL, every booking is also written to
      a real database your admin dashboard (admin.html) can see.
    */
    const BOOKINGS_API_URL = `${API_BASE}/api/bookings`;

    function syncBookingToGoogleSheetsDirect(booking) {
      const webhookUrl = (localStorage.getItem('tourent_sheets_webhook') || '').trim();
      if (!webhookUrl || !webhookUrl.startsWith('http')) return;
      try {
        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking)
        }).catch(() => {});
      } catch (e) {}
    }

    async function syncBookingToServer(booking){
      // Always trigger direct client-side Sheets webhook fallback in background
      syncBookingToGoogleSheetsDirect(booking);

      const statusEl = document.getElementById('emailStatus');
      if(statusEl){
        statusEl.hidden = false;
        statusEl.className = 'email-status sending';
        statusEl.innerHTML = `⏳ Sending voucher to <strong>${escapeHTML(booking.email)}</strong>...`;
      }

      try{
        const resp = await fetch(BOOKINGS_API_URL, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(booking)
        });
        const json = await resp.json();
        if(resp.ok && json.success){
          console.log('✅ Server sync successful, backend response:', json);
          if(json.emailSent){
            if(statusEl){
              statusEl.className = 'email-status sent';
              statusEl.innerHTML = `✅ Voucher emailed to <strong>${escapeHTML(booking.email)}</strong>`;
            }
            showToast(`📧 Voucher emailed to ${booking.email}`);
          } else {
            console.warn('📧 [Email Dispatch Notice]:', json.emailError);
            if(statusEl){
              statusEl.className = 'email-status failed';
              statusEl.innerHTML = `⚠️ <strong>Booking Confirmed &amp; Locked!</strong> Email voucher couldn't be sent automatically. You can copy your Booking ID <strong>#${escapeHTML(booking.id)}</strong> or click <em>"Send booking voucher to Tourent WhatsApp"</em> below for instant receipt.`;
            }
            showToast('⚠️ Booking locked! Voucher available via WhatsApp.');
          }
        } else {
          console.warn('Backend booking sync error:', json);
          if(statusEl){
            statusEl.className = 'email-status failed';
            statusEl.innerHTML = `⚠️ Booking saved locally, but server returned: ${escapeHTML(json.error || 'Server error')}`;
          }
          showToast(`⚠️ Booking error: ${json.error || 'Server error'}`);
        }
      }catch(err){
        console.warn('Backend not reachable — make sure `npm start` is running in terminal:', err);
        if(statusEl){
          statusEl.className = 'email-status failed';
          statusEl.innerHTML = `⚠️ Server offline! Run <code>npm start</code> in your terminal to dispatch emails.`;
        }
        showToast(`⚠️ Server offline! Run "npm start" in terminal to send emails.`);
      }
    }

    /* =========================================================
      WHATSAPP — CONFIRMATIONS & INQUIRIES
      ========================================================= */
    const WHATSAPP_NUMBER = "919322730029"; // country code + number, no + or spaces
    const WHATSAPP_AUTOMATION_URL = ""; // e.g. "https://your-site.vercel.app/api/send-whatsapp" — leave blank to skip

    function buildWhatsAppLink(number, text){
      let cleanPhone = (number || "").replace(/\D/g, '');
      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(() => {});
        }
      } catch (e) {}
      return `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
    }

    // Customer -> Tourent WhatsApp Booking Request
    function bookingWhatsAppText(booking){
      let vehicleDetails = "";
      if (Array.isArray(booking.vehicles) && booking.vehicles.length > 1) {
        vehicleDetails = `🚗 *Vehicles Booked (${booking.vehicles.length} Vehicles):*\n` +
          booking.vehicles.map((v, i) => `  ${i+1}️⃣ ${v.name}${v.transmission ? ` (${v.transmission})` : ''} — ${v.days} Days @ ₹${v.price.toLocaleString('en-IN')}/d (Dep: ₹${(v.deposit||0).toLocaleString('en-IN')})`).join('\n');
      } else {
        const singleV = Array.isArray(booking.vehicles) && booking.vehicles[0] ? booking.vehicles[0] : null;
        const transInfo = singleV && singleV.transmission ? ` (${singleV.transmission})` : (booking.transmission && booking.transmission !== "Multi" ? ` (${booking.transmission})` : '');
        const daysInfo = singleV ? ` · ${singleV.days} Days` : ` · ${booking.days} Days`;
        vehicleDetails = `🚗 *Vehicle:* ${singleV ? singleV.name : booking.vehicle}${transInfo}${daysInfo}`;
      }

      const rentalStr = booking.rentalTotal ? `\n💰 *Rental Charges:* ₹${booking.rentalTotal.toLocaleString('en-IN')}` : '';
      const depositStr = booking.depositTotal ? `\n🛡️ *Refundable Security Deposit:* ₹${booking.depositTotal.toLocaleString('en-IN')} (100% Refundable on Return)` : '';
      const paymentStr = (booking.advancePaid && booking.advancePaid > 0)
        ? `\n💳 *Payment Mode:* 20% Advance Paid Online (₹${booking.advancePaid.toLocaleString('en-IN')}${booking.transactionId ? ` | Txn: ${booking.transactionId}` : ''})\n💵 *Balance at Handover:* ₹${(booking.balanceAtPickup || booking.total).toLocaleString('en-IN')}`
        : `\n💳 *Payment Mode:* Pay at Pickup (₹0 Paid)\n💵 *Total at Handover:* ₹${(booking.balanceAtPickup || booking.total).toLocaleString('en-IN')}`;

      return `Hi Tourent, I have submitted a reservation request:\n\n` +
        `📋 *Reference:* ${booking.id}\n` +
        `${vehicleDetails}\n` +
        `📅 *Trip Pickup Date:* ${booking.pickupDate}\n` +
        `⏰ *Timing Cycle:* 09:00 AM to 09:00 AM (Standard Goa Timings)\n` +
        `📍 *Pickup Point:* ${booking.location}` +
        `${rentalStr}` +
        `${depositStr}` +
        `${paymentStr}\n` +
        `👤 *Name:* ${booking.name}\n` +
        `📞 *Phone:* ${booking.phone}` +
        (booking.notes ? `\n📝 *Notes:* ${booking.notes}` : '') +
        `\n\nPlease confirm availability for my booking. Thank you!`;
    }

    // Admin -> Customer Official WhatsApp Confirmation
    function buildAdminConfirmationWhatsApp(booking){
      let vehicleDetails = "";
      if (Array.isArray(booking.vehicles) && booking.vehicles.length > 1) {
        vehicleDetails = `🚗 *Vehicles (${booking.vehicles.length}):* ` + booking.vehicles.map(v => `${v.name}${v.transmission ? ` (${v.transmission})` : ''} (${v.days}d)`).join(' + ');
      } else {
        const transInfo = booking.transmission && booking.transmission !== "Multi" ? ` (${booking.transmission})` : '';
        vehicleDetails = `🚗 *Vehicle:* ${booking.vehicle}${transInfo}`;
      }

      const rentalStr = booking.rentalTotal ? `• Rental Charges: ₹${booking.rentalTotal.toLocaleString('en-IN')}\n` : '';
      const depositStr = booking.depositTotal ? `• Refundable Security Deposit: ₹${booking.depositTotal.toLocaleString('en-IN')} (100% Refundable)\n` : '';

      return `🎉 *Tourent Goa — Booking CONFIRMED* 🟢\n\n` +
        `Hi ${booking.name}, your vehicle reservation has been *CONFIRMED* by Tourent Admin!\n\n` +
        `📋 *Booking ID:* ${booking.id}\n` +
        `${vehicleDetails}\n` +
        `📅 *Rental Dates:* ${booking.pickupDate} to ${booking.returnDate} (${booking.days} day${booking.days>1?'s':''})\n` +
        `⏰ *Timing Cycle:* 09:00 AM to 09:00 AM (Return by 09:00 AM on final day)\n` +
        `📍 *Pickup Point:* ${booking.location}\n\n` +
        `💰 *Payment Breakdown:*\n` +
        `${rentalStr}` +
        `${depositStr}` +
        `💵 *Total Amount at Handover:* ₹${booking.total.toLocaleString('en-IN')}\n\n` +
        `✅ *Pickup Checklist & Rules:*\n` +
        `• Original Driving License & Aadhaar/ID\n` +
        `• Security deposit (100% refundable at vehicle return)\n` +
        `• Return vehicle by 09:00 AM next morning / final date\n\n` +
        `📞 *Helpline:* +91 93227 30029 / +91 93224 69973\n` +
        `📍 Panaji · Margao · Vasco · Dabolim & Mopa Airports\n\n` +
        `We are excited to serve you in Goa! 🌴🚗`;
    }

    // Admin -> Customer Decline / Cancellation
    function buildAdminDeclineWhatsApp(booking){
      return `Hi ${booking.name}, thank you for choosing Tourent Goa.\n\n` +
        `Regarding your booking request *${booking.id}* for *${booking.vehicle}* (${booking.pickupDate} to ${booking.returnDate}):\n` +
        `Unfortunately, this vehicle is currently unavailable for the chosen dates.\n\n` +
        `Please message or call us at *+91 93227 30029* so we can arrange the best available alternate vehicle for you.\n\n` +
        `Tourent Vehicle Rentals, Goa`;
    }

    // Floating "chat with us" button — general inquiries, works immediately.
    document.getElementById('whatsappFab').addEventListener('click', (e)=>{
      e.preventDefault();
      const text = "Hi Tourent, I'd like to enquire about renting a vehicle in Goa.";
      window.open(buildWhatsAppLink(WHATSAPP_NUMBER, text), '_blank', 'noopener');
    });

    function attemptAutoWhatsApp(booking){
      const statusEl = document.getElementById('whatsappStatus');
      if(!WHATSAPP_AUTOMATION_URL){
        return; // Tier 2 not configured — Tier 1 button below still works fully.
      }
      if(statusEl){
        statusEl.hidden = false;
        statusEl.className = 'email-status sending';
        statusEl.textContent = `Sending your confirmation to WhatsApp...`;
      }

      fetch(WHATSAPP_AUTOMATION_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(booking)
      })
        .then(res => { if(!res.ok) throw new Error('Automation endpoint returned ' + res.status); return res.json(); })
        .then(()=>{
          if(statusEl){
            statusEl.className = 'email-status sent';
            statusEl.textContent = `Confirmation sent to your WhatsApp.`;
          }
        })
        .catch((err)=>{
          console.error('WhatsApp automation failed:', err);
          if(statusEl){
            statusEl.className = 'email-status failed';
            statusEl.textContent = 'Automatic WhatsApp send failed — use the button below to send it yourself in one tap.';
          }
        });
    }

    /* ============ FLEET RENDER ============ */
    const fleetGrid = document.getElementById('fleetGrid');

    function isTwoWheelerVehicle(v) {
      if (!v) return false;
      if (v.cat === "two" || v.cat === "bike" || v.cat === "scooter") return true;
      const tag = (v.tag || "").toLowerCase();
      if (tag.includes("scooter") || tag.includes("motorcycle") || tag.includes("bike")) return true;
      const name = (v.name || "").toLowerCase();
      if (name.includes("activa") || name.includes("fascino") || name.includes("hunter") || name.includes("himalayan") || name.includes("jupiter") || name.includes("access") || name.includes("bullet") || name.includes("vespa")) return true;
      return false;
    }

    function getVehicleTransmissionPrice(v, chosenTrans) {
      if (!v) return 1800;
      const trans = (chosenTrans || v.trans || "Manual").toLowerCase();
      const isAuto = trans.includes("auto") || trans.includes("cvt") || trans.includes("amt");
      
      if (isAuto) {
        if (v.priceAuto !== null && v.priceAuto !== undefined && Number(v.priceAuto) > 0) {
          return Number(v.priceAuto);
        }
        if (v.priceManual && Number(v.priceManual) > 0) {
          return Math.round((Number(v.priceManual) * 1.2) / 50) * 50;
        }
        return Number(v.price) || 2200;
      } else {
        if (v.priceManual !== null && v.priceManual !== undefined && Number(v.priceManual) > 0) {
          return Number(v.priceManual);
        }
        return Number(v.price) || 1800;
      }
    }

    function getEffectiveVehicleRate(vehicle, chosenTrans, pickupDateStr) {
      const baseRate = getVehicleTransmissionPrice(vehicle, chosenTrans);
      const surge = getSurgeRuleForDate(pickupDateStr);
      const multiplier = (surge && surge.isSurged && Number(surge.multiplier) > 1.0) ? Number(surge.multiplier) : 1.0;
      const chargedRate = Math.round(baseRate * multiplier);
      // Original standard counter rack rate is ALWAYS higher than the discounted Tourent rate
      const originalRate = Math.round((chargedRate * 1.25) / 50) * 50;
      return {
        baseRate,
        finalRate: chargedRate,
        originalRate,
        multiplier: surge.multiplier,
        name: surge.name,
        badge: surge.badge,
        isSurged: surge.isSurged
      };
    }

    function getVehicleTransOptions(v) {
      if (!v) return { hasBoth: true, isAutoOnly: false, isManualOnly: false, defaultTrans: "Manual" };
      const t = (v.trans || "").toLowerCase();
      const name = (v.name || "").toLowerCase();
      const isScooter = name.includes("activa") || name.includes("fascino") || name.includes("jupiter") || name.includes("access") || name.includes("vespa") || v.tag === "Scooter";
      const isBike = name.includes("hunter") || name.includes("himalayan") || name.includes("bullet") || name.includes("classic") || v.tag === "Motorcycle" || v.tag === "Adventure bike";

      if (isScooter) {
        return { hasBoth: false, isAutoOnly: true, isManualOnly: false, defaultTrans: "Automatic" };
      }
      if (isBike) {
        return { hasBoth: false, isAutoOnly: false, isManualOnly: true, defaultTrans: "Manual" };
      }

      const isExplicitAutoOnly = (v.cat === "lux" || t === "automatic" || t === "hybrid cvt" || name.includes("hycross") || name.includes("fortuner") || name.includes("defender") || name.includes("bmw") || name.includes("audi") || name.includes("mini") || name.includes("hyryder"));

      if (isExplicitAutoOnly) {
        return { hasBoth: false, isAutoOnly: true, isManualOnly: false, defaultTrans: "Automatic" };
      }

      return { hasBoth: true, isAutoOnly: false, isManualOnly: false, defaultTrans: "Manual" };
    }

    function renderFleet(cat, selectedDateStr){
      const grid = document.getElementById('fleetGrid');
      if (!grid) return;
      grid.innerHTML = "";
      const activeVehicles = (Array.isArray(VEHICLES) ? VEHICLES : []).filter(v => v.active !== false);
      const list = cat === "all" ? activeVehicles : activeVehicles.filter(v => v.cat === cat);
      const pickupDateVal = selectedDateStr || document.getElementById('fleetPickupDate')?.value || todayISO(1);

      if (list.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: #64748b; font-size: 15px; font-weight: 600;">
            No vehicles currently available in this category. Please select another category above.
          </div>
        `;
        return;
      }

      list.forEach((v, idx)=>{
        const isTwoWheeler = isTwoWheelerVehicle(v);
        const transOpts = getVehicleTransOptions(v);
        const effManual = getEffectiveVehicleRate(v, "Manual", pickupDateVal);
        const effAuto = getEffectiveVehicleRate(v, "Automatic", pickupDateVal);
        const priceManual = effManual.finalRate;
        const priceAuto = effAuto.finalRate;
        const origManual = effManual.originalRate;
        const origAuto = effAuto.originalRate;

        const initTrans = transOpts.defaultTrans;
        const currentDiscounted = initTrans === "Automatic" ? priceAuto : priceManual;
        const currentOriginal = initTrans === "Automatic" ? origAuto : origManual;
        const savingsPercent = Math.max(5, Math.round(((currentOriginal - currentDiscounted) / currentOriginal) * 100));

        let transHTML = "";
        if (!isTwoWheeler) {
          if (transOpts.hasBoth) {
            transHTML = `
              <div class="vcard-trans-box">
                <span class="vcard-trans-label">Gearbox</span>
                <div class="vcard-trans-toggles">
                  <button type="button" class="trans-pill-btn active" data-val="Manual">Manual</button>
                  <button type="button" class="trans-pill-btn" data-val="Automatic">Automatic</button>
                </div>
              </div>
            `;
          } else if (transOpts.isAutoOnly) {
            transHTML = `
              <div class="vcard-trans-box">
                <span class="vcard-trans-label">Gearbox</span>
                <span class="trans-badge-single">Automatic</span>
              </div>
            `;
          } else {
            transHTML = `
              <div class="vcard-trans-box">
                <span class="vcard-trans-label">Gearbox</span>
                <span class="trans-badge-single">Manual</span>
              </div>
            `;
          }
        }

        const availInfo = LIVE_AVAILABILITY ? LIVE_AVAILABILITY[v.id] : null;
        const totalUnits = Number(v.totalUnits) || (v.id === 'v_baleno' ? 20 : 10);
        const remUnits = availInfo !== null && availInfo !== undefined ? availInfo.availableUnits : totalUnits;
        const isSoldOut = remUnits <= 0;
        const isLowStock = !isSoldOut && remUnits <= 3;

        let stockBadgeHTML = '';
        if (isSoldOut) {
          stockBadgeHTML = `<span class="vcard-stock-badge sold-out" title="Fully booked for selected dates"><span class="stock-live-dot"></span>Sold Out</span>`;
        } else if (isLowStock) {
          stockBadgeHTML = `<span class="vcard-stock-badge low-stock" title="High demand! Only ${remUnits} of ${totalUnits} units remaining"><span class="stock-live-dot"></span>Only ${remUnits} Left</span>`;
        } else {
          stockBadgeHTML = `<span class="vcard-stock-badge in-stock" title="${remUnits} of ${totalUnits} units available in fleet"><span class="stock-live-dot"></span>${remUnits} Available</span>`;
        }

        let badgeHTML = '';
        if (effManual.isSurged) {
          badgeHTML = `<span class="vcard-surge-tag" style="background:linear-gradient(135deg,#ea580c 0%,#c2410c 100%);">${effManual.badge || '🔥 Peak Season Tariff'}</span>`;
        } else {
          badgeHTML = `<span class="vcard-surge-tag" style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);">🏷️ ${savingsPercent}% OFF</span>`;
        }

        const card = document.createElement('div');
        card.className = "vcard reveal is-visible" + (isSoldOut ? " is-sold-out" : "");
        card.dataset.id = v.id;
        card.dataset.selectedTrans = initTrans;
        card.dataset.manualPrice = priceManual;
        card.dataset.autoPrice = priceAuto;
        card.dataset.origManualPrice = origManual;
        card.dataset.origAutoPrice = origAuto;
        card.innerHTML = `
          <div class="vcard-media">
            <span class="vcard-tag">${v.tag}</span>
            ${badgeHTML}
            <img
              class="vcard-photo"
              src="${photoUrlFor(v.name)}"
              alt="${v.name}"
              loading="${idx < 2 ? 'eager' : 'lazy'}"
              decoding="async"
              ${idx === 0 ? 'fetchpriority="high"' : ''}
            >
          </div>
          <div class="vcard-body">
            <div class="vcard-title-row">
              <h4>${v.name}</h4>
              ${stockBadgeHTML}
            </div>
            <div class="vcard-meta">
              <span>${v.seats} seats</span>
              <span>${v.fuel}</span>
              <span>${v.mileage} km/l</span>
            </div>
            ${transHTML}
            <div class="vcard-foot">
              <div class="vcard-price">
                <span class="vcard-was-price">₹${currentOriginal.toLocaleString('en-IN')}</span>
                <strong class="vcard-price-value">₹${currentDiscounted.toLocaleString('en-IN')}</strong>
                <span>per day</span>
              </div>
              ${isSoldOut 
                ? `<button class="vcard-btn vcard-btn-soldout" disabled data-vehicle="${v.name.replace(/"/g,'&quot;')}">Sold Out</button>`
                : `<button class="vcard-btn" data-vehicle="${v.name.replace(/"/g,'&quot;')}">Reserve</button>`
              }
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
      observeReveals();
    }
    renderFleet("all");

    document.getElementById('tabBar').addEventListener('click', (e)=>{
      const btn = e.target.closest('.tab');
      if(!btn) return;
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      btn.classList.add('active');
      renderFleet(btn.dataset.cat, document.getElementById('fleetPickupDate')?.value);
    });

    // Setup Fleet Date Filter Bar for real-time inventory checking & dynamic pricing
    const fleetPickupInput = document.getElementById('fleetPickupDate');
    const fleetReturnInput = document.getElementById('fleetReturnDate');
    const btnCheckFleetAvail = document.getElementById('btnCheckFleetAvail');

    if (fleetPickupInput && fleetReturnInput) {
      const pDefault = todayISO(1);
      const rDefault = todayISO(4);
      fleetPickupInput.value = pDefault;
      fleetReturnInput.value = rDefault;
      fleetPickupInput.min = todayISO(0);
      fleetReturnInput.min = todayISO(1);

      const onPickupDateChange = () => {
        if (fleetPickupInput.value) {
          fleetReturnInput.min = fleetPickupInput.value;
          if (fleetReturnInput.value && fleetReturnInput.value < fleetPickupInput.value) {
            const nextDay = new Date(fleetPickupInput.value);
            nextDay.setDate(nextDay.getDate() + 3);
            fleetReturnInput.value = nextDay.toISOString().slice(0, 10);
          }
          const activeCat = document.querySelector('.tab.active')?.dataset.cat || 'all';
          renderFleet(activeCat, fleetPickupInput.value);
          fetchFleetAvailability(fleetPickupInput.value, fleetReturnInput.value);
        }
      };
      fleetPickupInput.addEventListener('change', onPickupDateChange);
      fleetPickupInput.addEventListener('input', onPickupDateChange);

      const onReturnDateChange = () => {
        if (fleetPickupInput.value && fleetReturnInput.value) {
          fetchFleetAvailability(fleetPickupInput.value, fleetReturnInput.value);
        }
      };
      fleetReturnInput.addEventListener('change', onReturnDateChange);
      fleetReturnInput.addEventListener('input', onReturnDateChange);

      if (btnCheckFleetAvail) {
        btnCheckFleetAvail.addEventListener('click', () => {
          const activeCat = document.querySelector('.tab.active')?.dataset.cat || 'all';
          renderFleet(activeCat, fleetPickupInput.value);
          fetchFleetAvailability(fleetPickupInput.value, fleetReturnInput.value);
        });
      }
    }

    // event delegation for Transmission pills and "Reserve" buttons rendered dynamically above
    const fleetGridContainer = document.getElementById('fleetGrid');
    if (fleetGridContainer) {
      fleetGridContainer.addEventListener('click', (e)=>{
      const pill = e.target.closest('.trans-pill-btn');
      if (pill) {
        const card = pill.closest('.vcard');
        const toggles = pill.closest('.vcard-trans-toggles');
        toggles.querySelectorAll('.trans-pill-btn').forEach(b => b.classList.remove('active'));
        pill.classList.add('active');
        if (card) {
          const selectedTrans = pill.dataset.val;
          card.dataset.selectedTrans = selectedTrans;
          const priceValueEl = card.querySelector('.vcard-price-value');
          const wasPriceEl = card.querySelector('.vcard-was-price');
          if (priceValueEl) {
            const price = selectedTrans === 'Automatic' ? Number(card.dataset.autoPrice) : Number(card.dataset.manualPrice);
            priceValueEl.textContent = '₹' + price.toLocaleString('en-IN');
          }
          if (wasPriceEl) {
            const origPrice = selectedTrans === 'Automatic' ? Number(card.dataset.origAutoPrice || card.dataset.autoPrice) : Number(card.dataset.origManualPrice || card.dataset.manualPrice);
            wasPriceEl.textContent = '₹' + origPrice.toLocaleString('en-IN');
          }
        }
        return;
      }

      const btn = e.target.closest('.vcard-btn');
      if(!btn || btn.disabled || btn.classList.contains('vcard-btn-soldout')) return;
      const card = btn.closest('.vcard');
      const chosenTrans = card?.dataset.selectedTrans || "Manual";
      openBooking(btn.dataset.vehicle, null, chosenTrans);
    });
  }

    /* ============ ESTIMATOR ============ */
    const vehicleSelect = document.getElementById('vehicleSelect');
    const pickupSelect = document.getElementById('pickupSelect');
    const destSelect = document.getElementById('destSelect');
    const travelStyleSelect = document.getElementById('travelStyleSelect');
    const specificRouteRow = document.getElementById('specificRouteRow');

    function populateEstimatorVehicles() {
      if (!vehicleSelect) return;
      const currVal = vehicleSelect.value;
      vehicleSelect.innerHTML = "";
      VEHICLES.forEach((v,i)=>{
        const eff = getEffectiveVehicleRate(v, "Manual", new Date());
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${v.name} — ₹${eff.finalRate.toLocaleString('en-IN')}/day`;
        vehicleSelect.appendChild(opt);
      });
      if (currVal !== "" && Number(currVal) < VEHICLES.length) {
        vehicleSelect.value = currVal;
      }
    }
    populateEstimatorVehicles();

    pickupSelect.innerHTML = "";
    const pickupGroups = {};
    PICKUP_POINTS.forEach((p, i) => {
      const gName = p.group || 'Pickup Points';
      if (!pickupGroups[gName]) {
        pickupGroups[gName] = document.createElement('optgroup');
        pickupGroups[gName].label = gName;
        pickupSelect.appendChild(pickupGroups[gName]);
      }
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = p.label || p.name;
      pickupGroups[gName].appendChild(opt);
    });

    const estPickupDetailsWrap = document.getElementById('estPickupDetailsWrap');
    const estPickupAddressField = document.getElementById('estPickupAddressField');
    const estPickupAddressInput = document.getElementById('estPickupAddress');

    function updateEstPickupLocationUI() {
      if (!pickupSelect || !estPickupDetailsWrap) return;
      const selectedPoint = PICKUP_POINTS[pickupSelect.value];
      const name = selectedPoint ? selectedPoint.name : '';
      const isDoorstep = /hotel|resort|airbnb|villa|custom|doorstep/i.test(name);

      if (isDoorstep) {
        estPickupDetailsWrap.style.display = 'block';
        if (estPickupAddressField) estPickupAddressField.style.display = 'block';
      } else {
        estPickupDetailsWrap.style.display = 'none';
        if (estPickupAddressField) estPickupAddressField.style.display = 'none';
      }
    }

    if (pickupSelect) {
      pickupSelect.addEventListener('change', updateEstPickupLocationUI);
      updateEstPickupLocationUI();
    }

    DESTINATIONS.forEach((d,i)=>{
      const opt = document.createElement('option');
      opt.value = i; opt.textContent = d.name;
      destSelect.appendChild(opt);
    });

    const TRAVEL_STYLE_DATA = {
      explorer: {
        title: "🚗 Standard Goa Explorer",
        badge: "~85 km / Day (Recommended)",
        desc: "Designed for classic Goa holiday trips covering beach hopping, scenic coastal forts, sunset viewpoints, famous beach clubs, and dining across North &amp; South Goa.",
        tags: [
          "🏖️ Baga, Calangute, Anjuna &amp; Vagator",
          "🏰 Fort Aguada &amp; Chapora Fort",
          "🍽️ Tito's Lane, Thalassa &amp; Beach Shacks",
          "🌅 Daily Sunset &amp; Nightlife Cruising"
        ]
      },
      relaxed: {
        title: "🌴 Relaxed Beach Stay",
        badge: "~50 km / Day",
        desc: "Ideal for travelers chilling in one coastal belt (e.g. Candolim, Morjim, or South Goa). Perfect for short trips to nearby cafes, local shacks, and village markets.",
        tags: [
          "🏖️ Local Beach Shacks &amp; Lounging",
          "☕ Nearby Bakeries &amp; Breakfast Cafes",
          "🛍️ Flea Markets &amp; Village Shopping",
          "🌊 Low-Mileage Leisure Driving"
        ]
      },
      roadtripper: {
        title: "🗺️ Active Road Tripper",
        badge: "~140 km / Day",
        desc: "For adventurous travelers planning deep exploration across Goa, including famous inland waterfalls, scenic wildlife sanctuaries, and full North-to-South cross-state road trips.",
        tags: [
          "🌊 Dudhsagar Falls &amp; Netravali",
          "🏰 Cabo de Rama &amp; Old Goa Churches",
          "🌿 Bondla Sanctuary &amp; Sahyadris",
          "🚗 Long-Distance Cross Goa Touring"
        ]
      },
      specific: {
        title: "🎯 Point-to-Point Specific Route",
        badge: "Direct Route Calculation",
        desc: "Calculates the exact GPS road distance from your chosen pickup point directly to your selected destination below.",
        tags: [
          "✈️ Airport to Hotel Direct Transfer",
          "🏨 Single Destination Resort Stay",
          "📍 Exact Road Network Mileage"
        ]
      }
    };

    function updateTravelStyleCard() {
      const val = travelStyleSelect ? travelStyleSelect.value : 'explorer';
      const isSpecific = val === 'specific';
      if (specificRouteRow) {
        specificRouteRow.style.display = isSpecific ? 'flex' : 'none';
      }

      const cardEl = document.getElementById('travelStyleInfoCard');
      if (!cardEl) return;

      const data = TRAVEL_STYLE_DATA[val] || TRAVEL_STYLE_DATA.explorer;
      cardEl.innerHTML = `
        <div class="tsi-head">
          <div class="tsi-title">${data.title}</div>
          <div class="tsi-badge">${data.badge}</div>
        </div>
        <div class="tsi-desc">${data.desc}</div>
        <div class="tsi-tags">
          ${data.tags.map(t => `<span class="tsi-tag">${t}</span>`).join('')}
        </div>
      `;
    }

    if (travelStyleSelect) {
      travelStyleSelect.addEventListener('change', updateTravelStyleCard);
      updateTravelStyleCard();
    }

    let lastEstimate = null;

    function calcBudget(){
      const v = VEHICLES[vehicleSelect.value] || VEHICLES[0];
      const pickup = PICKUP_POINTS[pickupSelect.value] || PICKUP_POINTS[0];
      const d = DESTINATIONS[destSelect.value] || DESTINATIONS[0];
      const days = Math.max(1, Math.min(30, parseInt(document.getElementById('daysInput').value || 3, 10)));
      document.getElementById('daysInput').value = days;

      const style = travelStyleSelect ? travelStyleSelect.value : 'explorer';
      let distance = 0;
      let routeSummary = "";

      if (style === 'relaxed') {
        const dailyKm = 50;
        distance = days * dailyKm;
        routeSummary = `🌴 Relaxed Beach Stay (${days} ${days === 1 ? 'day' : 'days'} · ~${dailyKm} km/day)`;
      } else if (style === 'roadtripper') {
        const dailyKm = 140;
        distance = days * dailyKm;
        routeSummary = `🗺️ Full Goa Road Tripper (${days} ${days === 1 ? 'day' : 'days'} · ~${dailyKm} km/day)`;
      } else if (style === 'specific') {
        const oneWay = document.getElementById('tripType').value === "one";
        const legKm = pickup.dist[d.name] || 45;
        const baseKm = oneWay ? legKm : legKm * 2;
        const extraLocalKm = (days > 1) ? (days - 1) * 35 : 0;
        distance = baseKm + extraLocalKm;
        routeSummary = `${oneWay ? "One-way" : "Round trip"}: ${pickup.name} → ${d.name}${days > 1 ? ` (+${days - 1}d local)` : ''}`;
      } else {
        // Standard Explorer (Default)
        const dailyKm = 85;
        distance = days * dailyKm;
        routeSummary = `🚗 Standard Goa Explorer (${days} ${days === 1 ? 'day' : 'days'} · ~${dailyKm} km/day)`;
      }

      const fuelPrice = FUEL_PRICE[v.fuel] || 96.50;
      const fuelLitres = distance / (v.mileage || 18);
      const fuelCost = fuelLitres * fuelPrice;
      const effVehicle = getEffectiveVehicleRate(v, "Manual", new Date());
      const dailyPrice = effVehicle.finalRate;
      const rentalCost = dailyPrice * days;
      const total = Math.round(fuelCost + rentalCost);

      document.getElementById('resRoute').textContent = routeSummary;
      document.getElementById('resDistance').textContent = `${distance} km total (${days} ${days === 1 ? 'day' : 'days'})`;
      document.getElementById('resMileage').textContent = `${v.mileage} km/l (${v.fuel})`;
      document.getElementById('resFuel').textContent = `${fuelLitres.toFixed(1)} L · ₹${Math.round(fuelCost).toLocaleString('en-IN')}`;
      document.getElementById('resDaysLabel').textContent = days;
      document.getElementById('resRental').textContent = `₹${rentalCost.toLocaleString('en-IN')}`;
      document.getElementById('resTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
      document.getElementById('resFuelLine').textContent = `${fuelLitres.toFixed(1)} litres of ${v.fuel}`;
      document.getElementById('resSubLine').textContent = `${v.name} · ₹${dailyPrice.toLocaleString('en-IN')}/day`;

      const maxTank = Math.max(40, Math.ceil(fuelLitres / 10) * 10);
      const pct = Math.min(1, fuelLitres / maxTank);
      const circumference = 264;
      document.getElementById('gaugeArc').setAttribute('stroke-dashoffset', circumference - (circumference * pct));
      document.getElementById('gaugeText').textContent = fuelLitres.toFixed(0) + "L";

      lastEstimate = { vehicleName: v.name, days, total, distance };

      const card = document.getElementById('resultCard');
      if (card) {
        card.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';
        card.style.transform = 'scale(1.02)';
        setTimeout(() => { card.style.transform = 'scale(1)'; }, 250);
      }
    }

    document.getElementById('calcBtn').addEventListener('click', calcBudget);

    vehicleSelect.selectedIndex = 0;
    pickupSelect.selectedIndex = 0;
    destSelect.selectedIndex = 8;

    document.getElementById('bookFromEstimatorBtn').addEventListener('click', ()=>{
      if (!lastEstimate) calcBudget();
      const v = VEHICLES[vehicleSelect.value] || VEHICLES[0];
      const estPoint = PICKUP_POINTS[pickupSelect.value];
      const estAddress = estPickupAddressInput ? estPickupAddressInput.value.trim() : '';
      openBooking(v.name, {
        days: parseInt(document.getElementById('daysInput').value || 3, 10),
        pickupLocationName: estPoint ? estPoint.name : '',
        pickupAddress: estAddress
      });
    });

    /* ============ SCROLL REVEAL ============ */
    function observeReveals(){
      const els = document.querySelectorAll('.reveal:not(.is-visible)');
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(en=>{
          if(en.isIntersecting){ en.target.classList.add('is-visible'); io.unobserve(en.target); }
        });
      }, {threshold:0.15});
      els.forEach(el=>io.observe(el));
    }
    observeReveals();

    /* ============ HEADER SHRINK ============ */
    const header = document.getElementById('siteHeader');
    if (header) {
      const updateHeaderShrink = () => {
        header.classList.toggle('shrink', window.scrollY > 30);
      };
      window.addEventListener('scroll', updateHeaderShrink, { passive: true });
      updateHeaderShrink();
    }

    /* ============ MOBILE NAV ============ */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    navToggle.addEventListener('click', ()=>{
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.textContent = isOpen ? '✕' : '☰';
    });
    navLinks.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', (e)=>{
        if(a.id === 'myBookingsLink') return; // handled separately below
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.textContent = '☰';
        navToggle.setAttribute('aria-expanded','false');
      });
    });

    document.addEventListener('click', (e) => {
      if (navLinks && navLinks.classList.contains('open')) {
        if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
          navLinks.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.textContent = '☰';
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });

    /* ============ TOAST ============ */
    let toastTimer = null;
    function showToast(msg){
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(()=> toast.classList.remove('show'), 2800);
    }

    /* ============ BOOKING MODAL ============ */
    const bookingOverlay = document.getElementById('bookingOverlay');
    const bookingForm = document.getElementById('bookingForm');
    const bookingFormView = document.getElementById('bookingFormView');
    const bookingSuccessView = document.getElementById('bookingSuccessView');
    const bookingError = document.getElementById('bookingError');


    function todayISO(offsetDays=0){
      const d = new Date();
      d.setDate(d.getDate()+offsetDays);
      return d.toISOString().slice(0,10);
    }
    document.getElementById('bkPickupDate').min = todayISO();

    let activeBookingVehicles = [];

    function getVehicleSecurityDeposit(v) {
      if (!v) return 3000;
      const cat = (v.cat || '').toLowerCase();
      if (cat === 'two') {
        return 0; // Zero security deposit for two-wheelers
      }
      if (v.deposit !== undefined && Number(v.deposit) >= 0) return Number(v.deposit);
      const name = (v.name || '').toLowerCase();

      if (cat === 'lux' || name.includes('bmw') || name.includes('audi') || name.includes('defender') || name.includes('mini') || name.includes('fortuner') || name.includes('hycross')) {
        return 10000;
      }
      if (cat === 'suv' || name.includes('thar') || name.includes('crysta') || name.includes('ertiga') || name.includes('carens') || name.includes('alcazar') || name.includes('scorpio')) {
        return 5000;
      }
      return 3000;
    }

    function formatShortDate(dateObj) {
      if (!dateObj || isNaN(dateObj.getTime())) return "";
      return dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    }

    function renderBookingVehiclesList() {
      const container = document.getElementById('bookingVehiclesList');
      if (!container) return;

      if (!activeBookingVehicles.length) {
        activeBookingVehicles = [{ vehicleIndex: 0, transmission: "Manual", days: 3 }];
      }

      const pickupVal = document.getElementById('bkPickupDate')?.value;
      const basePickupDate = pickupVal ? new Date(pickupVal) : new Date();
      const surgeRule = getSurgeRuleForDate(pickupVal);

      let surgeBannerHTML = '';
      if (surgeRule && surgeRule.isSurged) {
        const multPct = Math.round((surgeRule.multiplier - 1) * 100);
        surgeBannerHTML = `
          <div style="background:linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%);border:1.5px solid #fdba74;border-radius:12px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;">
            <span style="font-size:20px;">🎄</span>
            <div style="font-size:12.5px;color:#9a3412;line-height:1.4;">
              <strong>${surgeRule.badge || `${surgeRule.name} (+${multPct}%)`}</strong> active for your selected travel dates (${formatShortDate(basePickupDate)}).
            </div>
          </div>
        `;
      }

      const cardsHTML = activeBookingVehicles.map((item, idx) => {
        const v = VEHICLES[item.vehicleIndex] || VEHICLES[0];
        const is2W = isTwoWheelerVehicle(v);
        const transOpts = getVehicleTransOptions(v);
        const days = Math.max(1, parseInt(item.days, 10) || 1);
        const effRate = getEffectiveVehicleRate(v, item.transmission, pickupVal);
        const currentRate = effRate.finalRate;
        const subtotal = currentRate * days;
        const deposit = getVehicleSecurityDeposit(v);

        const carReturnDate = new Date(basePickupDate);
        carReturnDate.setDate(carReturnDate.getDate() + days);
        const returnFormatted = formatShortDate(carReturnDate);

        let transHTML = "";
        if (!is2W) {
          transHTML = `
            <div class="modal-trans-row" style="margin-top:0;flex:1;">
              <label class="modal-trans-label ${item.transmission === 'Manual' ? 'active' : ''}" style="${transOpts.isAutoOnly ? 'opacity:0.35;cursor:not-allowed;' : ''}">
                <input type="radio" name="bkTrans_${idx}" value="Manual" ${item.transmission === 'Manual' ? 'checked' : ''} ${transOpts.isAutoOnly ? 'disabled' : ''}>
                <span>⚙️ Manual</span>
              </label>
              <label class="modal-trans-label ${item.transmission === 'Automatic' ? 'active' : ''}" style="${transOpts.isManualOnly ? 'opacity:0.35;cursor:not-allowed;' : ''}">
                <input type="radio" name="bkTrans_${idx}" value="Automatic" ${item.transmission === 'Automatic' ? 'checked' : ''} ${transOpts.isManualOnly ? 'disabled' : ''}>
                <span>⚡ Auto</span>
              </label>
            </div>
          `;
        }

        // Calculate other cards in activeBookingVehicles already using each vehicle model
        const otherCardsUsedCounts = {};
        activeBookingVehicles.forEach((otherItem, oIdx) => {
          if (oIdx !== idx) {
            const oV = VEHICLES[otherItem.vehicleIndex];
            if (oV) {
              otherCardsUsedCounts[oV.id] = (otherCardsUsedCounts[oV.id] || 0) + 1;
            }
          }
        });

        const optionsHTML = VEHICLES.map((veh, vIdx) => {
          const transForVeh = (vIdx === item.vehicleIndex) ? item.transmission : getVehicleTransOptions(veh).defaultTrans;
          const effForVeh = getEffectiveVehicleRate(veh, transForVeh, pickupVal);
          const rateForVeh = effForVeh.finalRate;

          const availInfo = LIVE_AVAILABILITY ? LIVE_AVAILABILITY[veh.id] : null;
          const totalUnits = Number(veh.totalUnits) || (veh.id === 'v_baleno' ? 20 : 10);
          const baseAvail = availInfo !== null && availInfo !== undefined ? availInfo.availableUnits : totalUnits;
          const otherCardsUsingThisVeh = otherCardsUsedCounts[veh.id] || 0;
          const isCurrentSelection = (vIdx === item.vehicleIndex);

          let stockBadge = '';
          let isOptionDisabled = false;

          if (baseAvail <= 0) {
            stockBadge = ' · (Sold Out)';
            if (!isCurrentSelection) isOptionDisabled = true;
          } else if (otherCardsUsingThisVeh >= baseAvail && !isCurrentSelection) {
            stockBadge = ` · (All ${baseAvail} added to booking)`;
            isOptionDisabled = true;
          } else if (baseAvail <= 3) {
            stockBadge = ` · (Only ${baseAvail} left)`;
          } else {
            stockBadge = ` · (${baseAvail} available)`;
          }

          return `
            <option value="${vIdx}" ${isCurrentSelection ? 'selected' : ''} ${isOptionDisabled ? 'disabled' : ''}>
              ${veh.name} (${veh.seats} Seats) — ₹${rateForVeh.toLocaleString('en-IN')}/day${stockBadge}
            </option>
          `;
        }).join('');

        return `
          <div class="bk-vehicle-card" data-card-index="${idx}">
            <div class="bk-vehicle-card-head">
              <span class="bk-v-num">🚗 Vehicle #${idx + 1}</span>
              ${activeBookingVehicles.length > 1 ? `<button type="button" class="bk-v-remove-btn" data-remove-index="${idx}">✕ Remove</button>` : ''}
            </div>
            
            <div class="field" style="margin-bottom:0;">
              <select class="bk-v-select" data-select-index="${idx}">
                ${optionsHTML}
              </select>
            </div>

            <div class="bk-v-actions-row">
              ${transHTML}

              <!-- Dedicated Capsule Stepper Matching User Image -->
              <div class="bk-capsule-stepper">
                <button type="button" class="bk-capsule-btn bk-v-minus" data-idx="${idx}" aria-label="Decrease days">−</button>
                <div class="bk-capsule-display">
                  <span class="bk-capsule-val">${days}</span>
                  <span class="bk-capsule-label">Days</span>
                </div>
                <button type="button" class="bk-capsule-btn bk-v-plus" data-idx="${idx}" aria-label="Increase days">+</button>
              </div>
            </div>

            <div class="bk-v-calc-preview">
              <span>📅 Return: ${returnFormatted} (${days}d) · Rental: ₹${subtotal.toLocaleString('en-IN')} + Deposit: ₹${deposit.toLocaleString('en-IN')}</span>
              <strong>₹${(subtotal + deposit).toLocaleString('en-IN')}</strong>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = surgeBannerHTML + cardsHTML;

      container.querySelectorAll('.bk-v-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
          const cardIdx = parseInt(e.target.dataset.selectIndex, 10);
          const newVIdx = parseInt(e.target.value, 10);
          const newV = VEHICLES[newVIdx] || VEHICLES[0];
          const newOpts = getVehicleTransOptions(newV);
          let newTrans = newOpts.defaultTrans;
          if (newOpts.isAutoOnly) newTrans = "Automatic";
          if (newOpts.isManualOnly) newTrans = "Manual";

          activeBookingVehicles[cardIdx].vehicleIndex = newVIdx;
          activeBookingVehicles[cardIdx].transmission = isTwoWheelerVehicle(newV) ? "" : newTrans;
          renderBookingVehiclesList();
        });
      });

      container.querySelectorAll('.modal-trans-label').forEach(label => {
        label.addEventListener('click', () => {
          const radio = label.querySelector('input');
          if (radio && !radio.disabled) {
            const card = label.closest('.bk-vehicle-card');
            const cardIdx = parseInt(card.dataset.cardIndex, 10);
            activeBookingVehicles[cardIdx].transmission = radio.value;
            renderBookingVehiclesList();
          }
        });
      });

      container.querySelectorAll('.bk-v-minus').forEach(btn => {
        btn.addEventListener('click', () => {
          const cardIdx = parseInt(btn.dataset.idx, 10);
          if (activeBookingVehicles[cardIdx].days > 1) {
            activeBookingVehicles[cardIdx].days -= 1;
            renderBookingVehiclesList();
          }
        });
      });

      container.querySelectorAll('.bk-v-plus').forEach(btn => {
        btn.addEventListener('click', () => {
          const cardIdx = parseInt(btn.dataset.idx, 10);
          if (activeBookingVehicles[cardIdx].days < 90) {
            activeBookingVehicles[cardIdx].days += 1;
            renderBookingVehiclesList();
          }
        });
      });

      container.querySelectorAll('.bk-v-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const removeIdx = parseInt(e.target.dataset.removeIndex, 10);
          if (activeBookingVehicles.length > 1) {
            activeBookingVehicles.splice(removeIdx, 1);
            renderBookingVehiclesList();
          }
        });
      });

      const addBtn = document.getElementById('addVehicleToBookingBtn');
      if (addBtn) {
        addBtn.style.display = activeBookingVehicles.length >= 5 ? 'none' : 'inline-flex';
      }

      updateBookingLiveSummary();
    }

    let pendingPaymentBooking = null;

    function updateBookingLiveSummary() {
      const pickupVal = document.getElementById('bkPickupDate')?.value;
      const basePickupDate = pickupVal ? new Date(pickupVal) : new Date();

      const countLabel = document.getElementById('bkSummaryCountLabel');
      if (countLabel) countLabel.textContent = `${activeBookingVehicles.length} ${activeBookingVehicles.length === 1 ? 'Vehicle' : 'Vehicles'}`;

      let totalRentalFare = 0;
      let totalSecurityDeposit = 0;

      const vehicleLines = activeBookingVehicles.map(item => {
        const v = VEHICLES[item.vehicleIndex] || VEHICLES[0];
        const days = Math.max(1, parseInt(item.days, 10) || 1);
        const effRate = getEffectiveVehicleRate(v, item.transmission, pickupVal);
        const currentRate = effRate.finalRate;
        const subtotal = currentRate * days;
        const deposit = getVehicleSecurityDeposit(v);

        totalRentalFare += subtotal;
        totalSecurityDeposit += deposit;

        const carReturnDate = new Date(basePickupDate);
        carReturnDate.setDate(carReturnDate.getDate() + days);
        const retStr = formatShortDate(carReturnDate);

        const trans = item.transmission ? ` (${item.transmission})` : '';
        const surgeBadge = '';
        return `<div>🚗 <strong>${v.name}</strong>${trans}${surgeBadge} · ${days}d @ ₹${currentRate.toLocaleString('en-IN')}/d = ₹${subtotal.toLocaleString('en-IN')} + <em>₹${deposit.toLocaleString('en-IN')} dep.</em> (Return: ${retStr})</div>`;
      });

      const advanceAmount = Math.round(totalRentalFare * 0.20);
      const balanceRental = totalRentalFare - advanceAmount;
      const balancePayableAtPickup = balanceRental + totalSecurityDeposit;

      // Update 20% Advance highlight in guarantee banner
      const advanceHighlightEl = document.getElementById('bkPayAdvanceNowAmount');
      if (advanceHighlightEl) advanceHighlightEl.textContent = `₹ ${advanceAmount.toLocaleString('en-IN')}`;

      const itemsList = document.getElementById('bkSummaryItemsList');
      if (itemsList) {
        itemsList.innerHTML = `
          ${vehicleLines.join('')}
          <div style="margin-top:8px;padding-top:8px;border-top:1px dashed #cbd5e1;display:flex;justify-content:space-between;color:#334155;font-size:12px;">
            <span>Total Rental Charges: <strong>₹${totalRentalFare.toLocaleString('en-IN')}</strong></span>
            <span>Refundable Deposit: <strong style="color:#059669;">₹${totalSecurityDeposit.toLocaleString('en-IN')}</strong></span>
          </div>
        `;
      }

      const summaryTitleEl = document.getElementById('bkSummaryTitle');
      const grandTotalEl = document.getElementById('bkSummaryGrandTotal');
      const balanceRowEl = document.getElementById('bkSummaryBalanceRow');
      const balanceAmountEl = document.getElementById('bkSummaryBalanceAmount');
      const submitBtnEl = document.getElementById('bkSubmitBtn');
      const submitNoteEl = document.getElementById('bkSubmitNote');

      if (summaryTitleEl) summaryTitleEl.textContent = "Advance Payable Now (20%)";
      if (grandTotalEl) grandTotalEl.textContent = `₹ ${advanceAmount.toLocaleString('en-IN')}`;
      if (balanceRowEl) balanceRowEl.style.display = "flex";
      if (balanceAmountEl) balanceAmountEl.textContent = `₹ ${balancePayableAtPickup.toLocaleString('en-IN')} (₹${balanceRental.toLocaleString('en-IN')} rent + ₹${totalSecurityDeposit.toLocaleString('en-IN')} dep.)`;
      if (submitBtnEl) submitBtnEl.textContent = `Proceed to Pay 20% Advance (₹ ${advanceAmount.toLocaleString('en-IN')})`;
      if (submitNoteEl) submitNoteEl.textContent = "Guaranteed instant vehicle lock · Official booking voucher issued immediately.";

      // Check total chosen count for each vehicle against live availability
      const chosenCounts = {};
      activeBookingVehicles.forEach(item => {
        const v = VEHICLES[item.vehicleIndex];
        if (v) chosenCounts[v.id] = (chosenCounts[v.id] || 0) + 1;
      });

      let overbookedVehicle = null;
      for (const [vId, count] of Object.entries(chosenCounts)) {
        const availInfo = LIVE_AVAILABILITY ? LIVE_AVAILABILITY[vId] : null;
        const vObj = VEHICLES.find(v => v.id === vId);
        const total = Number(vObj?.totalUnits) || (vId === 'v_baleno' ? 20 : 10);
        const avail = availInfo !== null && availInfo !== undefined ? availInfo.availableUnits : total;
        if (count > avail) {
          overbookedVehicle = { name: vObj?.name || vId, available: avail, requested: count };
          break;
        }
      }

      if (overbookedVehicle) {
        if (submitBtnEl) {
          submitBtnEl.disabled = true;
          submitBtnEl.style.opacity = '0.6';
          submitBtnEl.style.cursor = 'not-allowed';
          submitBtnEl.textContent = `❌ ${overbookedVehicle.name} Sold Out / Exceeded (${overbookedVehicle.available} Left)`;
        }
        if (bookingError) {
          bookingError.hidden = false;
          bookingError.textContent = `⚠️ Only ${overbookedVehicle.available} unit(s) of ${overbookedVehicle.name} are available for your selected dates. Please adjust quantity or select another model.`;
        }
      } else {
        if (submitBtnEl) {
          submitBtnEl.disabled = false;
          submitBtnEl.style.opacity = '1';
          submitBtnEl.style.cursor = 'pointer';
        }
        if (bookingError && bookingError.textContent.includes('unit(s) of')) {
          bookingError.hidden = true;
        }
      }
    }

    document.getElementById('bkPickupDate')?.addEventListener('change', (e) => {
      const pVal = e.target.value;
      renderBookingVehiclesList();
      updateBookingLiveSummary();
      if (pVal) {
        const maxDays = Math.max(...activeBookingVehicles.map(i => parseInt(i.days, 10) || 1));
        const rDate = new Date(pVal);
        rDate.setDate(rDate.getDate() + maxDays);
        fetchFleetAvailability(pVal, rDate.toISOString().slice(0, 10));
      }
    });

    document.getElementById('addVehicleToBookingBtn')?.addEventListener('click', () => {
      if (activeBookingVehicles.length < 5) {
        activeBookingVehicles.push({ vehicleIndex: 0, transmission: "Manual", days: 3 });
        renderBookingVehiclesList();
      }
    });

    function openBooking(vehicleName, prefillEstimate, prefillTrans){
      const idx = VEHICLES.findIndex(v=>v.name===vehicleName);
      const v = idx > -1 ? VEHICLES[idx] : VEHICLES[0];
      const transOpts = getVehicleTransOptions(v);
      let initTrans = prefillTrans || transOpts.defaultTrans;
      if (transOpts.isAutoOnly) initTrans = "Automatic";
      if (transOpts.isManualOnly) initTrans = "Manual";

      // Check if dates were preselected in fleetDateFilterBar
      const fleetPickup = document.getElementById('fleetPickupDate')?.value;
      const fleetReturn = document.getElementById('fleetReturnDate')?.value;
      let initDays = (prefillEstimate && prefillEstimate.days) || 3;
      if (fleetPickup && fleetReturn) {
        const diffDays = Math.round((new Date(fleetReturn) - new Date(fleetPickup)) / (1000 * 60 * 60 * 24));
        if (diffDays > 0) initDays = diffDays;
      }

      activeBookingVehicles = [{
        vehicleIndex: idx > -1 ? idx : 0,
        transmission: isTwoWheelerVehicle(v) ? "" : initTrans,
        days: initDays
      }];

      bookingError.hidden = true;
      bookingFormView.hidden = false;
      bookingSuccessView.hidden = true;
      document.getElementById('emailStatus').hidden = true;
      document.getElementById('whatsappStatus').hidden = true;

      // Reset all customer details to start with a fresh clean form
      const bkName = document.getElementById('bkName');
      const bkPhone = document.getElementById('bkPhone');
      const bkEmail = document.getElementById('bkEmail');
      const bkNotes = document.getElementById('bkNotes');
      const bkLoc = document.getElementById('bkLocation');
      if (bkName) bkName.value = '';
      if (bkPhone) bkPhone.value = '';
      if (bkEmail) bkEmail.value = '';
      if (bkNotes) bkNotes.value = '';
      if (bkLoc) {
        if (prefillEstimate && prefillEstimate.pickupLocationName) {
          let foundIdx = -1;
          for (let i = 0; i < bkLoc.options.length; i++) {
            if (bkLoc.options[i].value === prefillEstimate.pickupLocationName) {
              foundIdx = i;
              break;
            }
          }
          if (foundIdx > -1) {
            bkLoc.selectedIndex = foundIdx;
          } else {
            bkLoc.selectedIndex = 0;
          }
        } else {
          bkLoc.selectedIndex = 0;
        }
      }
      if (bkPickupAddressInput) {
        bkPickupAddressInput.value = (prefillEstimate && prefillEstimate.pickupAddress) || '';
      }

      const pickup = fleetPickup || todayISO(1);
      document.getElementById('bkPickupDate').value = pickup;

      // Ensure availability is synced for this pickup date
      const rDate = new Date(pickup);
      rDate.setDate(rDate.getDate() + initDays);
      fetchFleetAvailability(pickup, rDate.toISOString().slice(0, 10));

      const termsCheck = document.getElementById('bkTermsCheck');
      if (termsCheck) termsCheck.checked = false;

      selectedPaymentMode = 'advance';
      const advRadio = document.querySelector('input[name="bkPaymentMode"][value="advance"]');
      if (advRadio) advRadio.checked = true;
      document.getElementById('payOptionAdvance')?.classList.add('active');
      document.getElementById('payOptionPickup')?.classList.remove('active');

      renderBookingVehiclesList();
      if (typeof updatePickupLocationUI === 'function') updatePickupLocationUI();
      if (typeof updateDropLocationUI === 'function') updateDropLocationUI();

      bookingOverlay.classList.add('open');
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      const bkModal = bookingOverlay.querySelector('.modal');
      if (bkModal) {
        bkModal.scrollTop = 0;
      }
    }

    // Dynamic Pickup & Drop Location Selectors
    const bkLocationSelect = document.getElementById('bkLocation');
    const bkPickupDetailsWrap = document.getElementById('bkPickupDetailsWrap');
    const bkPickupAddressField = document.getElementById('bkPickupAddressField');
    const bkPickupAddressInput = document.getElementById('bkPickupAddress');
    const bkDifferentDropCheck = document.getElementById('bkDifferentDropCheck');
    const bkDropLocationWrap = document.getElementById('bkDropLocationWrap');
    const bkDropLocationSelect = document.getElementById('bkDropLocation');
    const bkDropAddressField = document.getElementById('bkDropAddressField');
    const bkDropAddressInput = document.getElementById('bkDropAddress');

    function updatePickupLocationUI() {
      if (!bkLocationSelect || !bkPickupDetailsWrap) return;
      const val = bkLocationSelect.value || '';
      const isDoorstep = /hotel|resort|airbnb|villa|custom|doorstep/i.test(val);

      if (isDoorstep) {
        bkPickupDetailsWrap.style.display = 'block';
        if (bkPickupAddressField) bkPickupAddressField.style.display = 'block';
      } else {
        bkPickupDetailsWrap.style.display = 'none';
        if (bkPickupAddressField) bkPickupAddressField.style.display = 'none';
      }
    }

    function updateDropLocationUI() {
      if (!bkDifferentDropCheck || !bkDropLocationWrap) return;
      if (bkDifferentDropCheck.checked) {
        bkDropLocationWrap.style.display = 'block';
        const dVal = bkDropLocationSelect ? bkDropLocationSelect.value : '';
        const isDropDoorstep = /hotel|resort|airbnb|villa|custom|doorstep|collection/i.test(dVal);
        if (bkDropAddressField) {
          bkDropAddressField.style.display = isDropDoorstep ? 'block' : 'none';
        }
      } else {
        bkDropLocationWrap.style.display = 'none';
      }
    }

    if (bkLocationSelect) bkLocationSelect.addEventListener('change', updatePickupLocationUI);
    if (bkDifferentDropCheck) bkDifferentDropCheck.addEventListener('change', updateDropLocationUI);
    if (bkDropLocationSelect) bkDropLocationSelect.addEventListener('change', updateDropLocationUI);

    function closeBooking(){
      bookingOverlay.classList.remove('open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';

      // Clear customer details on close
      const bkName = document.getElementById('bkName');
      const bkPhone = document.getElementById('bkPhone');
      const bkEmail = document.getElementById('bkEmail');
      const bkNotes = document.getElementById('bkNotes');
      const bkLoc = document.getElementById('bkLocation');
      if (bkName) bkName.value = '';
      if (bkPhone) bkPhone.value = '';
      if (bkEmail) bkEmail.value = '';
      if (bkNotes) bkNotes.value = '';
      if (bkLoc) bkLoc.selectedIndex = 0;
      if (bkPickupAddressInput) bkPickupAddressInput.value = '';
      if (bkDifferentDropCheck) bkDifferentDropCheck.checked = false;
      if (bkDropAddressInput) bkDropAddressInput.value = '';
      updatePickupLocationUI();
      updateDropLocationUI();
      if (bookingForm) bookingForm.reset();
    }

    document.getElementById('bookNowBtn').addEventListener('click', ()=> openBooking(VEHICLES[0].name));
    document.getElementById('ctaReserveBtn').addEventListener('click', ()=> openBooking(VEHICLES[0].name));
    document.getElementById('bookingClose').addEventListener('click', closeBooking);
    document.getElementById('bookingDoneBtn').addEventListener('click', closeBooking);
    bookingOverlay.addEventListener('click', (e)=>{ if(e.target === bookingOverlay) closeBooking(); });

    function loadBookings(){
      try{
        const raw = localStorage.getItem(BOOKINGS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // Automatically filter out automated QA test suite entries
        const clean = parsed.filter(b => b && b.id && !b.id.startsWith('TRT-SEC-') && !b.id.startsWith('TEST-'));
        if (clean.length !== parsed.length) {
          localStorage.setItem(BOOKINGS_KEY, JSON.stringify(clean));
        }
        return clean;
      }catch(err){
        console.error('Could not read saved bookings:', err);
        return [];
      }
    }
    function saveBookings(list){
      try{
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
      }catch(err){
        console.error('Could not save booking:', err);
      }
      refreshBookingCount();
    }
    function refreshBookingCount(){
      const count = loadBookings().length;
      const badge = document.getElementById('bookingCount');
      badge.textContent = count;
      badge.hidden = count === 0;
    }

    function formatIndianPhone(raw) {
      if (!raw) return '';
      let digits = String(raw).replace(/\D/g, '');
      if (digits.startsWith('91') && digits.length === 12) {
        digits = digits.slice(2);
      }
      if (digits.length === 10) {
        return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
      }
      return String(raw).trim();
    }

    function attachPhoneFormatter(inputEl) {
      if (!inputEl) return;
      inputEl.addEventListener('input', (e) => {
        let val = e.target.value;
        // Allow reference IDs like TRT-
        if (/^[a-zA-Z]/i.test(val)) return;

        let digits = val.replace(/\D/g, '');
        // If pasted with leading 91 (e.g. 919370655832), strip the 91
        if (digits.startsWith('91') && digits.length > 10) {
          digits = digits.slice(2);
        }
        digits = digits.slice(0, 10);

        if (!digits) {
          e.target.value = '';
          return;
        }

        if (digits.length > 5) {
          e.target.value = `${digits.slice(0, 5)} ${digits.slice(5)}`;
        } else {
          e.target.value = digits;
        }
      });
    }

    // Attach phone auto-formatters
    attachPhoneFormatter(document.getElementById('bkPhone'));
    attachPhoneFormatter(document.getElementById('myBkPhoneInput'));

    function makeBookingId(){
      const stamp = Date.now().toString(36).toUpperCase().slice(-5);
      const rand = Math.floor(10 + Math.random()*90);
      return `TRT-${stamp}${rand}`;
    }

    bookingForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      bookingError.hidden = true;

      const name = document.getElementById('bkName').value.trim();
      const rawPhone = document.getElementById('bkPhone').value.trim();
      const email = document.getElementById('bkEmail').value.trim();
      const pickupDate = document.getElementById('bkPickupDate').value;
      const notes = document.getElementById('bkNotes').value.trim();

      const pickupLocation = bkLocationSelect ? bkLocationSelect.value : 'Manohar International Airport, Mopa (GOX)';
      const pickupAddress = (bkPickupAddressInput && bkPickupAddressField && bkPickupDetailsWrap && bkPickupDetailsWrap.style.display !== 'none') ? bkPickupAddressInput.value.trim() : '';
      
      const hasDifferentDrop = bkDifferentDropCheck ? bkDifferentDropCheck.checked : false;
      const dropLocation = hasDifferentDrop && bkDropLocationSelect ? bkDropLocationSelect.value : pickupLocation;
      const dropAddress = (hasDifferentDrop && bkDropAddressInput && bkDropAddressField && bkDropAddressField.style.display !== 'none') ? bkDropAddressInput.value.trim() : '';

      const phoneDigits = rawPhone.replace(/\D/g, '');
      const clean10 = phoneDigits.length === 12 && phoneDigits.startsWith('91') ? phoneDigits.slice(2) : (phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits);

      if(!name || !rawPhone || !email || !pickupDate){
        return showFormError("Please fill in every required field.");
      }
      if(clean10.length !== 10){
        return showFormError("Enter a valid 10-digit mobile number (e.g. +91 93706 55832).");
      }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        return showFormError("Enter a valid email address.");
      }

      const isPickupHotel = /hotel|resort|airbnb|villa|custom|doorstep/i.test(pickupLocation);
      if (isPickupHotel && !pickupAddress) {
        return showFormError("Please enter your Hotel / Resort or Villa name & area for doorstep delivery.");
      }

      const isDropHotel = hasDifferentDrop && /hotel|resort|airbnb|villa|custom|doorstep|collection/i.test(dropLocation);
      if (isDropHotel && !dropAddress) {
        return showFormError("Please enter the return Hotel / Resort or Villa name & area for collection.");
      }

      const termsCheck = document.getElementById('bkTermsCheck');
      if (termsCheck && !termsCheck.checked) {
        return showFormError("Please read and accept the Goa Rental Terms & Policies before confirming.");
      }

      // Build consolidated location string for display, receipts & sync
      let formattedLocation = pickupLocation;
      if (pickupAddress) {
        formattedLocation += ` (${pickupAddress})`;
      }
      if (hasDifferentDrop && dropLocation !== pickupLocation) {
        formattedLocation += ` → Return: ${dropLocation}${dropAddress ? ` (${dropAddress})` : ''}`;
      }

      const formattedPhone = `+91 ${clean10.slice(0, 5)} ${clean10.slice(5, 10)}`;

      const pStart = new Date(pickupDate);
      let maxDays = 1;
      let totalRentalFare = 0;
      let totalSecurityDeposit = 0;

      const selectedVehiclesList = activeBookingVehicles.map(item => {
        const v = VEHICLES[item.vehicleIndex] || VEHICLES[0];
        const is2W = isTwoWheelerVehicle(v);
        const trans = is2W ? "" : (item.transmission || "Manual");
        const days = Math.max(1, parseInt(item.days, 10) || 1);
        if (days > maxDays) maxDays = days;
        
        const carReturn = new Date(pStart);
        carReturn.setDate(carReturn.getDate() + days);
        const returnDateStr = carReturn.toISOString().slice(0, 10);
        const effRate = getEffectiveVehicleRate(v, trans, pickupDate);
        const currentRate = effRate.finalRate;
        const subtotal = currentRate * days;
        const deposit = getVehicleSecurityDeposit(v);

        totalRentalFare += subtotal;
        totalSecurityDeposit += deposit;

        return {
          name: v.name,
          category: v.cat,
          seats: v.seats,
          transmission: trans,
          price: currentRate,
          basePrice: effRate.baseRate,
          multiplier: effRate.multiplier,
          isSurged: effRate.isSurged,
          seasonName: effRate.name || "",
          badge: effRate.badge || "",
          days: days,
          deposit: deposit,
          returnDate: returnDateStr,
          subtotal: subtotal
        };
      });

      const maxReturnDate = new Date(pStart);
      maxReturnDate.setDate(maxReturnDate.getDate() + maxDays);
      const overallReturnDate = maxReturnDate.toISOString().slice(0, 10);

      const vehicleNames = selectedVehiclesList.map(v => `${v.name} (${v.days}d${v.transmission ? `, ${v.transmission}` : ''})`).join(' + ');

      const advanceAmount = Math.round(totalRentalFare * 0.20);
      const balanceRental = totalRentalFare - advanceAmount;
      const balancePayableAtPickup = balanceRental + totalSecurityDeposit;
      const totalAmount = totalRentalFare + totalSecurityDeposit;

      const booking = {
        id: makeBookingId(),
        vehicle: vehicleNames,
        vehicles: selectedVehiclesList,
        transmission: selectedVehiclesList.length === 1 ? selectedVehiclesList[0].transmission : "Multi",
        rentalTotal: totalRentalFare,
        depositTotal: totalSecurityDeposit,
        price: selectedVehiclesList.reduce((acc, cur) => acc + cur.price, 0),
        days: maxDays,
        total: totalAmount,
        paymentMode: "Advance 20%",
        advancePaid: advanceAmount,
        balanceAtPickup: balancePayableAtPickup,
        transactionId: '',
        name,
        phone: formattedPhone,
        email,
        pickupDate,
        returnDate: overallReturnDate,
        pickup: pickupLocation,
        drop: dropLocation,
        pickupLocation,
        pickupAddress,
        dropLocation,
        dropAddress,
        location: formattedLocation,
        notes,
        status: "Confirmed",
        createdAt: new Date().toISOString()
      };

      // Open Payment Checkout Modal for 20% Advance Lock Token
      pendingPaymentBooking = booking;
      openPaymentModal(advanceAmount);
    });

    function showFormError(msg){
      bookingError.textContent = msg;
      bookingError.hidden = false;
    }

    /* =========================================================
       PAYMENT CHECKOUT MODAL CONTROLLER (RAZORPAY / UPI)
       ========================================================= */
    const paymentOverlay = document.getElementById('paymentModalOverlay');
    const payCloseBtn = document.getElementById('payModalClose');
    const payTabsBar = document.getElementById('payTabsBar');
    const payUpiConfirmBtn = document.getElementById('payUpiConfirmBtn');
    const payGatewayConfirmBtn = document.getElementById('payGatewayConfirmBtn');

    let currentSignedOrder = null;

    async function openPaymentModal(advanceAmt) {
      if (!pendingPaymentBooking || !paymentOverlay) return;
      const booking = pendingPaymentBooking;

      document.getElementById('payModalAmount').textContent = advanceAmt.toLocaleString('en-IN');
      document.getElementById('payUpiBtnAmount').textContent = advanceAmt.toLocaleString('en-IN');
      document.getElementById('payGwBtnAmount').textContent = advanceAmt.toLocaleString('en-IN');

      const qrImg = document.getElementById('payQrImage');
      if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=9322730029@okaxis&pn=Tourent%20Goa%20Rentals&am=${advanceAmt}&cu=INR`;
      }

      paymentOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      const payModal = paymentOverlay.querySelector('.modal');
      if (payModal) payModal.scrollTop = 0;
    }

    function closePaymentModal() {
      if (!paymentOverlay) return;
      paymentOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (payCloseBtn) payCloseBtn.addEventListener('click', closePaymentModal);
    if (paymentOverlay) {
      paymentOverlay.addEventListener('click', (e) => {
        if (e.target === paymentOverlay) closePaymentModal();
      });
    }

    if (payTabsBar) {
      payTabsBar.querySelectorAll('.pay-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.dataset.paytab;
          payTabsBar.querySelectorAll('.pay-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
          document.getElementById('payPaneUpi')?.classList.toggle('active', tab === 'upi');
          document.getElementById('payPaneGateway')?.classList.toggle('active', tab === 'gateway');
        });
      });
    }

    // Razorpay Live & Sandbox Gateway Checkout Controller
    async function handleRazorpayCheckout() {
      if (!pendingPaymentBooking) return;
      const booking = pendingPaymentBooking;

      const origText = payGatewayConfirmBtn ? payGatewayConfirmBtn.innerHTML : '';
      if (payGatewayConfirmBtn) {
        payGatewayConfirmBtn.disabled = true;
        payGatewayConfirmBtn.innerHTML = `⏳ Opening Razorpay Gateway...`;
      }

      try {
        // 1. Request Order Creation from Backend
        const orderResp = await fetch(`${API_BASE}/api/payment/razorpay/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: booking.id,
            vehicles: booking.vehicles,
            days: booking.days,
            phone: booking.phone,
            name: booking.name,
            email: booking.email,
            rentalTotal: booking.rentalTotal || booking.total,
            depositTotal: booking.depositTotal || 0
          })
        });

        const orderData = await orderResp.json();
        if (!orderData || !orderData.success) {
          throw new Error(orderData.error || 'Failed to initialize payment gateway order');
        }

        // 2. Open Live Razorpay SDK Modal if available
        if (typeof Razorpay === 'function' && orderData.isLive) {
          const rzpOptions = {
            key: orderData.keyId,
            amount: orderData.amountPaise,
            currency: orderData.currency || 'INR',
            name: 'Tourent Goa Rentals',
            description: `20% Advance Token for ${booking.vehicle}`,
            image: 'https://tourent.in/favicon.ico',
            order_id: orderData.orderId,
            prefill: {
              name: booking.name,
              email: booking.email,
              contact: booking.phone.replace(/\D/g, '').slice(-10)
            },
            notes: {
              bookingId: booking.id,
              pickupDate: booking.pickupDate,
              location: booking.location
            },
            theme: {
              color: '#0c2340'
            },
            modal: {
              ondismiss: function() {
                if (payGatewayConfirmBtn) {
                  payGatewayConfirmBtn.disabled = false;
                  payGatewayConfirmBtn.innerHTML = origText;
                }
              }
            },
            handler: async function(rzpResp) {
              const txn = rzpResp.razorpay_payment_id;
              pendingPaymentBooking.transactionId = txn;
              pendingPaymentBooking.status = "Confirmed";
              pendingPaymentBooking.paymentMode = "Advance 20% (Razorpay)";

              const confirmedBooking = { ...pendingPaymentBooking };

              // Verify on backend & dispatch confirmed email voucher
              try {
                await fetch(`${API_BASE}/api/payment/razorpay/verify`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: rzpResp.razorpay_order_id,
                    razorpay_payment_id: rzpResp.razorpay_payment_id,
                    razorpay_signature: rzpResp.razorpay_signature,
                    booking: confirmedBooking
                  })
                });
              } catch (verErr) {
                console.warn('Backend verification note:', verErr);
              }

              // Local storage & success view
              try {
                const bookings = loadBookings();
                bookings.unshift(confirmedBooking);
                saveBookings(bookings);
              } catch(e){}

              closePaymentModal();
              showBookingSuccess(confirmedBooking);
              if (bookingForm) bookingForm.reset();
              showToast(`✓ Razorpay Payment ${txn} Captured! Official voucher emailed.`);
              pendingPaymentBooking = null;
            }
          };

          const rzpInstance = new Razorpay(rzpOptions);
          rzpInstance.on('payment.failed', function(resp) {
            alert(`Payment Failed: ${resp.error.description} (Reason: ${resp.error.reason})`);
            if (payGatewayConfirmBtn) {
              payGatewayConfirmBtn.disabled = false;
              payGatewayConfirmBtn.innerHTML = origText;
            }
          });
          rzpInstance.open();
        } else {
          alert('Razorpay Checkout failed to load. Please disable ad-blockers or privacy extensions and reload the page.');
          if (payGatewayConfirmBtn) {
            payGatewayConfirmBtn.disabled = false;
            payGatewayConfirmBtn.innerHTML = origText;
          }
        }
      } catch (err) {
        console.error('Razorpay checkout error:', err);
        alert(`Payment Gateway initialization failed: ${err.message}. Please check your connection and try again.`);
        if (payGatewayConfirmBtn) {
          payGatewayConfirmBtn.disabled = false;
          payGatewayConfirmBtn.innerHTML = origText;
        }
      }
    }

    function handleUpiPaymentSubmission() {
      if (!pendingPaymentBooking) return;
      
      const txn = `UPI-PENDING-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(10+Math.random()*90)}`;
      pendingPaymentBooking.transactionId = txn;
      pendingPaymentBooking.status = "Pending confirmation";
      pendingPaymentBooking.paymentMode = "UPI Manual (Pending Verification)";

      const requestedBooking = { ...pendingPaymentBooking };

      // 1. Submit booking request to backend server
      syncBookingToServer(requestedBooking);

      // 2. Save booking to local cache
      try {
        const bookings = loadBookings();
        bookings.unshift(requestedBooking);
        saveBookings(bookings);
      } catch (e) {
        console.warn('Local storage note:', e);
      }

      // 3. Update UI views
      closePaymentModal();
      showBookingSuccess(requestedBooking);
      if (bookingForm) bookingForm.reset();

      const bkName = document.getElementById('bkName');
      const bkPhone = document.getElementById('bkPhone');
      const bkEmail = document.getElementById('bkEmail');
      const bkNotes = document.getElementById('bkNotes');
      const bkLoc = document.getElementById('bkLocation');
      if (bkName) bkName.value = '';
      if (bkPhone) bkPhone.value = '';
      if (bkEmail) bkEmail.value = '';
      if (bkNotes) bkNotes.value = '';
      if (bkLoc) bkLoc.selectedIndex = 0;

      showToast(`✓ Booking Submitted! Our desk will verify UPI transfer & send confirmation.`);
      pendingPaymentBooking = null;
      currentSignedOrder = null;
    }

    function completeAdvancePayment() {
      if (!pendingPaymentBooking) return;
      
      const txn = `PAY-TRT-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(10+Math.random()*90)}`;
      pendingPaymentBooking.transactionId = txn;
      pendingPaymentBooking.status = "Confirmed";

      const confirmedBooking = { ...pendingPaymentBooking };

      // 1. Instantly dispatch official email voucher via backend server
      syncBookingToServer(confirmedBooking);

      // 2. Save booking to local cache
      try {
        const bookings = loadBookings();
        bookings.unshift(confirmedBooking);
        saveBookings(bookings);
      } catch (e) {
        console.warn('Local storage note:', e);
      }

      // 3. Update UI views
      closePaymentModal();
      showBookingSuccess(confirmedBooking);
      if (bookingForm) bookingForm.reset();

      const bkName = document.getElementById('bkName');
      const bkPhone = document.getElementById('bkPhone');
      const bkEmail = document.getElementById('bkEmail');
      const bkNotes = document.getElementById('bkNotes');
      const bkLoc = document.getElementById('bkLocation');
      if (bkName) bkName.value = '';
      if (bkPhone) bkPhone.value = '';
      if (bkEmail) bkEmail.value = '';
      if (bkNotes) bkNotes.value = '';
      if (bkLoc) bkLoc.selectedIndex = 0;

      showToast(`✓ Payment of ₹${confirmedBooking.advancePaid.toLocaleString('en-IN')} Authorized! Booking Confirmed.`);
      pendingPaymentBooking = null;
      currentSignedOrder = null;
    }

    if (payUpiConfirmBtn) payUpiConfirmBtn.addEventListener('click', handleUpiPaymentSubmission);
    if (payGatewayConfirmBtn) payGatewayConfirmBtn.addEventListener('click', handleRazorpayCheckout);

    function showBookingSuccess(booking){
      if (bookingFormView) bookingFormView.hidden = true;
      if (bookingSuccessView) bookingSuccessView.hidden = false;
      const idEl = document.getElementById('successId');
      if (idEl) idEl.textContent = booking.id;
      
      let vehicleSummary = booking.vehicle;
      if (Array.isArray(booking.vehicles) && booking.vehicles.length > 1) {
        vehicleSummary = booking.vehicles.map(v => `${v.name}${v.transmission ? ` (${v.transmission})` : ''} (${v.days}d)`).join(' + ');
      } else if (booking.transmission && booking.transmission !== "Multi") {
        vehicleSummary = `${booking.vehicle} (${booking.transmission})`;
      }

      const isAdvance = booking.advancePaid && booking.advancePaid > 0;
      const badge = document.getElementById('successBadge');
      const advRow = document.getElementById('successAdvancePaid');
      const nextSteps = document.getElementById('successNextSteps');

      if (isAdvance) {
        if (badge) {
          badge.textContent = "✓ Instant Booking Confirmed (20% Advance Paid)";
          badge.style.background = "#e6f4ea";
          badge.style.color = "#1e7a3e";
          badge.style.borderColor = "rgba(30,122,62,0.4)";
        }
        if (advRow) advRow.textContent = `₹${booking.advancePaid.toLocaleString('en-IN')} (Txn: ${booking.transactionId || 'UPI'})`;
        if (nextSteps) nextSteps.innerHTML = `Your vehicle is <strong>guaranteed &amp; locked</strong> with your 20% advance token! Our Goa operations team will call and message you on WhatsApp prior to handover.`;
      } else {
        if (badge) {
          badge.textContent = "⏳ Awaiting Admin Confirmation";
          badge.style.background = "#fff8e6";
          badge.style.color = "#9c6800";
          badge.style.borderColor = "rgba(227,162,61,0.4)";
        }
        if (advRow) advRow.textContent = `₹ 0 (Pay at Handover)`;
        if (nextSteps) nextSteps.innerHTML = `Your reservation request is submitted! Our admin desk will verify vehicle availability and confirm your booking via <strong>Email &amp; WhatsApp</strong>.`;
      }

      const bookedAtStr = booking.createdAt ? new Date(booking.createdAt).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      }) : new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      });

      const tsEl = document.getElementById('successTimestamp');
      if (tsEl) tsEl.textContent = bookedAtStr;

      const vEl = document.getElementById('successVehicle');
      if (vEl) vEl.textContent = vehicleSummary;
      const pEl = document.getElementById('successPickup');
      if (pEl) pEl.textContent = `${booking.pickupDate} · ${booking.location}`;
      const rEl = document.getElementById('successReturn');
      if (rEl) rEl.textContent = booking.returnDate;
      const lEl = document.getElementById('successLocation');
      if (lEl) lEl.textContent = booking.location;
      const feeEl = document.getElementById('successRentalFee');
      if (feeEl) feeEl.textContent = `₹${(booking.rentalTotal || booking.total).toLocaleString('en-IN')}`;
      const depEl = document.getElementById('successDeposit');
      if (depEl) depEl.textContent = booking.depositTotal ? `₹${booking.depositTotal.toLocaleString('en-IN')} (100% Refundable)` : `₹ 0 (Zero Deposit on 2W)`;
      const totEl = document.getElementById('successTotal');
      if (totEl) totEl.textContent = `₹${(booking.balanceAtPickup || booking.total).toLocaleString('en-IN')}`;
      const phEl = document.getElementById('successPhone');
      if (phEl) phEl.textContent = booking.phone;

      showToast(isAdvance ? `Booking Confirmed (${booking.id})` : `Reservation submitted (${booking.id})`);

      const waBtn = document.getElementById('whatsappSendBtn');
      if (waBtn) {
        waBtn.onclick = ()=>{
          window.open(buildWhatsAppLink(WHATSAPP_NUMBER, bookingWhatsAppText(booking)), '_blank', 'noopener');
        };
      }

      const viewBkBtn = document.getElementById('viewMyBookingsBtn');
      if(viewBkBtn){
        viewBkBtn.onclick = ()=>{
          closeBooking();
          renderMyBookings();
          myBookingsOverlay.classList.add('open');
          document.body.style.overflow = 'hidden';
        };
      }
    }

    /* ============ MY BOOKINGS ============ */
    const myBookingsOverlay = document.getElementById('myBookingsOverlay');
    const myBookingsList = document.getElementById('myBookingsList');

    function escapeHTML(str) {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function formatBookedOnDate(val) {
      if (!val) return 'Recent';
      const d = new Date(val);
      if (isNaN(d.getTime())) return 'Recent';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    }

    async function searchBookingsCloud(query) {
      const banner = document.getElementById('myBkStatusBanner');
      if (!query || !query.trim()) {
        if (banner) banner.hidden = true;
        renderMyBookings();
        return;
      }

      const q = query.trim();
      if (banner) {
        banner.hidden = false;
        banner.innerHTML = `⏳ Searching MongoDB cloud for <strong>"${escapeHTML(q)}"</strong>...`;
      }

          try {
        const resp = await fetch(`${API_BASE}/api/bookings?search=${encodeURIComponent(q)}`);
        if (resp.ok) {
          const json = await resp.json();
          if (json.success && Array.isArray(json.data)) {
            if (banner) {
              banner.innerHTML = `🔍 Found <strong>${json.data.length}</strong> reservation${json.data.length === 1 ? '' : 's'} in cloud for "${escapeHTML(q)}"`;
            }
            renderMyBookings(json.data, true);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend query error:', err);
      }

      const local = loadBookings().filter(b => 
        (b.phone && b.phone.includes(q)) || 
        (b.id && b.id.toLowerCase().includes(q.toLowerCase()))
      );
      if (banner) {
        banner.innerHTML = `📱 Found <strong>${local.length}</strong> reservation(s) on this device for "${escapeHTML(q)}"`;
      }
      renderMyBookings(local, false);
    }

    function renderMyBookings(customList = null, isCloud = false){
      const bookings = customList !== null ? customList : loadBookings();
      if(bookings.length === 0){
        myBookingsList.innerHTML = `
          <div class="empty-state">
            <div style="margin-bottom:12px;color:var(--text-muted);">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <strong>No reservations found</strong>
            <p>Enter your 10-digit phone number or Reference ID above to track your booking from any device.</p>
          </div>
        `;
        return;
      }

      myBookingsList.innerHTML = bookings.map(b => {
        const isConfirmed = b.status && b.status.toLowerCase() === "confirmed";
        const isCancelled = b.status && (b.status.toLowerCase() === "cancelled" || b.status.toLowerCase() === "declined");
        const isCompleted = b.status && b.status.toLowerCase() === "completed";
        const statusClass = isConfirmed ? "status-confirmed" : (isCancelled ? "status-cancelled" : (isCompleted ? "status-completed" : "status-pending"));
        const statusIcon = isConfirmed ? "✓" : (isCancelled ? "✕" : (isCompleted ? "★" : ""));

        let statusLabel = "Pending Confirmation";
        if (isConfirmed) {
          statusLabel = "Confirmed by Admin";
        } else if (isCompleted) {
          statusLabel = "Trip Completed";
        } else if (isCancelled) {
          if (b.refundStatus === 'Pending Refund' || (b.refundEligible && b.refundStatus !== 'Refunded')) {
            statusLabel = `Cancelled (100% Refund Queued: ₹${Number(b.refundAmount || b.advancePaid || 0).toLocaleString('en-IN')})`;
          } else if (b.refundStatus === 'Refunded') {
            statusLabel = `Cancelled (Refund Completed: ₹${Number(b.refundAmount || b.advancePaid || 0).toLocaleString('en-IN')})`;
          } else if (b.refundStatus === 'Non-Refundable') {
            statusLabel = "Cancelled (Non-Refundable)";
          } else {
            statusLabel = "Cancelled";
          }
        }

        const safeId = escapeHTML(b.id || '');
        const safeVehicle = escapeHTML(b.vehicle || 'Vehicle');
        const safePickup = escapeHTML(b.pickupDate || '');
        const safeReturn = escapeHTML(b.returnDate || '');
        const safeLocation = escapeHTML(b.location || 'Goa Delivery Counter');
        const safeName = escapeHTML(b.name || '');
        const safePhone = escapeHTML(b.phone || '');
        const safeNotes = escapeHTML(b.notes || '');

        const createdTimeStr = formatBookedOnDate(b.createdAt || b.bookedAt || b.date);

        let vehicleDetailsHTML = '';
        if (Array.isArray(b.vehicles) && b.vehicles.length > 0) {
          vehicleDetailsHTML = b.vehicles.map(v => {
            const trans = v.transmission ? ` (${escapeHTML(v.transmission)})` : '';
            const depStr = v.deposit ? ` + ₹${Number(v.deposit).toLocaleString('en-IN')} Ref. Deposit` : ' (₹0 Deposit)';
            return `<div style="font-size:12.5px;color:#334155;margin:3px 0;display:flex;align-items:center;gap:5px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> <span><strong>${escapeHTML(v.name)}</strong>${trans} · ${v.days}d @ ₹${Number(v.price).toLocaleString('en-IN')}/d${depStr} (Return: ${escapeHTML(v.returnDate || safeReturn)})</span></div>`;
          }).join('');
        } else {
          vehicleDetailsHTML = `<p><strong>${safeVehicle}</strong> · ${Number(b.days) || 1} day(s) · Return: ${safeReturn}</p>`;
        }

        const isAdvancePaid = b.advancePaid && Number(b.advancePaid) > 0;
        const customerChatMsg = isCancelled
          ? `Hi Tourent Goa, I cancelled my booking #${safeId} (${safeName}, Phone: ${safePhone}). Please confirm the cancellation and refund status.`
          : `Hi Tourent, I am inquiring about my booking #${safeId} (${safeName}, Phone: ${safePhone}).`;

        return `
        <div class="booking-entry" data-id="${safeId}">
          <div class="booking-entry-head">
            <div>
              <strong class="booking-ref" style="font-size:15px;color:var(--ink-blue);">#${safeId}</strong>
              <div class="booking-entry-date">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span class="booked-label">Booked on:</span> <strong class="booked-val">${createdTimeStr}</strong>
              </div>
            </div>
            <span class="booking-entry-status ${statusClass}">${statusIcon} ${statusLabel}</span>
          </div>

          ${vehicleDetailsHTML}
          <p style="margin-top:6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span style="display:inline-flex;align-items:center;gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> <strong>Pickup:</strong> ${safePickup}</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> <strong>Location:</strong> ${safeLocation}</span>
          </p>

          ${isAdvancePaid ? `
            <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;padding:10px 14px;margin:10px 0;font-size:12.5px;">
              <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:6px;border-bottom:1px dashed #86efac;margin-bottom:6px;">
                <span style="color:#166534;font-weight:700;display:inline-flex;align-items:center;gap:4px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  20% Advance Paid Online:
                </span>
                <strong style="color:#15803d;font-size:14px;">₹${Number(b.advancePaid).toLocaleString('en-IN')}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#334155;margin-bottom:3px;">
                <span>Rental Charges: <strong>₹${Number(b.rentalTotal || b.total).toLocaleString('en-IN')}</strong></span>
                <span>Ref. Deposit: <strong>₹${Number(b.depositTotal || 0).toLocaleString('en-IN')}</strong></span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding-top:4px;color:var(--ink-blue);">
                <span style="display:inline-flex;align-items:center;gap:4px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <strong>Balance Due at Pickup:</strong>
                </span>
                <strong style="color:var(--laterite);font-size:15px;">₹${Number(b.balanceAtPickup || (b.total - b.advancePaid)).toLocaleString('en-IN')}</strong>
              </div>
              ${b.transactionId ? `<div style="font-size:10.5px;color:#059669;margin-top:4px;font-family:var(--mono);">✓ Txn ID: ${escapeHTML(b.transactionId)} · Paid on ${createdTimeStr}</div>` : ''}
            </div>
          ` : `
            <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:10px 14px;margin:10px 0;font-size:12.5px;">
              <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:6px;border-bottom:1px dashed #cbd5e1;margin-bottom:6px;">
                <span style="color:#475569;font-weight:700;display:inline-flex;align-items:center;gap:4px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  Payment Mode:
                </span>
                <strong style="color:#0369a1;">Pay 100% at Pickup (₹0 Paid)</strong>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#334155;margin-bottom:3px;">
                <span>Rental Charges: <strong>₹${Number(b.rentalTotal || b.total).toLocaleString('en-IN')}</strong></span>
                <span>Ref. Deposit: <strong>₹${Number(b.depositTotal || 0).toLocaleString('en-IN')}</strong></span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding-top:4px;color:var(--ink-blue);">
                <span style="display:inline-flex;align-items:center;gap:4px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <strong>Total Due at Handover:</strong>
                </span>
                <strong style="color:var(--laterite);font-size:15px;">₹${Number(b.total || 0).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          `}

          <p style="font-size:12px;color:#64748b;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="display:inline-flex;align-items:center;gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${safeName}</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ${safePhone}</span>
          </p>
          ${safeNotes ? `<p style="font-size:12px;color:#64748b;display:flex;align-items:center;gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Note: ${safeNotes}</p>` : ''}
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center;">
            ${isCancelled ? `
              <a href="${buildWhatsAppLink(WHATSAPP_NUMBER, customerChatMsg)}" target="_blank" rel="noopener" style="background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;padding:7px 14px;border-radius:999px;font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:6px;text-decoration:none;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92z"/></svg>
                WhatsApp Cancellation Help
              </a>
            ` : `
              <a href="${buildWhatsAppLink(WHATSAPP_NUMBER, customerChatMsg)}" target="_blank" rel="noopener" style="background:#25D366;color:#fff;border:none;padding:7px 14px;border-radius:999px;font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:6px;text-decoration:none;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92z"/></svg>
                WhatsApp Desk
              </a>
            `}
            ${!isCancelled && !isCompleted ? `<button type="button" class="booking-cancel" data-cancel="${safeId}" data-advance="${Number(b.advancePaid || 0)}" data-created="${b.createdAt || b.bookedAt || b.date || ''}" data-name="${safeName}" data-phone="${safePhone}" data-email="${escapeHTML(b.email || '')}" data-vehicle="${safeVehicle}">Cancel booking</button>` : ''}
          </div>
        </div>
        `;
      }).join('');
    }

    async function syncLocalBookingsWithCloud() {
      const localList = loadBookings();
      if (!localList || localList.length === 0) return;

      try {
        let hasChanges = false;
        const updatedList = [...localList];

        for (let i = 0; i < updatedList.length; i++) {
          const b = updatedList[i];
          if (!b.id) continue;
          const cleanId = b.id.replace(/^#/, '').trim();
          try {
            const resp = await fetch(`${API_BASE}/api/bookings/${encodeURIComponent(cleanId)}`);
            if (resp.ok) {
              const json = await resp.json();
              if (json.success && json.data) {
                const serverB = json.data;
                const isLocalCancelled = b.status === 'Cancelled' || b.status === 'Declined';
                const isServerCancelled = serverB.status === 'Cancelled' || serverB.status === 'Declined';

                if (isLocalCancelled && !isServerCancelled) {
                  // Push local cancellation to server
                  fetch(`${API_BASE}/api/bookings/${encodeURIComponent(cleanId)}/cancel`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: "Cancelled", booking: b })
                  }).catch(() => {});
                } else if (serverB.status && serverB.status !== b.status) {
                  updatedList[i] = { ...b, ...serverB };
                  hasChanges = true;
                }
              }
            }
          } catch (err) {
            // quiet fallback
          }
        }

        if (hasChanges) {
          saveBookings(updatedList);
          const currentQuery = document.getElementById('myBkPhoneInput')?.value || '';
          if (!currentQuery) {
            renderMyBookings();
          }
        }
      } catch (e) {
        console.warn('Auto-sync note:', e);
      }
    }

    myBookingsList.addEventListener('click', async (e)=>{
      const btn = e.target.closest('[data-cancel]');
      if(!btn) return;
      const id = btn.dataset.cancel;
      
      const localList = loadBookings();
      const currentBooking = localList.find(b => (b.id || '').replace(/^#/, '').toLowerCase() === id.replace(/^#/, '').toLowerCase());
      
      const advancePaid = Number(btn.dataset.advance || currentBooking?.advancePaid || 0);
      const createdRaw = btn.dataset.created || currentBooking?.createdAt || currentBooking?.bookedAt || currentBooking?.date;
      const createdDate = createdRaw ? new Date(createdRaw) : new Date();
      const elapsedHours = Math.round((Math.max(0, Date.now() - createdDate.getTime()) / (1000 * 60 * 60)) * 10) / 10;
      const isWithin24h = elapsedHours <= 24;
      const custName = btn.dataset.name || currentBooking?.name || 'Guest';
      const custEmail = btn.dataset.email || currentBooking?.email || '';
      const custPhone = btn.dataset.phone || currentBooking?.phone || '';
      const custVehicle = btn.dataset.vehicle || currentBooking?.vehicle || 'Vehicle';

      let confirmPrompt = `Are you sure you want to cancel booking #${id}?`;
      if (advancePaid > 0) {
        if (isWithin24h) {
          confirmPrompt = `⚠️ CANCEL BOOKING #${id}?\n\n🟢 100% FULL REFUND ELIGIBLE\nThis reservation was created ${elapsedHours} hours ago (within the 24-hour cancellation window).\n\nYou will receive a 100% full refund of ₹${advancePaid.toLocaleString('en-IN')} back to your original payment method (UPI / Card) within 3–5 business days.\n\nClick OK to confirm cancellation and process your refund.`;
        } else {
          confirmPrompt = `⚠️ CANCEL BOOKING #${id}?\n\n🛑 NON-REFUNDABLE NOTICE\nThis reservation was created ${elapsedHours} hours ago (exceeds the 24-hour cancellation window).\n\nAs per Tourent Goa policy, cancellations after 24 hours of booking are non-refundable (advance token of ₹${advancePaid.toLocaleString('en-IN')} is retained).\n\nClick OK if you still wish to release this vehicle reservation.`;
        }
      } else {
        confirmPrompt = `⚠️ CANCEL BOOKING #${id}?\n\nYour Pay-at-Pickup reservation (₹0 advance) will be cancelled immediately.\n\nClick OK to confirm cancellation.`;
      }

      if (confirm(confirmPrompt)) {
        btn.disabled = true;
        btn.textContent = 'Cancelling...';

        let refundInfo = null;

        // Sync cancellation directly to MongoDB Atlas and backend server
        try {
          const resp = await fetch(`${API_BASE}/api/bookings/${encodeURIComponent(id)}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: "Cancelled",
              cancelReason: isWithin24h ? 'Cancelled within 24h grace period' : 'Cancelled after 24h window',
              booking: currentBooking || {
                id: id,
                name: custName,
                email: custEmail,
                phone: custPhone,
                vehicle: custVehicle,
                advancePaid: advancePaid,
                createdAt: createdDate.toISOString()
              }
            })
          });
          if (resp.ok) {
            const json = await resp.json();
            refundInfo = json.refundInfo;
          } else {
            await fetch(`${API_BASE}/api/bookings/${encodeURIComponent(id)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: "Cancelled" })
            });
          }
        } catch (err) {
          console.warn('Backend cancellation error:', err);
        }

        const isRefundEligible = refundInfo ? refundInfo.refundEligible : (isWithin24h && advancePaid > 0);
        const refundAmt = refundInfo ? refundInfo.refundAmount : (isRefundEligible ? advancePaid : 0);
        const refundStat = refundInfo ? refundInfo.refundStatus : (isRefundEligible ? 'Pending Refund' : (advancePaid > 0 ? 'Non-Refundable' : 'Not Applicable'));

        // Update localStorage
        const curLocal = loadBookings();
        const cleanTargetId = id.replace(/^#/, '').toLowerCase();
        let matched = false;
        const updatedLocal = curLocal.map(b => {
          if ((b.id || '').replace(/^#/, '').toLowerCase() === cleanTargetId) {
            matched = true;
            return {
              ...b,
              status: "Cancelled",
              cancelledAt: new Date().toISOString(),
              refundEligible: isRefundEligible,
              refundAmount: refundAmt,
              refundStatus: refundStat
            };
          }
          return b;
        });

        if (!matched) {
          updatedLocal.unshift({
            id: id,
            name: custName,
            phone: custPhone,
            email: custEmail,
            vehicle: custVehicle,
            advancePaid: advancePaid,
            status: "Cancelled",
            cancelledAt: new Date().toISOString(),
            refundEligible: isRefundEligible,
            refundAmount: refundAmt,
            refundStatus: refundStat
          });
        }

        saveBookings(updatedLocal);

        // Sync cancellation directly to Google Sheets in background
        const cancelledItem = updatedLocal.find(b => (b.id || '').replace(/^#/, '').toLowerCase() === cleanTargetId);
        if (cancelledItem) syncBookingToGoogleSheetsDirect(cancelledItem);

        const currentQuery = document.getElementById('myBkPhoneInput')?.value || '';
        if (currentQuery) {
          searchBookingsCloud(currentQuery);
        } else {
          renderMyBookings();
        }

        if (advancePaid > 0 && isWithin24h) {
          showToast(`✓ Booking #${id} cancelled. 100% Refund of ₹${advancePaid.toLocaleString('en-IN')} queued.`);
        } else {
          showToast(`Booking #${id} marked as Cancelled`);
        }
      }
    });

    document.getElementById('myBkSearchBtn')?.addEventListener('click', () => {
      const q = document.getElementById('myBkPhoneInput')?.value || '';
      searchBookingsCloud(q);
    });

    document.getElementById('myBkPhoneInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        searchBookingsCloud(e.target.value);
      }
    });

    document.getElementById('myBookingsLink').addEventListener('click', (e)=>{
      e.preventDefault();
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.textContent = '☰';
      
      const banner = document.getElementById('myBkStatusBanner');
      if (banner) banner.hidden = true;

      const input = document.getElementById('myBkPhoneInput');
      if (input && input.value) {
        searchBookingsCloud(input.value);
      } else {
        renderMyBookings();
      }

      syncLocalBookingsWithCloud();

      myBookingsOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    document.getElementById('viewMyBookingsBtn')?.addEventListener('click', () => {
      closeBooking();
      document.getElementById('myBookingsLink').click();
    });

    document.getElementById('myBookingsClose').addEventListener('click', ()=>{
      myBookingsOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });

    myBookingsOverlay.addEventListener('click', (e)=>{
      if(e.target === myBookingsOverlay){
        myBookingsOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    /* =========================================================
       TERMS & POLICIES MODAL CONTROLLER (GOA RTO POLICY)
       ========================================================= */
    const termsOverlay = document.getElementById('termsModalOverlay');
    const termsCloseBtn = document.getElementById('termsModalClose');
    const termsGotItBtn = document.getElementById('termsModalGotItBtn');
    const termsNavTabs = document.getElementById('termsNavTabs');

    function openTermsModal(targetTab = 'fourWheeler') {
      if (!termsOverlay) return;
      termsOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';

      const modalEl = termsOverlay.querySelector('.modal');
      if (modalEl) modalEl.scrollTop = 0;

      if (termsNavTabs) {
        termsNavTabs.querySelectorAll('.terms-tab-btn').forEach(btn => {
          const isActive = btn.dataset.tab === targetTab;
          btn.classList.toggle('active', isActive);
        });
      }
      document.querySelectorAll('.terms-tab-pane').forEach(pane => {
        const paneId = 'pane' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1);
        pane.classList.toggle('active', pane.id === paneId);
      });
    }

    function closeTermsModal() {
      if (!termsOverlay) return;
      termsOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (termsCloseBtn) termsCloseBtn.addEventListener('click', closeTermsModal);
    if (termsGotItBtn) {
      termsGotItBtn.addEventListener('click', () => {
        const check = document.getElementById('bkTermsCheck');
        if (check) check.checked = true;
        closeTermsModal();
        showToast("✓ Goa Rental Terms & Policies accepted!");
      });
    }
    if (termsOverlay) {
      termsOverlay.addEventListener('click', (e) => {
        if (e.target === termsOverlay) closeTermsModal();
      });
    }

    if (termsNavTabs) {
      termsNavTabs.querySelectorAll('.terms-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tabKey = btn.dataset.tab;
          termsNavTabs.querySelectorAll('.terms-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
          document.querySelectorAll('.terms-tab-pane').forEach(pane => {
            const paneId = 'pane' + tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
            pane.classList.toggle('active', pane.id === paneId);
          });
          const modalEl = termsOverlay?.querySelector('.modal');
          if (modalEl) modalEl.scrollTop = 0;
        });
      });
    }

    document.getElementById('footTerms')?.addEventListener('click', (e) => {
      e.preventDefault();
      openTermsModal('fourWheeler');
    });

    document.getElementById('openBookingTermsLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      const has2W = activeBookingVehicles.some(item => (VEHICLES[item.vehicleIndex] || VEHICLES[0]).cat === 'two');
      openTermsModal(has2W ? 'twoWheeler' : 'fourWheeler');
    });

    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){
        closeBooking();
        closeTermsModal();
        myBookingsOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    refreshBookingCount();
    syncLocalBookingsWithCloud();

    /* =========================================================
      MULTI-LANGUAGE (i18n) — static dictionary, no translation
      API required. Covers navigation, hero, section headers,
      estimator/matcher/itinerary/chat labels and footer. Vehicle
      names, testimonials and perk body copy stay in English by
      design (proper nouns / lower priority for a first pass) —
      see the wrap-up notes for how to extend coverage further.
      ========================================================= */
    const LANG_STORAGE_KEY = "tourent_lang";
        const I18N = {
      en: {
        "nav.fleet":"Fleet", "nav.taxis":"Airport Taxis", "nav.estimator":"Budget Estimator", "nav.perks":"Perks", "nav.reviews":"Reviews",
        "nav.contact":"Contact", "nav.myBookings":"My Bookings", "nav.bookNow":"Book Now", "nav.attractions":"Attractions",
        "attractions.eyebrow":"Goa Travel Guide", "attractions.title":"Explore Goa's Best Attractions",
        "attractions.desc":"Discover the best beaches, forts, waterfalls, temples, heritage sites, wildlife destinations and other must-visit places across Goa.",
        "attractions.featuredBadge":"⭐ Goa's Top Attractions", "attractions.featuredTitle":"Iconic & Recommended Destinations",
        "attractions.featuredSub":"Hand-picked must-visit highlights across North & South Goa",
        "hero.eyebrow":"Goa's self-drive car, SUV & bike fleet", "hero.titleLine1":"Rent any vehicle,", "hero.titleLine2":"anytime.",
        "hero.sub":"From a Fascino for the beach shacks to a Fortuner for the Ghats — Tourent puts Goa's full range of hatchbacks, SUVs, scooters and luxury drives on one doorstep.",
        "hero.browseFleet":"Browse the fleet", "hero.estimateCost":"Estimate my trip cost",
        "hero.stat1":"Vehicles on the ramp", "hero.stat2":"Pickup points across Goa", "hero.stat3":"Average rider rating",
        "fleet.eyebrow":"The Fleet", "fleet.title":"A vehicle for every stretch of coast",
        "fleet.desc":"Self-drive hatchbacks for the highway, rugged SUVs for the Ghats, scooters for the lanes, and a luxury line for the occasion that calls for one.",
        "fleet.matcherTitle":"Not sure which one fits your trip?", "fleet.matcherDesc":"Answer three quick questions and we'll rank the fleet for you.", "fleet.matcherBtn":"Match me a vehicle",
        "tabs.all":"All Vehicles", "tabs.hatch":"Hatchbacks & Sedans", "tabs.suv":"SUVs & MUVs", "tabs.two":"Two-Wheelers", "tabs.lux":"Luxury Fleet",
        "est.eyebrow":"Smart Budget Estimator", "est.title":"Know your fuel cost before you start your drive",
        "est.desc":"Pick a vehicle and a destination — Tourent works out the round-trip distance, fuel required and a full day's budget, so there are no surprises on the road.",
        "est.itineraryTitle":"Don't have a plan yet?", "est.itineraryDesc":"Tell us your days and interests — we'll build a day-by-day Goa itinerary and load the budget here automatically.", "est.itineraryBtn":"Plan my Goa trip",
        "est.vehicleLabel":"Vehicle", "est.pickupLabel":"Pickup location", "est.destLabel":"Destination", "est.daysLabel":"Rental days", "est.tripTypeLabel":"Trip type",
        "est.roundTrip":"Round trip (there & back)", "est.oneWay":"One way", "est.calcBtn":"Calculate my budget",
        "est.note":"Distances are real road distances from your chosen pickup point (not a single fixed point), and fuel price is Goa's current average. Actual usage varies with traffic, AC use and driving style.",
        "perks.eyebrow":"Pre-Booking Perks", "perks.title":"Book ahead, arrive to more than a car",
        "perks.desc":"Reserve online before you land and Tourent unlocks a set of perks reserved only for pre-bookings — no walk-in gets these.",
        "reviews.eyebrow":"Rider Notes", "reviews.title":"What Goa's regulars & visitors say",
        "cta.title":"Your Goa road trip starts with one booking", "cta.desc":"Lock your vehicle, your price and your perks — today.",
        "cta.reserve":"Reserve a vehicle", "cta.call1":"Call +91 93227 30029", "cta.call2":"Call +91 93224 69973",
        "footer.brand":"Rent any vehicle, anytime. Goa's independent self-drive, scooter and luxury rental counter — from Mopa to Mormugao.",
        "footer.fleetHead":"Fleet", "footer.companyHead":"Company", "footer.reachHead":"Reach Us",
        "matcher.eyebrow":"Smart Vehicle Matcher", "matcher.title":"Tell us about your trip",
        "matcher.people":"How many people, including you?", "matcher.budget":"Daily budget",
        "matcher.budgetLow":"Under ₹2,000/day", "matcher.budgetMid":"₹2,000 – ₹5,000/day", "matcher.budgetHigh":"₹5,000+/day",
        "matcher.terrain":"Where are you mostly headed?", "matcher.terrainCity":"In-town / beach hopping",
        "matcher.terrainHighway":"Highway trips to other towns", "matcher.terrainOffroad":"Ghats, forts, off-road", "matcher.terrainMixed":"A bit of everything",
        "matcher.driveType":"Drive type", "matcher.selfDrive":"Self-drive", "matcher.chauffeur":"Chauffeured",
        "matcher.runBtn":"Show my matches", "matcher.tryAgain":"Try different answers",
        "itinerary.eyebrow":"Trip Planner", "itinerary.title":"Plan your Goa days", "itinerary.days":"How many days?",
        "itinerary.interests":"What do you want to see? (pick a few)", "itinerary.beaches":"Beaches", "itinerary.waterfalls":"Waterfalls",
        "itinerary.heritage":"Forts & Heritage", "itinerary.nightlife":"Nightlife", "itinerary.nature":"Nature & Wildlife", "itinerary.markets":"Markets & Food",
        "itinerary.style":"Travel style", "itinerary.styleBudget":"Budget", "itinerary.styleComfort":"Comfort", "itinerary.styleLuxury":"Luxury",
        "itinerary.runBtn":"Build my itinerary", "itinerary.loadEstimator":"Load into estimator", "itinerary.reserveBtn":"Reserve this vehicle",
        "chat.title":"Tourent Concierge", "chat.subtitle":"Usually replies instantly", "chat.placeholder":"Ask about rentals, deposits, licences..."
      },
      ru: {
        "nav.fleet":"Автопарк", "nav.taxis":"Такси в аэропорт", "nav.estimator":"Калькулятор", "nav.perks":"Привилегии", "nav.reviews":"Отзывы",
        "nav.contact":"Контакты", "nav.myBookings":"Мои брони", "nav.bookNow":"Забронировать", "nav.attractions":"Места и достопримечательности",
        "attractions.eyebrow":"Гид по Гоа", "attractions.title":"Лучшие места и достопримечательности Гоа",
        "attractions.desc":"Откройте для себя лучшие пляжи, форты, водопады, храмы, памятники архитектуры и природные парки Гоа.",
        "attractions.featuredBadge":"⭐ Топ мест Гоа", "attractions.featuredTitle":"Знаковые и рекомендуемые места",
        "attractions.featuredSub":"Самые яркие и популярные локации Северного и Южного Гоа",
        "hero.eyebrow":"Прокат авто и байков по Гоа", "hero.titleLine1":"Арендуйте любой транспорт,", "hero.titleLine2":"в любое время.",
        "hero.sub":"От скутера Fascino для пляжей до Fortuner для гор — у Tourent весь диапазон хэтчбеков, внедорожников, скутеров и люкс-авто в одном месте.",
        "hero.browseFleet":"Смотреть автопарк", "hero.estimateCost":"Рассчитать бюджет поездки",
        "hero.stat1":"Автомобилей в наличии", "hero.stat2":"Точек выдачи по Гоа", "hero.stat3":"Средний рейтинг клиентов",
        "fleet.eyebrow":"Автопарк", "fleet.title":"Транспорт для любого маршрута побережья",
        "fleet.desc":"Хэтчбеки для шоссе, внедорожники для гор Гат, скутеры для узких улиц и линейка люкс-авто на особый случай.",
        "fleet.matcherTitle":"Не знаете, что выбрать?", "fleet.matcherDesc":"Ответьте на 3 вопроса — подберём подходящий автомобиль.", "fleet.matcherBtn":"Подобрать авто",
        "tabs.all":"Все", "tabs.hatch":"Хэтчбеки и седаны", "tabs.suv":"Внедорожники", "tabs.two":"Двухколёсные", "tabs.lux":"Люкс",
        "est.eyebrow":"Умный калькулятор бюджета", "est.title":"Узнайте расход топлива заранее",
        "est.desc":"Выберите автомобиль и направление — мы рассчитаем расстояние туда-обратно, расход топлива и бюджет на день.",
        "est.itineraryTitle":"Ещё нет плана поездки?", "est.itineraryDesc":"Укажите количество дней и интересы — мы составим маршрут по Гоа и сразу подставим бюджет.", "est.itineraryBtn":"Спланировать поездку",
        "est.vehicleLabel":"Автомобиль", "est.pickupLabel":"Пункт выдачи", "est.destLabel":"Направление", "est.daysLabel":"Дней аренды", "est.tripTypeLabel":"Тип поездки",
        "est.roundTrip":"Туда и обратно", "est.oneWay":"В одну сторону", "est.calcBtn":"Рассчитать бюджет",
        "est.note":"Расстояния — реальные, от выбранного пункта выдачи (а не от одной фиксированной точки), а цена топлива — текущая средняя по Гоа. Реальный расход зависит от трафика и стиля вождения.",
        "perks.eyebrow":"Привилегии за раннее бронирование", "perks.title":"Забронируйте заранее — получите больше, чем авто",
        "perks.desc":"Забронируйте онлайн до прилёта и получите привилегии, доступные только при предварительной брони.",
        "reviews.eyebrow":"Отзывы клиентов", "reviews.title":"Что говорят гости и местные",
        "cta.title":"Ваше путешествие по Гоа начинается с одной брони", "cta.desc":"Закрепите автомобиль, цену и привилегии — уже сегодня.",
        "cta.reserve":"Забронировать авто", "cta.call1":"Позвонить +91 93227 30029", "cta.call2":"Позвонить +91 93224 69973",
        "footer.brand":"Аренда любого транспорта в любое время. Независимый прокат авто, скутеров и люкс-класса в Гоа — от Мопы до Мормугао.",
        "footer.fleetHead":"Автопарк", "footer.companyHead":"Компания", "footer.reachHead":"Связаться",
        "matcher.eyebrow":"Умный подбор авто", "matcher.title":"Расскажите о поездке",
        "matcher.people":"Сколько человек, включая вас?", "matcher.budget":"Бюджет в день",
        "matcher.budgetLow":"До ₹2 000/день", "matcher.budgetMid":"₹2 000 – ₹5 000/день", "matcher.budgetHigh":"От ₹5 000/день",
        "matcher.terrain":"Куда в основном поедете?", "matcher.terrainCity":"По городу / пляжи",
        "matcher.terrainHighway":"Трассы в другие города", "matcher.terrainOffroad":"Горы, форты, бездорожье", "matcher.terrainMixed":"Понемногу всего",
        "matcher.driveType":"Тип аренды", "matcher.selfDrive":"Самостоятельно", "matcher.chauffeur":"С водителем",
        "matcher.runBtn":"Показать варианты", "matcher.tryAgain":"Ответить иначе",
        "itinerary.eyebrow":"Планировщик поездки", "itinerary.title":"Спланируйте дни в Гоа", "itinerary.days":"Сколько дней?",
        "itinerary.interests":"Что хотите посмотреть?", "itinerary.beaches":"Пляжи", "itinerary.waterfalls":"Водопады",
        "itinerary.heritage":"Форты и наследие", "itinerary.nightlife":"Ночная жизнь", "itinerary.nature":"Природа", "itinerary.markets":"Рынки и еда",
        "itinerary.style":"Стиль поездки", "itinerary.styleBudget":"Бюджетный", "itinerary.styleComfort":"Комфорт", "itinerary.styleLuxury":"Люкс",
        "itinerary.runBtn":"Построить маршрут", "itinerary.loadEstimator":"В калькулятор", "itinerary.reserveBtn":"Забронировать это авто",
        "chat.title":"Консьерж Tourent", "chat.subtitle":"Обычно отвечает мгновенно", "chat.placeholder":"Спросите об аренде, депозите, правах..."
      },
      de: {
        "nav.fleet":"Flotte", "nav.taxis":"Flughafentaxis", "nav.estimator":"Budgetrechner", "nav.perks":"Vorteile", "nav.reviews":"Bewertungen",
        "nav.contact":"Kontakt", "nav.myBookings":"Meine Buchungen", "nav.bookNow":"Jetzt buchen", "nav.attractions":"Attraktionen",
        "attractions.eyebrow":"Goa Reiseführer", "attractions.title":"Erkunden Sie Goas beste Attraktionen",
        "attractions.desc":"Entdecken Sie die schönsten Strände, Festungen, Wasserfälle, Tempel, historischen Stätten und Naturziele in Goa.",
        "attractions.featuredBadge":"⭐ Goas Top-Attraktionen", "attractions.featuredTitle":"Ikonische & Empfohlene Reiseziele",
        "attractions.featuredSub":"Ausgewählte Highlights in Nord- und Süd-Goa",
        "hero.eyebrow":"Selbstfahrerflotte in Goa", "hero.titleLine1":"Jedes Fahrzeug mieten,", "hero.titleLine2":"jederzeit.",
        "hero.sub":"Vom Fascino-Roller für die Strandbuden bis zum Fortuner für die Ghats — Tourent bietet Goas gesamte Palette an Kleinwagen, SUVs, Rollern und Luxusfahrzeugen an einem Ort.",
        "hero.browseFleet":"Flotte ansehen", "hero.estimateCost":"Reisekosten schätzen",
        "hero.stat1":"Fahrzeuge verfügbar", "hero.stat2":"Abholstellen in Goa", "hero.stat3":"Durchschnittsbewertung",
        "fleet.eyebrow":"Die Flotte", "fleet.title":"Ein Fahrzeug für jeden Küstenabschnitt",
        "fleet.desc":"Kleinwagen für die Landstraße, robuste SUVs für die Ghats, Roller für die Gassen und eine Luxuslinie für besondere Anlässe.",
        "fleet.matcherTitle":"Nicht sicher, welches Fahrzeug passt?", "fleet.matcherDesc":"Drei kurze Fragen — wir reihen die Flotte für Sie.", "fleet.matcherBtn":"Fahrzeug finden",
        "tabs.all":"Alle Fahrzeuge", "tabs.hatch":"Kleinwagen & Limousinen", "tabs.suv":"SUVs & Vans", "tabs.two":"Zweiräder", "tabs.lux":"Luxusflotte",
        "est.eyebrow":"Intelligenter Budgetrechner", "est.title":"Kraftstoffkosten vorab berechnen",
        "est.desc":"Wählen Sie Fahrzeug und Ziel — wir berechnen Distanz, Kraftstoffbedarf und Tagesbudget.",
        "est.itineraryTitle":"Noch keinen Plan?", "est.itineraryDesc":"Tage und Interessen angeben — wir erstellen eine Goa-Reiseroute und tragen das Budget automatisch hier ein.", "est.itineraryBtn":"Reise planen",
        "est.vehicleLabel":"Fahrzeug", "est.pickupLabel":"Abholstelle", "est.destLabel":"Ziel", "est.daysLabel":"Miettage", "est.tripTypeLabel":"Fahrtart",
        "est.roundTrip":"Hin- und Rückfahrt", "est.oneWay":"Einfache Fahrt", "est.calcBtn":"Budget berechnen",
        "est.note":"Die Distanzen sind reale Straßenentfernungen ab der gewählten Abholstelle (nicht ein fester Punkt), der Kraftstoffpreis ist der aktuelle Goa-Durchschnitt. Tatsächlicher Verbrauch variiert.",
        "perks.eyebrow":"Vorab-Buchungsvorteile", "perks.title":"Früh buchen, mehr als nur ein Auto erhalten",
        "perks.desc":"Online vor der Landung buchen und exklusive Vorab-Buchungsvorteile erhalten.",
        "reviews.eyebrow":"Gästestimmen", "reviews.title":"Was Stammgäste & Besucher sagen",
        "cta.title":"Ihr Goa-Roadtrip beginnt mit einer Buchung", "cta.desc":"Sichern Sie sich Fahrzeug, Preis und Vorteile — heute.",
        "cta.reserve":"Fahrzeug reservieren", "cta.call1":"Anrufen +91 93227 30029", "cta.call2":"Anrufen +91 93224 69973",
        "footer.brand":"Jedes Fahrzeug mieten, jederzeit. Goas unabhängiger Vermieter für Selbstfahrer, Roller und Luxusautos — von Mopa bis Mormugao.",
        "footer.fleetHead":"Flotte", "footer.companyHead":"Unternehmen", "footer.reachHead":"Kontakt",
        "matcher.eyebrow":"Intelligenter Fahrzeugfinder", "matcher.title":"Erzählen Sie uns von Ihrer Reise",
        "matcher.people":"Wie viele Personen, Sie eingeschlossen?", "matcher.budget":"Tagesbudget",
        "matcher.budgetLow":"Unter ₹2.000/Tag", "matcher.budgetMid":"₹2.000 – ₹5.000/Tag", "matcher.budgetHigh":"Über ₹5.000/Tag",
        "matcher.terrain":"Wohin geht die Reise hauptsächlich?", "matcher.terrainCity":"Innerorts / Strände",
        "matcher.terrainHighway":"Landstraßen zu anderen Orten", "matcher.terrainOffroad":"Ghats, Forts, Gelände", "matcher.terrainMixed":"Von allem etwas",
        "matcher.driveType":"Fahrart", "matcher.selfDrive":"Selbstfahrer", "matcher.chauffeur":"Mit Fahrer",
        "matcher.runBtn":"Vorschläge anzeigen", "matcher.tryAgain":"Andere Angaben versuchen",
        "itinerary.eyebrow":"Reiseplaner", "itinerary.title":"Planen Sie Ihre Goa-Tage", "itinerary.days":"Wie viele Tage?",
        "itinerary.interests":"Was möchten Sie sehen?", "itinerary.beaches":"Strände", "itinerary.waterfalls":"Wasserfälle",
        "itinerary.heritage":"Forts & Kultur", "itinerary.nightlife":"Nachtleben", "itinerary.nature":"Natur", "itinerary.markets":"Märkte & Essen",
        "itinerary.style":"Reisestil", "itinerary.styleBudget":"Budget", "itinerary.styleComfort":"Komfort", "itinerary.styleLuxury":"Luxus",
        "itinerary.runBtn":"Route erstellen", "itinerary.loadEstimator":"In Rechner laden", "itinerary.reserveBtn":"Dieses Fahrzeug reservieren",
        "chat.title":"Tourent Concierge", "chat.subtitle":"Antwortet meist sofort", "chat.placeholder":"Fragen zu Miete, Kaution, Führerschein..."
      },
      pt: {
        "nav.fleet":"Frota", "nav.taxis":"Táxis de Aeroporto", "nav.estimator":"Estimador", "nav.perks":"Vantagens", "nav.reviews":"Avaliações",
        "nav.contact":"Contacto", "nav.myBookings":"Minhas Reservas", "nav.bookNow":"Reservar Agora", "nav.attractions":"Atrações",
        "attractions.eyebrow":"Guia de Viagem de Goa", "attractions.title":"Explore as Melhores Atrações de Goa",
        "attractions.desc":"Descubra as melhores praias, fortes, cascatas, templos, património e natureza em Goa.",
        "attractions.featuredBadge":"⭐ Principais Atrações de Goa", "attractions.featuredTitle":"Destinos Icónicos e Recomendados",
        "attractions.featuredSub":"Destaques imperdíveis em todo o Norte e Sul de Goa",
        "hero.eyebrow":"Frota de carros e motos em Goa", "hero.titleLine1":"Alugue qualquer veículo,", "hero.titleLine2":"a qualquer hora.",
        "hero.sub":"De uma Fascino para as praias a um Fortuner para os Ghats — a Tourent reúne hatchbacks, SUVs, scooters e veículos de luxo num só lugar.",
        "hero.browseFleet":"Ver a frota", "hero.estimateCost":"Estimar custo da viagem",
        "hero.stat1":"Veículos disponíveis", "hero.stat2":"Pontos de recolha em Goa", "hero.stat3":"Avaliação média",
        "fleet.eyebrow":"A Frota", "fleet.title":"Um veículo para cada trecho da costa",
        "fleet.desc":"Hatchbacks para a estrada, SUVs robustos para os Ghats, scooters para as ruelas e uma linha de luxo para ocasiões especiais.",
        "fleet.matcherTitle":"Não sabe qual escolher?", "fleet.matcherDesc":"Responda a três perguntas rápidas e ordenamos a frota para si.", "fleet.matcherBtn":"Encontrar meu veículo",
        "tabs.all":"Todos os veículos", "tabs.hatch":"Hatchbacks & Sedans", "tabs.suv":"SUVs & MUVs", "tabs.two":"Duas Rodas", "tabs.lux":"Frota de Luxo",
        "est.eyebrow":"Estimador Inteligente de Orçamento", "est.title":"Saiba o custo do combustível antes de sair",
        "est.desc":"Escolha um veículo e um destino — calculamos a distância, o combustível necessário e o orçamento do dia.",
        "est.itineraryTitle":"Ainda não tem um plano?", "est.itineraryDesc":"Diga-nos os dias e interesses — criamos um roteiro por Goa e carregamos o orçamento aqui automaticamente.", "est.itineraryBtn":"Planear minha viagem",
        "est.vehicleLabel":"Veículo", "est.pickupLabel":"Ponto de recolha", "est.destLabel":"Destino", "est.daysLabel":"Dias de aluguer", "est.tripTypeLabel":"Tipo de viagem",
        "est.roundTrip":"Ida e volta", "est.oneWay":"Só ida", "est.calcBtn":"Calcular meu orçamento",
        "est.note":"As distâncias são reais, a partir do ponto de recolha escolhido (não de um ponto fixo), e o preço do combustível é a média atual em Goa. O consumo real varia.",
        "perks.eyebrow":"Vantagens de Reserva Antecipada", "perks.title":"Reserve com antecedência, receba mais do que um carro",
        "perks.desc":"Reserve online antes de aterrar e desbloqueie vantagens exclusivas para reservas antecipadas.",
        "reviews.eyebrow":"Comentários dos Clientes", "reviews.title":"O que dizem os visitantes e habituais",
        "cta.title":"A sua viagem por Goa começa com uma reserva", "cta.desc":"Garanta o veículo, o preço e as vantagens — hoje.",
        "cta.reserve":"Reservar um veículo", "cta.call1":"Ligar +91 93227 30029", "cta.call2":"Ligar +91 93224 69973",
        "footer.brand":"Alugue qualquer veículo, a qualquer hora. O balcão independente de aluguer em Goa — de Mopa a Mormugão.",
        "footer.fleetHead":"Frota", "footer.companyHead":"Empresa", "footer.reachHead":"Contacte-nos",
        "matcher.eyebrow":"Assistente Inteligente de Veículos", "matcher.title":"Conte-nos sobre a sua viagem",
        "matcher.people":"Quantas pessoas, incluindo você?", "matcher.budget":"Orçamento diário",
        "matcher.budgetLow":"Até ₹2.000/dia", "matcher.budgetMid":"₹2.000 – ₹5.000/dia", "matcher.budgetHigh":"Mais de ₹5.000/dia",
        "matcher.terrain":"Para onde vai principalmente?", "matcher.terrainCity":"Na cidade / praias",
        "matcher.terrainHighway":"Estrada para outras cidades", "matcher.terrainOffroad":"Ghats, fortes, todo-o-terreno", "matcher.terrainMixed":"Um pouco de tudo",
        "matcher.driveType":"Tipo de condução", "matcher.selfDrive":"Auto-condução", "matcher.chauffeur":"Com motorista",
        "matcher.runBtn":"Ver correspondências", "matcher.tryAgain":"Tentar respostas diferentes",
        "itinerary.eyebrow":"Planeador de Viagem", "itinerary.title":"Planeie os seus dias em Goa", "itinerary.days":"Quantos dias?",
        "itinerary.interests":"O que quer ver?", "itinerary.beaches":"Praias", "itinerary.waterfalls":"Cascatas",
        "itinerary.heritage":"Fortes e Património", "itinerary.nightlife":"Vida Noturna", "itinerary.nature":"Natureza", "itinerary.markets":"Mercados e Comida",
        "itinerary.style":"Estilo de viagem", "itinerary.styleBudget":"Económico", "itinerary.styleComfort":"Conforto", "itinerary.styleLuxury":"Luxo",
        "itinerary.runBtn":"Criar roteiro", "itinerary.loadEstimator":"Carregar no estimador", "itinerary.reserveBtn":"Reservar este veículo",
        "chat.title":"Concierge Tourent", "chat.subtitle":"Normalmente responde de imediato", "chat.placeholder":"Pergunte sobre aluguer, caução, carta..."
      }
    };

    function applyLanguage(lang){
      const dict = I18N[lang] || I18N.en;
      document.querySelectorAll('[data-i18n]').forEach(el=>{
        const key = el.getAttribute('data-i18n');
        const text = dict[key] || I18N.en[key];
        if(text !== undefined) el.textContent = text;
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
        const key = el.getAttribute('data-i18n-placeholder');
        const text = dict[key] || I18N.en[key];
        if(text !== undefined) el.setAttribute('placeholder', text);
      });
      document.documentElement.lang = lang;
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    }

    const langSwitch = document.getElementById('langSwitch');
    langSwitch.addEventListener('change', ()=> applyLanguage(langSwitch.value));
    (function initLanguage(){
      const saved = localStorage.getItem(LANG_STORAGE_KEY) || 'en';
      langSwitch.value = saved;
      applyLanguage(saved);
    })();

    /* =========================================================
      SMART VEHICLE MATCHER — rule-based scoring across the fleet.
      No AI call needed for this one; it's a deterministic ranking,
      which is actually preferable here (consistent, explainable,
      free, instant).
      ========================================================= */
    const matcherOverlay = document.getElementById('matcherOverlay');
    const matcherFormView = document.getElementById('matcherFormView');
    const matcherResultsView = document.getElementById('matcherResultsView');
    let matcherDrive = 'self';

    function openModal(overlay){ 
      overlay.classList.add('open'); 
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden'; 
      const m = overlay.querySelector('.modal');
      if (m) m.scrollTop = 0;
    }
    function closeModal(overlay){ 
      overlay.classList.remove('open'); 
      document.body.classList.remove('modal-open');
      document.body.style.overflow = ''; 
    }

    document.getElementById('openMatcherBtn').addEventListener('click', ()=>{
      matcherFormView.hidden = false;
      matcherResultsView.hidden = true;
      openModal(matcherOverlay);
    });
    document.getElementById('matcherClose').addEventListener('click', ()=> closeModal(matcherOverlay));
    matcherOverlay.addEventListener('click', (e)=>{ if(e.target === matcherOverlay) closeModal(matcherOverlay); });

    matcherOverlay.querySelectorAll('[data-drive]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        matcherOverlay.querySelectorAll('[data-drive]').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        matcherDrive = btn.dataset.drive;
      });
    });

    function scoreVehicle(v, prefs){
      let score = 0;
      score += v.seats >= prefs.people ? 30 : -40;

      if(v.price <= prefs.budget){
        score += 25 - Math.min(25, (prefs.budget - v.price) / 250);
      } else {
        score -= (v.price - prefs.budget) / 150;
      }

      const terrainFit = {
        city: ['hatch','two'],
        highway: ['hatch','suv','lux'],
        offroad: ['suv'],
        mixed: ['suv','hatch']
      };
      if((terrainFit[prefs.terrain]||[]).includes(v.cat)) score += 20;
      if(prefs.terrain === 'offroad' && /Thar|Defender|Fortuner/.test(v.name)) score += 15;
      if(prefs.terrain === 'city' && v.cat === 'two') score += 10;

      return score;
    }

    document.getElementById('matcherRunBtn').addEventListener('click', ()=>{
      const prefs = {
        people: Math.max(1, parseInt(document.getElementById('mPeople').value || 1, 10)),
        budget: Number(document.getElementById('mBudget').value),
        terrain: document.getElementById('mTerrain').value,
        drive: matcherDrive
      };

      const ranked = VEHICLES
        .map(v => ({ v, score: scoreVehicle(v, prefs) }))
        .filter(x => x.score > -Infinity)
        .sort((a,b) => b.score - a.score)
        .slice(0, 3);

      const list = document.getElementById('matcherResultsList');
      if(ranked.length === 0){
        list.innerHTML = `<p class="empty-state">No exact match — try a higher budget or a different drive type.</p>`;
      } else {
        list.innerHTML = ranked.map(({v}, i) => `
          <div class="match-card">
            <div class="match-card-info">
              <span class="match-score">${i===0 ? 'BEST MATCH' : 'GOOD FIT'}</span>
              <h4>${v.name}</h4>
              <p>${v.seats} seats · ${v.trans} · ${v.tag}</p>
            </div>
            <div class="match-card-price">
              <strong>₹${v.price.toLocaleString('en-IN')}</strong>
              <span>per day</span>
              <button data-reserve="${v.name.replace(/"/g,'&quot;')}">Reserve</button>
            </div>
          </div>
        `).join('');
      }

      matcherFormView.hidden = true;
      matcherResultsView.hidden = false;
    });

    document.getElementById('matcherResultsList').addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-reserve]');
      if(!btn) return;
      closeModal(matcherOverlay);
      setTimeout(()=> openBooking(btn.dataset.reserve), 150);
    });
    document.getElementById('matcherAgainBtn').addEventListener('click', ()=>{
      matcherFormView.hidden = false;
      matcherResultsView.hidden = true;
    });

    /* =========================================================
      AI ITINERARY GENERATOR — template-driven trip composer.
      Also fully deterministic/local for now; the structure here
      (days in, structured plan + vehicle + estimator hook out) is
      exactly what a real LLM call would slot into later if you
      add a backend — see the wrap-up notes.
      ========================================================= */
    const itineraryOverlay = document.getElementById('itineraryOverlay');
    const itineraryFormView = document.getElementById('itineraryFormView');
    const itineraryResultsView = document.getElementById('itineraryResultsView');
    let itineraryInterests = ['beaches'];
    let lastItinerary = null;

    const ITINERARY_BANK = {
      beaches: ["Sunrise walk at Baga Beach", "Water sports session at Calangute", "Sunset at Vagator's red cliffs", "Beach-shack lunch in Anjuna", "Quiet stretch of Morjim in the afternoon"],
      waterfalls: ["Day trip to Dudhsagar Falls with a jeep safari from the base", "Photo stop at Tambdi Surla temple en route"],
      heritage: ["Chapora Fort at sunset", "Basilica of Bom Jesus in Old Goa", "Fontainhas Latin Quarter walk in Panaji"],
      nightlife: ["Anjuna flea market into the evening", "Live music at a Baga beach club", "Riverside casino cruise on the Mandovi"],
      nature: ["Bird-watching at Salim Ali Bird Sanctuary", "Bondla Wildlife Sanctuary nature walk", "Morning at the Butterfly Conservatory"],
      markets: ["Mapusa Friday Market for local produce", "Saturday Night Market at Arpora", "Seafood thali stop in Margao"]
    };

    itineraryOverlay.querySelectorAll('[data-interest]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        chip.classList.toggle('active');
        itineraryInterests = Array.from(itineraryOverlay.querySelectorAll('[data-interest].active')).map(c=>c.dataset.interest);
      });
    });

    document.getElementById('openItineraryBtn').addEventListener('click', ()=>{
      itineraryFormView.hidden = false;
      itineraryResultsView.hidden = true;
      openModal(itineraryOverlay);
    });
    document.getElementById('itineraryClose').addEventListener('click', ()=> closeModal(itineraryOverlay));
    itineraryOverlay.addEventListener('click', (e)=>{ if(e.target === itineraryOverlay) closeModal(itineraryOverlay); });

    function recommendVehicleForTrip(style, interests){
      let cat = style === 'budget' ? 'hatch' : style === 'luxury' ? 'lux' : 'suv';
      if(interests.includes('waterfalls') && style !== 'luxury') cat = 'suv';
      const candidates = VEHICLES.filter(v => v.cat === cat);
      return candidates[0] || VEHICLES[0];
    }

    function pickRepresentativeDestination(interests){
      if(interests.includes('waterfalls')) return DESTINATIONS.findIndex(d=>d.name.includes('Dudhsagar'));
      if(interests.includes('heritage')) return DESTINATIONS.findIndex(d=>d.name.includes('Panaji'));
      if(interests.includes('nightlife') || interests.includes('markets')) return DESTINATIONS.findIndex(d=>d.name.includes('Anjuna'));
      return DESTINATIONS.findIndex(d=>d.name.includes('Calangute'));
    }

    document.getElementById('itineraryRunBtn').addEventListener('click', ()=>{
      const days = Math.max(1, Math.min(7, parseInt(document.getElementById('iDays').value || 3, 10)));
      const style = document.getElementById('iStyle').value;
      const interests = itineraryInterests.length ? itineraryInterests : ['beaches'];

      const pool = [];
      interests.forEach(tag => (ITINERARY_BANK[tag]||[]).forEach(item => pool.push(item)));
      const daysArr = [];
      let idx = 0;
      for(let d=1; d<=days; d++){
        const items = [];
        for(let k=0; k<2 && pool.length; k++){ items.push(pool[idx % pool.length]); idx++; }
        daysArr.push({ day: d, items });
      }

      const vehicle = recommendVehicleForTrip(style, interests);
      const destIdx = pickRepresentativeDestination(interests);

      document.getElementById('itineraryDaysList').innerHTML = daysArr.map(d => `
        <div class="itin-day">
          <h5>Day ${d.day}</h5>
          <ul>${d.items.map(i=>`<li>${i}</li>`).join('')}</ul>
        </div>
      `).join('');

      document.getElementById('itineraryVehicleCard').innerHTML = `
        <div>
          <strong>Suggested vehicle: ${vehicle.name}</strong>
          <span>${vehicle.seats} seats · ₹${vehicle.price.toLocaleString('en-IN')}/day · ${days} day${days>1?'s':''} ≈ ₹${(vehicle.price*days).toLocaleString('en-IN')}</span>
        </div>
      `;

      lastItinerary = { vehicle, days, destIdx: destIdx > -1 ? destIdx : 1 };
      itineraryFormView.hidden = true;
      itineraryResultsView.hidden = false;
    });

    document.getElementById('itineraryAgainBtn').addEventListener('click', ()=>{
      itineraryFormView.hidden = false;
      itineraryResultsView.hidden = true;
    });

    document.getElementById('itineraryLoadEstimatorBtn').addEventListener('click', ()=>{
      if(!lastItinerary) return;
      const vIdx = VEHICLES.findIndex(v=>v.name === lastItinerary.vehicle.name);
      if(vIdx > -1) vehicleSelect.value = vIdx;
      pickupSelect.value = 0; // itinerary planner assumes a Panaji Counter start; change the pickup counter in the estimator if yours differs
      destSelect.value = lastItinerary.destIdx;
      document.getElementById('daysInput').value = lastItinerary.days;
      document.getElementById('tripType').value = 'round';
      if(travelStyleSelect) travelStyleSelect.value = 'explorer';
      closeModal(itineraryOverlay);
      document.getElementById('estimator').scrollIntoView({behavior:'smooth'});
      setTimeout(calcBudget, 350);
    });

    document.getElementById('itineraryReserveBtn').addEventListener('click', ()=>{
      if(!lastItinerary) return;
      closeModal(itineraryOverlay);
      setTimeout(()=> openBooking(lastItinerary.vehicle.name, {days: lastItinerary.days}), 150);
    });

    /* =========================================================
      AI CONCIERGE CHAT — rule-based FAQ + intent router today,
      with a clear seam to upgrade to a real Claude-powered backend
      later (see wrap-up notes — deliberately no backend added here
      per your last request).
      ========================================================= */
    const FAQ_KB = [
      { kw: ['cancel','refund'], a: "Free cancellation up to 24 hours before your pickup time, full refund. Inside 24 hours, one day's rental is retained." },
      { kw: ['deposit','security deposit'], a: "A refundable security deposit is collected at pickup (amount depends on the vehicle) and returned within 3–5 days of the vehicle coming back undamaged." },
      { kw: ['licence','license','licenses','licences','document','documents','passport'], a: "You'll need a valid driving licence (Indian or an International Driving Permit) plus a government photo ID at pickup. For two-wheelers over 50cc, a licence with the correct class is required." },
      { kw: ['fuel','tank','petrol','diesel'], a: "Vehicles leave with a starter tank if pre-booked. Return with roughly the same level you received, or a top-up fee applies at the local pump rate." },
      { kw: ['minimum age','how old','age requirement','age limit'], a: "Minimum age is 21 for two-wheelers and 23 for cars, with at least 1 year of driving experience." },
      { kw: ['helmet'], a: "Helmets are provided free with every two-wheeler rental — and required by law while riding in Goa." },
      { kw: ['kilometre limit','kilometer limit','mileage limit','extra km','km limit','unlimited km'], a: "Daily rentals are unlimited-kilometre within Goa. Outstation trips crossing state borders may have a fair-use cap — ask us for your specific route." },
      { kw: ['late return','late fee','running late'], a: "A grace period of 1 hour is standard; beyond that, late returns are billed at an hourly rate toward an extra day." },
      { kw: ['payment','cash','upi','credit card','debit card'], a: "We accept UPI, cards and cash at the counter. Online bookings don't need payment upfront — we confirm and collect at pickup." },
      { kw: ['driver','chauffeur','with a driver'], a: "Tourent specializes exclusively in self-drive cars, SUVs, and scooters so you have 100% freedom and privacy on your Goa trip." },
      { kw: ['permit','karnataka','maharashtra','border','outstation'], a: "For pre-booked outstation trips crossing into Karnataka or Maharashtra, we handle the border permit and toll paperwork in advance." },
      { kw: ['insurance','damage','accident'], a: "All vehicles carry standard insurance. Any damage during the rental is assessed against the security deposit; major incidents should be reported to us immediately." },
      { kw: ['delivery','hotel drop','hotel pickup','drop to hotel'], a: "We can deliver to your hotel or a Dabolim/Mopa airport pickup — select that as your pickup point when booking." },
      { kw: ['price','cost','rate','how much','rates'], a: "Rates range from about ₹400/day for a scooter to ₹15,000/day for the Land Rover Defender — depends on the vehicle. Use the Smart Vehicle Matcher or the Budget Estimator above for a number tailored to your trip." },
      { kw: ['location','address','where are you','counter'], a: "We provide direct pickup & delivery at Mopa Airport (GOX), Dabolim Airport (GOI), major railway stations (Madgaon, Thivim), and doorstep delivery to hotels/villas across North & South Goa." },
      { kw: ['open','hours','timing','close'], a: "Our operations and delivery teams run 24/7; airport and hotel pickups can be arranged for any flight or check-in time with advance notice." }
    ];

    /* Word-boundary matching, not substring — the previous version used
      text.includes(keyword), which meant "age" matched inside "message"
      and "damage", "id" matched inside "guide" and "avoid", and so on.
      That was the main source of wrong/irrelevant chatbot answers. */
    function escapeRegex(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    function matchFAQ(text){
      const t = ` ${text.toLowerCase().replace(/[^\w\s]/g, ' ')} `;
      for(const entry of FAQ_KB){
        for(const k of entry.kw){
          const re = new RegExp(`\\b${escapeRegex(k)}\\b`, 'i');
          if(re.test(t)) return entry.a;
        }
      }
      return null;
    }

    const chatFab = document.getElementById('chatFab');
    const chatPanel = document.getElementById('chatPanel');
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    let chatOpened = false;

    function addChatMsg(text, from){
      const div = document.createElement('div');
      div.className = `chat-msg ${from}`;
      div.textContent = text;
      chatBody.appendChild(div);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addChatChips(options){
      const row = document.createElement('div');
      row.className = 'chat-chips';
      options.forEach(opt=>{
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.addEventListener('click', ()=>{ addChatMsg(opt.label, 'user'); opt.action(); });
        row.appendChild(btn);
      });
      chatBody.appendChild(row);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function chatShowMainMenu(){
      addChatChips([
        { label: 'Find my vehicle', action: ()=>{ addChatMsg("Let's find your perfect ride — a few quick questions.", 'bot'); closeChat(); openModal(matcherOverlay); } },
        { label: 'Plan my Goa trip', action: ()=>{ addChatMsg("Great — tell me your days and interests.", 'bot'); closeChat(); openModal(itineraryOverlay); } },
        { label: 'Ask a question', action: ()=>{ addChatMsg("Go ahead — type your question below (deposits, licences, fuel policy, cancellations...).", 'bot'); chatInput.focus(); } },
        { label: 'Chat on WhatsApp', action: ()=> window.open(buildWhatsAppLink(WHATSAPP_NUMBER, "Hi Tourent, I'd like to enquire about renting a vehicle in Goa."), '_blank', 'noopener') }
      ]);
    }

    function openChat(){
      chatPanel.classList.add('open');
      document.getElementById('chatFabBadge').hidden = true;
      if(!chatOpened){
        chatOpened = true;
        addChatMsg("Hi! I'm the Tourent concierge. I can recommend a vehicle, plan your Goa days, or answer questions about deposits, licences and policies.", 'bot');
        chatShowMainMenu();
      }
    }
    function closeChat(){ chatPanel.classList.remove('open'); }

    chatFab.addEventListener('click', ()=> chatPanel.classList.contains('open') ? closeChat() : openChat());
    document.getElementById('chatClose').addEventListener('click', closeChat);

    function handleChatSend(){
      const text = chatInput.value.trim();
      if(!text) return;
      addChatMsg(text, 'user');
      chatInput.value = '';

      // Async sync enquiry to MongoDB Atlas
      fetch(`${API_BASE}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, source: 'concierge_chat' })
      }).catch(() => {});

      const lower = text.toLowerCase();

      // FAQ takes priority over intent-routing: a message like "can I
      // cancel my booking?" contains the word "book" but is clearly a
      // cancellation-policy question, not a request to open the booking
      // form. Checking specific factual answers first — and requiring
      // more deliberate phrasing for the routing intents below — fixes
      // the wrong-answer bug from before.
      const answer = matchFAQ(lower);
      if(answer){
        addChatMsg(answer, 'bot');
        return;
      }

      if(/\b(recommend|suggest|which vehicle|what vehicle|help me choose|match me)\b/.test(lower)){
        addChatMsg("Let's find your perfect ride.", 'bot');
        closeChat(); openModal(matcherOverlay);
        return;
      }
      if(/\b(itinerary|plan my trip|plan a trip|days in goa|things to do|what to see)\b/.test(lower)){
        addChatMsg("Let's plan it out.", 'bot');
        closeChat(); openModal(itineraryOverlay);
        return;
      }
      if(/\b(book now|make a booking|reserve a|i want to book|start booking)\b/.test(lower)){
        addChatMsg("Opening the booking form for you.", 'bot');
        closeChat(); openBooking(VEHICLES[0].name);
        return;
      }
      if(/\bwhatsapp\b/.test(lower)){
        window.open(buildWhatsAppLink(WHATSAPP_NUMBER, text), '_blank', 'noopener');
        addChatMsg("Opened WhatsApp for you.", 'bot');
        return;
      }

      addChatMsg("I'm not sure about that one — here's what I can help with directly:", 'bot');
      chatShowMainMenu();
    }

    document.getElementById('chatSendBtn').addEventListener('click', handleChatSend);
    chatInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') handleChatSend(); });

    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){
        closeModal(matcherOverlay);
        closeModal(itineraryOverlay);
        closeChat();
      }
    });

    // existing code
  refreshBookingCount();


  /* =========================================
    GOLD DUST PARTICLES
    ========================================= */

  const particleContainer = document.querySelector(".gold-particles");

  if (particleContainer) {

    for (let i = 0; i < 70; i++) {

      const particle = document.createElement("span");

      particle.className = "gold-particle";

      particle.style.left =
        Math.random() * 100 + "%";

      particle.style.top =
        Math.random() * 100 + "%";

      particle.style.animationDuration =
        (8 + Math.random() * 12) + "s";

      particle.style.animationDelay =
        (Math.random() * 4) + "s";

      const size =
        1 + Math.random() * 3;

      particle.style.width =
        size + "px";

      particle.style.height =
        size + "px";

      particleContainer.appendChild(particle);
    }

  }

  /* =========================================
     HELP & FAQ ACCORDION CONTROLLER
     ========================================= */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('active');
      
      // Close other open accordion items for clean UX
      document.querySelectorAll('.faq-item.active').forEach(openItem => {
        if (openItem !== item) openItem.classList.remove('active');
      });

      // Toggle clicked item
      item.classList.toggle('active', !isOpen);
    });
  });