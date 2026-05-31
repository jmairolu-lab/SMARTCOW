const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { generateOTP, OTP_EXPIRY_MS } = require('../utils/otp');

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendOtpResponse = (otp, phone, name, res, message) => {
  console.log(`\n========================================`);
  console.log(`📱 OTP for ${phone} (${name || 'New User'}): ${otp}`);
  console.log(`⏰ Expires in 5 minutes`);
  console.log(`========================================\n`);

  res.status(200).json({
    success: true,
    message,
    otp,
    phone,
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await Otp.deleteMany({ phone });
    await Otp.create({ phone, otp, name, expiresAt });

    sendOtpResponse(otp, phone, name, res, 'OTP sent successfully. Please verify to complete registration.');
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await Otp.deleteMany({ phone });
    await Otp.create({ phone, otp, name: user.name, expiresAt });

    sendOtpResponse(otp, phone, user.name, res, 'OTP sent successfully. Please verify to login.');
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const otpRecord = await Otp.findOne({ phone }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new OTP.' });
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteMany({ phone });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    if (otpRecord.otp !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      const farmerName = name || otpRecord.name;
      if (!farmerName) {
        return res.status(400).json({ success: false, message: 'Farmer name is required for registration' });
      }

      const passwordHash = await bcrypt.hash(phone + process.env.JWT_SECRET, 12);
      user = await User.create({
        name: farmerName,
        phone,
        passwordHash,
        isVerified: true,
      });
    } else {
      user.isVerified = true;
      await user.save();
    }

    await Otp.deleteMany({ phone });

    const token = createToken(user._id);

    res.status(200).json({
      success: true,
      message: user.createdAt.getTime() === user.updatedAt.getTime() ? 'Registration successful' : 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const user = await User.findOne({ phone });
    const farmerName = name || (user ? user.name : '');

    if (!user && !farmerName) {
      return res.status(400).json({ success: false, message: 'Name is required for new registration' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await Otp.deleteMany({ phone });
    await Otp.create({ phone, otp, name: farmerName, expiresAt });

    sendOtpResponse(otp, phone, farmerName, res, 'New OTP sent successfully.');
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        phone: req.user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};
