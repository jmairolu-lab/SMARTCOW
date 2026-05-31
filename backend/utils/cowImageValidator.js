const NON_COW_KEYWORDS = [
  'cat', 'dog', 'bird', 'fish', 'car', 'person', 'human', 'tree',
  'flower', 'food', 'pizza', 'phone', 'laptop', 'house', 'building'
];

const validateCowImage = (file) => {
  if (!file) {
    return { valid: false, reason: 'No image provided' };
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, reason: 'Only cow-related images allowed' };
  }

  const filename = (file.originalname || '').toLowerCase();
  const hasNonCowKeyword = NON_COW_KEYWORDS.some((kw) => filename.includes(kw));
  if (hasNonCowKeyword) {
    return { valid: false, reason: 'Only cow-related images allowed' };
  }

  if (file.size < 5000) {
    return { valid: false, reason: 'Only cow-related images allowed' };
  }

  const buffer = file.buffer;
  if (buffer && buffer.length > 12) {
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45;
    if (!isJpeg && !isPng && !isWebp) {
      return { valid: false, reason: 'Only cow-related images allowed' };
    }
  }

  return { valid: true };
};

module.exports = { validateCowImage };
