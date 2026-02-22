const authController = require("../controllers/auth.controller");

const router = require("express").Router();

// Register User
router.post("/register", authController.register);

// Login User
router.post("/login", authController.login);

// Logout User
router.post("/logout", authController.logout);

module.exports = router;
