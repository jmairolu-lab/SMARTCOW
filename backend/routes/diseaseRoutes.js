const express = require('express');
const multer = require('multer');
const { analyzeImage, analyzeSymptoms } = require('../controllers/diseaseController');
const { protect } = require('../middleware/auth');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(protect);

router.post('/image', upload.single('image'), analyzeImage);
router.post('/symptom', analyzeSymptoms);

module.exports = router;
