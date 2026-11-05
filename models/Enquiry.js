const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  message: { type: String, required: true },
  source: { type: String, default: 'concierge_chat' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Enquiry', EnquirySchema);
