const express = require('express');
const { getVaccinations, createVaccination } = require('../controllers/vaccinationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getVaccinations);
router.post('/', createVaccination);

module.exports = router;
