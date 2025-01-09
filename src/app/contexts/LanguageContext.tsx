'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'jp';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getBrowserLanguage(): Language {
  // Check if window is defined (client-side)
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.toLowerCase();
    // Check if the language starts with 'ja' or 'jp'
    if (browserLang.startsWith('ja') || browserLang.startsWith('jp')) {
      return 'jp';
    }
    // Check if the language starts with 'en'
    if (browserLang.startsWith('en')) {
      return 'en';
    }
  }
  // Default to Japanese if browser language is not English or Japanese
  return 'jp';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('jp'); // Default to Japanese

  // Load language preference on mount
  useEffect(() => {
    // First check localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // If no saved preference, use browser language with Japanese fallback
      const detectedLanguage = getBrowserLanguage();
      setLanguage(detectedLanguage);
      localStorage.setItem('language', detectedLanguage);
    }
  }, []);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
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
