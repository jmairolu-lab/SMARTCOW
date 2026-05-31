const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const OTP_EXPIRY_MS = 5 * 60 * 1000;

module.exports = { generateOTP, OTP_EXPIRY_MS };
