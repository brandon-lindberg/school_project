'use client';

import React, { useState, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../contexts/LanguageContext';
import RegionNavigation from './RegionNavigation';
import { REGIONS_CONFIG } from '../config/regions';
import { School } from '@/types/school';
import { getLocalizedContent } from '@/utils/language';
import {
  HomeIcon,
  BuildingLibraryIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  GlobeAltIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';
import AdminMenu from './AdminMenu';
import { UserRole } from '@prisma/client';
import { Session } from 'next-auth';
import NotificationsDropdown from './NotificationsDropdown';

interface NavbarProps {
  schools?: School[];
  onRegionClick?: (region: string) => void;
  viewMode?: 'list' | 'grid';
}

type ExtendedSession = Session & {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: UserRole;
    managedSchoolId?: number;
  };
};

export default function Navbar({ schools = [], onRegionClick, viewMode = 'list' }: NavbarProps) {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const { language, toggleLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  console.log('Navbar session:', JSON.stringify(session, null, 2));
  console.log('Navbar session user:', JSON.stringify(session?.user, null, 2));

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleRegionClick = (region: string) => {
    if (pathname !== '/list') {
      router.push('/list');
      // Wait for navigation to complete before trying to scroll
      setTimeout(() => {
        const element = document.getElementById(region);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Also expand the section if it's collapsed
          const event = new CustomEvent('expandRegion', { detail: region });
          window.dispatchEvent(event);
        }
      }, 100);
    } else if (onRegionClick) {
      onRegionClick(region);
    }
  };

  const schoolsByRegion = useMemo(() => {
    return Object.entries(REGIONS_CONFIG).reduce(
      (acc, [region]) => {
        acc[region] = schools.filter(school => {
          const schoolLocation =
            getLocalizedContent(school.location_en, school.location_jp, 'en') || '';
          // Handle special cases for region matching
          if (
            region === 'Kansai' &&
            (schoolLocation.includes('Kyoto') ||
              schoolLocation.includes('Osaka') ||
              schoolLocation.includes('Kobe') ||
              schoolLocation.includes('京都') ||
              schoolLocation.includes('大阪') ||
              schoolLocation.includes('神戸'))
          ) {
            return true;
          }
          if (
            region === 'Aichi' &&
            (schoolLocation.includes('Nagoya') || schoolLocation.includes('名古屋'))
          ) {
            return true;
          }
          if (
            region === 'Ibaraki' &&
            (schoolLocation.includes('Tsukuba') || schoolLocation.includes('つくば'))
          ) {
            return true;
          }
          if (
            region === 'Miyagi' &&
            (schoolLocation.includes('Sendai') || schoolLocation.includes('仙台'))
          ) {
            return true;
          }
          if (
            region === 'Iwate' &&
            (schoolLocation.includes('Appi Kogen') || schoolLocation.includes('安比高原'))
          ) {
            return true;
          }
          if (
            region === 'Yamanashi' &&
            (schoolLocation.includes('Kofu') || schoolLocation.includes('甲府'))
          ) {
            return true;
          }
          if (
            region === 'Hokkaido' &&
            (schoolLocation.includes('Sapporo') ||
              schoolLocation.includes('札幌') ||
              schoolLocation.includes('Niseko') ||
              schoolLocation.includes('ニセコ'))
          ) {
            return true;
          }
          return schoolLocation === region;
        }).length;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [schools]);

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white shadow-lg flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10" />
            <span className="text-[#0057B7] font-semibold text-lg leading-tight">
              International Schools Database Japan
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-4">
          <div className="space-y-2">
            <Link
              href="/"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <HomeIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
              <span className="group-hover:text-[#0057B7]">
                {language === 'en' ? 'Home' : 'ホーム'}
              </span>
            </Link>

            <Link
              href="/list"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BuildingLibraryIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
              <span className="group-hover:text-[#0057B7]">
                {language === 'en' ? 'Schools' : '学校'}
              </span>
            </Link>

            {session && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCircleIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
                  <span className="group-hover:text-[#0057B7]">
                    {language === 'en' ? 'Dashboard' : 'ダッシュボード'}
                  </span>
                </Link>
                <AdminMenu
                  userRole={session?.user?.role as UserRole}
                  managedSchoolId={session?.user?.managedSchoolId as number}
                />
              </>
            )}
          </div>

          {/* Region Navigation */}
          {viewMode === 'list' && (
            <RegionNavigation
              language={language}
              regionsConfig={REGIONS_CONFIG}
              onRegionClick={handleRegionClick}
              viewMode={viewMode}
              schoolsByRegion={schoolsByRegion}
            />
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100">
          {session ? (
            <>
              <button
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-[#D9534F] hover:bg-red-50 rounded-lg transition-colors group mb-4"
              >
                <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                <span>{language === 'en' ? 'Logout' : 'ログアウト'}</span>
              </button>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    toggleLanguage();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
                >
                  <GlobeAltIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
                  <span className="group-hover:text-[#0057B7]">
                    {language === 'en' ? '日本語' : 'English'}
                  </span>
                </button>
                <NotificationsDropdown />
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  toggleLanguage();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
              >
                <GlobeAltIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
                <span className="group-hover:text-[#0057B7]">
                  {language === 'en' ? '日本語' : 'English'}
                </span>
              </button>
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-[#0057B7] hover:bg-blue-50 rounded-lg transition-colors group"
              >
                <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                <span>{language === 'en' ? 'Login' : 'ログイン'}</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors group"
              >
                <UserCircleIcon className="w-6 h-6" />
                <span>{language === 'en' ? 'Register' : '新規登録'}</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8" />
              <span className="text-[#0057B7] font-semibold text-sm">ISDB Japan</span>
            </Link>
            <button onClick={toggleMobileMenu} className="p-2 rounded-lg hover:bg-gray-100">
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-[60px] bg-white z-40 overflow-y-auto">
            <div className="px-4 py-6 space-y-4">
              <div className="space-y-2">
                <Link
                  href="/"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HomeIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
                  <span className="group-hover:text-[#0057B7]">
                    {language === 'en' ? 'Home' : 'ホーム'}
                  </span>
                </Link>

                <Link
                  href="/list"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BuildingLibraryIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
                  <span className="group-hover:text-[#0057B7]">
                    {language === 'en' ? 'Schools' : '学校'}
                  </span>
                </Link>

                {session && (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserCircleIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
                      <span className="group-hover:text-[#0057B7]">
                        {language === 'en' ? 'Dashboard' : 'ダッシュボード'}
                      </span>
                    </Link>
                    <AdminMenu
                      userRole={session?.user?.role as UserRole}
                      managedSchoolId={session?.user?.managedSchoolId as number}
                    />
                  </>
                )}
              </div>
              <div className="pt-4 border-t border-gray-100 space-y-2">
                {session ? (
                  <>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-[#D9534F] hover:bg-red-50 rounded-lg transition-colors group mb-4"
                    >
                      <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                      <span>{language === 'en' ? 'Logout' : 'ログアウト'}</span>
                    </button>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          toggleLanguage();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
                      >
                        <GlobeAltIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
                        <span className="group-hover:text-[#0057B7]">
                          {language === 'en' ? '日本語' : 'English'}
                        </span>
                      </button>
                      <NotificationsDropdown />
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        toggleLanguage();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
                    >
                      <GlobeAltIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0057B7]" />
                      <span className="group-hover:text-[#0057B7]">
                        {language === 'en' ? '日本語' : 'English'}
                      </span>
                    </button>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-[#0057B7] hover:bg-blue-50 rounded-lg transition-colors group"
                    >
                      <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                      <span>{language === 'en' ? 'Login' : 'ログイン'}</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors group"
                    >
                      <UserCircleIcon className="w-6 h-6" />
                      <span>{language === 'en' ? 'Register' : '新規登録'}</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
