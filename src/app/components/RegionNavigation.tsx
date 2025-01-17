import React from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Language } from '../types/language';
import { School } from '@/types/school';
import { RegionsConfig } from '../list/page';
import { getLocalizedContent } from '@/utils/language';
import './styles/scrollbar.css';

interface RegionNavigationProps {
  schools: School[];
  language: Language;
  regionsConfig: RegionsConfig;
  onRegionClick: (location: string) => void;
  viewMode: 'list' | 'grid';
}

const RegionNavigation: React.FC<RegionNavigationProps> = ({
  schools,
  language,
  regionsConfig,
  onRegionClick,
  viewMode,
}) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isListPage = pathname === '/list';

  // Only show on list page, in list view mode, and for authenticated users
  if (!isListPage || viewMode !== 'list' || !session?.user) {
    return null;
  }

  // Group schools by location using the same logic as ListPage
  const groupedSchools = schools.reduce((acc: { [key: string]: School[] }, school) => {
    // Check both English and Japanese locations
    let location =
      getLocalizedContent(school.location_en, school.location_jp, language) || 'Other';

    // Handle special cases for region matching
    if (
      location.includes('Kyoto') ||
      location.includes('Osaka') ||
      location.includes('Kobe') ||
      location.includes('京都') ||
      location.includes('大阪') ||
      location.includes('神戸')
    ) {
      location = 'Kansai';
    } else if (location.includes('Nagoya') || location.includes('名古屋')) {
      location = 'Aichi';
    } else if (location.includes('Tsukuba') || location.includes('つくば')) {
      location = 'Ibaraki';
    } else if (location.includes('Sendai') || location.includes('仙台')) {
      location = 'Miyagi';
    } else if (location.includes('Appi Kogen') || location.includes('安比高原')) {
      location = 'Iwate';
    } else if (location.includes('Kofu') || location.includes('甲府')) {
      location = 'Yamanashi';
    } else if (
      location.includes('Sapporo') ||
      location.includes('札幌') ||
      location.includes('Niseko') ||
      location.includes('ニセコ')
    ) {
      location = 'Hokkaido';
    }

    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(school);
    return acc;
  }, {});

  return (
    <div className="py-4 space-y-2">
      <h3 className="px-4 text-sm font-medium text-gray-500">
        {language === 'en' ? 'Regions' : '地域'}
      </h3>
      <div className="max-h-[calc(100vh-500px)] overflow-y-auto scrollbar">
        <div className="space-y-0.5">
          {Object.entries(regionsConfig)
            .filter(([location]) => location !== 'Other')
            .map(([location, names]) => (
              <button
                key={location}
                onClick={() => onRegionClick(location)}
                className="w-full flex items-center justify-between px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <span>{names[language]}</span>
                <span className="text-xs text-gray-400">
                  ({groupedSchools[location]?.length || 0})
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RegionNavigation;
