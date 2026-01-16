const mongoose = require('mongoose');

const landRequestSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userWalletAddress: {
    type: String,
    required: true
  },
  khatian: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  ward: {
    type: String,
    required: true
  },
  areaInUnits: {
    type: Number,
    required: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  txHash: {
    type: String,
    default: null
  },
  landId: {
    type: Number,
    default: null
  }
}, {timestamps: true});

module.exports = mongoose.model('LandRequest', landRequestSchema);
