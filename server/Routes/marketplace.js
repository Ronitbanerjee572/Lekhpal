const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  submitSaleListing,
  getApprovedListings,
  getMyListings,
  getPendingListings,
  updateListingStatus,
} = require('../Controller/marketplace');

const router = express.Router();

router.get('/listings', protect, getApprovedListings);
router.get('/my-listings', protect, getMyListings);
router.get('/pending-listings', protect, adminOnly, getPendingListings);
router.post('/listings', protect, submitSaleListing);
router.post('/listings/status', protect, adminOnly, updateListingStatus);

module.exports = router;
