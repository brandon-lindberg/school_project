import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ContactBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { language } = useLanguage();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 right-0 bg-white border-t border-l border-gray-100 shadow-lg z-40 lg:left-64 left-0">
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {language === 'en' ? (
            <>
              Don&apos;t see your school? Want your school to be featured?{' '}
              <a href="mailto:contact@isdb-japan.com" className="text-blue-600 hover:text-blue-800">
                Contact us
              </a>
            </>
          ) : (
            <>
              学校を掲載したい方は{' '}
              <a href="mailto:contact@isdb-japan.com" className="text-blue-600 hover:text-blue-800">
                お問い合わせ
              </a>
              ください
            </>
          )}
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label={language === 'en' ? 'Close banner' : 'バナーを閉じる'}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ContactBanner;
