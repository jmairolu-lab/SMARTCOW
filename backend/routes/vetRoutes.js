const express = require('express');
const { getNearbyVets } = require('../controllers/vetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', getNearbyVets);

module.exports = router;
