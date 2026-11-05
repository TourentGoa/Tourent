const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: 'Tourist in Goa'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  vehicle: {
    type: String,
    default: 'Self-Drive Vehicle'
  },
  comment: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', ReviewSchema);
