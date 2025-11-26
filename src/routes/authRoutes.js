const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// #region - Authentication Routes
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/resend-otp', authController.resendOTP);
// #endregion

module.exports = router;



