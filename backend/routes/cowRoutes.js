const express = require('express');
const { getCows, createCow, updateCow, deleteCow, getCowCount } = require('../controllers/cowController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getCows);
router.get('/count', getCowCount);
router.post('/', createCow);
router.put('/:id', updateCow);
router.delete('/:id', deleteCow);

module.exports = router;
