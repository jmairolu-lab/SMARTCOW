const express = require('express');
const { register, login, verifyOtp, resendOtp, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/profile', protect, getProfile);

module.exports = router;
