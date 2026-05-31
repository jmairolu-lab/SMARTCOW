const express = require('express');
const { getWeather } = require('../controllers/weatherController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', getWeather);

module.exports = router;
