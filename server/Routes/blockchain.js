const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");

const {
    registerLand,
    setValuation,
    approveDeal,
    getPendingDeals,
    getLandDetails,
    checkAdmin,
    getRecentLandActivity,
    getUserOwnedLands,
} = require("../Controller/blockchain");

const router = express.Router();

router.post("/register-land", protect, registerLand);
router.post("/set-valuation", protect, setValuation);
router.post("/approve-deal", protect, approveDeal);
router.get("/pending-deals", protect, getPendingDeals);
router.get("/land/:landId", protect, getLandDetails);
router.get("/check-admin", protect, checkAdmin);
router.get('/recent-activity', protect, getRecentLandActivity);
router.get('/user-owned-lands', protect, getUserOwnedLands);

module.exports = router;