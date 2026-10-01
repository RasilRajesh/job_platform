const express = require('express');
const router = express.Router();
const { registeruser, loginuser } = require('../controllers/authcontrollers.js');

router.post("/register",registeruser);
router.post("/login",loginuser);
module.exports = router;