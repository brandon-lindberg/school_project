'use client';

import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'jp' : 'en')}
      className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`Switch to ${language === 'en' ? 'Japanese' : 'English'}`}
    >
      {language === 'en' ? '日本語' : 'English'}
    </button>
  );
}
