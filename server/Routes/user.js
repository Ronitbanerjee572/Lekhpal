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

const {
    submitLandRequest,
    getUserLandRequests,
    getPendingLandRequests,
    approveLandRequest,
    rejectLandRequest
} = require("../Controller/landRequest");

const router = express.Router();

// User routes
router.post("/signup", handleUserSignup);
router.post("/login", handleUserLogin);
router.get("/me", protect, getCurrentUser);
router.patch("/update", protect, updateUserProfile);

// Blockchain routes (Admin)
router.post("/blockchain/register-land", protect, registerLand);
router.post("/blockchain/set-valuation", protect, setValuation);
router.post("/blockchain/approve-deal", protect, approveDeal);
router.get("/blockchain/pending-deals", protect, getPendingDeals);
router.get("/blockchain/land/:landId", protect, getLandDetails);
router.get("/blockchain/check-admin", protect, checkAdmin);

// Land Request routes (User & Admin)
router.post("/land-request/submit", protect, submitLandRequest);
router.get("/land-request/my-requests", protect, getUserLandRequests);
router.get("/land-request/pending", protect, getPendingLandRequests);
router.post("/land-request/approve", protect, approveLandRequest);
router.post("/land-request/reject", protect, rejectLandRequest);

module.exports = router;