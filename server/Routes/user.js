const express = require("express");
const { protect } = require("../middleware/auth");
const {
    
    handleUserSignup,
    handleUserLogin,
    getCurrentUser,
    updateUserProfile,

} = require("../Controller/user");

const router = express.Router();

router.post("/signup", handleUserSignup);
router.post("/login", handleUserLogin);
router.get("/me", protect, getCurrentUser);
router.patch("/update", protect, updateUserProfile);

module.exports = router;