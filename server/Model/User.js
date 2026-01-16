const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: {
    type: String,
    required: true,
    match: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
  },
  contactNo: { 
    type: String, 
    required: true 
  },
  pinCode: { 
    type: String, 
    required: true 
  },
  password:{ 
    type: String, 
    required: true 
  },
  role: {type: String,
        enum: ['admin', 'user', 'govt'],
        default: 'user'
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true
  },
  buyerStatus: {
    type: String,
    enum: ['not_requested', 'pending', 'approved', 'rejected'],
    default: 'not_requested'
  },
  sellerStatus: {
    type: String,
    enum: ['not_requested', 'pending', 'approved', 'rejected'],
    default: 'not_requested'
  }
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);