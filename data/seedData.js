const INITIAL_FLEET = [
  {id: "v_swift", name:"Maruti Swift", cat:"hatch", price:1800, priceManual:1800, priceAuto:2200, deposit:3000, mileage:20, fuel:"petrol", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/swift.png", totalUnits:15, active:true},
  {id: "v_baleno", name:"Maruti Baleno", cat:"hatch", price:2000, priceManual:2000, priceAuto:2400, deposit:3000, mileage:21, fuel:"petrol", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/baleno.png", totalUnits:20, active:true},
  {id: "v_i20", name:"Hyundai i20", cat:"hatch", price:2000, priceManual:2000, priceAuto:2400, deposit:3000, mileage:19, fuel:"petrol", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/i20.png", totalUnits:15, active:true},
  {id: "v_glanza", name:"Toyota Glanza", cat:"hatch", price:2100, priceManual:2100, priceAuto:2500, deposit:3000, mileage:21, fuel:"petrol", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/glanza.png", totalUnits:12, active:true},

  {id: "v_ertiga", name:"Maruti Ertiga", cat:"suv", price:2800, priceManual:2800, priceAuto:3300, deposit:5000, mileage:18, fuel:"petrol", seats:7, trans:"Manual & Automatic", tag:"Self-drive", image:"images/ertiga.png", totalUnits:15, active:true},
  {id: "v_creta_2nd", name:"Hyundai Creta (2nd Gen)", cat:"suv", price:2800, priceManual:2800, priceAuto:3300, deposit:3000, mileage:18, fuel:"diesel", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/creta 2nd gen.png", totalUnits:12, active:true},
  {id: "v_creta_3rd", name:"Hyundai Creta (3rd Gen)", cat:"suv", price:3200, priceManual:3200, priceAuto:3600, deposit:3000, mileage:17, fuel:"petrol", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/creta 3rd gen.png", totalUnits:10, active:true},
  {id: "v_alcazar", name:"Hyundai Alcazar", cat:"suv", price:3800, priceManual:3800, priceAuto:4300, deposit:5000, mileage:17, fuel:"diesel", seats:7, trans:"Manual & Automatic", tag:"Self-drive", image:"images/alcazar.png", totalUnits:8, active:true},
  {id: "v_carens", name:"Kia Carens", cat:"suv", price:3200, priceManual:3200, priceAuto:3700, deposit:5000, mileage:16, fuel:"diesel", seats:7, trans:"Manual & Automatic", tag:"Self-drive", image:"images/carens.png", totalUnits:10, active:true},
  {id: "v_crysta", name:"Toyota Innova Crysta", cat:"suv", price:4500, priceManual:4500, priceAuto:5200, deposit:5000, mileage:13, fuel:"diesel", seats:7, trans:"Manual & Automatic", tag:"Self-drive", image:"images/crysta.png", totalUnits:10, active:true},
  {id: "v_hycross", name:"Toyota Innova Hycross", cat:"suv", price:5200, priceManual:null, priceAuto:5200, deposit:10000, mileage:20, fuel:"petrol", seats:7, trans:"Hybrid CVT", tag:"Self-drive", image:"images/hycross.png", totalUnits:8, active:true},
  {id: "v_fortuner", name:"Toyota Fortuner", cat:"suv", price:8500, priceManual:null, priceAuto:8500, deposit:10000, mileage:12, fuel:"diesel", seats:7, trans:"Automatic", tag:"Self-drive", image:"images/fortuner.png", totalUnits:6, active:true},
  {id: "v_thar", name:"Mahindra Thar", cat:"suv", price:3500, priceManual:3500, priceAuto:4200, deposit:5000, mileage:14, fuel:"diesel", seats:4, trans:"Manual & Automatic 4x4", tag:"Self-drive", image:"images/thar.png", totalUnits:6, active:true},
  {id: "v_hyryder", name:"Toyota Hyryder", cat:"suv", price:3200, priceManual:null, priceAuto:3200, deposit:5000, mileage:20, fuel:"petrol", seats:5, trans:"Hybrid CVT", tag:"Self-drive", image:"images/hyryder.png", totalUnits:8, active:true},
  {id: "v_brezza", name:"Maruti Brezza", cat:"suv", price:2600, priceManual:2600, priceAuto:3000, deposit:3000, mileage:17, fuel:"petrol", seats:5, trans:"Manual & Automatic", tag:"Self-drive", image:"images/brezza.png", totalUnits:10, active:true},

  {id: "v_defender", name:"Land Rover Defender", cat:"lux", price:15000, priceManual:null, priceAuto:15000, deposit:15000, mileage:10, fuel:"diesel", seats:5, trans:"Automatic", tag:"Luxury", image:"images/defender.png", totalUnits:3, active:true},
  {id: "v_mini", name:"Mini Cooper", cat:"lux", price:9500, priceManual:null, priceAuto:9500, deposit:10000, mileage:15, fuel:"petrol", seats:4, trans:"Automatic", tag:"Luxury", image:"images/mini.png", totalUnits:4, active:true},
  {id: "v_bmw", name:"BMW 3 Series", cat:"lux", price:12000, priceManual:null, priceAuto:12000, deposit:10000, mileage:12, fuel:"petrol", seats:5, trans:"Automatic", tag:"Luxury", image:"images/bmw.png", totalUnits:4, active:true},
  {id: "v_bmw_z4", name:"BMW Z4 Convertible", cat:"lux", price:18000, priceManual:null, priceAuto:18000, deposit:15000, mileage:12, fuel:"petrol", seats:2, trans:"Automatic", tag:"Luxury", image:"images/bmwz4.png", totalUnits:2, active:true},
  {id: "v_audi", name:"Audi A4", cat:"lux", price:13000, priceManual:null, priceAuto:13000, deposit:10000, mileage:12, fuel:"petrol", seats:5, trans:"Automatic", tag:"Luxury", image:"images/audi.png", totalUnits:4, active:true},

  {id: "v_fascino", name:"Yamaha Fascino", cat:"two", price:400, priceManual:null, priceAuto:400, deposit:0, mileage:47, fuel:"petrol", seats:2, trans:"Automatic", tag:"Scooter", image:"images/fascino.png", totalUnits:25, active:true},
  {id: "v_activa", name:"Honda Activa", cat:"two", price:450, priceManual:null, priceAuto:450, deposit:0, mileage:45, fuel:"petrol", seats:2, trans:"Automatic", tag:"Scooter", image:"images/activa.png", totalUnits:25, active:true},
  {id: "v_hunter", name:"Royal Enfield Hunter 350", cat:"two", price:900, priceManual:900, priceAuto:null, deposit:0, mileage:35, fuel:"petrol", seats:2, trans:"Manual", tag:"Motorcycle", image:"images/hunter.png", totalUnits:10, active:true},
  {id: "v_himalayan", name:"Royal Enfield Himalayan", cat:"two", price:1400, priceManual:1400, priceAuto:null, deposit:0, mileage:30, fuel:"petrol", seats:2, trans:"Manual", tag:"Adventure bike", image:"images/himalayan.png", totalUnits:8, active:true}
];

const INITIAL_REVIEWS = [
  {
    author: "Rohan & Sneha Joshi",
    location: "Mumbai",
    rating: 5,
    vehicle: "Toyota Innova Hycross",
    comment: "The car was delivered spotless at Mopa Airport 10 mins before our flight landed. Smooth hybrid drive all the way to South Goa resorts."
  },
  {
    author: "Vikram Malhotra",
    location: "Delhi",
    rating: 5,
    vehicle: "Mahindra Thar 4x4",
    comment: "Thar in top condition! Driving through Vagator and Morjim beach backroads was exhilarating. 100% deposit returned immediately at return handover."
  },
  {
    author: "Ananya Iyer",
    location: "Bengaluru",
    rating: 5,
    vehicle: "Royal Enfield Hunter 350",
    comment: "Flawless bike rental experience. Helmet provided, fuel was full, and customer service on WhatsApp was super responsive!"
  }
];

module.exports = { INITIAL_FLEET, INITIAL_REVIEWS };
