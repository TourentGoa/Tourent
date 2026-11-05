const mongoose = require('mongoose');

const SeasonSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  startDate: { type: String },
  endDate: { type: String },
  startMonth: { type: Number },
  startDay: { type: Number },
  endMonth: { type: Number },
  endDay: { type: Number },
  multiplier: { type: Number, default: 1.0 },
  minDays: { type: Number, default: 1 },
  badge: { type: String, default: '' },
  badgeText: { type: String, default: '' },
  active: { type: Boolean, default: true }
}, { _id: false });

const PricingRuleSchema = new mongoose.Schema({
  key: { type: String, default: 'primary', unique: true },
  globalOverride: {
    enabled: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
    multiplier: { type: Number, default: 1.25 },
    label: { type: String, default: 'High Demand Surge' }
  },
  globalSurge: {
    enabled: { type: Boolean, default: false },
    multiplier: { type: Number, default: 1.25 },
    label: { type: String, default: 'High Demand Surge' }
  },
  seasons: {
    type: [SeasonSchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('PricingRule', PricingRuleSchema);
