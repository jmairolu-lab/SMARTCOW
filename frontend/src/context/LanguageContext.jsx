import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTranslation } from '../i18n';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('smartcattle_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('smartcattle_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key, params) => getTranslation(language, key, params), [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'kn' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
