const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  cat: {
    type: String,
    enum: ['hatch', 'sedan', 'suv', 'lux', 'two'],
    default: 'hatch'
  },
  price: {
    type: Number,
    required: true
  },
  priceManual: {
    type: Number,
    default: null
  },
  priceAuto: {
    type: Number,
    default: null
  },
  deposit: {
    type: Number,
    default: 3000
  },
  mileage: {
    type: Number,
    default: 18
  },
  fuel: {
    type: String,
    default: 'petrol'
  },
  seats: {
    type: Number,
    default: 5
  },
  trans: {
    type: String,
    default: 'Manual'
  },
  tag: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  totalUnits: {
    type: Number,
    default: 10,
    min: 1
  },
  soldOut: {
    type: Boolean,
    default: false
  },
  isSoldOut: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Catalog filtering index
VehicleSchema.index({ cat: 1, active: 1 });

module.exports = mongoose.model('Vehicle', VehicleSchema);
