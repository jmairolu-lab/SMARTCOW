import en from './en.json';
import kn from './kn.json';

const translations = { en, kn };

export const getTranslation = (lang, key, params = {}) => {
  const keys = key.split('.');
  let value = translations[lang] || translations.en;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      let fallback = translations.en;
      for (const fk of keys) {
        fallback = fallback?.[fk];
      }
      value = fallback || key;
      break;
    }
  }

  if (typeof value !== 'string') return key;

  return Object.entries(params).reduce(
    (str, [paramKey, paramVal]) => str.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramVal),
    value
  );
};

export default translations;
