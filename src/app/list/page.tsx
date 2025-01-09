'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { School } from '../../interfaces/School';
import SearchBox from '../components/SearchBox';
import debounce from 'lodash.debounce';
import SchoolList from '../components/SchoolList';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedContent } from '@/utils/language';

const ListPageSkeleton = () => (
  <div className="animate-pulse">
    {/* Header placeholder */}
    <div className="h-8 bg-gray-200 rounded w-48 mb-6" />

    {/* Search box placeholder */}
    <div className="mb-8">
      <div className="h-12 bg-gray-200 rounded w-full max-w-md" />
    </div>

    {/* Region sections */}
    <div className="space-y-16">
      {[
        'Tokyo',
        'Kansai',
        'Aichi',
        'Ibaraki',
        'Nagano',
        'Hokkaido',
        'Okinawa',
        'Miyagi',
        'Hiroshima',
        'Fukuoka',
        'Iwate',
        'Yamanashi'
      ].map((region) => (
        <div key={region} className="mb-12">
          {/* Region header placeholder */}
          <div className="mb-6 pb-2 border-b border-gray-200">
            <div className="h-8 bg-gray-200 rounded w-64" />
          </div>

          {/* School cards placeholder */}
          <div className="flex overflow-x-auto space-x-4 p-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-[300px]">
                <div className="bg-gray-200 rounded-lg h-[200px]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ListPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { language } = useLanguage();

  // Translations
  const translations = {
    schools: language === 'en' ? 'Schools' : '学校',
    searchResults: language === 'en' ? 'Search Results' : '検索結果',
    noResults: language === 'en' ? 'No results found' : '結果が見つかりません',
    regions: {
      Tokyo: language === 'en' ? 'Tokyo' : '東京',
      Kansai: language === 'en' ? 'Kansai' : '関西',
      Aichi: language === 'en' ? 'Aichi' : '愛知県',
      Ibaraki: language === 'en' ? 'Ibaraki' : '茨城県',
      Nagano: language === 'en' ? 'Nagano' : '長野県',
      Hokkaido: language === 'en' ? 'Hokkaido' : '北海道',
      Okinawa: language === 'en' ? 'Okinawa' : '沖縄県',
      Miyagi: language === 'en' ? 'Miyagi' : '宮城県',
      Hiroshima: language === 'en' ? 'Hiroshima' : '広島県',
      Fukuoka: language === 'en' ? 'Fukuoka' : '福岡県',
      Iwate: language === 'en' ? 'Iwate' : '岩手県',
      Yamanashi: language === 'en' ? 'Yamanashi' : '山梨県',
      Other: language === 'en' ? 'Other' : 'その他'
    }
  };

  // Predefined location order
  const LOCATION_ORDER = [
    'Tokyo',
    'Kansai',
    'Aichi',
    'Ibaraki',
    'Nagano',
    'Hokkaido',
    'Okinawa',
    'Miyagi',
    'Hiroshima',
    'Fukuoka',
    'Iwate',
    'Yamanashi'
  ];

  // Group schools by location with predefined order
  const groupSchoolsByLocation = (schools: School[]) => {
    // First, group schools by their location
    const grouped = schools.reduce((acc: { [key: string]: School[] }, school) => {
      // Check both English and Japanese locations
      let location = getLocalizedContent(school.location_en, school.location_jp, language) || 'Other';

      // Handle special cases for region matching
      if (location.includes('Kyoto') || location.includes('Osaka') || location.includes('Kobe') ||
        location.includes('京都') || location.includes('大阪') || location.includes('神戸')) {
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
      }

      if (!acc[location]) {
        acc[location] = [];
      }
      acc[location].push(school);
      return acc;
    }, {});

    // Create an ordered object based on LOCATION_ORDER
    const orderedLocations = LOCATION_ORDER.reduce((acc: { [key: string]: School[] }, location) => {
      if (grouped[location]) {
        acc[location] = grouped[location];
      }
      return acc;
    }, {});

    // Add any remaining locations not in the predefined order
    Object.entries(grouped).forEach(([location, schools]) => {
      if (!orderedLocations[location] && location !== 'Other') {
        orderedLocations[location] = schools;
      }
    });

    // Add 'Other' category at the end if it exists
    if (grouped['Other']) {
      orderedLocations['Other'] = grouped['Other'];
    }

    return orderedLocations;
  };

  const fetchAllSchools = async () => {
    try {
      const response = await fetch('/api/schools?limit=1000'); // Fetch all schools at once
      const data = await response.json();
      return data.schools;
    } catch (error) {
      console.error('Error fetching schools:', error);
      return [];
    }
  };

  const fetchSearchResults = async (query: string) => {
    try {
      const response = await fetch(`/api/schools?search=${encodeURIComponent(query)}&limit=20`);
      const data = await response.json();
      return data.schools;
    } catch (error) {
      console.error('Error fetching search results:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadInitialSchools = async () => {
      const initialSchools = await fetchAllSchools();
      setSchools(initialSchools);
      setIsInitialLoad(false);
    };

    loadInitialSchools();
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        setIsLoading(true);
        const searchResults = await fetchSearchResults(query);
        setSchools(searchResults);
        setIsLoading(false);
      }, 300),
    []
  );

  const handleSearchInput = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-grow">
        {isInitialLoad ? (
          <ListPageSkeleton />
        ) : (
          <>
            <div className="mb-8">
              <div className="relative">
                <SearchBox onSearch={handleSearchInput} language={language} />
                {searchQuery.trim().length > 0 && (
                  <div className="absolute w-full z-50">
                    <div className="bg-white rounded-md shadow-lg mt-1 max-h-[400px] overflow-y-auto">
                      <SchoolList
                        schools={schools}
                        searchQuery={searchQuery}
                        isLoading={isLoading}
                        loadingCount={5}
                        isDropdown={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-16">
              {searchQuery.trim().length === 0 ? (
                // Display all schools grouped by location
                Object.entries(groupSchoolsByLocation(schools)).map(([location, locationSchools]) => (
                  <div key={location} className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-200">
                      {translations.regions[location as keyof typeof translations.regions]}{' '}
                      <span className="text-gray-500 text-lg">
                        ({locationSchools.length} {translations.schools})
                      </span>
                    </h2>
                    <SchoolList
                      schools={locationSchools}
                      isLoading={isInitialLoad || isLoading}
                      loadingCount={5}
                      isDropdown={false}
                    />
                  </div>
                ))
              ) : (
                // Display search results without grouping
                <div>
                  <h2 className="text-2xl font-semibold mb-4">{translations.searchResults}</h2>
                  {schools.length === 0 && !isLoading && (
                    <p className="text-gray-500">{translations.noResults}</p>
                  )}
                  <SchoolList
                    schools={schools}
                    searchQuery={searchQuery}
                    isLoading={isLoading}
                    loadingCount={5}
                    isDropdown={false}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListPage;
