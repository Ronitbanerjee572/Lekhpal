const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");

const {
    submitLandRequest,
    getUserLandRequests,
    getPendingLandRequests,
    approveLandRequest,
    rejectLandRequest,
} = require("../Controller/landRequest");

const router = express.Router();

router.post("/submit", protect, submitLandRequest);
router.get("/my-requests", protect, getUserLandRequests);
router.get("/pending", protect, getPendingLandRequests);
router.post("/approve", protect, approveLandRequest);
router.post("/reject", protect, rejectLandRequest);

module.exports = router;