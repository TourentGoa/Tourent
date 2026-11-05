const mongoose = require('mongoose');

const TaxiBookingSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  cabType: {
    type: String,
    required: true
  },
  airport: {
    type: String,
    required: true
  },
  dropLocation: {
    type: String,
    required: true
  },
  pickupDate: {
    type: String,
    required: true
  },
  pickupTime: {
    type: String,
    default: 'Flexible'
  },
  flightNumber: {
    type: String,
    default: ''
  },
  passengerName: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  estimatedFare: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending confirmation', 'Confirmed', 'Completed', 'Cancelled', 'Declined'],
    default: 'Pending confirmation'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TaxiBooking', TaxiBookingSchema);
