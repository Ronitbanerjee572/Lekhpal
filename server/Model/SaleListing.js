const mongoose = require('mongoose');

const saleListingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  landId: {
    type: Number,
    required: true,
  },
  priceWei: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('SaleListing', saleListingSchema);
