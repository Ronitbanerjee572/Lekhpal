const express = require("express");
const { protect } = require("../middleware/auth");
const {
    
    handleUserSignup,
    handleUserLogin,
    getCurrentUser,
    updateUserProfile,

} = require("../Controller/user");

const {
    registerLand,
    setValuation,
    approveDeal,
    getPendingDeals,
    getLandDetails,
    checkAdmin
} = require("../Controller/blockchain");

const router = express.Router();

// User routes
router.post("/signup", handleUserSignup);
router.post("/login", handleUserLogin);
router.get("/me", protect, getCurrentUser);
router.patch("/update", protect, updateUserProfile);

// Blockchain routes
router.post("/blockchain/register-land", protect, registerLand);
router.post("/blockchain/set-valuation", protect, setValuation);
router.post("/blockchain/approve-deal", protect, approveDeal);
router.get("/blockchain/pending-deals", protect, getPendingDeals);
router.get("/blockchain/land/:landId", protect, getLandDetails);
router.get("/blockchain/check-admin", protect, checkAdmin);

module.exports = router;