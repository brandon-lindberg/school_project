import React, { useState, useEffect } from 'react';
import { Language } from '../types/language';
import { RegionsConfig } from '../config/regions';
import './styles/scrollbar.css';

interface RegionNavigationProps {
  language: Language;
  regionsConfig: RegionsConfig;
  onRegionClick: (region: string) => void;
  viewMode: 'list' | 'grid';
  schoolsByRegion: Record<string, number>;
}

export default function RegionNavigation({
  language,
  regionsConfig,
  onRegionClick,
  viewMode,
  schoolsByRegion
}: RegionNavigationProps) {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Only show in list view mode and on large screens
  if (viewMode !== 'list' || !isLargeScreen) {
    return null;
  }

  return (
    <div className="mt-6 overflow-y-auto max-h-[calc(100vh-500px)] scrollbar">
      <div className="space-y-2">
        {Object.entries(regionsConfig)
          .filter(([location]) => location !== 'Other')
          .map(([location, names]) => (
            <button
              key={location}
              onClick={() => onRegionClick(location)}
              className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group"
            >
              <span className="group-hover:text-[#0057B7]">{names[language]}</span>
              <span className="text-sm text-gray-500">
                ({schoolsByRegion[location] || 0})
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
