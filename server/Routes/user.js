const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");
const {
    
    handleUserSignup,
    handleUserLogin,
    getCurrentUser,
    updateUserProfile,
    requestMarketplaceRole,
    updateMarketplaceRoleStatus,
    getPendingMarketplaceRequests,

} = require("../Controller/user");

const router = express.Router();

router.post("/signup", handleUserSignup);
router.post("/login", handleUserLogin);
router.get("/me", protect, getCurrentUser);
router.patch("/update", protect, updateUserProfile);
router.post("/marketplace/request-role", protect, requestMarketplaceRole);
router.post("/marketplace/role-status", protect, adminOnly, updateMarketplaceRoleStatus);
router.get("/marketplace/pending-requests", protect, adminOnly, getPendingMarketplaceRequests);

module.exports = router;