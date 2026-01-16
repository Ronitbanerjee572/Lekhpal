const { ethers } = require('ethers');
const SaleListing = require('../Model/SaleListing');
const User = require('../Model/User');

async function submitSaleListing(req, res) {
  try {
    const { landId, priceEth } = req.body;

    if (!landId || !priceEth) {
      return res.status(400).json({ message: 'landId and priceEth are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.sellerStatus !== 'approved') {
      return res.status(403).json({ message: 'Seller approval required before listing' });
    }

    const priceWei = ethers.parseEther(priceEth.toString()).toString();

    const existing = await SaleListing.findOne({ landId, status: { $in: ['pending', 'approved'] } });
    if (existing) {
      return res.status(400).json({ message: 'A listing already exists for this land' });
    }

    const listing = await SaleListing.create({
      userId: req.user._id,
      landId,
      priceWei,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Listing submitted for approval',
      listing,
    });
  } catch (err) {
    console.error('Submit sale listing error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function getApprovedListings(req, res) {
  try {
    const listings = await SaleListing.find({ status: 'approved' }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, listings });
  } catch (err) {
    console.error('Get listings error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function getMyListings(req, res) {
  try {
    const listings = await SaleListing.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, listings });
  } catch (err) {
    console.error('Get my listings error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function getPendingListings(req, res) {
  try {
    const listings = await SaleListing.find({ status: 'pending' })
      .populate('userId', 'name email walletAddress')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, listings });
  } catch (err) {
    console.error('Get pending listings error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function updateListingStatus(req, res) {
  try {
    const { listingId, status, reason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const listing = await SaleListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    listing.status = status;
    listing.rejectionReason = status === 'rejected' ? reason || 'Rejected by admin' : undefined;
    await listing.save();

    return res.status(200).json({ success: true, listing });
  } catch (err) {
    console.error('Update listing status error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = {
  submitSaleListing,
  getApprovedListings,
  getMyListings,
  getPendingListings,
  updateListingStatus,
};
