import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations, translations } from '../lib/translations';
import { User } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, user, onUpdateUser }: { 
  children: React.ReactNode; 
  user: User | null;
  onUpdateUser: (updates: Partial<User>) => void;
}) {
  const [language, setLanguageState] = useState<Language>((user?.language as Language) || 'en');

  useEffect(() => {
    if (user?.language && user.language !== language) {
      setLanguageState(user.language as Language);
    }
  }, [user?.language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    onUpdateUser({ language: lang });
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
