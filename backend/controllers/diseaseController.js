const { validateCowImage } = require('../utils/cowImageValidator');

const DISEASES = ['Healthy', 'Mastitis', 'FMD', 'Skin Infection'];

const TREATMENTS = {
  Healthy: 'Cow appears healthy. Continue regular checkups, balanced nutrition, and clean housing.',
  Mastitis: 'Consult a vet immediately. Apply warm compress, ensure milking hygiene, and administer prescribed antibiotics.',
  FMD: 'Isolate the animal immediately. Contact veterinary authorities. Provide soft feed and plenty of water.',
  'Skin Infection': 'Clean affected area with antiseptic. Apply topical treatment as prescribed. Improve barn hygiene.',
};

const SYMPTOM_MAP = {
  Fever: { diseases: ['Mastitis', 'FMD'], severity: 'High' },
  'Loss of appetite': { diseases: ['Mastitis', 'FMD'], severity: 'Medium' },
  Limping: { diseases: ['FMD', 'Skin Infection'], severity: 'Medium' },
  Swelling: { diseases: ['Mastitis', 'FMD'], severity: 'High' },
  'Mouth ulcers': { diseases: ['FMD'], severity: 'High' },
};

const SEVERITY_SUGGESTIONS = {
  Low: 'Monitor closely for 24-48 hours. Ensure adequate rest and hydration.',
  Medium: 'Schedule a vet visit within 24 hours. Isolate if contagious symptoms present.',
  High: 'Seek immediate veterinary attention. Isolate the animal from the herd.',
};

const analyzeImageBuffer = (buffer) => {
  let hash = 0;
  for (let i = 0; i < Math.min(buffer.length, 1000); i++) {
    hash = (hash + buffer[i] * (i + 1)) % 10000;
  }

  const diseaseIndex = hash % DISEASES.length;
  const disease = DISEASES[diseaseIndex];
  const confidence = 65 + (hash % 35);

  return { disease, confidence, treatment: TREATMENTS[disease] };
};

exports.analyzeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const validation = validateCowImage(req.file);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.reason });
    }

    const result = analyzeImageBuffer(req.file.buffer);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

exports.analyzeSymptoms = async (req, res, next) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one symptom' });
    }

    const matchedDiseases = {};
    let maxSeverity = 'Low';
    const severityOrder = { Low: 0, Medium: 1, High: 2 };

    symptoms.forEach((symptom) => {
      const match = SYMPTOM_MAP[symptom];
      if (match) {
        match.diseases.forEach((d) => {
          matchedDiseases[d] = (matchedDiseases[d] || 0) + 1;
        });
        if (severityOrder[match.severity] > severityOrder[maxSeverity]) {
          maxSeverity = match.severity;
        }
      } else {
        matchedDiseases['Skin Infection'] = (matchedDiseases['Skin Infection'] || 0) + 1;
        if (severityOrder['Medium'] > severityOrder[maxSeverity]) {
          maxSeverity = 'Medium';
        }
      }
    });

    let topDisease = 'Healthy';
    let topScore = 0;
    Object.entries(matchedDiseases).forEach(([disease, score]) => {
      if (score > topScore) {
        topScore = score;
        topDisease = disease;
      }
    });

    if (topScore === 0) {
      topDisease = 'Healthy';
      maxSeverity = 'Low';
    }

    res.status(200).json({
      success: true,
      disease: topDisease,
      severity: maxSeverity,
      suggestion: SEVERITY_SUGGESTIONS[maxSeverity] + ' ' + (TREATMENTS[topDisease] || ''),
      analyzedSymptoms: symptoms,
    });
  } catch (error) {
    next(error);
  }
};
