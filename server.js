require('dotenv').config();
const dns = require('dns');

// Automatically configure reliable DNS servers (Google / Cloudflare) to prevent SRV query failures on local ISPs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (dnsErr) {
  // Fallback to system default
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Disable query buffering so offline DB never hangs API requests or emails
mongoose.set('bufferCommands', false);

const Booking = require('./models/Booking');
const Vehicle = require('./models/Vehicle');
const Enquiry = require('./models/Enquiry');
const TaxiBooking = require('./models/TaxiBooking');
const Review = require('./models/Review');
const AdminSecurity = require('./models/AdminSecurity');
const PricingRule = require('./models/PricingRule');
const { INITIAL_FLEET, INITIAL_REVIEWS } = require('./data/seedData');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'tourent_fallback_secret_key_goa_2026';
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TourentGoa@2026!';

// ==========================================
// 💳 RAZORPAY PAYMENT GATEWAY INITIALIZATION
// ==========================================
const Razorpay = require('razorpay');
const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || '').trim();
const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || '').trim();
const RAZORPAY_WEBHOOK_SECRET = (process.env.RAZORPAY_WEBHOOK_SECRET || 'tourent_webhook_secret_goa_2026').trim();

let razorpayInstance = null;
const isRazorpayConfigured = RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_SECRET.includes('placeholder') && !RAZORPAY_KEY_SECRET.includes('dummy');

if (isRazorpayConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
    console.log(`⚡ [Razorpay] Live Gateway initialized with Key ID: ${RAZORPAY_KEY_ID}`);
  } catch (err) {
    console.warn('⚠️ [Razorpay] Initialization note:', err.message);
  }
} else {
  console.log('🧪 [Razorpay] Sandbox Mode active (Plug live RAZORPAY_KEY_ID in .env for real cards/UPI)');
}

// ==========================================
// 🛡️ SECURITY & RATE LIMITING MIDDLEWARE
// ==========================================

const isLocalIp = (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || !req.ip;

// Global API rate limiter (300 requests per 15 minutes)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isLocalIp,
  message: { success: false, error: 'Too many requests from this IP. Please try again after 15 minutes.' }
});

// Sensitive Booking Creation Limiter (120 requests per 15 minutes per IP)
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isLocalIp,
  message: { success: false, error: 'Booking rate limit exceeded. Please wait a few minutes before trying again.' }
});

// Admin Login Brute-force Limiter (15 attempts per 15 minutes per IP)
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isLocalIp,
  message: { success: false, error: 'Too many failed login attempts. Account temporarily locked for 15 minutes.' }
});

// Public Search Scraper Limiter (100 lookups per 5 minutes per IP)
const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isLocalIp,
  message: { success: false, error: 'Lookup rate limit exceeded. Please slow down.' }
});

// Normalize URL in case Vercel Serverless proxy stripped /api
app.use((req, res, next) => {
  const matched = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'] || '';
  if (matched && matched.startsWith('/api') && !req.url.startsWith('/api')) {
    const qIndex = req.url.indexOf('?');
    const query = qIndex !== -1 ? req.url.slice(qIndex) : '';
    req.url = matched + query;
  }
  next();
});

// Apply global rate limiting to all /api/ routes
app.use('/api/', globalApiLimiter);

// ==========================================
// 🔌 SERVERLESS MONGODB CONNECTION CACHE
// ==========================================
const isServerless = Boolean(process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME);

let cachedMongoPromise = global.mongoosePromise || null;

async function connectMongoServerless() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!MONGODB_URI) {
    return null;
  }
  if (!cachedMongoPromise) {
    cachedMongoPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    }).then(async (m) => {
      console.log('✅ [MongoDB Atlas] Connected to TourentCluster (Serverless)');
      try {
        await seedDatabaseIfEmpty();
      } catch (seedErr) {
        console.warn('⚠️ Seeding note:', seedErr.message);
      }
      return m;
    }).catch(err => {
      console.error('❌ [MongoDB Atlas] Serverless connection error:', err.message);
      cachedMongoPromise = null;
      return null;
    });
    global.mongoosePromise = cachedMongoPromise;
  }
  return cachedMongoPromise;
}

app.connectMongoServerless = connectMongoServerless;

if (isServerless) {
  app.use(async (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path === '/health') {
      try {
        await connectMongoServerless();
      } catch (_) {}
    }
    next();
  });
}

// 1. Hide backend server signature (prevents fingerprinting)
app.disable('x-powered-by');

// 2. Enterprise HTTP Security Headers (Anti-Clickjacking, Anti-XSS, MIME protection, Transport Security)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// 3. Sensitive File Shield (Blocks direct browser access to .env, server.js, models, and JSON caches)
app.use((req, res, next) => {
  const sensitivePatterns = [
    /^\/\.env/i,
    /^\/\.git/i,
    /^\/server\.js/i,
    /^\/package.*\.json/i,
    /^\/admin_security_config\.json/i,
    /^\/admin_bookings_cache\.json/i,
    /^\/models(\/|$)/i,
    /^\/node_modules(\/|$)/i,
    /^\/data(\/|$)/i,
    /^\/tests(\/|$)/i,
    /^\/scratch(\/|$)/i,
    /^\/\.DS_Store/i,
    /^\/\.gitignore/i
  ];
  if (sensitivePatterns.some(pattern => pattern.test(req.path))) {
    return res.status(403).json({ success: false, error: 'Access denied: Forbidden resource.' });
  }
  next();
});

// Standard Middlewares (Strict CORS validation allowing localhost, local file preview, and configured domains)
const allowedOrigins = [
  'http://localhost:5001',
  'http://localhost:3000',
  'http://127.0.0.1:5001',
  'http://127.0.0.1:3000',
  'https://tourent.in',
  'https://www.tourent.in',
  'http://tourent.in',
  'http://www.tourent.in'
];
if (process.env.APP_URL) allowedOrigins.push(process.env.APP_URL.replace(/\/$/, ''));
if (process.env.PRODUCTION_DOMAIN) allowedOrigins.push(process.env.PRODUCTION_DOMAIN.replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests, curl, mobile apps, or local file:// previews (null origin)
    if (!origin || origin === 'null') {
      return callback(null, true);
    }
    // Allow any localhost / 127.0.0.1 port in development
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // Allow any Vercel domain (*.vercel.app)
    if (/^https:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/i.test(origin)) {
      return callback(null, true);
    }
    // Allow Tourent production domains
    if (/^https?:\/\/(www\.)?tourent\.in$/i.test(origin)) {
      return callback(null, true);
    }
    // Check against allowed production origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));
app.set('trust proxy', 1);
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (HTML, CSS, JS, Images, Icons) with optimized caching
const PUBLIC_DIR = path.join(__dirname, 'public');
const staticOptions = {
  maxAge: '7d',
  dotfiles: 'ignore',
  setHeaders: (res, filePath) => {
    if (/\.(ico|png|jpg|jpeg|svg|webp|woff2|woff|ttf)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
};
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR, staticOptions));
}
app.use(express.static(path.join(__dirname), staticOptions));

// ==========================================
// 🔐 ADMIN AUTHENTICATION & SECURITY ENGINE
// ==========================================
const SECURITY_FILE = path.join(__dirname, 'admin_security_config.json');

function checkPasswordMatch(candidate, stored) {
  if (!candidate || !stored) return false;
  const trimmedCandidate = String(candidate).trim();
  const trimmedStored = String(stored).trim();
  if (/^\$2[aby]\$\d{2}\$/.test(trimmedStored)) {
    try {
      return bcrypt.compareSync(trimmedCandidate, trimmedStored);
    } catch (e) {
      return false;
    }
  }
  return trimmedCandidate === trimmedStored;
}

async function getSecurityConfig() {
  const defaultConfig = {
    customMasterPassword: '',
    ownerEmail: (process.env.OWNER_EMAIL || 'tourentgoarentals@gmail.com').trim(),
    twoFactorEnabled: true,
    staffPins: [
      { id: 'pin_1', label: 'Primary Desk', pin: '3029', role: 'staff', active: true, createdAt: new Date() },
      { id: 'pin_2', label: 'Airport & Fleet Ops', pin: '9973', role: 'staff', active: true, createdAt: new Date() },
      { id: 'pin_3', label: 'Staff PIN 3', pin: '0204', role: 'staff', active: true, createdAt: new Date() }
    ],
    sessionVersion: 1,
    lastPasswordChangedAt: null
  };

  // 1. Check MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      let doc = await AdminSecurity.findOne({ key: 'primary' });
      if (!doc) {
        doc = await AdminSecurity.create({ key: 'primary', ...defaultConfig });
      }
      return {
        customMasterPassword: doc.customMasterPassword || '',
        ownerEmail: doc.ownerEmail || defaultConfig.ownerEmail,
        twoFactorEnabled: doc.twoFactorEnabled !== false,
        staffPins: Array.isArray(doc.staffPins) ? doc.staffPins : defaultConfig.staffPins,
        sessionVersion: doc.sessionVersion || 1,
        lastPasswordChangedAt: doc.lastPasswordChangedAt || null
      };
    } catch (err) {
      console.warn('⚠️ [Security] Could not load from MongoDB, using local fallback:', err.message);
    }
  }

  // 2. Check local JSON file fallback
  try {
    if (fs.existsSync(SECURITY_FILE)) {
      const raw = fs.readFileSync(SECURITY_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      return {
        ...defaultConfig,
        ...parsed,
        ownerEmail: parsed.ownerEmail || defaultConfig.ownerEmail,
        twoFactorEnabled: parsed.twoFactorEnabled !== false,
        staffPins: Array.isArray(parsed.staffPins) ? parsed.staffPins : defaultConfig.staffPins
      };
    }
  } catch (err) {
    console.warn('⚠️ [Security] Could not load local security file:', err.message);
  }

  return defaultConfig;
}

async function saveSecurityConfig(updates) {
  const current = await getSecurityConfig();
  const merged = { ...current, ...updates };

  // Write to local fallback file
  try {
    fs.writeFileSync(SECURITY_FILE, JSON.stringify(merged, null, 2), 'utf8');
  } catch (err) {
    console.error('❌ [Security] Error saving local config file:', err.message);
  }

  // Write to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await AdminSecurity.findOneAndUpdate(
        { key: 'primary' },
        { ...merged, key: 'primary' },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('❌ [Security] Error saving to MongoDB:', err.message);
    }
  }

  return merged;
}

// ==========================================
// 📦 LOCAL BOOKINGS CACHE (Zero-Data-Loss Engine)
// ==========================================
const BOOKINGS_CACHE_FILE = path.join(__dirname, 'admin_bookings_cache.json');

function getLocalBookingsCache() {
  try {
    if (fs.existsSync(BOOKINGS_CACHE_FILE)) {
      const raw = fs.readFileSync(BOOKINGS_CACHE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function saveBookingToLocalCache(bData) {
  try {
    const list = getLocalBookingsCache();
    const idx = list.findIndex(b => b.id === bData.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...bData };
    } else {
      list.unshift(bData);
    }
    fs.writeFileSync(BOOKINGS_CACHE_FILE, JSON.stringify(list.slice(0, 100), null, 2), 'utf8');
  } catch (e) {
    console.warn('⚠️ Could not write booking to local cache:', e.message);
  }
}

async function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing token.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient administrative privileges.' });
    }

    const secConfig = await getSecurityConfig();
    if (decoded.sessionVersion && decoded.sessionVersion < (secConfig.sessionVersion || 1)) {
      return res.status(401).json({ success: false, error: 'Your session has been invalidated because the admin password was changed. Please log in again.' });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired session. Please log in again.' });
  }
}

async function requireOwnerAuth(req, res, next) {
  requireAdminAuth(req, res, () => {
    if (req.admin && req.admin.staffRole && req.admin.staffRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden: Owner Master Password privileges required for this action.' });
    }
    next();
  });
}

// Helper: Format and Normalize Indian Phone (+91 XXXXX XXXXX)
function formatIndianPhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  const clean10 = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : (digits.length >= 10 ? digits.slice(-10) : digits);
  if (clean10.length === 10) {
    return `+91 ${clean10.slice(0, 5)} ${clean10.slice(5, 10)}`;
  }
  return String(raw).trim();
}

// ==========================================
// 📊 GOOGLE SHEETS LIVE AUTO-SYNC ENGINE
// ==========================================
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');

function getAppSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('⚠️ Error reading settings file:', err.message);
  }
  return {
    googleSheetsWebhookUrl: (process.env.GOOGLE_SHEETS_WEBHOOK_URL || '').trim()
  };
}

function saveAppSettings(settings) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('❌ Error saving settings file:', err);
    return false;
  }
}

// ==========================================
// ⚡ DYNAMIC & SEASONAL PRICING ENGINE
// ==========================================
const PRICING_RULES_FILE = path.join(__dirname, 'data', 'pricing_rules.json');

const DEFAULT_PRICING_RULES = {
  globalOverride: {
    enabled: false,
    multiplier: 1.25,
    label: "High Demand Surge"
  },
  seasons: [
    {
      id: "season_new_year",
      name: "Christmas & New Year Super Peak",
      startDate: "2026-12-20",
      endDate: "2027-01-05",
      multiplier: 1.80,
      minDays: 3,
      badgeText: "🔥 Peak Festive Tariff",
      active: true
    },
    {
      id: "season_diwali",
      name: "Diwali Festive Week",
      startDate: "2026-10-25",
      endDate: "2026-11-05",
      multiplier: 1.35,
      minDays: 2,
      badgeText: "✨ Diwali Festive Tariff",
      active: true
    },
    {
      id: "season_republic_day",
      name: "Republic Day Long Weekend",
      startDate: "2027-01-22",
      endDate: "2027-01-27",
      multiplier: 1.30,
      minDays: 2,
      badgeText: "🌴 Long Weekend Tariff",
      active: true
    },
    {
      id: "season_winter_peak",
      name: "Goa Winter High Season",
      startDate: "2026-11-06",
      endDate: "2027-02-28",
      multiplier: 1.20,
      minDays: 1,
      badgeText: "☀️ High Season Tariff",
      active: true
    },
    {
      id: "season_summer",
      name: "Summer Vacation Season",
      startDate: "2027-04-10",
      endDate: "2027-05-31",
      multiplier: 1.15,
      minDays: 1,
      badgeText: "🏖️ Summer Holiday Tariff",
      active: true
    }
  ]
};

let cachedPricingRules = null;

function getPricingRulesFromFile() {
  try {
    if (fs.existsSync(PRICING_RULES_FILE)) {
      const raw = fs.readFileSync(PRICING_RULES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      return {
        globalOverride: { ...DEFAULT_PRICING_RULES.globalOverride, ...(parsed.globalOverride || {}) },
        globalSurge: { ...DEFAULT_PRICING_RULES.globalOverride, ...(parsed.globalSurge || parsed.globalOverride || {}) },
        seasons: Array.isArray(parsed.seasons) ? parsed.seasons : DEFAULT_PRICING_RULES.seasons
      };
    }
  } catch (err) {
    console.warn('⚠️ Error reading pricing rules file:', err.message);
  }
  return DEFAULT_PRICING_RULES;
}

function getPricingRulesSync() {
  return cachedPricingRules || getPricingRulesFromFile();
}

async function getPricingRules() {
  if (cachedPricingRules) {
    return cachedPricingRules;
  }
  if (mongoose.connection.readyState === 1) {
    try {
      let doc = await PricingRule.findOne({ key: 'primary' }).lean();
      if (!doc) {
        const fileRules = getPricingRulesFromFile();
        const created = await PricingRule.create({ key: 'primary', ...fileRules });
        doc = created.toObject ? created.toObject() : created;
      }
      cachedPricingRules = {
        globalOverride: doc.globalOverride || DEFAULT_PRICING_RULES.globalOverride,
        globalSurge: doc.globalSurge || doc.globalOverride || DEFAULT_PRICING_RULES.globalOverride,
        seasons: Array.isArray(doc.seasons) ? doc.seasons : DEFAULT_PRICING_RULES.seasons
      };
      return cachedPricingRules;
    } catch (err) {
      console.warn('⚠️ [Pricing Engine] MongoDB load warning, falling back to file cache:', err.message);
    }
  }
  cachedPricingRules = getPricingRulesFromFile();
  return cachedPricingRules;
}

async function savePricingRules(rules) {
  cachedPricingRules = {
    globalOverride: rules.globalOverride || rules.globalSurge || DEFAULT_PRICING_RULES.globalOverride,
    globalSurge: rules.globalSurge || rules.globalOverride || DEFAULT_PRICING_RULES.globalOverride,
    seasons: Array.isArray(rules.seasons) ? rules.seasons : DEFAULT_PRICING_RULES.seasons
  };

  if (mongoose.connection.readyState === 1) {
    try {
      await PricingRule.findOneAndUpdate(
        { key: 'primary' },
        { ...cachedPricingRules, key: 'primary' },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('❌ [Pricing Engine] Error saving rules to MongoDB:', err.message);
    }
  }

  try {
    const dir = path.dirname(PRICING_RULES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRICING_RULES_FILE, JSON.stringify(cachedPricingRules, null, 2), 'utf8');
  } catch (err) {
    // EROFS on read-only serverless environment is normal and handled safely by MongoDB
  }
  return true;
}

function calculateAuthoritativeVehicleRate(vItem, pickupDate) {
  if (!vItem) return { finalDayRate: 2000, deposit: 3000 };
  const vName = (vItem.name || vItem.vehicle || '').trim().toLowerCase();
  const vId = (vItem.id || '').trim().toLowerCase();

  // Match against authoritative catalog
  const catalogVehicle = INITIAL_FLEET.find(f => 
    (f.id && f.id.toLowerCase() === vId) || 
    (f.name && f.name.toLowerCase() === vName) ||
    (vName && f.name && vName.includes(f.name.toLowerCase()))
  );

  let baseRate = 2000;
  let deposit = 3000;

  if (catalogVehicle) {
    const isAuto = (vItem.transmission || '').toLowerCase().includes('auto');
    if (isAuto && catalogVehicle.priceAuto) {
      baseRate = catalogVehicle.priceAuto;
    } else if (catalogVehicle.priceManual) {
      baseRate = catalogVehicle.priceManual;
    } else {
      baseRate = catalogVehicle.price || 2000;
    }
    deposit = Number(catalogVehicle.deposit !== undefined ? catalogVehicle.deposit : 3000);
  } else if (vItem.price && Number(vItem.price) > 0) {
    baseRate = Number(vItem.price);
    deposit = Number(vItem.deposit || 3000);
  }

  // Apply active seasonal pricing multipliers if active
  const rules = getPricingRulesSync();
  let multiplier = 1.0;
  if (rules.globalOverride && (rules.globalOverride.active || rules.globalOverride.enabled) && Number(rules.globalOverride.multiplier) > 0) {
    multiplier = Math.max(multiplier, Number(rules.globalOverride.multiplier));
  } else if (rules.globalSurge && rules.globalSurge.enabled && Number(rules.globalSurge.multiplier) > 0) {
    multiplier = Math.max(multiplier, Number(rules.globalSurge.multiplier));
  }

  if (pickupDate && Array.isArray(rules.seasons)) {
    const pDate = String(pickupDate).slice(0, 10);
    const parts = pDate.split('-');
    const m = parts.length === 3 ? parseInt(parts[1], 10) : (new Date(pDate).getMonth() + 1);
    const d = parts.length === 3 ? parseInt(parts[2], 10) : new Date(pDate).getDate();

    const activeSeason = rules.seasons.find(s => {
      if (s.active === false) return false;
      if (s.startDate && s.endDate && pDate >= s.startDate && pDate <= s.endDate) return true;
      if (s.startMonth && s.startDay && s.endMonth && s.endDay) {
        const sM = Number(s.startMonth);
        const sD = Number(s.startDay);
        const eM = Number(s.endMonth);
        const eD = Number(s.endDay);
        if (sM < eM || (sM === eM && sD <= eD)) {
          if (m > sM && m < eM) return true;
          if (m === sM && m === eM) return d >= sD && d <= eD;
          if (m === sM) return d >= sD;
          if (m === eM) return d <= eD;
          return false;
        } else {
          if (m > sM || m < eM) return true;
          if (m === sM) return d >= sD;
          if (m === eM) return d <= eD;
          return false;
        }
      }
      return false;
    });

    if (activeSeason && Number(activeSeason.multiplier) > 0) {
      multiplier = Math.max(multiplier, Number(activeSeason.multiplier));
    }
  }

  const finalDayRate = Math.round(baseRate * multiplier);
  return { finalDayRate, deposit };
}

function normalizeBookingForSheets(b) {
  if (!b) return null;
  const raw = (typeof b.toObject === 'function') ? b.toObject() : (b._doc ? { ...b._doc } : { ...b });
  
  const rawId = raw.id || raw.bookingId || raw.referenceId || (raw._id ? String(raw._id) : '') || '';
  let cleanId = String(rawId).replace(/^['#]/, '').trim().toUpperCase();
  if (cleanId && !cleanId.startsWith('TRT-')) {
    cleanId = `TRT-${cleanId.replace(/^TRT-?/i, '')}`;
  }
  const finalId = cleanId || `TRT-${Date.now().toString(36).toUpperCase().slice(-5)}`;
  
  let vehicleStr = raw.vehicle || '';
  if (!vehicleStr && Array.isArray(raw.vehicles) && raw.vehicles.length > 0) {
    vehicleStr = raw.vehicles.map(v => v.name + (v.transmission ? ` (${v.transmission})` : '')).join(', ');
  }
  
  let transmission = raw.transmission || (Array.isArray(raw.vehicles) && raw.vehicles[0] && raw.vehicles[0].transmission) || 'Manual';

  const advPaid = Number(raw.advancePaid || 0);
  const tot = Number(raw.total || (Number(raw.rentalTotal || 0) + Number(raw.depositTotal || 0)) || 0);
  const balDue = Number(raw.balanceAtPickup != null ? raw.balanceAtPickup : (tot - advPaid));

  let notes = raw.notes || '';
  if (raw.status === 'Cancelled' && raw.refundStatus && raw.refundStatus !== 'Not Applicable') {
    const refundNote = `[Refund: ${raw.refundStatus} - ₹${raw.refundAmount || advPaid}${raw.refundTxnId ? ` | Txn: ${raw.refundTxnId}` : ''}]`;
    if (!notes.includes(raw.refundStatus)) {
      notes = notes ? `${notes} | ${refundNote}` : refundNote;
    }
  }

  let paymentStatus = raw.paymentStatus;
  if (!paymentStatus) {
    if (raw.status === 'Cancelled') {
      if (raw.refundStatus === 'Refunded') {
        paymentStatus = `REFUNDED (₹${raw.refundAmount || advPaid})`;
      } else if (raw.refundStatus === 'Pending Refund') {
        paymentStatus = `REFUND QUEUED (₹${raw.refundAmount || advPaid})`;
      } else if (advPaid > 0) {
        paymentStatus = 'CANCELLED (Advance Non-refundable)';
      } else {
        paymentStatus = 'CANCELLED (Pay at Pickup)';
      }
    } else {
      paymentStatus = advPaid > 0 ? 'PAID (20% Advance Online)' : 'PENDING (Pay at Pickup)';
    }
  }

  return {
    id: finalId,
    name: raw.name || '',
    phone: raw.phone || '',
    email: raw.email || '',
    vehicle: vehicleStr || 'Self-Drive Vehicle',
    transmission: transmission,
    pickupDate: raw.pickupDate || '',
    returnDate: raw.returnDate || raw.pickupDate || '',
    days: Number(raw.days || 1),
    pickup: raw.pickupLocation || raw.pickup || 'Manohar International Airport, Mopa (GOX)',
    drop: raw.dropLocation || raw.drop || raw.pickupLocation || raw.pickup || 'Manohar International Airport, Mopa (GOX)',
    location: raw.location || raw.pickupLocation || raw.pickup || 'Goa',
    rentalTotal: Number(raw.rentalTotal || 0),
    depositTotal: Number(raw.depositTotal || 0),
    total: tot,
    advancePaid: advPaid,
    balanceAtPickup: balDue,
    status: raw.status || 'Confirmed',
    paymentMode: raw.paymentMode || (advPaid > 0 ? 'Advance 20%' : 'Pay at Pickup'),
    paymentStatus: paymentStatus,
    transactionId: raw.transactionId || (advPaid > 0 ? 'Online Payment Verified' : '-'),
    refundStatus: raw.refundStatus || '',
    refundAmount: Number(raw.refundAmount || 0),
    refundTxnId: raw.refundTxnId || '',
    cancelReason: raw.cancelReason || '',
    cancelledAt: raw.cancelledAt || null,
    notes: notes,
    createdAt: raw.createdAt || new Date().toISOString()
  };
}

async function syncBookingToGoogleSheets(bookingOrArray, customWebhookUrl) {
  const settings = getAppSettings();
  const webhookUrl = (customWebhookUrl || settings.googleSheetsWebhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL || '').trim();
  if (!webhookUrl) {
    return { success: false, error: 'Google Sheets Webhook URL is empty. Please enter and save your Google Apps Script Web App URL.' };
  }

  try {
    const rawList = Array.isArray(bookingOrArray) ? bookingOrArray : [bookingOrArray];
    const payload = rawList.map(normalizeBookingForSheets).filter(Boolean);

    if (payload.length === 0) {
      return { success: false, error: 'No valid booking records to sync' };
    }

    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const text = await resp.text();
    console.log(`📊 [Google Sheets Auto-Sync] Status ${resp.status}. Response preview:`, text.slice(0, 150));

    // Check if Google returned an authorization/login interstitial page
    if (text.includes('accounts.google.com') || text.includes('Google hasn') || text.includes('Sign in - Google Accounts') || (text.includes('script.google.com') && text.includes('form'))) {
      return {
        success: false,
        error: '⚠️ Google Permission Needed: In your Google tab, please click "Review Permissions" -> "Advanced" -> "Go to Untitled project (unsafe)" -> "Allow".'
      };
    }

    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (e) {}

    if (parsed && parsed.result === 'error') {
      return { success: false, error: `Google Sheets Script Error: ${parsed.error}` };
    }

    return { success: true, response: text, data: parsed };
  } catch (err) {
    console.warn('⚠️ [Google Sheets Auto-Sync Note]:', err.message);
    return { success: false, error: `Connection failed: ${err.message}` };
  }
}

// ==========================================
// AUTOMATED GMAIL EMAIL DISPATCH SERVICE
// ==========================================
const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: (process.env.GMAIL_USER || '').trim(),
    pass: (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '')
  }
});

async function sendAdmin2FAEmail(toEmail, otpCode, meta = {}) {
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  console.log('\n======================================================');
  console.log(`🔐 [TOURENT 2FA VERIFICATION CODE]: >>> ${otpCode} <<<`);
  console.log(`📧 Target Recipient: ${toEmail}`);
  console.log('======================================================\n');

  if (!user || !pass || !toEmail) {
    console.warn('⚠️ [Nodemailer 2FA] Gmail credentials or recipient missing in .env');
    return { success: false, error: 'Email delivery unavailable' };
  }

  const timeStr = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const ipStr = meta.ip || 'Unknown IP';
  const userAgentStr = meta.userAgent || 'Chrome Browser';

  const htmlContent = `
    <div style="font-family:'Plus Jakarta Sans', Arial, -apple-system, sans-serif; background:#0f172a; padding:35px 15px; color:#f8fafc; line-height:1.6;">
      <div style="max-width:540px; margin:0 auto; background:#1e293b; border-radius:20px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.4); border:1px solid #334155;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, #0c2340 0%, #1e3a5f 100%); padding:28px 24px; text-align:center; border-bottom:1px solid rgba(227,162,61,0.25);">
          <div style="display:inline-block; width:44px; height:44px; line-height:44px; border-radius:12px; background:linear-gradient(135deg, #e3a23d, #b4472e); color:#0c2340; font-weight:900; font-size:22px; margin-bottom:10px;">T</div>
          <h1 style="margin:0; font-size:20px; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">Tourent Goa · Security Portal</h1>
          <p style="margin:4px 0 0; font-size:12px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.08em; font-weight:700;">Owner Master 2-Step Verification</p>
        </div>

        <!-- Body -->
        <div style="padding:32px 28px; text-align:center;">
          <div style="width:58px; height:58px; border-radius:16px; background:rgba(227, 162, 61, 0.15); border:1.5px solid rgba(227, 162, 61, 0.35); color:#e3a23d; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:26px;">
            🔐
          </div>
          <h2 style="margin:0 0 8px; font-size:20px; font-weight:800; color:#ffffff;">Your Login Verification Code</h2>
          <p style="margin:0 0 24px; font-size:13.5px; color:#cbd5e1; line-height:1.55;">
            Use the 6-digit security code below to complete your Master Administrator login. This code is valid for <strong>5 minutes</strong>.
          </p>

          <!-- OTP Box -->
          <div style="background:#0f172a; border:2px dashed #e3a23d; border-radius:16px; padding:18px 20px; margin:0 auto 28px; max-width:320px;">
            <div style="font-family:'SF Mono', Menlo, Consolas, monospace; font-size:36px; font-weight:900; letter-spacing:8px; color:#fbbf24; text-shadow:0 0 12px rgba(251,191,36,0.3);">
              ${otpCode}
            </div>
            <div style="font-size:11px; color:#94a3b8; margin-top:6px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">One-Time Security PIN</div>
          </div>

          <!-- Audit Metadata Details -->
          <div style="background:#0f172a; border-radius:12px; padding:14px 18px; text-align:left; font-size:12px; color:#94a3b8; border:1px solid #334155; margin-bottom:24px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="color:#64748b;">Requested At:</span>
              <strong style="color:#e2e8f0;">${timeStr} (IST)</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="color:#64748b;">IP Address:</span>
              <strong style="color:#e2e8f0;">${ipStr}</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:#64748b;">Client:</span>
              <strong style="color:#e2e8f0; max-width:240px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${userAgentStr}</strong>
            </div>
          </div>

          <!-- Security Notice -->
          <div style="border-top:1px solid #334155; padding-top:18px; font-size:11.5px; color:#64748b; line-height:1.5;">
            ⚠️ <em>If you did not attempt to log in to Tourent Admin, please immediately change your Master Password from a secure device.</em>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#0c2340; padding:14px 20px; text-align:center; font-size:11px; color:#64748b; border-top:1px solid #334155;">
          Tourent Self-Drive Car Rentals Goa · Security Operations Engine
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Tourent Security Alert" <${user}>`,
    to: toEmail,
    subject: `🔐 ${otpCode} is your Tourent Admin Login Verification Code`,
    text: `Your Tourent Admin login verification code is ${otpCode}. Valid for 5 minutes. Requested at ${timeStr} (IST) from IP ${ipStr}.`,
    html: htmlContent
  };

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 [2FA Email] Sent verification OTP to ${toEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [2FA Email Error] Failed to send OTP to ${toEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function sendBookingVoucherEmail(booking) {
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  if (!user || !pass || !booking.email) {
    const missing = !booking.email ? 'Customer email is missing' : 'Gmail credentials missing in .env';
    console.warn(`⚠️ [Nodemailer] Cannot send email: ${missing}`);
    return { success: false, error: missing };
  }

  const advanceStr = (booking.advancePaid && booking.advancePaid > 0) 
    ? `₹${Number(booking.advancePaid).toLocaleString('en-IN')}` 
    : `₹0`;
  const balanceStr = `₹${Number(booking.balanceAtPickup || booking.total).toLocaleString('en-IN')}`;
  const totalTripStr = `₹${Number(booking.total).toLocaleString('en-IN')}`;
  const dateStr = booking.createdAt 
    ? new Date(booking.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) 
    : 'Recent';

  const htmlContent = `
    <div style="font-family:'Plus Jakarta Sans', Arial, sans-serif; background:#f4f7fa; padding:30px 15px; color:#0c2340;">
      <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 16px 40px rgba(12,35,64,0.08); border:1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, #0c2340 0%, #173d6a 100%); padding:28px 24px; text-align:center; color:#ffffff;">
          <h1 style="margin:0; font-size:24px; font-weight:800; letter-spacing:-0.5px;">TOURENT GOA</h1>
          <p style="margin:4px 0 0; font-size:12.5px; color:#e0f2fe; letter-spacing:0.5px;">OFFICIAL VEHICLE RESERVATION VOUCHER</p>
        </div>

        <!-- Status Badge -->
        <div style="padding:24px 24px 10px; text-align:center;">
          <div style="display:inline-block; background:#e6f4ea; color:#1e7a3e; border:1px solid rgba(30,122,62,0.3); padding:6px 18px; border-radius:999px; font-weight:700; font-size:13px;">
            ✓ 20% Advance Paid · Vehicle Guaranteed &amp; Confirmed
          </div>
          <h2 style="margin:16px 0 4px; font-size:24px; color:#0c2340; font-family:monospace;">#${booking.id}</h2>
          <p style="margin:0; font-size:12px; color:#64748b;">Booked on: ${dateStr}</p>
        </div>

        <!-- Trip Details -->
        <div style="padding:15px 24px;">
          <div style="background:#f8fafc; border-radius:14px; padding:18px; border:1px solid #e2e8f0; font-size:13.5px; line-height:1.65;">
            <div style="margin-bottom:8px;">🚗 <strong>Vehicle(s):</strong> ${booking.vehicle}</div>
            <div style="margin-bottom:8px;">📅 <strong>Pickup Date:</strong> ${booking.pickupDate}</div>
            <div style="margin-bottom:8px;">🏁 <strong>Return Date:</strong> ${booking.returnDate}</div>
            <div style="margin-bottom:${booking.dropLocation && booking.dropLocation !== (booking.pickupLocation || booking.pickup) ? '8px' : '0'};">📍 <strong>Pickup Point:</strong> ${booking.pickupLocation || booking.pickup || booking.location}${booking.pickupAddress ? ` (${booking.pickupAddress})` : (booking.flightTrainNo ? ` [${booking.flightTrainNo}]` : '')}</div>
            ${booking.dropLocation && booking.dropLocation !== (booking.pickupLocation || booking.pickup) ? `<div>🔄 <strong>Drop-off Point:</strong> ${booking.dropLocation}${booking.dropAddress ? ` (${booking.dropAddress})` : ''}</div>` : ''}
          </div>
        </div>

        <!-- Financial Breakdown -->
        <div style="padding:0 24px 20px;">
          <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:14px; padding:18px; font-size:13px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
              <span>Total Trip Amount:</span>
              <strong>${totalTripStr}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:#15803d; font-weight:700;">
              <span>🟢 20% Advance Paid Online:</span>
              <span>${advanceStr}</span>
            </div>
            <div style="display:flex; justify-content:space-between; padding-top:10px; border-top:1px dashed #86efac; color:#0c2340; font-size:15px; font-weight:800;">
              <span>💵 Balance Due at Pickup:</span>
              <span style="color:#d9531e;">${balanceStr}</span>
            </div>
            ${booking.transactionId ? `<div style="font-size:11px; color:#059669; margin-top:8px; font-family:monospace;">✓ Txn ID: ${booking.transactionId}</div>` : ''}
          </div>
        </div>

        <!-- Customer & Support -->
        <div style="padding:0 24px 24px; font-size:13px; color:#334155; line-height:1.5;">
          <p style="margin:0 0 14px;"><strong>Customer:</strong> ${booking.name} · ${booking.phone}</p>
          <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:14px; color:#1e40af; font-size:12.5px;">
            📌 <strong>Next Step:</strong> Our Goa fleet coordinator will contact you via WhatsApp / Call prior to handover. Please keep your Driving Licence ready upon vehicle delivery.
          </div>
          <div style="text-align:center; margin-top:20px;">
            <a href="https://api.whatsapp.com/send/?phone=919322730029" style="background:#25D366; color:#ffffff; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:700; font-size:13.5px; display:inline-block;">
              💬 Chat with Tourent Goa WhatsApp Desk
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f1f5f9; padding:16px; text-align:center; font-size:11.5px; color:#64748b; border-top:1px solid #e2e8f0;">
          Tourent Goa Vehicle Rentals · 24/7 Helpline: +91 93227 30029 / +91 93224 69973 · Panaji / Airport / Mopa / Margao / Calangute
        </div>
      </div>
    </div>
  `;

  const textFallback = `TOURENT GOA - VEHICLE RESERVATION VOUCHER
Booking ID: #${booking.id}
Vehicle: ${booking.vehicle}
Pickup Date: ${booking.pickupDate}
Return Date: ${booking.returnDate}
Location: ${booking.location}

FINANCIAL SUMMARY:
- Total Trip Amount: ${totalTripStr}
- 20% Advance Paid Online: ${advanceStr}
- Balance Payable at Pickup: ${balanceStr}
${booking.transactionId ? `- Transaction ID: ${booking.transactionId}\n` : ''}
Customer: ${booking.name} (${booking.phone})
Helpline / WhatsApp: +91 93227 30029 / +91 93224 69973`;

  try {
    const info = await emailTransporter.sendMail({
      from: `"Tourent Goa Rentals" <${user}>`,
      to: booking.email,
      cc: user, // Sends admin copy as well
      replyTo: user,
      subject: `🎉 Booking Confirmed: Tourent Goa [#${booking.id}] - ${booking.vehicle}`,
      text: textFallback,
      html: htmlContent
    });
    console.log(`📧 [Nodemailer] Official Voucher emailed to ${booking.email} for #${booking.id} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    const isAuthErr = err.message && (err.message.includes('535') || err.message.includes('BadCredentials') || err.message.includes('Username and Password'));
    if (isAuthErr) {
      console.error('\n🚨 ==============================================================');
      console.error('❌ [GMAIL SMTP AUTHENTICATION FAILED - 535 BadCredentials]');
      console.error(`Google rejected the Gmail App Password for: ${user}`);
      console.error('👉 TO FIX THIS IN 30 SECONDS:');
      console.error('   1. Go to: https://myaccount.google.com/apppasswords');
      console.error('   2. Sign into ' + user);
      console.error('   3. Create a new App Password (App name: Tourent)');
      console.error('   4. Copy the 16-letter password into .env: GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx');
      console.error('   5. Restart your server');
      console.error('==============================================================\n');
    } else {
      console.error(`⚠️ [Nodemailer] Email send error for ${booking.email}:`, err.message);
    }
    return { success: false, error: err.message };
  }
}

async function sendBookingCancellationEmail(booking) {
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  if (!user || !pass || !booking.email) {
    const missing = !booking.email ? 'Customer email is missing' : 'Gmail credentials missing in .env';
    console.warn(`⚠️ [Nodemailer] Cannot send cancellation email: ${missing}`);
    return { success: false, error: missing };
  }

  const isRefundEligible = booking.refundEligible || (booking.refundStatus === 'Pending Refund') || (booking.refundStatus === 'Refunded');
  const refundAmount = Number(booking.refundAmount || booking.advancePaid || 0);
  const advancePaid = Number(booking.advancePaid || 0);
  const refundAmtStr = `₹${refundAmount.toLocaleString('en-IN')}`;
  const advanceStr = `₹${advancePaid.toLocaleString('en-IN')}`;

  let refundBadgeHtml = '';
  let refundDetailsHtml = '';

  if (isRefundEligible && refundAmount > 0) {
    if (booking.refundStatus === 'Refunded') {
      refundBadgeHtml = `
        <div style="display:inline-block; background:#e6f4ea; color:#1e7a3e; border:1px solid rgba(30,122,62,0.3); padding:6px 18px; border-radius:999px; font-weight:700; font-size:13px;">
          ✓ 100% Refund Completed (${refundAmtStr})
        </div>
      `;
      refundDetailsHtml = `
        <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:14px; padding:18px; font-size:13px; margin-bottom:15px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:#15803d; font-weight:700;">
            <span>🟢 Refund Status:</span>
            <span>Completed &amp; Credited</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span>Refund Amount:</span>
            <strong>${refundAmtStr}</strong>
          </div>
          ${booking.refundTxnId ? `<div style="font-size:11.5px; color:#047857; margin-top:8px; font-family:monospace;">✓ Refund Txn Ref: ${booking.refundTxnId}</div>` : ''}
        </div>
      `;
    } else {
      refundBadgeHtml = `
        <div style="display:inline-block; background:#fef3c7; color:#92400e; border:1px solid #fde68a; padding:6px 18px; border-radius:999px; font-weight:700; font-size:13px;">
          🟢 100% Full Refund Queued (${refundAmtStr})
        </div>
      `;
      refundDetailsHtml = `
        <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:14px; padding:18px; font-size:13px; margin-bottom:15px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:#15803d; font-weight:700;">
            <span>🟢 24-Hour Policy:</span>
            <span>100% Full Refund Eligible</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span>Advance Token to Refund:</span>
            <strong style="color:#15803d;">${refundAmtStr}</strong>
          </div>
          <div style="padding-top:8px; border-top:1px dashed #86efac; font-size:12px; color:#475569;">
            ⏱️ Your full refund of <strong>${refundAmtStr}</strong> will be processed back to your original payment method within <strong>3–5 business days</strong>.
          </div>
        </div>
      `;
    }
  } else if (advancePaid > 0) {
    refundBadgeHtml = `
      <div style="display:inline-block; background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:6px 18px; border-radius:999px; font-weight:700; font-size:13px;">
        Reservation Cancelled (Non-Refundable)
      </div>
    `;
    refundDetailsHtml = `
      <div style="background:#fff1f2; border:1.5px solid #fecdd3; border-radius:14px; padding:18px; font-size:13px; margin-bottom:15px; color:#9f1239;">
        <div style="font-weight:700; margin-bottom:6px;">🛑 Non-Refundable Cancellation Notice:</div>
        <div style="font-size:12px; line-height:1.5;">
          This reservation was cancelled after the 24-hour booking grace window. As per Tourent Goa policy, the advance reservation token of <strong>${advanceStr}</strong> is retained to cover scheduled fleet allocation.
        </div>
      </div>
    `;
  } else {
    refundBadgeHtml = `
      <div style="display:inline-block; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:6px 18px; border-radius:999px; font-weight:700; font-size:13px;">
        Reservation Cancelled (Pay at Pickup)
      </div>
    `;
  }

  const htmlContent = `
    <div style="font-family:'Plus Jakarta Sans', Arial, sans-serif; background:#f4f7fa; padding:30px 15px; color:#0c2340;">
      <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 16px 40px rgba(12,35,64,0.08); border:1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, #0c2340 0%, #173d6a 100%); padding:28px 24px; text-align:center; color:#ffffff;">
          <h1 style="margin:0; font-size:24px; font-weight:800; letter-spacing:-0.5px;">TOURENT GOA</h1>
          <p style="margin:4px 0 0; font-size:12.5px; color:#e0f2fe; letter-spacing:0.5px;">RESERVATION CANCELLATION NOTICE</p>
        </div>

        <!-- Status Badge -->
        <div style="padding:24px 24px 10px; text-align:center;">
          ${refundBadgeHtml}
          <h2 style="margin:16px 0 4px; font-size:24px; color:#0c2340; font-family:monospace;">#${booking.id}</h2>
          <p style="margin:0; font-size:12px; color:#64748b;">Cancelled on: ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
        </div>

        <!-- Refund Section -->
        <div style="padding:10px 24px 0;">
          ${refundDetailsHtml}
        </div>

        <!-- Trip Details -->
        <div style="padding:10px 24px 15px;">
          <div style="background:#f8fafc; border-radius:14px; padding:18px; border:1px solid #e2e8f0; font-size:13.5px; line-height:1.65;">
            <div style="margin-bottom:8px;">🚗 <strong>Cancelled Vehicle:</strong> ${booking.vehicle}</div>
            <div style="margin-bottom:8px;">📅 <strong>Scheduled Dates:</strong> ${booking.pickupDate} → ${booking.returnDate}</div>
            <div>📍 <strong>Scheduled Pickup:</strong> ${booking.location}</div>
          </div>
        </div>

        <!-- Customer & Support -->
        <div style="padding:0 24px 24px; font-size:13px; color:#334155; line-height:1.5;">
          <p style="margin:0 0 14px;"><strong>Customer:</strong> ${booking.name} · ${booking.phone}</p>
          <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:14px; color:#1e40af; font-size:12.5px;">
            💬 Need help or want to rebook for other dates? Our 24/7 team is available on WhatsApp and phone.
          </div>
          <div style="text-align:center; margin-top:20px;">
            <a href="https://api.whatsapp.com/send/?phone=919322730029" style="background:#25D366; color:#ffffff; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:700; font-size:13.5px; display:inline-block;">
              💬 Chat with Tourent Goa WhatsApp Desk
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f1f5f9; padding:16px; text-align:center; font-size:11.5px; color:#64748b; border-top:1px solid #e2e8f0;">
          Tourent Goa Vehicle Rentals · 24/7 Helpline: +91 93227 30029 / +91 93224 69973 · Panaji / Airport / Mopa / Margao / Calangute
        </div>
      </div>
    </div>
  `;

  const subject = (isRefundEligible && refundAmount > 0)
    ? `⚠️ Booking Cancelled & 100% Refund Queued: Tourent Goa [#${booking.id}]`
    : `⚠️ Booking Cancelled: Tourent Goa [#${booking.id}]`;

  const textFallback = `TOURENT GOA - BOOKING CANCELLATION NOTICE
Booking Reference: #${booking.id}
Vehicle: ${booking.vehicle}
Dates: ${booking.pickupDate} to ${booking.returnDate}
Customer: ${booking.name} (${booking.phone})
${isRefundEligible && refundAmount > 0 ? `100% Refund of ${refundAmtStr} queued (3-5 business days).` : ''}
Tourent Goa Support: +91 93227 30029`;

  try {
    const info = await emailTransporter.sendMail({
      from: `"Tourent Goa Rentals" <${user}>`,
      to: booking.email,
      cc: user, // Sends copy to Admin Gmail as well
      replyTo: user,
      subject,
      text: textFallback,
      html: htmlContent
    });
    console.log(`📧 [Nodemailer] Cancellation notice emailed to ${booking.email} for #${booking.id} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`⚠️ [Nodemailer] Cancellation email send error for ${booking.email}:`, err.message);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 1. HEALTH & STATUS API
// ==========================================
const handleHealthCheck = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    service: 'Tourent Goa Production API',
    database: states[dbState] || 'unknown',
    emailConfigured: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
  });
};
app.get('/api/health', handleHealthCheck);
app.get('/health', handleHealthCheck);

// Direct Test Email Diagnostic Route (Protected)
app.post('/api/test-email', requireAdminAuth, async (req, res) => {
  const targetEmail = (req.body && req.body.email) ? req.body.email : (process.env.GMAIL_USER || 'tourentgoarentals@gmail.com');
  const dummyBooking = {
    id: `TRT-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    name: 'Diagnostic User',
    phone: '+91 93224 69973',
    email: targetEmail,
    pickupDate: new Date().toISOString().slice(0, 10),
    returnDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    location: 'Panaji Delivery Counter',
    vehicle: 'Maruti Swift (Manual)',
    advancePaid: 1080,
    balanceAtPickup: 7320,
    total: 8400,
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };

  const result = await sendBookingVoucherEmail(dummyBooking);
  res.json({
    success: result.success,
    recipient: targetEmail,
    messageId: result.messageId || null,
    error: result.error || null
  });
});

// GET /api/test-email - Test sending an instant voucher email (Protected)
app.get('/api/test-email', requireAdminAuth, async (req, res) => {
  const targetEmail = req.query.to || process.env.GMAIL_USER;
  try {
    const testBooking = {
      id: 'TRT-TEST' + Math.floor(1000 + Math.random() * 9000),
      name: 'Tourent Verified Guest',
      phone: '+91 93224 69973',
      email: targetEmail,
      vehicle: 'Maruti Swift (Manual)',
      pickupDate: '2026-08-28',
      returnDate: '2026-08-31',
      location: 'Panaji Delivery Counter',
      total: 8400,
      advancePaid: 1080,
      balanceAtPickup: 7320,
      transactionId: 'PAY-TRT-DEMO' + Math.floor(100+Math.random()*900),
      createdAt: new Date().toISOString()
    };
    await sendBookingVoucherEmail(testBooking);
    res.json({ success: true, message: `Test email successfully dispatched to ${targetEmail} from ${process.env.GMAIL_USER}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. ADMIN AUTHENTICATION & SECURITY API
// ==========================================

// Map to store pending 2FA challenges: tempToken -> { otpCode, expiresAt, attempts, ownerEmail, ip, lastSentAt }
const pending2FAChallenges = new Map();

// Periodic cleanup of expired challenges (every 2 mins)
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of pending2FAChallenges.entries()) {
    if (data.expiresAt < now) {
      pending2FAChallenges.delete(token);
    }
  }
}, 120000);

function verifyTrustedDeviceToken(token) {
  if (!token || typeof token !== 'string') return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded && decoded.type === 'trusted_device' && decoded.role === 'admin';
  } catch (e) {
    return false;
  }
}

// POST /api/admin/login - Authenticate admin / staff & trigger 2FA for Owner if untrusted
app.post('/api/admin/login', adminAuthLimiter, async (req, res) => {
  try {
    const { username, password, trustedDeviceToken } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password or Staff PIN is required.' });
    }

    const trimmedPass = String(password).trim();
    const secConfig = await getSecurityConfig();

    // 1. Check Master Admin Password (strictly check active custom password, supports bcrypt hash)
    const activeMasterPassword = (secConfig.customMasterPassword && secConfig.customMasterPassword.trim()) || ADMIN_PASSWORD || 'TourentGoa@2026!';
    const isMasterMatch = checkPasswordMatch(trimmedPass, activeMasterPassword);

    // 2. Check ANY active staff PIN from config or database
    const matchingStaffPin = Array.isArray(secConfig.staffPins) ? 
      secConfig.staffPins.find(p => p && p.pin && String(p.pin).trim() === trimmedPass && p.active !== false) : null;

    // 3. Fallback default PINs
    const isDefaultPinMatch = (trimmedPass === '3029') || (trimmedPass === '9973') || (trimmedPass === '0204');

    const isPassValid = isMasterMatch || Boolean(matchingStaffPin) || isDefaultPinMatch;

    if (!isPassValid) {
      console.warn(`🔒 [Security] Failed admin login attempt from IP ${req.ip}`);
      return res.status(401).json({ success: false, error: 'Invalid password or PIN. Please try again.' });
    }

    // A. Staff PIN Login -> Instant Access (No 2FA required for daily operations)
    if (!isMasterMatch) {
      const loginRole = 'staff';
      const pinLabel = matchingStaffPin ? matchingStaffPin.label : (trimmedPass === '3029' ? 'Primary Desk' : (trimmedPass === '9973' ? 'Airport & Fleet Ops' : (trimmedPass === '0204' ? 'Staff PIN 3' : 'Staff Desk')));

      const token = jwt.sign(
        { 
          username: ADMIN_USERNAME, 
          role: 'admin', 
          staffRole: loginRole, 
          label: pinLabel,
          sessionVersion: secConfig.sessionVersion || 1,
          authTime: Date.now() 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log(`🔑 [Security] Staff login successful (${pinLabel}) from IP ${req.ip}`);
      return res.json({
        success: true,
        requires2FA: false,
        message: 'Staff authenticated successfully',
        token,
        admin: { 
          username: ADMIN_USERNAME, 
          role: 'admin', 
          staffRole: loginRole, 
          label: pinLabel 
        }
      });
    }

    // B. Master Owner Login (Enforces 2FA whenever enabled)
    const is2FAEnabled = secConfig.twoFactorEnabled !== false;

    if (!is2FAEnabled) {
      const token = jwt.sign(
        { 
          username: ADMIN_USERNAME, 
          role: 'admin', 
          staffRole: 'admin', 
          label: 'Owner Master',
          sessionVersion: secConfig.sessionVersion || 1,
          authTime: Date.now() 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log(`👑 [Security] Master Admin login successful (2FA disabled by owner) from IP ${req.ip}`);
      return res.json({
        success: true,
        requires2FA: false,
        message: 'Master Admin authenticated successfully',
        token,
        admin: { 
          username: ADMIN_USERNAME, 
          role: 'admin', 
          staffRole: 'admin', 
          label: 'Owner Master' 
        }
      });
    }

    // C. 2FA Challenge Generation for Master Login (Every unlock requires OTP)
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const tempToken = `2fa_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const ownerEmail = (secConfig.ownerEmail || process.env.OWNER_EMAIL || 'tourentgoarentals@gmail.com').trim();

    pending2FAChallenges.set(tempToken, {
      otpCode,
      ownerEmail,
      attempts: 0,
      createdAt: Date.now(),
      lastSentAt: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
      ip: req.ip,
      userAgent: req.headers['user-agent'] || 'Browser'
    });

    // Send 2FA Email (async in background so response is immediate)
    sendAdmin2FAEmail(ownerEmail, otpCode, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }).catch(e => console.error('2FA Email send error:', e.message));

    // Mask email for privacy (e.g., pad***@gmail.com)
    const emailParts = ownerEmail.split('@');
    const maskedUser = emailParts[0].length <= 3 
      ? emailParts[0].slice(0, 1) + '***' 
      : emailParts[0].slice(0, 3) + '***' + emailParts[0].slice(-1);
    const maskedEmail = `${maskedUser}@${emailParts[1] || 'gmail.com'}`;

    console.log(`🔐 [Security] 2FA OTP generated for Master Login (${maskedEmail}). Code sent.`);
    return res.json({
      success: true,
      requires2FA: true,
      tempToken,
      maskedEmail,
      message: `A 6-digit verification code was sent to ${maskedEmail}`
    });

  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during authentication.' });
  }
});

// POST /api/admin/verify-2fa - Validate 6-digit OTP and issue Master Token
app.post('/api/admin/verify-2fa', adminAuthLimiter, async (req, res) => {
  try {
    const { tempToken, otpCode, rememberDevice } = req.body;
    if (!tempToken || !otpCode) {
      return res.status(400).json({ success: false, error: 'Temporary token and 6-digit verification code are required.' });
    }

    const challenge = pending2FAChallenges.get(tempToken);
    if (!challenge) {
      return res.status(401).json({ success: false, error: 'Verification session expired. Please enter your password again.' });
    }

    if (Date.now() > challenge.expiresAt) {
      pending2FAChallenges.delete(tempToken);
      return res.status(401).json({ success: false, error: 'Verification code expired (valid for 5 minutes). Please request a new code.' });
    }

    challenge.attempts += 1;
    if (challenge.attempts > 5) {
      pending2FAChallenges.delete(tempToken);
      return res.status(401).json({ success: false, error: 'Too many incorrect attempts. Please log in again.' });
    }

    const cleanInputCode = String(otpCode).trim().replace(/\D/g, '');
    if (cleanInputCode !== challenge.otpCode) {
      return res.status(401).json({ success: false, error: 'Invalid 6-digit verification code. Please check your email and try again.' });
    }

    // Success! Remove challenge from memory
    pending2FAChallenges.delete(tempToken);

    const secConfig = await getSecurityConfig();

    const token = jwt.sign(
      { 
        username: ADMIN_USERNAME, 
        role: 'admin', 
        staffRole: 'admin', 
        label: 'Owner Master',
        sessionVersion: secConfig.sessionVersion || 1,
        authTime: Date.now() 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    let trustedDeviceToken = null;
    if (rememberDevice) {
      trustedDeviceToken = jwt.sign(
        { 
          type: 'trusted_device',
          username: ADMIN_USERNAME, 
          role: 'admin',
          createdAt: Date.now()
        },
        JWT_SECRET,
        { expiresIn: '24h' } // 24 Hours Device Trust
      );
    }

    console.log(`👑 [Security] Master Admin 2FA verified successfully from IP ${req.ip}`);
    res.json({
      success: true,
      message: '2-Step Verification successful! Welcome Owner Master.',
      token,
      trustedDeviceToken,
      admin: { 
        username: ADMIN_USERNAME, 
        role: 'admin', 
        staffRole: 'admin', 
        label: 'Owner Master' 
      }
    });
  } catch (err) {
    console.error('2FA verification error:', err);
    res.status(500).json({ success: false, error: 'Error processing 2-step verification.' });
  }
});

// POST /api/admin/resend-2fa - Resend OTP code with rate limit
app.post('/api/admin/resend-2fa', adminAuthLimiter, async (req, res) => {
  try {
    const { tempToken } = req.body;
    if (!tempToken) {
      return res.status(400).json({ success: false, error: 'tempToken is required.' });
    }

    const challenge = pending2FAChallenges.get(tempToken);
    if (!challenge) {
      return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
    }

    const now = Date.now();
    const timeSinceLast = (now - (challenge.lastSentAt || 0)) / 1000;
    if (timeSinceLast < 30) {
      const waitTime = Math.ceil(30 - timeSinceLast);
      return res.status(429).json({ success: false, error: `Please wait ${waitTime} seconds before requesting a new code.` });
    }

    const newOtp = String(Math.floor(100000 + Math.random() * 900000));
    challenge.otpCode = newOtp;
    challenge.lastSentAt = now;
    challenge.expiresAt = now + (5 * 60 * 1000); // 5 more minutes
    challenge.attempts = 0;

    await sendAdmin2FAEmail(challenge.ownerEmail, newOtp, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, message: `New verification code sent to ${challenge.ownerEmail}` });
  } catch (err) {
    console.error('Resend 2FA error:', err);
    res.status(500).json({ success: false, error: 'Failed to resend code.' });
  }
});

// GET /api/admin/verify - Verify active JWT session token
app.get('/api/admin/verify', requireAdminAuth, (req, res) => {
  res.json({ success: true, valid: true, admin: req.admin });
});

// GET /api/admin/security - Retrieve current security settings & staff PINs
app.get('/api/admin/security', requireAdminAuth, async (req, res) => {
  try {
    const secConfig = await getSecurityConfig();
    res.json({
      success: true,
      hasCustomMaster: !!secConfig.customMasterPassword,
      ownerEmail: secConfig.ownerEmail || 'tourentgoarentals@gmail.com',
      twoFactorEnabled: secConfig.twoFactorEnabled !== false,
      lastPasswordChangedAt: secConfig.lastPasswordChangedAt,
      sessionVersion: secConfig.sessionVersion || 1,
      staffPins: secConfig.staffPins || [],
      envFallbackAvailable: true
    });
  } catch (err) {
    console.error('Error fetching security settings:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve security settings.' });
  }
});

// POST /api/admin/security/email - Update Owner 2FA Notification Email
app.post('/api/admin/security/email', requireOwnerAuth, async (req, res) => {
  try {
    const { ownerEmail, twoFactorEnabled } = req.body;
    if (!ownerEmail || !ownerEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    await saveSecurityConfig({
      ownerEmail: ownerEmail.trim().toLowerCase(),
      twoFactorEnabled: twoFactorEnabled !== false
    });

    res.json({
      success: true,
      message: 'Owner notification email & 2FA settings updated successfully.',
      ownerEmail: ownerEmail.trim().toLowerCase(),
      twoFactorEnabled: twoFactorEnabled !== false
    });
  } catch (err) {
    console.error('Error updating owner email:', err);
    res.status(500).json({ success: false, error: 'Failed to update owner email.' });
  }
});

// POST /api/admin/security/password - Change Master Admin Password
app.post('/api/admin/security/password', requireOwnerAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Both current password and new password are required.' });
    }

    const secConfig = await getSecurityConfig();
    const trimmedCurrent = String(currentPassword).trim();
    const trimmedNew = String(newPassword).trim();

    const activeMasterPassword = (secConfig.customMasterPassword && secConfig.customMasterPassword.trim()) || ADMIN_PASSWORD || 'TourentGoa@2026!';
    const currentMatches = checkPasswordMatch(trimmedCurrent, activeMasterPassword);

    if (!currentMatches) {
      return res.status(401).json({ success: false, error: 'Current master password is incorrect. Please check and try again.' });
    }

    if (trimmedNew.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    if (checkPasswordMatch(trimmedNew, activeMasterPassword)) {
      return res.status(400).json({ success: false, error: 'New password must be different from your current master password.' });
    }

    const hashedNew = bcrypt.hashSync(trimmedNew, 12);
    const newSessionVersion = (secConfig.sessionVersion || 1) + 1;
    await saveSecurityConfig({
      customMasterPassword: hashedNew,
      lastPasswordChangedAt: new Date(),
      sessionVersion: newSessionVersion
    });

    // Issue a fresh token for current session so active user doesn't get kicked out
    const newToken = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin', staffRole: 'admin', sessionVersion: newSessionVersion, authTime: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`🔐 [Security] Owner Master Password successfully updated from IP ${req.ip}`);
    res.json({
      success: true,
      message: 'Owner Master password updated successfully! Your active session is preserved.',
      token: newToken
    });
  } catch (err) {
    console.error('Error updating master password:', err);
    res.status(500).json({ success: false, error: 'Failed to update password. Server error: ' + err.message });
  }
});

// POST /api/admin/security/pins - Update or add Staff PINs
app.post('/api/admin/security/pins', requireOwnerAuth, async (req, res) => {
  try {
    const { staffPins } = req.body;
    if (!Array.isArray(staffPins)) {
      return res.status(400).json({ success: false, error: 'staffPins must be an array.' });
    }

    // Sanitize pins
    const cleanPins = staffPins.map((p, idx) => ({
      id: p.id || `pin_${Date.now()}_${idx}`,
      label: String(p.label || 'Staff PIN').trim(),
      pin: String(p.pin || '').trim(),
      role: p.role || 'staff',
      active: p.active !== false,
      createdAt: p.createdAt || new Date()
    })).filter(p => p.pin.length >= 3);

    await saveSecurityConfig({ staffPins: cleanPins });

    res.json({
      success: true,
      message: 'Staff PINs updated successfully.',
      staffPins: cleanPins
    });
  } catch (err) {
    console.error('Error saving staff PINs:', err);
    res.status(500).json({ success: false, error: 'Failed to update staff PINs.' });
  }
});

// POST /api/admin/security/invalidate-sessions - Force logout all other devices
app.post('/api/admin/security/invalidate-sessions', requireOwnerAuth, async (req, res) => {
  try {
    const secConfig = await getSecurityConfig();
    const newSessionVersion = (secConfig.sessionVersion || 1) + 1;
    await saveSecurityConfig({ sessionVersion: newSessionVersion });

    const newToken = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin', staffRole: 'admin', sessionVersion: newSessionVersion, authTime: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'All other staff and admin sessions have been invalidated. Current device session refreshed.',
      token: newToken
    });
  } catch (err) {
    console.error('Error invalidating sessions:', err);
    res.status(500).json({ success: false, error: 'Failed to invalidate sessions.' });
  }
});

// ==========================================
// 3. PROTECTED ADMIN BOOKINGS API
// ==========================================

// GET /api/admin/bookings - Retrieve all customer bookings (Protected)
app.get('/api/admin/bookings', requireAdminAuth, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'all') query.status = status;

    if (search) {
      const s = search.trim();
      const sDigits = s.replace(/\D/g, '');
      const s10 = sDigits.length >= 5 ? sDigits.slice(-10) : '';
      const textRegex = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const orConditions = [
        { id: textRegex },
        { name: textRegex },
        { vehicle: textRegex },
        { email: textRegex }
      ];

      if (s10) {
        const phoneFlexRegex = new RegExp(s10.split('').join('\\D*'), 'i');
        orConditions.push({ phone: phoneFlexRegex });
      } else {
        orConditions.push({ phone: textRegex });
      }
      query.$or = orConditions;
    }

    let dbBookings = [];
    if (mongoose.connection.readyState === 1) {
      try {
        dbBookings = await Booking.find(query).sort({ createdAt: -1 });
      } catch (dbErr) {
        console.warn('⚠️ [MongoDB Admin Fetch Error]:', dbErr.message);
      }
    }
    const localBookings = getLocalBookingsCache();
    const map = new Map();
    dbBookings.forEach(b => {
      const obj = b.toObject ? b.toObject() : b;
      if (obj.id) map.set(obj.id.replace(/^#/, '').toLowerCase(), obj);
    });

    localBookings.forEach(b => {
      if (!b.id) return;
      const key = b.id.replace(/^#/, '').toLowerCase();
      if (!map.has(key)) {
        map.set(key, b);
      } else {
        const existing = map.get(key);
        const localUpdated = new Date(b.updatedAt || b.cancelledAt || b.createdAt || 0).getTime();
        const dbUpdated = new Date(existing.updatedAt || existing.cancelledAt || existing.createdAt || 0).getTime();
        if (b.status === 'Cancelled' || b.status === 'Declined' || localUpdated >= dbUpdated) {
          map.set(key, { ...existing, ...b });
          if (mongoose.connection.readyState === 1 && existing.status !== b.status) {
            Booking.findOneAndUpdate(
              { $or: [{ id: b.id }, { id: key }] },
              { $set: b }
            ).catch(() => {});
          }
        }
      }
    });

    let allBookings = Array.from(map.values());
    if (status && status !== 'all') {
      allBookings = allBookings.filter(b => b.status === status);
    }
    allBookings.sort((a, b) => new Date(b.createdAt || b.bookedAt || Date.now()) - new Date(a.createdAt || a.bookedAt || Date.now()));
    res.json({ success: true, count: allBookings.length, data: allBookings });
  } catch (err) {
    console.error('Admin fetch bookings error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch admin bookings' });
  }
});

// POST /api/admin/bookings - Create direct dispatch / offline booking (Protected)
app.post('/api/admin/bookings', requireAdminAuth, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `TRT-DIR-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(10+Math.random()*90)}`;
    }
    data.phone = formatIndianPhone(data.phone);
    data.rentalTotal = Number(data.rentalTotal || data.price || data.total) || 0;
    data.depositTotal = Number(data.depositTotal) || 0;
    data.total = Number(data.total || (data.rentalTotal + data.depositTotal)) || 0;
    data.advancePaid = Number(data.advancePaid) || 0;
    data.balanceAtPickup = Number(data.balanceAtPickup || (data.total - data.advancePaid)) || 0;
    data.supplierPayout = Number(data.supplierPayout) || 0;
    data.netProfit = Number(data.rentalTotal - data.supplierPayout) || 0;

    let newBooking = null;
    if (mongoose.connection.readyState === 1) {
      newBooking = new Booking(data);
      await newBooking.save();
    }
    
    saveBookingToLocalCache(data);
    const createdBooking = newBooking ? newBooking.toObject() : data;
    console.log(`📋 [Admin] Created Direct Dispatch Booking: ${createdBooking.id} (${createdBooking.vehicle} for ${createdBooking.name})`);

    if (createdBooking.email && createdBooking.status === "Confirmed") {
      sendBookingVoucherEmail(createdBooking).catch(e => console.warn('Email trigger error:', e));
    }

    // Real-Time Google Sheets Auto-Sync for Admin direct bookings
    syncBookingToGoogleSheets(createdBooking).catch(err => console.warn('⚠️ [Google Sheets Auto-Sync Note]:', err.message));

    res.json({ success: true, data: createdBooking });
  } catch (err) {
    console.error('Admin create booking error:', err);
    res.status(500).json({ success: false, error: 'Failed to create booking: ' + err.message });
  }
});

// PATCH /api/admin/bookings/:id - Update booking status / details (Protected)
app.patch('/api/admin/bookings/:id', requireAdminAuth, async (req, res) => {
  try {
    const rawId = req.params.id || '';
    const idClean = rawId.replace(/^#/, '').trim();
    let updated = null;

    if (mongoose.connection.readyState === 1) {
      updated = await Booking.findOneAndUpdate(
        { $or: [{ id: idClean }, { id: { $regex: new RegExp(`^#?${idClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }] },
        { $set: req.body },
        { new: true, runValidators: true }
      );
    }

    // Also update local cache
    const list = getLocalBookingsCache();
    const idx = list.findIndex(b => {
      const bid = (b.id || '').replace(/^#/, '').trim().toLowerCase();
      return bid === idClean.toLowerCase();
    });
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...req.body, updatedAt: new Date().toISOString() };
      fs.writeFileSync(BOOKINGS_CACHE_FILE, JSON.stringify(list, null, 2), 'utf8');
      if (!updated) updated = list[idx];
    }

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    console.log(`🔄 [Admin] Booking Updated: ${updated.id} -> Status: ${updated.status}`);
    
    if (req.body.status === "Confirmed") {
      sendBookingVoucherEmail(updated).catch(e => console.warn('Email trigger error:', e));
    } else if (req.body.status === "Cancelled" || req.body.status === "Declined") {
      sendBookingCancellationEmail(updated).catch(e => console.warn('Email cancellation error:', e));
    }

    // Sync status changes to Google Sheets
    syncBookingToGoogleSheets(updated).catch(err => console.warn('⚠️ [Google Sheets Auto-Sync Note]:', err.message));

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Admin update booking error:', err);
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
});

// POST /api/admin/bookings/:id/refund - Admin executes or records customer refund (Protected - Owner Only)
app.post('/api/admin/bookings/:id/refund', requireOwnerAuth, async (req, res) => {
  try {
    const rawId = req.params.id || '';
    const idClean = rawId.replace(/^#/, '').trim();
    const { refundTxnId, refundAmount, notes } = req.body;

    const updateFields = {
      refundStatus: 'Refunded',
      refundedAt: new Date(),
      refundTxnId: refundTxnId || `REF-${Date.now().toString(36).toUpperCase()}`,
      updatedAt: new Date()
    };
    if (refundAmount !== undefined) updateFields.refundAmount = Number(refundAmount);
    if (notes) updateFields.notes = notes;

    let updated = null;
    if (mongoose.connection.readyState === 1) {
      updated = await Booking.findOneAndUpdate(
        { $or: [{ id: idClean }, { id: { $regex: new RegExp(`^#?${idClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }] },
        { $set: updateFields },
        { new: true }
      );
    }

    const list = getLocalBookingsCache();
    const idx = list.findIndex(b => {
      const bid = (b.id || '').replace(/^#/, '').trim().toLowerCase();
      return bid === idClean.toLowerCase();
    });
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updateFields, updatedAt: new Date().toISOString() };
      fs.writeFileSync(BOOKINGS_CACHE_FILE, JSON.stringify(list, null, 2), 'utf8');
      if (!updated) updated = list[idx];
    }

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Send refund confirmation email to customer & admin
    sendBookingCancellationEmail(updated).catch(err => console.warn('⚠️ [Email Refund Confirmation Note]:', err.message));

    syncBookingToGoogleSheets(updated).catch(err => console.warn('⚠️ [Google Sheets Auto-Sync Note]:', err.message));

    console.log(`💸 [Admin Refund] Booking #${idClean} marked as Refunded (Txn: ${updateFields.refundTxnId})`);
    res.json({ success: true, message: `Booking #${idClean} marked as Refunded`, data: updated });
  } catch (err) {
    console.error('Admin refund error:', err);
    res.status(500).json({ success: false, error: 'Failed to process refund: ' + err.message });
  }
});

// POST /api/admin/bookings/:id/resend-cancellation-email - Resend official cancellation voucher (Protected)
app.post('/api/admin/bookings/:id/resend-cancellation-email', requireAdminAuth, async (req, res) => {
  try {
    const rawId = req.params.id || '';
    const idClean = rawId.replace(/^#/, '').trim();
    let booking = null;

    if (mongoose.connection.readyState === 1) {
      booking = await Booking.findOne({
        $or: [{ id: idClean }, { id: { $regex: new RegExp(`^#?${idClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }]
      });
    }
    if (!booking) {
      const list = getLocalBookingsCache();
      booking = list.find(b => (b.id || '').replace(/^#/, '').trim().toLowerCase() === idClean.toLowerCase());
    }
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const obj = booking.toObject ? booking.toObject() : booking;
    const emailResult = await sendBookingCancellationEmail(obj);
    if (emailResult.success) {
      res.json({ success: true, message: `Official cancellation voucher emailed to ${obj.email}` });
    } else {
      res.status(500).json({ success: false, error: emailResult.error || 'Failed to dispatch email' });
    }
  } catch (err) {
    console.error('Resend cancellation email error:', err);
    res.status(500).json({ success: false, error: 'Failed to send cancellation email' });
  }
});

// DELETE /api/admin/bookings/:id - Delete a booking (Protected)
app.delete('/api/admin/bookings/:id', requireAdminAuth, async (req, res) => {
  try {
    let deleted = null;
    if (mongoose.connection.readyState === 1) {
      deleted = await Booking.findOneAndDelete({ id: req.params.id });
    }
    // Also remove from local cache
    try {
      const list = getLocalBookingsCache().filter(b => b.id !== req.params.id);
      fs.writeFileSync(BOOKINGS_CACHE_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (e) {}

    console.log(`🗑️ [Admin] Booking Deleted: ${req.params.id}`);
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Admin delete booking error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete booking' });
  }
});

// ==========================================
// 📊 GOOGLE SHEETS ADMIN INTEGRATION ENDPOINTS
// ==========================================

// GET /api/admin/google-sheets/config - Retrieve current Google Sheets Webhook URL
app.get('/api/admin/google-sheets/config', requireAdminAuth, (req, res) => {
  const settings = getAppSettings();
  res.json({
    success: true,
    webhookUrl: settings.googleSheetsWebhookUrl || '',
    configured: Boolean(settings.googleSheetsWebhookUrl && settings.googleSheetsWebhookUrl.startsWith('http'))
  });
});

// POST /api/admin/google-sheets/config - Save Google Sheets Webhook URL (Owner Only)
app.post('/api/admin/google-sheets/config', requireOwnerAuth, (req, res) => {
  const { webhookUrl } = req.body;
  const current = getAppSettings();
  current.googleSheetsWebhookUrl = (webhookUrl || '').trim();
  const saved = saveAppSettings(current);
  if (!saved) {
    return res.status(500).json({ success: false, error: 'Failed to save settings' });
  }
  console.log(`📊 [Google Sheets] Webhook URL updated by Admin: ${current.googleSheetsWebhookUrl ? 'Configured' : 'Cleared'}`);
  res.json({
    success: true,
    message: 'Google Sheets Webhook URL saved successfully',
    webhookUrl: current.googleSheetsWebhookUrl,
    configured: Boolean(current.googleSheetsWebhookUrl && current.googleSheetsWebhookUrl.startsWith('http'))
  });
});

// POST /api/admin/google-sheets/test - Send a test row to verify Google Sheet connection
app.post('/api/admin/google-sheets/test', requireAdminAuth, async (req, res) => {
  const { webhookUrl } = req.body || {};
  const testBooking = {
    id: `TRT-TEST${Math.floor(100 + Math.random() * 900)}`,
    name: 'Tourent Test Customer',
    phone: '+91 93227 30029',
    email: 'tourentgoarentals@gmail.com',
    vehicle: 'Swift AT / Thar 4x4 (Test Row)',
    transmission: 'Automatic',
    pickupDate: new Date().toISOString().slice(0, 10),
    returnDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    days: 1,
    location: 'Goa Airport (Mopa / Dabolim)',
    total: 2500,
    advancePaid: 500,
    depositTotal: 3000,
    balanceAtPickup: 2000,
    status: 'Confirmed',
    transactionId: 'TEST_TXN_OK',
    notes: 'Google Sheets Auto-Sync verified successfully!',
    createdAt: new Date().toISOString()
  };

  const result = await syncBookingToGoogleSheets(testBooking, webhookUrl);
  if (result.success) {
    res.json({ success: true, message: '✅ Test row appended to Google Sheet successfully!' });
  } else {
    res.status(400).json({ success: false, error: result.error || 'Failed to reach Google Sheets Webhook' });
  }
});

// POST /api/admin/google-sheets/sync-all - Push all current bookings (active & cancelled) to Google Sheet
app.post('/api/admin/google-sheets/sync-all', requireAdminAuth, async (req, res) => {
  try {
    const { webhookUrl, bookings } = req.body || {};
    let bookingsToSync = Array.isArray(bookings) ? bookings : [];
    if (bookingsToSync.length === 0) {
      const cacheList = getLocalBookingsCache();
      let dbList = [];
      if (mongoose.connection.readyState === 1) {
        dbList = await Booking.find().sort({ createdAt: -1 });
      }
      const map = new Map();
      dbList.forEach(b => {
        const item = b.toObject ? b.toObject() : b;
        map.set((item.id || '').toLowerCase(), item);
      });
      cacheList.forEach(b => {
        const k = (b.id || '').toLowerCase();
        if (!map.has(k) || (b.status === 'Cancelled' && map.get(k).status !== 'Cancelled')) {
          map.set(k, b);
        }
      });
      bookingsToSync = Array.from(map.values());
    }

    if (bookingsToSync.length === 0) {
      return res.status(400).json({ success: false, error: 'No bookings found to sync' });
    }

    const result = await syncBookingToGoogleSheets(bookingsToSync, webhookUrl);
    if (result.success) {
      res.json({ success: true, count: bookingsToSync.length, message: `✅ Successfully synced ${bookingsToSync.length} booking(s) to Google Sheet!` });
    } else {
      res.status(400).json({ success: false, error: result.error || 'Failed to sync to Google Sheet' });
    }
  } catch (err) {
    console.error('Error syncing all to Google Sheets:', err);
    res.status(500).json({ success: false, error: 'Internal server error while syncing to Google Sheets' });
  }
});

// POST /api/admin/google-sheets/sync-cancellations - Push all cancelled bookings to Google Sheet
app.post('/api/admin/google-sheets/sync-cancellations', requireAdminAuth, async (req, res) => {
  try {
    const { webhookUrl, bookings } = req.body || {};
    let cancelledToSync = Array.isArray(bookings) ? bookings : [];
    if (cancelledToSync.length === 0) {
      const cacheList = getLocalBookingsCache();
      let dbList = [];
      if (mongoose.connection.readyState === 1) {
        dbList = await Booking.find({
          $or: [
            { status: { $in: ['Cancelled', 'Declined'] } },
            { refundStatus: { $in: ['Refunded', 'Pending Refund', 'Non-Refundable'] } },
            { refundEligible: true }
          ]
        }).sort({ cancelledAt: -1, createdAt: -1 });
      }
      const map = new Map();
      dbList.forEach(b => {
        const item = b.toObject ? b.toObject() : b;
        map.set((item.id || '').toLowerCase(), item);
      });
      cacheList.filter(b => b.status === 'Cancelled' || b.status === 'Declined' || b.refundStatus === 'Refunded' || b.refundStatus === 'Pending Refund').forEach(b => {
        map.set((b.id || '').toLowerCase(), b);
      });
      cancelledToSync = Array.from(map.values());
    }

    if (cancelledToSync.length === 0) {
      return res.status(400).json({ success: false, error: 'No cancelled bookings found to sync' });
    }

    const result = await syncBookingToGoogleSheets(cancelledToSync, webhookUrl);
    if (result.success) {
      res.json({ success: true, count: cancelledToSync.length, message: `✅ Successfully synced ${cancelledToSync.length} cancelled booking(s) to Google Sheet!` });
    } else {
      res.status(400).json({ success: false, error: result.error || 'Failed to sync cancellations to Google Sheet' });
    }
  } catch (err) {
    console.error('Error syncing cancellations to Google Sheets:', err);
    res.status(500).json({ success: false, error: 'Internal server error while syncing cancellations to Google Sheets' });
  }
});

// ==========================================
// 4. SERVER-SIDE PAYMENT & RAZORPAY API
// ==========================================

// POST /api/payment/razorpay/create-order - Create live Razorpay Order
app.post('/api/payment/razorpay/create-order', bookingLimiter, async (req, res) => {
  try {
    const { id, vehicles, days, phone, name, email } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing required booking identifier' });
    }

    let calculatedRental = 0;
    let calculatedDeposit = 0;

    if (Array.isArray(vehicles) && vehicles.length > 0) {
      vehicles.forEach(v => {
        const { finalDayRate, deposit } = calculateAuthoritativeVehicleRate(v, req.body.pickupDate);
        const d = Math.max(1, parseInt(v.days || days, 10) || 1);
        calculatedRental += (finalDayRate * d);
        calculatedDeposit += deposit;
      });
    } else {
      const vObj = { name: req.body.vehicle || req.body.name, transmission: req.body.transmission };
      const { finalDayRate, deposit } = calculateAuthoritativeVehicleRate(vObj, req.body.pickupDate);
      const d = Math.max(1, parseInt(days || req.body.days, 10) || 1);
      calculatedRental = (finalDayRate * d);
      calculatedDeposit = deposit;
    }

    const advanceAmount = Math.round(calculatedRental * 0.20);
    const balanceAtPickup = (calculatedRental - advanceAmount) + calculatedDeposit;
    const totalTrip = calculatedRental + calculatedDeposit;
    const amountInPaise = advanceAmount * 100;

    // 1. If Razorpay is configured with real API credentials, create official Razorpay order
    if (razorpayInstance) {
      const rzpOrder = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: id.slice(-40),
        notes: {
          bookingId: id,
          customerName: name || 'Guest',
          phone: phone || '',
          advanceAmount: String(advanceAmount)
        }
      });

      console.log(`⚡ [Razorpay] Created Live Order ${rzpOrder.id} for #${id} (Amount: ₹${advanceAmount})`);

      return res.json({
        success: true,
        isLive: true,
        orderId: rzpOrder.id,
        amount: advanceAmount,
        amountPaise: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId: RAZORPAY_KEY_ID,
        balanceAtPickup,
        totalTrip
      });
    }

    // 2. Sandbox / Demo Fallback Mode
    const sandboxOrderId = `order_sand_${id.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString(36)}`;
    const sandboxSignature = crypto.createHmac('sha256', JWT_SECRET)
      .update(`${sandboxOrderId}:${advanceAmount}:${phone || ''}`)
      .digest('hex');

    console.log(`🧪 [Razorpay Sandbox] Created Order ${sandboxOrderId} for #${id} (Amount: ₹${advanceAmount})`);

    res.json({
      success: true,
      isLive: false,
      orderId: sandboxOrderId,
      amount: advanceAmount,
      amountPaise: amountInPaise,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID || 'rzp_test_sandbox',
      orderSignature: sandboxSignature,
      balanceAtPickup,
      totalTrip
    });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    res.status(500).json({ success: false, error: 'Failed to initialize payment gateway order: ' + err.message });
  }
});

// POST /api/payment/razorpay/verify - Verify Razorpay payment signature & confirm booking
app.post('/api/payment/razorpay/verify', bookingLimiter, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, error: 'Missing payment signature verification parameters' });
    }

    let isValid = false;

    if (!razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment signature required for verification' });
    }

    if (razorpayInstance) {
      const generatedSignature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      isValid = (generatedSignature === razorpay_signature);
    } else {
      // Sandbox mode verification
      isValid = true;
    }

    if (!isValid) {
      console.warn(`🚨 [Razorpay Security] Invalid payment signature for ${razorpay_order_id}!`);
      return res.status(400).json({ success: false, error: 'Payment signature verification failed. Untrusted transaction.' });
    }

    console.log(`✅ [Razorpay] Payment Verified! Order: ${razorpay_order_id}, Payment ID: ${razorpay_payment_id}`);

    // If booking details passed, record payment and dispatch email voucher
    if (booking && booking.id) {
      booking.transactionId = razorpay_payment_id;
      booking.status = 'Confirmed';
      booking.paymentMode = 'Advance 20% (Razorpay)';
      booking.phone = formatIndianPhone(booking.phone);
      booking.rentalTotal = Number(booking.rentalTotal || booking.price || booking.total) || 0;
      booking.depositTotal = Number(booking.depositTotal) || 0;
      booking.total = Number(booking.total || (booking.rentalTotal + booking.depositTotal)) || 0;
      booking.advancePaid = Number(booking.advancePaid) || 0;
      booking.balanceAtPickup = Number(booking.balanceAtPickup || (booking.total - booking.advancePaid)) || 0;
      booking.returnDate = booking.returnDate || booking.pickupDate;

      // 1. Send confirmed voucher email
      sendBookingVoucherEmail(booking).catch(e => console.warn('Email dispatch note:', e.message));

      // 2. Save to Local Cache & MongoDB Atlas
      saveBookingToLocalCache(booking);
      try {
        if (mongoose.connection.readyState === 1) {
          await Booking.findOneAndUpdate(
            { id: booking.id },
            { $set: booking },
            { upsert: true, new: true }
          );
          console.log(`✅ [MongoDB Atlas] Booking ${booking.id} confirmed via Razorpay Payment ${razorpay_payment_id}`);
        }
      } catch (dbErr) {
        console.warn('MongoDB save note:', dbErr.message);
      }

      // 3. Real-Time Google Sheets Auto-Sync for Razorpay confirmed booking
      syncBookingToGoogleSheets(booking).catch(err => console.warn('⚠️ [Google Sheets Auto-Sync Note]:', err.message));
    }

    res.json({
      success: true,
      verified: true,
      transactionId: razorpay_payment_id,
      message: 'Payment verified and reservation confirmed!'
    });
  } catch (err) {
    console.error('Razorpay verification error:', err);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
});

// POST /api/payment/razorpay/webhook - Live Razorpay Server-to-Server Webhook
app.post('/api/payment/razorpay/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBuffer = req.rawBody || Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    if (RAZORPAY_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(rawBuffer)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.warn('⚠️ [Razorpay Webhook] Invalid webhook signature detected!');
        return res.status(400).json({ status: 'invalid signature' });
      }
    }

    const eventData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log(`🔔 [Razorpay Webhook] Event: ${eventData.event}`);

    if (eventData.event === 'payment.captured' || eventData.event === 'order.paid') {
      const paymentEntity = eventData.payload && eventData.payload.payment && eventData.payload.payment.entity;
      if (!paymentEntity) return res.json({ status: 'ignored' });

      const bookingId = (paymentEntity.notes && paymentEntity.notes.bookingId) || paymentEntity.description;
      if (bookingId) {
        // Idempotency: skip duplicates if already Confirmed
        let existing = null;
        if (mongoose.connection.readyState === 1) {
          existing = await Booking.findOne({ id: bookingId });
        }
        if (existing && existing.status === 'Confirmed') {
          console.log(`ℹ️ [Razorpay Webhook] Booking ${bookingId} already confirmed. Skipping duplicate email/sheets.`);
          return res.json({ status: 'already_confirmed' });
        }

        console.log(`✅ [Razorpay Webhook] Auto-confirmed Booking ${bookingId} for ₹${paymentEntity.amount / 100}`);
        let b = null;
        if (mongoose.connection.readyState === 1) {
          b = await Booking.findOneAndUpdate(
            { id: bookingId },
            { $set: { status: 'Confirmed', transactionId: paymentEntity.id, paymentMode: 'Advance 20% (Razorpay Webhook)' } },
            { new: true }
          );
        }
        const bObj = b ? b.toObject() : { id: bookingId, status: 'Confirmed', transactionId: paymentEntity.id };
        saveBookingToLocalCache(bObj);
        if (b) sendBookingVoucherEmail(b).catch(e => console.warn('Email trigger error:', e));
        syncBookingToGoogleSheets(bObj).catch(err => console.warn('⚠️ [Google Sheets Auto-Sync Note]:', err.message));
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Razorpay webhook error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Backward compatibility endpoints
app.post('/api/payment/create-order', bookingLimiter, (req, res) => {
  res.redirect(307, '/api/payment/razorpay/create-order');
});
app.post('/api/payment/verify', bookingLimiter, (req, res) => {
  res.redirect(307, '/api/payment/razorpay/verify');
});

// ==========================================
// 5. PUBLIC SELF-DRIVE BOOKINGS API
// ==========================================

// Public Data Sanitizer: Strips internal margins, supplier costs, and dispatch notes from public responses
function sanitizeBookingForPublic(b) {
  if (!b) return null;
  const obj = b.toObject ? b.toObject() : { ...b };
  delete obj.supplierName;
  delete obj.supplierPhone;
  delete obj.supplierPayout;
  delete obj.netProfit;
  delete obj.assignedSlot;
  delete obj.driverName;
  delete obj.driverPhone;
  delete obj.notes;
  delete obj._id;
  delete obj.__v;
  return obj;
}

// GET /api/bookings - Public "My Bookings" lookup (Rate-limited, exact matching & sanitized)
app.get('/api/bookings', searchLimiter, async (req, res) => {
  try {
    const { phone, search } = req.query;
    const lookup = String(phone || search || '').trim();

    if (!lookup) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const sDigits = lookup.replace(/\D/g, '');
    const cleanId = lookup.replace(/^#/, '').trim();

    // Anti-scraping: require an exact 10-digit phone number OR a specific booking ID (min 8 chars)
    const isPhoneSearch = sDigits.length >= 10;
    const isIdSearch = cleanId.length >= 8 && /^[a-zA-Z0-9_-]+$/.test(cleanId);

    if (!isPhoneSearch && !isIdSearch) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please enter a valid 10-digit mobile number or complete Booking ID (e.g., TRT-123456).' 
      });
    }

    const orConditions = [];
    if (isIdSearch) {
      orConditions.push({ id: cleanId }, { id: `#${cleanId}` });
    }
    if (isPhoneSearch) {
      const s10 = sDigits.slice(-10);
      const phoneFlexRegex = new RegExp(s10.split('').join('\\D*') + '$', 'i');
      orConditions.push({ phone: phoneFlexRegex });
    }

    let dbBookings = [];
    if (mongoose.connection.readyState === 1 && orConditions.length > 0) {
      try {
        dbBookings = await Booking.find({ $or: orConditions }).sort({ createdAt: -1 });
      } catch (dbErr) {
        console.warn('⚠️ [MongoDB Search Error]:', dbErr.message);
      }
    }

    const localBookings = getLocalBookingsCache();
    const map = new Map();
    dbBookings.forEach(b => {
      const obj = b.toObject ? b.toObject() : b;
      if (obj.id) map.set(obj.id.replace(/^#/, '').toLowerCase(), obj);
    });

    localBookings.forEach(b => {
      let idMatch = false;
      let phoneMatch = false;
      if (isIdSearch && b.id) {
        const bClean = b.id.replace(/^#/, '').toLowerCase();
        idMatch = bClean === cleanId.toLowerCase();
      }
      if (isPhoneSearch && b.phone) {
        const s10 = sDigits.slice(-10);
        phoneMatch = new RegExp(s10.split('').join('\\D*') + '$', 'i').test(b.phone);
      }
      if (idMatch || phoneMatch) {
        const key = (b.id || '').replace(/^#/, '').toLowerCase();
        if (!map.has(key)) {
          map.set(key, b);
        }
      }
    });

    const results = Array.from(map.values())
      .filter(b => b && b.id && !b.id.startsWith('TRT-SEC-') && !b.id.startsWith('TEST-'))
      .map(sanitizeBookingForPublic)
      .sort((a, b) => new Date(b.createdAt || b.bookedAt || Date.now()) - new Date(a.createdAt || a.bookedAt || Date.now()));

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ success: false, error: 'Failed to lookup bookings' });
  }
});

// GET /api/bookings/:id - Retrieve single booking by Reference ID (Sanitized)
app.get('/api/bookings/:id', searchLimiter, async (req, res) => {
  try {
    const rawId = req.params.id || '';
    const idClean = rawId.replace(/^#/, '').trim();
    let booking = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const dbDoc = await Booking.findOne({
          $or: [{ id: idClean }, { id: { $regex: new RegExp(`^#?${idClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }]
        });
        if (dbDoc) {
          booking = dbDoc.toObject ? dbDoc.toObject() : dbDoc;
        }
      } catch (dbErr) {
        console.warn('⚠️ [MongoDB Single Lookup Error]:', dbErr.message);
      }
    }

    const list = getLocalBookingsCache();
    const localB = list.find(b => (b.id || '').replace(/^#/, '').trim().toLowerCase() === idClean.toLowerCase());

    if (localB) {
      if (!booking) {
        booking = localB;
      } else {
        const localUpdated = new Date(localB.updatedAt || localB.cancelledAt || localB.createdAt || 0).getTime();
        const dbUpdated = new Date(booking.updatedAt || booking.cancelledAt || booking.createdAt || 0).getTime();
        if (localB.status === 'Cancelled' || localB.status === 'Declined' || localUpdated >= dbUpdated) {
          booking = { ...booking, ...localB };
          if (mongoose.connection.readyState === 1 && booking.status !== localB.status) {
            Booking.findOneAndUpdate(
              { $or: [{ id: idClean }, { id: { $regex: new RegExp(`^#?${idClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }] },
              { $set: localB }
            ).catch(() => {});
          }
        }
      }
    }

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const authHeader = req.headers.authorization;
    let isAdminAuth = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded && (decoded.role === 'admin' || decoded.staffRole)) {
          isAdminAuth = true;
        }
      } catch (_) {}
    }

    const sanitized = sanitizeBookingForPublic(booking);
    if (!isAdminAuth) {
      if (sanitized.phone) {
        const raw = String(sanitized.phone).replace(/\D/g, '');
        if (raw.length >= 10) {
          sanitized.phone = `+91 ${raw.slice(-10, -7)}*** *${raw.slice(-2)}`;
        }
      }
      if (sanitized.email) {
        const parts = String(sanitized.email).split('@');
        if (parts.length === 2) {
          const u = parts[0];
          const maskedU = u.length <= 2 ? u[0] + '***' : u.slice(0, 2) + '***' + u.slice(-1);
          sanitized.email = `${maskedU}@${parts[1]}`;
        }
      }
    }

    res.json({ success: true, data: sanitized });
  } catch (err) {
    console.error('Error fetching single booking:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve booking' });
  }
});

// Helper: Evaluate 24-Hour Cancellation & Refund Policy
function evaluate24HourRefund(booking, cancellationDate = new Date()) {
  if (!booking) return { isWithin24Hours: false, elapsedHours: 0, refundEligible: false, refundAmount: 0, refundStatus: 'Not Applicable' };
  
  const createdRaw = booking.createdAt || booking.bookedAt || booking.date;
  const createdDate = createdRaw ? new Date(createdRaw) : new Date();
  const elapsedMs = Math.max(0, cancellationDate.getTime() - createdDate.getTime());
  const elapsedHours = Math.round((elapsedMs / (1000 * 60 * 60)) * 10) / 10;
  const isWithin24Hours = elapsedHours <= 24;
  const advancePaid = Number(booking.advancePaid || 0);

  let refundEligible = false;
  let refundAmount = 0;
  let refundStatus = 'Not Applicable';

  if (advancePaid > 0) {
    if (isWithin24Hours) {
      refundEligible = true;
      refundAmount = advancePaid;
      refundStatus = 'Pending Refund';
    } else {
      refundEligible = false;
      refundAmount = 0;
      refundStatus = 'Non-Refundable';
    }
  }

  return {
    isWithin24Hours,
    elapsedHours,
    refundEligible,
    refundAmount,
    refundStatus
  };
}

// PATCH /api/bookings/:id - Public customer cancellation / status sync
app.patch('/api/bookings/:id', searchLimiter, async (req, res) => {
  try {
    const rawId = req.params.id || '';
    const idClean = rawId.replace(/^#/, '').trim();
    const requestedStatus = req.body.status || 'Cancelled';
    const cancelDate = new Date();

    // 1. Fetch current booking to inspect booking creation time & advance paid
    let existing = null;
    if (mongoose.connection.readyState === 1) {
      try {
        existing = await Booking.findOne({
          $or: [{ id: idClean }, { id: { $regex: new RegExp(`^#?${idClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }]
        });
      } catch (dbErr) {
        console.warn('⚠️ [MongoDB Find Error]:', dbErr.message);
      }
    }
    if (!existing) {
      const list = getLocalBookingsCache();
      existing = list.find(b => (b.id || '').replace(/^#/, '').trim().toLowerCase() === idClean.toLowerCase());
    }

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    // Ownership Verification: Ensure request is from authenticated staff OR matches booking phone/email
    const authHeader = req.headers.authorization;
    let isAdminAuth = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded && (decoded.role === 'admin' || decoded.staffRole)) {
          isAdminAuth = true;
        }
      } catch (_) {}
    }

    if (!isAdminAuth) {
      if (requestedStatus !== 'Cancelled') {
        return res.status(403).json({ success: false, error: 'Forbidden: Customers are only permitted to cancel reservations.' });
      }

      const incomingPhone = String(req.body.phone || req.body.booking?.phone || '').replace(/\D/g, '');
      const incomingEmail = String(req.body.email || req.body.booking?.email || '').trim().toLowerCase();
      const existingPhone = String(existing.phone || '').replace(/\D/g, '');
      const existingEmail = String(existing.email || '').trim().toLowerCase();

      const phoneMatches = incomingPhone.length >= 7 && existingPhone.endsWith(incomingPhone.slice(-7));
      const emailMatches = incomingEmail && existingEmail && incomingEmail === existingEmail;

      if (!phoneMatches && !emailMatches) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Booking cancellation requires verifying the phone number or email associated with this reservation.'
        });
      }
    }

    const refundEval = evaluate24HourRefund(existing, cancelDate);

    const updatePayload = {
      status: requestedStatus,
      updatedAt: cancelDate
    };

    if (requestedStatus === 'Cancelled') {
      updatePayload.cancelledAt = cancelDate;
      updatePayload.cancelReason = req.body.cancelReason || 'Customer cancellation via My Bookings';
      updatePayload.refundEligible = refundEval.refundEligible;
      updatePayload.refundAmount = refundEval.refundAmount;
      updatePayload.refundStatus = refundEval.refundStatus;
    }

    let updated = null;
    if (mongoose.connection.readyState === 1) {
      try {
        updated = await Booking.findOneAndUpdate(
          { $or: [{ id: idClean }, { id: { $regex: new RegExp(`^#?${idClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }] },
          { $set: updatePayload },
          { new: true }
        );
      } catch (dbErr) {
        console.warn('⚠️ [MongoDB Update Error]:', dbErr.message);
      }
    }

    // Sync to local file cache
    const list = getLocalBookingsCache();
    const idx = list.findIndex(b => {
      const bid = (b.id || '').replace(/^#/, '').trim().toLowerCase();
      return bid === idClean.toLowerCase();
    });
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updatePayload, updatedAt: cancelDate.toISOString() };
      if (!updated) updated = list[idx];
    } else {
      const newEntry = {
        id: idClean,
        ...(existing || {}),
        ...updatePayload,
        updatedAt: cancelDate.toISOString()
      };
      list.unshift(newEntry);
      if (!updated) updated = newEntry;
    }
    fs.writeFileSync(BOOKINGS_CACHE_FILE, JSON.stringify(list, null, 2), 'utf8');

    if (requestedStatus === 'Cancelled') {
      sendBookingCancellationEmail(updated).catch(err => console.warn('⚠️ [Email Cancellation Note]:', err.message));
    }

    // Auto sync to Google Sheets if connected
    syncBookingToGoogleSheets(updated).catch(err => console.warn('⚠️ [Google Sheets Auto-Sync Note]:', err.message));

    console.log(`🚫 [Customer Cancellation] Booking #${idClean} marked as "${requestedStatus}" (${refundEval.refundStatus}: ₹${refundEval.refundAmount})`);
    res.json({
      success: true,
      message: refundEval.refundEligible 
        ? `Booking #${idClean} cancelled within 24 hours. Full refund of ₹${refundEval.refundAmount.toLocaleString('en-IN')} queued.`
        : `Booking #${idClean} marked as ${requestedStatus}.`,
      data: updated,
      refundInfo: refundEval
    });
  } catch (err) {
    console.error('Customer cancel booking error:', err);
    res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  }
});

// POST /api/bookings/:id/cancel - Explicit customer cancellation endpoint with 24-hr refund policy
app.post('/api/bookings/:id/cancel', searchLimiter, async (req, res) => {
  try {
    const rawId = req.params.id || '';
    const idClean = rawId.replace(/^#/, '').trim();
    const cancelDate = new Date();

    // 1. Fetch current booking to inspect booking creation time & advance paid
    let existing = null;
    if (mongoose.connection.readyState === 1) {
      try {
        existing = await Booking.findOne({
          $or: [{ id: idClean }, { id: { $regex: new RegExp(`^#?${idClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }]
        });
      } catch (dbErr) {
        console.warn('⚠️ [MongoDB Find Error]:', dbErr.message);
      }
    }
    if (!existing) {
      const list = getLocalBookingsCache();
      existing = list.find(b => (b.id || '').replace(/^#/, '').trim().toLowerCase() === idClean.toLowerCase());
    }

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    // Ownership Verification: Ensure request is from authenticated staff OR matches booking phone/email
    const authHeader = req.headers.authorization;
    let isAdminAuth = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded && (decoded.role === 'admin' || decoded.staffRole)) {
          isAdminAuth = true;
        }
      } catch (_) {}
    }

    if (!isAdminAuth) {
      const incomingPhone = String(req.body.phone || req.body.booking?.phone || '').replace(/\D/g, '');
      const incomingEmail = String(req.body.email || req.body.booking?.email || '').trim().toLowerCase();
      const existingPhone = String(existing.phone || '').replace(/\D/g, '');
      const existingEmail = String(existing.email || '').trim().toLowerCase();

      const phoneMatches = incomingPhone.length >= 7 && existingPhone.endsWith(incomingPhone.slice(-7));
      const emailMatches = incomingEmail && existingEmail && incomingEmail === existingEmail;

      if (!phoneMatches && !emailMatches) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Booking cancellation requires verifying the phone number or email associated with this reservation.'
        });
      }
    }

    const refundEval = evaluate24HourRefund(existing, cancelDate);

    const updatePayload = {
      status: 'Cancelled',
      cancelledAt: cancelDate,
      cancelReason: req.body.cancelReason || 'Customer requested cancellation via My Bookings',
      refundEligible: refundEval.refundEligible,
      refundAmount: refundEval.refundAmount,
      refundStatus: refundEval.refundStatus,
      updatedAt: cancelDate
    };

    let updated = null;
    if (mongoose.connection.readyState === 1) {
      try {
        updated = await Booking.findOneAndUpdate(
          { $or: [{ id: idClean }, { id: { $regex: new RegExp(`^#?${idClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }] },
          { $set: updatePayload },
          { new: true }
        );
      } catch (dbErr) {
        console.warn('⚠️ [MongoDB FindOneAndUpdate Error]:', dbErr.message);
      }
    }

    // Sync to local file cache
    const list = getLocalBookingsCache();
    const idx = list.findIndex(b => {
      const bid = (b.id || '').replace(/^#/, '').trim().toLowerCase();
      return bid === idClean.toLowerCase();
    });
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updatePayload, updatedAt: cancelDate.toISOString() };
      if (!updated) updated = list[idx];
    } else {
      const newEntry = {
        id: idClean,
        ...(existing || {}),
        ...updatePayload,
        updatedAt: cancelDate.toISOString()
      };
      list.unshift(newEntry);
      if (!updated) updated = newEntry;
    }
    fs.writeFileSync(BOOKINGS_CACHE_FILE, JSON.stringify(list, null, 2), 'utf8');

    // Send Cancellation Email Voucher to customer & admin
    sendBookingCancellationEmail(updated).catch(err => console.warn('⚠️ [Email Cancellation Note]:', err.message));

    // Auto sync to Google Sheets if connected
    syncBookingToGoogleSheets(updated).catch(err => console.warn('⚠️ [Google Sheets Auto-Sync Note]:', err.message));

    console.log(`🚫 [Customer Cancellation] Booking #${idClean} Cancelled (${refundEval.refundStatus}: ₹${refundEval.refundAmount} | ${refundEval.elapsedHours}h elapsed)`);
    res.json({
      success: true,
      message: refundEval.refundEligible 
        ? `Booking #${idClean} cancelled within 24 hours. Full refund of ₹${refundEval.refundAmount.toLocaleString('en-IN')} queued for processing.`
        : `Booking #${idClean} cancelled. Non-refundable as reservation was made over 24 hours ago.`,
      data: updated,
      refundInfo: refundEval
    });
  } catch (err) {
    console.error('Customer cancel booking error:', err);
    res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  }
});

// POST /api/bookings - Create new customer booking & dispatch email voucher
app.post('/api/bookings', bookingLimiter, async (req, res) => {
  const bData = req.body;
  if (!bData.id || !bData.name || !bData.phone || !bData.pickupDate) {
    return res.status(400).json({ success: false, error: 'Missing required booking fields' });
  }

  // Public bookings default strictly to 'Pending confirmation' unless created by authenticated admin
  const authHeader = req.headers.authorization;
  let isAdminAuth = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      if (decoded && (decoded.role === 'admin' || decoded.staffRole)) {
        isAdminAuth = true;
      }
    } catch (_) {}
  }
  if (!isAdminAuth) {
    bData.status = 'Pending confirmation';
  }

  // Normalize phone number and booking financial fields
  bData.phone = formatIndianPhone(bData.phone);

  let verifiedRental = 0;
  let verifiedDeposit = 0;
  if (Array.isArray(bData.vehicles) && bData.vehicles.length > 0) {
    bData.vehicles.forEach(v => {
      const { finalDayRate, deposit } = calculateAuthoritativeVehicleRate(v, bData.pickupDate);
      const d = Math.max(1, parseInt(v.days || bData.days, 10) || 1);
      verifiedRental += (finalDayRate * d);
      verifiedDeposit += deposit;
    });
  } else if (bData.vehicle) {
    const vObj = { name: bData.vehicle, transmission: bData.transmission };
    const { finalDayRate, deposit } = calculateAuthoritativeVehicleRate(vObj, bData.pickupDate);
    const d = Math.max(1, parseInt(bData.days, 10) || 1);
    verifiedRental = (finalDayRate * d);
    verifiedDeposit = deposit;
  }

  bData.rentalTotal = verifiedRental > 0 ? verifiedRental : (Number(bData.rentalTotal || bData.price || bData.total) || 0);
  bData.depositTotal = verifiedDeposit >= 0 ? verifiedDeposit : (Number(bData.depositTotal) || 0);
  bData.total = bData.rentalTotal + bData.depositTotal;
  bData.advancePaid = Number(bData.advancePaid) || Math.round(bData.rentalTotal * 0.20);
  bData.balanceAtPickup = Math.max(0, bData.total - bData.advancePaid);
  bData.returnDate = bData.returnDate || bData.pickupDate;
  bData.pickup = bData.pickupLocation || bData.pickup || bData.location || 'Manohar International Airport, Mopa (GOX)';
  bData.drop = bData.dropLocation || bData.drop || bData.pickup || 'Manohar International Airport, Mopa (GOX)';
  bData.pickupLocation = bData.pickupLocation || bData.pickup;
  bData.dropLocation = bData.dropLocation || bData.drop;
  bData.pickupAddress = bData.pickupAddress || '';
  bData.dropAddress = bData.dropAddress || '';
  bData.flightTrainNo = bData.flightTrainNo || '';
  bData.location = bData.location || bData.pickup;

  // Validate real-time availability to prevent overbooking
  try {
    const availData = await getFleetAvailability(bData.pickupDate, bData.returnDate);
    const requestedVehicles = Array.isArray(bData.vehicles) && bData.vehicles.length > 0 
      ? bData.vehicles 
      : [{ name: bData.vehicle }];

    const reqCounts = {};
    for (const rv of requestedVehicles) {
      const vName = (rv.name || '').trim().toLowerCase();
      const matchedKey = Object.keys(availData.availability).find(k => {
        const item = availData.availability[k];
        return item.id.toLowerCase() === vName || item.name.toLowerCase() === vName || (vName.includes(item.name.toLowerCase()));
      });
      if (matchedKey) {
        reqCounts[matchedKey] = (reqCounts[matchedKey] || 0) + 1;
      }
    }

    for (const [vId, count] of Object.entries(reqCounts)) {
      const availInfo = availData.availability[vId];
      if (availInfo && availInfo.availableUnits < count) {
        return res.status(409).json({
          success: false,
          error: `Sorry, ${availInfo.name} only has ${availInfo.availableUnits} unit(s) remaining for your selected dates (${bData.pickupDate} to ${bData.returnDate}). Please adjust quantity or choose another vehicle.`
        });
      }
    }
  } catch (availErr) {
    console.warn('⚠️ [Availability Validation Note]:', availErr.message);
  }

  console.log(`📥 [Booking Engine] Received booking ${bData.id} for ${bData.name} (${bData.email})`);

  // 1. Instantly dispatch official confirmation email voucher
  const emailResult = await sendBookingVoucherEmail(bData);

  // 2. Save to Local Cache & MongoDB Atlas if connected
  saveBookingToLocalCache(bData);
  try {
    if (mongoose.connection.readyState === 1) {
      const existing = await Booking.findOne({ id: bData.id });
      if (!existing) {
        const newBooking = new Booking(bData);
        await newBooking.save();
        console.log(`✅ [MongoDB Atlas] Saved Booking: ${bData.id} by ${bData.name} (Phone: ${bData.phone})`);
      }
    } else {
      console.log(`📝 [Local Mode] Booking ${bData.id} recorded in local cache (MongoDB reconnecting...)`);
    }
  } catch (err) {
    console.warn('⚠️ [MongoDB Save Note]:', err.message);
  }

  // 3. Real-Time Google Sheets Auto-Sync (Background async)
  syncBookingToGoogleSheets(bData).catch(err => console.warn('⚠️ [Google Sheets Auto-Sync Note]:', err.message));

  res.status(201).json({
    success: true,
    message: emailResult.success ? 'Booking confirmed and email voucher dispatched' : `Booking confirmed, but email delivery issue: ${emailResult.error}`,
    emailSent: emailResult.success,
    emailError: emailResult.error || null,
    data: bData
  });
});

// ==========================================
// 6. ANALYTICS & STATS API (Admin Protected)
// ==========================================
app.get('/api/analytics', requireAdminAuth, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending confirmation' });
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });

    const revenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['Confirmed', 'Completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$rentalTotal' }, totalDeposits: { $sum: '$depositTotal' }, grandTotal: { $sum: '$total' } } }
    ]);

    const revenue = revenueResult[0] || { totalRevenue: 0, totalDeposits: 0, grandTotal: 0 };
    const totalTaxis = await TaxiBooking.countDocuments();

    res.json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalTaxis,
        revenue
      }
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// ==========================================
// 4. AIRPORT TAXIS API
// ==========================================
app.get('/api/taxis', requireAdminAuth, async (req, res) => {
  try {
    const taxis = await TaxiBooking.find().sort({ createdAt: -1 });
    res.json({ success: true, count: taxis.length, data: taxis });
  } catch (err) {
    console.error('Error fetching taxi bookings:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch taxi bookings' });
  }
});

app.post('/api/taxis', bookingLimiter, async (req, res) => {
  try {
    const tData = req.body;
    if (!tData.id) {
      const stamp = Date.now().toString(36).toUpperCase().slice(-5);
      tData.id = `TXI-${stamp}${Math.floor(10 + Math.random() * 90)}`;
    }
    tData.status = 'Pending confirmation';
    const newTaxi = new TaxiBooking(tData);
    const saved = await newTaxi.save();
    console.log(`🚖 [MongoDB Atlas] New Airport Taxi: ${saved.id} (${saved.cabType} from ${saved.airport})`);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Error saving taxi booking:', err);
    res.status(500).json({ success: false, error: 'Failed to save taxi booking' });
  }
});

app.patch('/api/taxis/:id', requireAdminAuth, async (req, res) => {
  try {
    const updated = await TaxiBooking.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update taxi booking' });
  }
});

// ==========================================
// 5. FLEET MANAGEMENT & AVAILABILITY ENGINE
// ==========================================

async function getFleetAvailability(pickupDateStr, returnDateStr) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const pDate = (pickupDateStr || todayStr).slice(0, 10);
  const rDate = (returnDateStr || pDate).slice(0, 10);

  let fleet = [];
  if (mongoose.connection.readyState === 1) {
    try {
      fleet = await Vehicle.find();
    } catch (e) {
      console.warn('⚠️ [Availability] Error fetching db vehicles:', e.message);
    }
  }
  if (!fleet || fleet.length === 0) {
    fleet = INITIAL_FLEET.map(v => ({ ...v }));
  } else {
    fleet = fleet.map(v => {
      const obj = v.toObject ? v.toObject() : { ...v };
      if (obj.totalUnits === undefined || obj.totalUnits === null) {
        const seedMatch = INITIAL_FLEET.find(s => s.id === obj.id || (s.name && obj.name && s.name.toLowerCase() === obj.name.toLowerCase()));
        obj.totalUnits = seedMatch?.totalUnits || (obj.id === 'v_baleno' ? 20 : 10);
      }
      return obj;
    });
  }

  // Fetch active bookings (exclude Cancelled and Declined)
  let dbBookings = [];
  if (mongoose.connection.readyState === 1) {
    try {
      dbBookings = await Booking.find({ status: { $nin: ['Cancelled', 'Declined'] } });
    } catch (e) {
      console.warn('⚠️ [Availability] Error fetching db bookings:', e.message);
    }
  }

  const localBookings = getLocalBookingsCache();
  const allBookingsMap = new Map();
  dbBookings.forEach(b => {
    const obj = b.toObject ? b.toObject() : b;
    if (obj.id) allBookingsMap.set(String(obj.id).toLowerCase(), obj);
  });
  localBookings.forEach(b => {
    if (b.id && !allBookingsMap.has(String(b.id).toLowerCase())) {
      allBookingsMap.set(String(b.id).toLowerCase(), b);
    }
  });

  function matchVehicleId(vehicleString) {
    if (!vehicleString) return null;
    const clean = String(vehicleString).toLowerCase().trim();
    const byId = fleet.find(f => f.id && f.id.toLowerCase() === clean);
    if (byId) return byId.id;
    const byName = fleet.find(f => f.name && f.name.toLowerCase() === clean);
    if (byName) return byName.id;
    const byIncludes = fleet.find(f => f.name && (clean.includes(f.name.toLowerCase()) || f.name.toLowerCase().includes(clean)));
    if (byIncludes) return byIncludes.id;
    return null;
  }

  // Count booked units per vehicle for overlapping dates
  const bookedCounts = {};

  for (const b of allBookingsMap.values()) {
    if (b.status === 'Cancelled' || b.status === 'Declined') continue;

    const bPickup = (b.pickupDate || '').slice(0, 10);
    const bReturn = (b.returnDate || b.pickupDate || '').slice(0, 10);
    if (!bPickup) continue;

    // Standard interval overlap: bPickup <= rDate && bReturn >= pDate
    const isOverlapping = (bPickup <= rDate && bReturn >= pDate);
    if (!isOverlapping) continue;

    if (Array.isArray(b.vehicles) && b.vehicles.length > 0) {
      for (const item of b.vehicles) {
        const vKey = matchVehicleId(item.name || item.id) || (item.name || '').trim().toLowerCase();
        bookedCounts[vKey] = (bookedCounts[vKey] || 0) + 1;
      }
    } else if (b.vehicle) {
      const vKey = matchVehicleId(b.vehicle) || String(b.vehicle).trim().toLowerCase();
      bookedCounts[vKey] = (bookedCounts[vKey] || 0) + 1;
    }
  }

  const availability = {};
  for (const v of fleet) {
    const isManuallySoldOut = Boolean(v.soldOut === true || v.isSoldOut === true);
    const totalUnits = Math.max(1, Number(v.totalUnits) || (v.id === 'v_baleno' ? 20 : 10));
    const bookedUnits = bookedCounts[v.id] || 0;
    const availableUnits = isManuallySoldOut ? 0 : Math.max(0, totalUnits - bookedUnits);
    let status = 'Available';
    if (isManuallySoldOut || availableUnits <= 0) {
      status = 'Sold Out';
    } else if (availableUnits <= 3) {
      status = 'Low Stock';
    }

    availability[v.id] = {
      id: v.id,
      name: v.name,
      cat: v.cat,
      totalUnits,
      bookedUnits,
      availableUnits,
      status,
      soldOut: isManuallySoldOut,
      isSoldOut: isManuallySoldOut
    };
  }

  return {
    pickupDate: pDate,
    returnDate: rDate,
    availability
  };
}

app.get('/api/fleet/availability', async (req, res) => {
  try {
    const { pickupDate, returnDate, days } = req.query;
    let rDate = returnDate;
    if (!rDate && pickupDate && days) {
      const d = new Date(pickupDate);
      d.setDate(d.getDate() + (parseInt(days, 10) || 1));
      rDate = d.toISOString().slice(0, 10);
    }
    const result = await getFleetAvailability(pickupDate, rDate);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Error fetching fleet availability:', err);
    res.status(500).json({ success: false, error: 'Failed to calculate fleet availability' });
  }
});

// In-memory fleet cache for zero-loss serverless and offline resilience
let cachedFleet = null;

function getCachedFleet() {
  if (Array.isArray(cachedFleet) && cachedFleet.length > 0) {
    return cachedFleet;
  }
  return [...INITIAL_FLEET];
}

app.get('/api/fleet', async (req, res) => {
  try {
    const { category, active } = req.query;
    let query = {};
    if (category) query.cat = category;
    if (active !== undefined) query.active = active === 'true';

    let fleet = [];
    if (mongoose.connection.readyState === 1) {
      fleet = await Vehicle.find(query);
      if (Array.isArray(fleet) && fleet.length > 0 && !category && active === undefined) {
        cachedFleet = fleet.map(v => (v.toObject ? v.toObject() : { ...v }));
      }
    }
    if (!fleet || fleet.length === 0) {
      const source = getCachedFleet();
      fleet = source.filter(v => {
        if (category && v.cat !== category) return false;
        if (active !== undefined && (v.active === true) !== (active === 'true')) return false;
        return true;
      });
    }

    // Ensure totalUnits and soldOut states are present on all vehicles
    fleet = fleet.map(v => {
      const obj = v.toObject ? v.toObject() : { ...v };
      if (obj.totalUnits === undefined || obj.totalUnits === null) {
        const seedMatch = INITIAL_FLEET.find(s => s.id === obj.id || (s.name && obj.name && s.name.toLowerCase() === obj.name.toLowerCase()));
        obj.totalUnits = seedMatch?.totalUnits || (obj.id === 'v_baleno' ? 20 : 10);
      }
      obj.soldOut = Boolean(obj.soldOut === true || obj.isSoldOut === true);
      obj.isSoldOut = obj.soldOut;
      return obj;
    });

    // Maintain the exact curated positions: Hatchbacks -> SUVs -> Luxury -> Two-wheelers
    const defaultOrder = [
      "v_swift", "v_baleno", "v_i20", "v_glanza",
      "v_ertiga", "v_creta_2nd", "v_creta_3rd", "v_alcazar", "v_carens", "v_crysta", "v_hycross", "v_fortuner", "v_thar", "v_hyryder", "v_brezza",
      "v_defender", "v_mini", "v_bmw", "v_bmw_z4", "v_audi",
      "v_fascino", "v_activa", "v_hunter", "v_himalayan"
    ];
    const catOrder = { hatch: 1, sedan: 1, suv: 2, lux: 3, two: 4 };

    fleet.sort((a, b) => {
      const catA = (a.cat || '').toLowerCase().trim();
      const catB = (b.cat || '').toLowerCase().trim();
      const cA = catOrder[catA] || 99;
      const cB = catOrder[catB] || 99;

      // 1. Group by Category first: Hatchbacks/Self-Drive (1) -> SUVs (2) -> Luxury (3) -> Two-Wheelers (4)
      if (cA !== cB) return cA - cB;

      // 2. Within the same category, keep factory default sequence first
      const idxA = defaultOrder.indexOf(a.id);
      const idxB = defaultOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;

      // 3. For multiple new vehicles in same category, sort by price or addition
      return (Number(a.price) || 0) - (Number(b.price) || 0);
    });

    res.json({ success: true, count: fleet.length, data: fleet });
  } catch (err) {
    console.error('Error fetching fleet:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch fleet' });
  }
});

app.post('/api/fleet', requireAdminAuth, async (req, res) => {
  try {
    const vData = req.body;
    if (Array.isArray(vData)) {
      cachedFleet = vData;
      if (mongoose.connection.readyState === 1) {
        const ops = vData.map(v => ({
          updateOne: { filter: { id: v.id }, update: { $set: v }, upsert: true }
        }));
        await Vehicle.bulkWrite(ops);
      }
      return res.json({ success: true, message: 'Fleet updated successfully' });
    }

    if (vData && vData.id) {
      const current = getCachedFleet();
      const idx = current.findIndex(v => v.id === vData.id);
      if (idx !== -1) {
        current[idx] = { ...current[idx], ...vData };
      } else {
        current.push(vData);
      }
      cachedFleet = current;
    }

    if (mongoose.connection.readyState === 1) {
      const upserted = await Vehicle.findOneAndUpdate(
        { id: vData.id },
        { $set: vData },
        { upsert: true, new: true }
      );
      return res.json({ success: true, data: upserted });
    }
    res.json({ success: true, data: vData });
  } catch (err) {
    console.error('Error updating vehicle in MongoDB:', err);
    res.status(500).json({ success: false, error: 'Failed to save vehicle' });
  }
});

app.delete('/api/fleet/:id', requireOwnerAuth, async (req, res) => {
  try {
    if (cachedFleet) {
      cachedFleet = cachedFleet.filter(v => v.id !== req.params.id);
    }
    if (mongoose.connection.readyState === 1) {
      await Vehicle.findOneAndDelete({ id: req.params.id });
    }
    res.json({ success: true, message: 'Vehicle deleted from fleet' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete vehicle' });
  }
});

// ==========================================
// 6. CUSTOMER REVIEWS API
// ==========================================
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', bookingLimiter, async (req, res) => {
  try {
    const { name, rating, comment, vehicle, tripType, date } = req.body;
    if (!comment || !name) {
      return res.status(400).json({ success: false, error: 'Name and comment are required.' });
    }
    const safeReview = {
      name: String(name).trim().slice(0, 100),
      rating: Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
      comment: String(comment).trim().slice(0, 1000),
      vehicle: String(vehicle || '').trim().slice(0, 100),
      tripType: String(tripType || 'Self-Drive').trim().slice(0, 50),
      date: date || new Date().toISOString(),
      approved: false // Enforce admin moderation: reviews must be approved by admin
    };
    const newRev = new Review(safeReview);
    const saved = await newRev.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save review' });
  }
});

// ==========================================
// ⚡ DYNAMIC & SEASONAL PRICING API
// ==========================================
app.get('/api/pricing-rules', async (req, res) => {
  try {
    const rules = await getPricingRules();
    res.json({
      success: true,
      data: rules,
      rules: rules,
      globalOverride: rules.globalOverride,
      globalSurge: rules.globalSurge || rules.globalOverride,
      seasons: (rules.seasons || []).filter(s => s.active !== false)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/pricing-rules', requireAdminAuth, async (req, res) => {
  try {
    const rules = await getPricingRules();
    res.json({ success: true, rules, data: rules });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/pricing-rules', requireAdminAuth, async (req, res) => {
  try {
    const bodyRules = req.body.rules || req.body;
    const globalOverride = bodyRules.globalOverride || bodyRules.globalSurge;
    const seasons = bodyRules.seasons;
    const current = await getPricingRules();
    const updated = {
      globalOverride: globalOverride ? {
        enabled: Boolean(globalOverride.enabled || globalOverride.active),
        active: Boolean(globalOverride.enabled || globalOverride.active),
        multiplier: Number(globalOverride.multiplier) || 1.0,
        label: String(globalOverride.label || 'Surge Tariff').trim()
      } : current.globalOverride,
      globalSurge: globalOverride ? {
        enabled: Boolean(globalOverride.enabled || globalOverride.active),
        multiplier: Number(globalOverride.multiplier) || 1.0,
        label: String(globalOverride.label || 'Surge Tariff').trim()
      } : (current.globalSurge || current.globalOverride),
      seasons: Array.isArray(seasons) ? seasons : current.seasons
    };
    await savePricingRules(updated);
    console.log(`⚡ [Pricing Engine] Rules updated by admin. Global Surge: ${updated.globalOverride.enabled ? `${updated.globalOverride.multiplier}x` : 'OFF'}, Seasons: ${updated.seasons.length}`);
    res.json({ success: true, rules: updated, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. ENQUIRIES & CONCIERGE API
// ==========================================
app.get('/api/enquiries', requireAdminAuth, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
});

app.post('/api/enquiries', bookingLimiter, async (req, res) => {
  try {
    const { name, phone, email, message, source } = req.body;
    const safeEnquiry = {
      name: String(name || 'Visitor').trim().slice(0, 100),
      phone: String(phone || '').trim().slice(0, 25),
      email: String(email || '').trim().slice(0, 100),
      message: String(message || '').trim().slice(0, 2000),
      source: String(source || 'web').trim().slice(0, 50),
      createdAt: new Date()
    };
    const enquiry = new Enquiry(safeEnquiry);
    const saved = await enquiry.save();
    console.log(`💬 [MongoDB Atlas] Enquiry Saved from ${saved.name || 'Visitor'}`);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Error saving enquiry:', err);
    res.status(500).json({ success: false, error: 'Failed to save enquiry' });
  }
});

// Stealth Admin & Frontend Routing Fallbacks
const resolveFrontendFile = (filename) => {
  const inPublic = path.join(PUBLIC_DIR, filename);
  if (fs.existsSync(inPublic)) return inPublic;
  return path.join(__dirname, filename);
};

const ADMIN_FILE = resolveFrontendFile('admin.html');
const TAXIS_FILE = resolveFrontendFile('taxis.html');
const HELP_FILE = resolveFrontendFile('help.html');
const ATTRACTIONS_FILE = resolveFrontendFile('attractions.html');
const INDEX_FILE = resolveFrontendFile('index.html');

app.get(['/owner', '/hq', '/ops', '/portal', '/admin', '/admin.html'], (req, res) => {
  res.sendFile(ADMIN_FILE);
});

app.get(['/taxis', '/taxis.html', '/taxi', '/cabs'], (req, res) => {
  res.sendFile(TAXIS_FILE);
});

app.get(['/help', '/help.html', '/faq', '/faq.html', '/support'], (req, res) => {
  res.sendFile(HELP_FILE);
});

app.get(['/attractions', '/attractions.html', '/attraction', '/places', '/tourist-guide'], (req, res) => {
  res.sendFile(ATTRACTIONS_FILE);
});

app.get('*', (req, res) => {
  // Prevent static asset requests (.css, .js, .png, etc.) from falling through to index.html
  if (path.extname(req.path)) {
    return res.status(404).type('text/plain').send('Resource not found');
  }

  if (req.path.startsWith('/admin')) {
    return res.sendFile(ADMIN_FILE);
  }
  if (req.path.startsWith('/taxis') || req.path.startsWith('/taxi') || req.path.startsWith('/cabs')) {
    return res.sendFile(TAXIS_FILE);
  }
  if (req.path.startsWith('/help') || req.path.startsWith('/faq') || req.path.startsWith('/support')) {
    return res.sendFile(HELP_FILE);
  }
  if (req.path.startsWith('/attraction') || req.path.startsWith('/places')) {
    return res.sendFile(ATTRACTIONS_FILE);
  }
  res.sendFile(INDEX_FILE);
});

// ==========================================
// 9. DATABASE AUTO-SEEDING & SERVER START
// ==========================================
async function seedDatabaseIfEmpty() {
  try {
    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial fleet catalog into MongoDB Atlas...');
      await Vehicle.insertMany(INITIAL_FLEET);
      console.log(`✅ [MongoDB Atlas] Seeded ${INITIAL_FLEET.length} vehicles into TourentCluster!`);
    }

    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial reviews...');
      await Review.insertMany(INITIAL_REVIEWS);
      console.log(`✅ [MongoDB Atlas] Seeded ${INITIAL_REVIEWS.length} customer reviews!`);
    }
  } catch (err) {
    console.warn('⚠️ Seeding note:', err.message);
  }
}

// Centralized Error Handling Middleware (Suppresses raw stack traces in production)
app.use((err, req, res, next) => {
  console.error('❌ [Server Error]:', err.stack || err.message);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    error: isProd ? 'Internal server error. Please try again later.' : (err.message || 'Server error')
  });
});

let activeServer = null;

function setupGracefulShutdown(server) {
  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
    if (server) {
      server.close(async () => {
        console.log('🛑 HTTP server closed.');
        if (mongoose.connection.readyState === 1) {
          try {
            await mongoose.connection.close(false);
            console.log('🛑 MongoDB connection closed.');
          } catch (e) {}
        }
        process.exit(0);
      });
      setTimeout(() => {
        console.error('⚠️ Forced shutdown due to timeout.');
        process.exit(1);
      }, 8000).unref();
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

async function startServer() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in environment or .env file');
    }
    console.log('⏳ Connecting to MongoDB Atlas Cloud Database...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log('✅ [MongoDB Atlas] Successfully connected to TourentCluster (tourent_db)!');

    await seedDatabaseIfEmpty();

    activeServer = app.listen(PORT, () => {
      console.log(`🚀 Tourent MERN Server is running live on http://localhost:${PORT}`);
      console.log(`📁 Admin Portal available at http://localhost:${PORT}/admin.html`);
    });
    setupGracefulShutdown(activeServer);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
    console.log('⚠️ Starting Express server in offline-ready mode...');
    activeServer = app.listen(PORT, () => {
      console.log(`🚀 Tourent Server is running on http://localhost:${PORT} (Database reconnecting...)`);
    });
    setupGracefulShutdown(activeServer);
  }
}

// Only spin up persistent HTTP listener in standalone Node process (e.g. local development or npm test)
if (!isServerless && (require.main === module || process.env.PORT === '0')) {
  startServer();
}

module.exports = app;
