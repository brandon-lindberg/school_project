'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '../contexts/LanguageContext';
import { SearchFilters } from '../components/SearchBox';
import { debounce } from 'lodash';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import SchoolList from '../components/SchoolList';
import SearchBox from '../components/SearchBox';
import NotificationBanner, { NotificationType } from '../components/NotificationBanner';
import { School } from '@/types/school';
import { getLocalizedContent } from '@/utils/language';
import Link from 'next/link';
import { BsGrid, BsListUl } from 'react-icons/bs';
import { REGIONS_CONFIG } from '../config/regions';
import { groupSchoolsByLocation } from '../utils/schools';
import { useViewMode } from '../contexts/ViewModeContext';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { viewMode, updateViewMode } = useViewMode();
  const [filters, setFilters] = useState<SearchFilters>({
    region: ['all'],
    curriculum: ['all'],
  });
  const [isLoading, setIsLoading] = useState(false);
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
  const { data: session } = useSession();

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
    clearHistory: language === 'en' ? 'Clear All' : 'すべて削除',
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

  const handleSearchInput = useCallback(
    (query: string, filters: SearchFilters) => {
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
    },
    [debouncedSearch, allSchools]
  );

  useEffect(() => {
    if (searchQuery || !filters.region.includes('all') || !filters.curriculum.includes('all')) {
      handleSearchInput(searchQuery, filters);
    }
  }, [language, searchQuery, filters, handleSearchInput]);

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

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  // Force list view for unauthenticated users and small screens
  useEffect(() => {
    if ((!session?.user || window.innerWidth < 640) && viewMode === 'grid') {
      updateViewMode('list');
    }

    // Add resize listener for responsive behavior
    const handleResize = () => {
      if (window.innerWidth < 640 && viewMode === 'grid') {
        updateViewMode('list');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [session, viewMode, updateViewMode]);

  // Add scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Track scroll position for back to top button
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleExpandRegion = (event: CustomEvent) => {
      const region = event.detail;
      setCollapsedSections(prev => ({
        ...prev,
        [region]: false,
      }));
    };

    window.addEventListener('expandRegion', handleExpandRegion as EventListener);
    return () => {
      window.removeEventListener('expandRegion', handleExpandRegion as EventListener);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Back to Top Button */}
      {viewMode === 'list' && showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={language === 'en' ? 'Back to top' : 'トップに戻る'}
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}

      <div className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Search Icon Button */}
        <div className="fixed top-20 sm:top-4 right-4 z-50">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isSearchOpen ? 'Close search' : 'Open search'}
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isSearchOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Search Box Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 ${
            isSearchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsSearchOpen(false)}
        />

        {/* Collapsible Search Box */}
        <div
          className={`fixed top-32 sm:top-16 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 transition-all duration-300 z-50 ${
            isSearchOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <SearchBox
            onSearch={handleSearchInput}
            onFiltersChange={handleFiltersChange}
            language={language}
          />
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{translations.schools}</h1>
          {session?.user && (
            <button
              onClick={() => updateViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {viewMode === 'list' ? (
                <>
                  <BsGrid className="w-4 h-4" />
                  <span>{getLocalizedContent('Grid View', 'グリッド表示', language)}</span>
                </>
              ) : (
                <>
                  <BsListUl className="w-4 h-4" />
                  <span>{getLocalizedContent('List View', 'リスト表示', language)}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Browsing History Section */}
        {browsingHistory.length > 0 && !searchQuery ? (
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
              {browsingHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="absolute -top-8 right-0 text-sm text-gray-500 hover:text-gray-700"
                >
                  {translations.clearHistory}
                </button>
              )}
            </div>
          </div>
        ) : null}

        {/* Schools List */}
        {isLoading ? (
          <ListPageSkeleton />
        ) : viewMode === 'grid' ? (
          <SchoolList
            schools={schools}
            searchQuery={searchQuery}
            onNotification={handleNotification}
            language={language}
            viewMode={viewMode}
          />
        ) : (
          <>
            {/* Region Sections */}
            <div className="space-y-8">
              {Object.entries(groupSchoolsByLocation(schools, language)).map(
                ([location, locationSchools]) => {
                  const schools = locationSchools as School[];
                  return (
                    <div
                      key={location}
                      id={location}
                      className={`${collapsedSections[location] ? 'mb-2' : 'mb-8'}`}
                    >
                      <div
                        onClick={() => toggleSection(location)}
                        className="flex items-center justify-between cursor-pointer hover:bg-gray-25/50 p-4 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold">
                            {REGIONS_CONFIG[location][language]}
                          </h2>
                          <span className="text-gray-500 text-sm">({schools.length} Schools)</span>
                        </div>
                        <div>
                          {collapsedSections[location] ? (
                            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          collapsedSections[location]
                            ? 'h-0 opacity-0 invisible overflow-hidden'
                            : 'opacity-100 visible'
                        }`}
                      >
                        <SchoolList
                          schools={schools}
                          viewMode={viewMode}
                          language={language}
                          searchQuery={searchQuery}
                          onNotification={handleNotification}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListPage;
