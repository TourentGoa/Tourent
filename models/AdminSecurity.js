const mongoose = require('mongoose');

const StaffPinSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, default: 'Staff PIN' },
  pin: { type: String, required: true },
  role: { type: String, default: 'staff' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const AdminSecuritySchema = new mongoose.Schema({
  key: { type: String, default: 'primary', unique: true },
  customMasterPassword: { type: String, default: '' },
  ownerEmail: { type: String, default: 'tourentgoarentals@gmail.com' },
  twoFactorEnabled: { type: Boolean, default: true },
  staffPins: {
    type: [StaffPinSchema],
    default: [
      { id: 'pin_1', label: 'Primary Desk', pin: '3029', role: 'staff', active: true, createdAt: new Date() },
      { id: 'pin_2', label: 'Airport & Fleet Ops', pin: '9973', role: 'staff', active: true, createdAt: new Date() },
      { id: 'pin_3', label: 'Staff PIN 3', pin: '0204', role: 'staff', active: true, createdAt: new Date() }
    ]
  },
  sessionVersion: { type: Number, default: 1 },
  lastPasswordChangedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('AdminSecurity', AdminSecuritySchema);
