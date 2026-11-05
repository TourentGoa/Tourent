const mongoose = require('mongoose');

const VehicleItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  seats: { type: Number },
  transmission: { type: String, default: 'Manual' },
  price: { type: Number, required: true },
  days: { type: Number, default: 1 },
  deposit: { type: Number, default: 0 },
  returnDate: { type: String },
  subtotal: { type: Number, required: true }
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  vehicle: {
    type: String,
    required: true
  },
  vehicles: [VehicleItemSchema],
  transmission: {
    type: String,
    default: 'Manual'
  },
  rentalTotal: {
    type: Number,
    required: true
  },
  depositTotal: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  days: {
    type: Number,
    default: 1
  },
  total: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  pickupDate: {
    type: String,
    required: true
  },
  returnDate: {
    type: String,
    required: true
  },
  pickup: {
    type: String,
    default: 'Panaji HQ / Central Hub'
  },
  drop: {
    type: String,
    default: 'Panaji HQ / Central Hub'
  },
  pickupLocation: {
    type: String,
    default: 'Panaji HQ / Central Hub'
  },
  pickupAddress: {
    type: String,
    default: ''
  },
  dropLocation: {
    type: String,
    default: ''
  },
  dropAddress: {
    type: String,
    default: ''
  },
  flightTrainNo: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: 'Goa'
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending confirmation', 'Confirmed', 'Completed', 'Cancelled', 'Declined'],
    default: 'Pending confirmation'
  },
  paymentMode: {
    type: String,
    default: 'Advance 20%'
  },
  advancePaid: {
    type: Number,
    default: 0
  },
  balanceAtPickup: {
    type: Number,
    default: 0
  },
  transactionId: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: 'website'
  },
  // Operational Supplier & Dispatch Fields
  supplierName: {
    type: String,
    default: 'Self Fleet'
  },
  supplierPhone: {
    type: String,
    default: ''
  },
  supplierPayout: {
    type: Number,
    default: 0
  },
  netProfit: {
    type: Number,
    default: 0
  },
  assignedSlot: {
    type: String,
    default: 'Slot 1'
  },
  driverName: {
    type: String,
    default: ''
  },
  driverPhone: {
    type: String,
    default: ''
  },
  // Cancellation & 24-Hour Refund Management
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String,
    default: ''
  },
  refundEligible: {
    type: Boolean,
    default: false
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundStatus: {
    type: String,
    default: 'Not Applicable'
  },
  refundTxnId: {
    type: String,
    default: ''
  },
  refundedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Database Indexes for High-Traffic Query Optimization
BookingSchema.index({ vehicle: 1, pickupDate: 1, returnDate: 1, status: 1 });
BookingSchema.index({ phone: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', BookingSchema);
