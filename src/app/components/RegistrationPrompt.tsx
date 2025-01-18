import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';

const RegistrationPrompt: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="w-full bg-gradient-to-b from-white via-white to-transparent p-6 rounded-lg shadow-lg text-center mb-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        {language === 'en' ? 'Want to see all schools?' : 'すべての学校を見たいですか？'}
      </h3>
      <p className="text-gray-600 mb-4">
        {language === 'en'
          ? 'Register now to unlock access to our complete database of international schools in Japan.'
          : '今すぐ登録して、日本のインターナショナルスクールの完全なデータベースにアクセスしましょう。'}
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/register"
          className="inline-block bg-[#0057B7] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#004795] transition-colors"
        >
          {language === 'en' ? 'Register' : '登録'}
        </Link>
        <Link
          href="/login"
          className="inline-block bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors"
        >
          {language === 'en' ? 'Login' : 'ログイン'}
        </Link>
      </div>
    </div>
  );
};

export default RegistrationPrompt;

