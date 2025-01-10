'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../contexts/LanguageContext';
import { HomeIcon, BuildingLibraryIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const { language, toggleLanguage } = useLanguage();

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <span className="text-[#0057B7] font-semibold text-lg leading-tight">
            International Schools Database Japan
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-8 px-4">
        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
          >
            <HomeIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
            <span className="group-hover:text-[#0057B7]">
              {language === 'en' ? 'Home' : 'ホーム'}
            </span>
          </Link>

          <Link
            href="/list"
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
          >
            <BuildingLibraryIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
            <span className="group-hover:text-[#0057B7]">
              {language === 'en' ? 'Schools' : '学校'}
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
          >
            <UserCircleIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
            <span className="group-hover:text-[#0057B7]">
              {language === 'en' ? 'Dashboard' : 'ダッシュボード'}
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <button
          onClick={() => toggleLanguage()}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
        >
          <GlobeAltIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
          <span className="group-hover:text-[#0057B7]">
            {language === 'en' ? '日本語' : 'English'}
          </span>
        </button>

        {session && (
          <button
            onClick={() => signOut()}
            className="w-full flex items-center space-x-3 px-4 py-3 text-[#D9534F] hover:bg-red-50 rounded-lg transition-colors group"
          >
            <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            <span>
              {language === 'en' ? 'Logout' : 'ログアウト'}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
