'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { School } from '../../interfaces/School';
import SearchBox, { SearchFilters } from '../components/SearchBox';
import debounce from 'lodash.debounce';
import SchoolList from '../components/SchoolList';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedContent } from '@/utils/language';
import NotificationBanner, { NotificationType } from '../components/NotificationBanner';
import Link from 'next/link';

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
        'Yamanashi',
      ].map(region => (
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

interface Notification {
  type: NotificationType;
  message: string;
}

const REGIONS_CONFIG = {
  Tokyo: { en: 'Tokyo', jp: '東京' },
  Kansai: { en: 'Kansai', jp: '関西' },
  Aichi: { en: 'Aichi', jp: '愛知県' },
  Ibaraki: { en: 'Ibaraki', jp: '茨城県' },
  Nagano: { en: 'Nagano', jp: '長野県' },
  Hokkaido: { en: 'Hokkaido', jp: '北海道' },
  Okinawa: { en: 'Okinawa', jp: '沖縄県' },
  Miyagi: { en: 'Miyagi', jp: '宮城県' },
  Hiroshima: { en: 'Hiroshima', jp: '広島県' },
  Fukuoka: { en: 'Fukuoka', jp: '福岡県' },
  Iwate: { en: 'Iwate', jp: '岩手県' },
  Yamanashi: { en: 'Yamanashi', jp: '山梨県' },
  Other: { en: 'Other', jp: 'その他' },
};

const LOCATION_ORDER = Object.keys(REGIONS_CONFIG).filter(region => region !== 'Other');

const getDefaultCollapsedState = () => {
  return Object.keys(REGIONS_CONFIG).reduce(
    (acc, region) => {
      if (region !== 'Tokyo') {
        acc[region] = true;
      }
      return acc;
    },
    {} as { [key: string]: boolean }
  );
};

interface BrowsingHistoryItem {
  history_id: number;
  school_id: number;
  viewed_at: Date;
  school: {
    name_en: string | null;
    name_jp: string | null;
  };
}

const ListPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [browsingHistory, setBrowsingHistory] = useState<BrowsingHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filters, setFilters] = useState<SearchFilters>({
    region: ['all'],
    curriculum: ['all'],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('collapsedSections');
        return saved ? JSON.parse(saved) : getDefaultCollapsedState();
      } catch {
        return getDefaultCollapsedState();
      }
    }
    return getDefaultCollapsedState();
  });
  const { language } = useLanguage();

  // Translations
  const translations = {
    schools: language === 'en' ? 'Schools' : '学校',
    searchResults: language === 'en' ? 'Search Results' : '検索結果',
    noResults: language === 'en' ? 'No results found' : '結果が見つかりません',
    recentlyViewed: language === 'en' ? 'Recently Viewed' : '最近見た学校',
    regions: Object.entries(REGIONS_CONFIG).reduce((acc: Record<string, string>, [key, value]) => {
      acc[key] = language === 'en' ? value.en : value.jp;
      return acc;
    }, {}),
  };

  // Group schools by location with predefined order
  const groupSchoolsByLocation = (schools: School[]) => {
    // First, group schools by their location
    const grouped = schools.reduce((acc: { [key: string]: School[] }, school) => {
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

  const loadInitialSchools = useCallback(async () => {
    const initialSchools = await fetchAllSchools();
    setSchools(initialSchools);
    setAllSchools(initialSchools);
    setIsInitialLoad(false);
  }, []);

  const fetchSearchResults = async (query: string, filters: SearchFilters) => {
    try {
      const queryParams = new URLSearchParams();
      if (query) queryParams.append('search', query);

      // Handle multiple region selections
      if (filters.region && !filters.region.includes('all')) {
        filters.region.forEach(region => queryParams.append('region', region));
      }

      // Handle multiple curriculum selections
      if (filters.curriculum && !filters.curriculum.includes('all')) {
        filters.curriculum.forEach(curriculum => queryParams.append('curriculum', curriculum));
      }

      queryParams.append('limit', '1000');

      const response = await fetch(`/api/schools?${queryParams.toString()}`);
      const data = await response.json();
      return data.schools;
    } catch (error) {
      console.error('Error fetching search results:', error);
      return [];
    }
  };

  const handleNotification = useCallback((type: NotificationType, message: string) => {
    setNotification({ type, message });
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  }, []);

  const fetchBrowsingHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/browsing');
      const data = await response.json();
      if (Array.isArray(data)) {
        setBrowsingHistory(data);
      } else {
        setBrowsingHistory([]);
      }
    } catch (error) {
      console.error('Error fetching browsing history:', error);
      handleNotification(
        'error',
        language === 'en' ? 'Failed to load browsing history' : '閲覧履歴の読み込みに失敗しました'
      );
    }
  }, [language, handleNotification]);

  const handleClearHistory = useCallback(async () => {
    try {
      await fetch('/api/browsing', { method: 'DELETE' });
      setBrowsingHistory([]);
      handleNotification('success', language === 'en' ? 'History cleared' : '履歴を削除しました');
    } catch (error) {
      console.error('Error clearing history:', error);
      handleNotification(
        'error',
        language === 'en' ? 'Failed to clear history' : '履歴の削除に失敗しました'
      );
    }
  }, [language, handleNotification]);

  const handleDeleteHistoryEntry = useCallback(
    async (historyId: number) => {
      try {
        await fetch(`/api/browsing?historyId=${historyId}`, { method: 'DELETE' });
        setBrowsingHistory(prev => prev.filter(item => item.history_id !== historyId));
        handleNotification(
          'success',
          language === 'en' ? 'Entry removed' : 'エントリーを削除しました'
        );
      } catch (error) {
        console.error('Error deleting history entry:', error);
        handleNotification(
          'error',
          language === 'en' ? 'Failed to remove entry' : 'エントリーの削除に失敗しました'
        );
      }
    },
    [language, handleNotification]
  );

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([loadInitialSchools(), fetchBrowsingHistory()]);
    };

    loadInitialData();
  }, [fetchBrowsingHistory, loadInitialSchools]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string, filters: SearchFilters) => {
        setIsLoading(true);
        const searchResults = await fetchSearchResults(query, filters);
        setSchools(searchResults);
        setIsLoading(false);
      }, 300),
    []
  );

  const handleSearchInput = (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    setFilters(filters);

    if (
      query.trim() === '' &&
      filters.region.includes('all') &&
      filters.curriculum.includes('all')
    ) {
      debouncedSearch.cancel();
      setSchools(allSchools);
      setIsLoading(false);
    } else {
      debouncedSearch(query, filters);
    }
  };

  const toggleSection = (location: string) => {
    setCollapsedSections((prev: { [key: string]: boolean }) => {
      const newState = {
        ...prev,
        [location]: !prev[location],
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('collapsedSections', JSON.stringify(newState));
        } catch (error) {
          console.error('Failed to save collapsed sections state:', error);
        }
      }
      return newState;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-grow">
        {isInitialLoad ? (
          <ListPageSkeleton />
        ) : (
          <>
            {/* Browsing History Section */}
            {browsingHistory.length > 0 ? (
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-3 text-gray-600">
                  {translations.recentlyViewed}
                </h2>
                <div className="relative">
                  <div className="flex overflow-x-auto space-x-3 p-2 scrollbar">
                    {browsingHistory.map(entry => (
                      <div
                        key={entry.history_id}
                        className="flex-shrink-0 w-[200px] bg-white rounded border border-gray-100 hover:border-gray-200 transition-colors"
                        style={{ height: '100px' }}
                      >
                        <Link
                          href={`/schools/${entry.school_id}`}
                          className="block h-full p-3 relative"
                        >
                          <div className="flex flex-col h-full">
                            <h3 className="text-sm font-medium text-gray-700 hover:text-[#0057B7] line-clamp-2">
                              {getLocalizedContent(
                                entry.school.name_en,
                                entry.school.name_jp,
                                language
                              )}
                            </h3>
                            <div className="absolute bottom-2 left-0 right-0 px-3 flex justify-between items-center">
                              <p className="text-xs text-gray-400">
                                {new Date(entry.viewed_at).toLocaleDateString(
                                  language === 'en' ? 'en-US' : 'ja-JP',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )}
                              </p>
                              <button
                                onClick={e => {
                                  e.preventDefault();
                                  handleDeleteHistoryEntry(entry.history_id);
                                }}
                                className="text-xs text-gray-400 hover:text-[#D9534F] transition-colors"
                              >
                                {language === 'en' ? 'Remove' : '削除'}
                              </button>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-1">
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-gray-400 hover:text-[#D9534F] px-2 py-1 transition-colors"
                    >
                      {language === 'en' ? 'Clear All' : 'すべて削除'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

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
                        onNotification={handleNotification}
                        language={language}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-16">
              {searchQuery.trim().length === 0 ? (
                Object.entries(groupSchoolsByLocation(schools)).map(
                  ([location, locationSchools]) => (
                    <div key={location} className="mb-12">
                      <div
                        className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200 cursor-pointer"
                        onClick={() => toggleSection(location)}
                      >
                        <h2 className="text-2xl font-semibold">
                          {translations.regions[location as keyof typeof translations.regions]}{' '}
                          <span className="text-gray-500 text-lg">
                            ({locationSchools.length} {translations.schools})
                          </span>
                        </h2>
                        <button
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          aria-label={
                            collapsedSections[location] ? 'Expand section' : 'Collapse section'
                          }
                        >
                          <svg
                            className={`w-6 h-6 transform transition-transform ${
                              collapsedSections[location] ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          collapsedSections[location]
                            ? 'max-h-0 opacity-0'
                            : 'max-h-[2000px] opacity-100'
                        }`}
                      >
                        <SchoolList
                          schools={locationSchools}
                          isLoading={isInitialLoad || isLoading}
                          loadingCount={5}
                          isDropdown={false}
                          onNotification={handleNotification}
                          language={language}
                        />
                      </div>
                    </div>
                  )
                )
              ) : (
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
                    onNotification={handleNotification}
                    language={language}
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
