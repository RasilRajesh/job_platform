const express = require('express');
const router = express.Router();
const { registeruser, loginuser, getMe } = require('../controllers/authcontrollers.js');
const authmiddleware = require('../middleware/authmiddleware.js');

router.post("/register", registeruser);
router.post("/login", loginuser);
router.get("/me", authmiddleware, getMe);  // returns current user from token

module.exports = router;