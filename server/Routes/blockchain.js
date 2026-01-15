const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");

const {
    registerLand,
    setValuation,
    approveDeal,
    getPendingDeals,
    getLandDetails,
    checkAdmin
} = require("../Controller/blockchain");

router.post("/register-land", protect, registerLand);
router.post("/set-valuation", protect, setValuation);
router.post("/approve-deal", protect, approveDeal);
router.get("/pending-deals", protect, getPendingDeals);
router.get("/land/:landId", protect, getLandDetails);
router.get("/check-admin", protect, checkAdmin);

module.exports = router;