import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Language } from '../types/language';
import { RegionsConfig } from '../config/regions';
import { School } from '@/types/school';
import { groupSchoolsByRegionAndCity } from '../utils/schools';
import './styles/scrollbar.css';

interface RegionNavigationProps {
  language: Language;
  regionsConfig: RegionsConfig;
  onRegionClick: (region: string) => void;
  onCityClick?: (region: string, city: string) => void;
  viewMode: 'list' | 'grid';
  schools: School[];
}

export default function RegionNavigation({
  language,
  regionsConfig,
  onRegionClick,
  onCityClick,
  viewMode,
  schools,
}: RegionNavigationProps) {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  // Compute counts of schools per city within each region
  const regionCityCounts = useMemo(() => {
    const grouped = groupSchoolsByRegionAndCity(schools, language);
    const counts: Record<string, Record<string, number>> = {};
    Object.entries(grouped).forEach(([region, cities]) => {
      counts[region] = {};
      Object.entries(cities).forEach(([city, arr]) => {
        counts[region][city] = arr.length;
      });
    });
    return counts;
  }, [schools, language]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Only show in list view mode, on large screens, when logged in, and specifically on the list page
  if (viewMode !== 'list' || !isLargeScreen || !session?.user || pathname !== '/list') {
    return null;
  }

  return (
    <div className="mt-6 overflow-y-auto max-h-[calc(100vh-500px)] scrollbar">
      <div className="space-y-2">
        {Object.entries(regionsConfig)
          .filter(([region]) => region !== 'Other')
          .map(([region, names]) => {
            const cityCounts = regionCityCounts[region] || {};
            const total = Object.values(cityCounts).reduce((sum, c) => sum + c, 0);
            return (
              <div key={region}>
                <button
                  onClick={() => onRegionClick(region)}
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
                >
                  <span className="group-hover:text-[#0057B7]">{names[language]}</span>
                  <span className="text-sm text-gray-500">({total})</span>
                </button>
                <div className="pl-4 space-y-1">
                  {Object.entries(cityCounts).map(([city, count]) => (
                    <button
                      key={city}
                      onClick={() =>
                        onCityClick ? onCityClick(region, city) : onRegionClick(region)
                      }
                      className="w-full flex items-center justify-between px-4 py-1 text-gray-600 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
                    >
                      <span className="group-hover:text-[#0057B7]">{city}</span>
                      <span className="text-sm text-gray-400">({count})</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
