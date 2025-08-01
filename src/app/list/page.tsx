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
import { groupSchoolsByRegionAndCity } from '../utils/schools';
import { useViewMode } from '../contexts/ViewModeContext';
import RegistrationPrompt from '../components/RegistrationPrompt';
import SchoolCard from '../components/SchoolCard';
import { useBrowsingHistory } from '../contexts/BrowsingHistoryContext';
import ContactBanner from '../components/ContactBanner';
import { usePathname } from 'next/navigation';

const BrowsingHistorySkeleton = () => (
  <div className="mb-8 animate-pulse">
    <div className="h-6 w-32 bg-gray-200 rounded mb-3" /> {/* Title */}
    <div className="flex overflow-x-auto space-x-3 p-2">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="flex-shrink-0 w-[200px] h-[100px] bg-gray-200 rounded" />
      ))}
    </div>
  </div>
);

const FeaturedSchoolsSkeleton = () => (
  <div className="mb-12 max-w-7xl mx-auto animate-pulse">
    <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-6" /> {/* Title */}
    <div className="flex flex-nowrap gap-4 overflow-x-auto sm:overflow-visible sm:grid sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 pb-4">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="w-[300px] sm:w-auto flex-shrink-0 h-[200px] bg-gray-200 rounded"
        />
      ))}
    </div>
  </div>
);

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
      if (region !== 'Kanto') {
        acc[region] = true;
      }
      return acc;
    },
    {} as { [key: string]: boolean }
  );
};

const ListPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [randomSchools, setRandomSchools] = useState<School[]>([]);
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
  const pathname = usePathname();
  const {
    browsingHistory,
    deleteHistoryEntry: handleDeleteHistoryEntry,
    clearHistory: handleClearHistory,
  } = useBrowsingHistory();

  // Translations
  const translations = {
    schools: language === 'en' ? 'Schools' : '学校',
    searchResults: language === 'en' ? 'Search Results' : '検索結果',
    noResults: language === 'en' ? 'No results found' : '結果が見つかりません',
    recentlyViewed: language === 'en' ? 'Recently Viewed' : '最近見た学校',
    regions: Object.entries(REGIONS_CONFIG).reduce((acc: Record<string, string>, [key, value]) => {
      if (value && typeof value === 'object' && 'en' in value && 'jp' in value) {
        acc[key] = language === 'en' ? value.en : value.jp;
      } else {
        acc[key] = key; // Fallback to the key if the value is not properly structured
      }
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

  const fetchRandomSchools = useCallback(async () => {
    try {
      setIsFeaturedLoading(true);
      const response = await fetch('/api/schools/random?limit=4');
      const data = await response.json();
      setRandomSchools(data.schools);
    } catch (error) {
      console.error('Error fetching random schools:', error);
      setRandomSchools([]);
    } finally {
      setIsFeaturedLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      if (!mounted) return;

      try {
        setIsLoading(true);
        if (session?.user) {
          const [schools] = await Promise.all([fetchAllSchools(), fetchRandomSchools()]);
          if (mounted) {
            setSchools(schools);
            setAllSchools(schools);
          }
        } else {
          await fetchRandomSchools();
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [session, fetchRandomSchools]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string, filters: SearchFilters) => {
        if (!session?.user) return;
        setIsLoading(true);
        const searchResults = await fetchSearchResults(query, filters);
        setSchools(searchResults);
        setIsLoading(false);
      }, 300),
    [session]
  );

  const handleSearchInput = useCallback(
    (query: string, filters: SearchFilters) => {
      if (!session?.user) return;
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
    [debouncedSearch, allSchools, session]
  );

  useEffect(() => {
    if (!session?.user) return;
    if (searchQuery || !filters.region.includes('all') || !filters.curriculum.includes('all')) {
      handleSearchInput(searchQuery, filters);
    }
  }, [language, searchQuery, filters, handleSearchInput, session]);

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

  // Add loading states for different sections
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);

  // Loading state for browsing history
  useEffect(() => {
    // Set history loading to false after a short delay to simulate loading
    const timer = setTimeout(() => {
      setIsHistoryLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [browsingHistory]);

  // State for admin-scheduled featured slots
  const [featuredSlots, setFeaturedSlots] = useState<{ slotNumber: number; school: School }[]>([]);

  // Load featured slots and fall back to random for unassigned slots
  useEffect(() => {
    // Only reload featured and fallback when on the /list page
    if (pathname !== '/list') return;
    let mounted = true;
    const loadFeaturedSlots = async () => {
      setIsFeaturedLoading(true);
      try {
        const res = await fetch('/api/featured');
        const data = await res.json();
        if (!mounted) return;
        const slots = data.slots as { slotNumber: number; school: School }[];
        setFeaturedSlots(slots);
        // Count unique slot numbers (to handle overlapping schedules)
        const uniqueSlotCount = new Set(slots.map(slot => slot.slotNumber)).size;
        if (uniqueSlotCount < 4) {
          // Fetch full list of URL-enabled schools for fallback
          const randRes = await fetch('/api/schools/random?limit=1000');
          const randData = await randRes.json();
          if (!mounted) return;
          // Exclude any schools already scheduled
          const scheduledIds = new Set(slots.map(slot => slot.school.school_id));
          const candidates = (randData.schools as School[]).filter(
            s => !scheduledIds.has(s.school_id)
          );
          // Shuffle candidates
          for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
          }
          // Take only the needed number of fallback slots
          const finalFallback = candidates.slice(0, 4 - uniqueSlotCount);
          setRandomSchools(finalFallback);
        } else {
          setRandomSchools([]);
        }
      } catch (error) {
        console.error('Error loading featured slots:', error);
        setFeaturedSlots([]);
        setRandomSchools([]);
      } finally {
        if (mounted) setIsFeaturedLoading(false);
      }
    };
    loadFeaturedSlots();
    return () => {
      mounted = false;
    };
  }, [pathname]);

  // Combine scheduled slots with random fallbacks for display
  const displaySchools = useMemo(() => {
    const arr: (School | undefined)[] = [undefined, undefined, undefined, undefined];
    featuredSlots.forEach(slot => {
      const idx = slot.slotNumber - 1;
      if (idx >= 0 && idx < 4) arr[idx] = slot.school;
    });
    let randIndex = 0;
    return arr
      .map(s => {
        if (s) return s;
        if (randIndex < randomSchools.length) return randomSchools[randIndex++];
        return undefined;
      })
      .filter((s): s is School => !!s);
  }, [featuredSlots, randomSchools]);

  // Group schools by region and then by city for nested listing
  const groupedSchools = useMemo(
    () => groupSchoolsByRegionAndCity(schools, language),
    [schools, language]
  );

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
          className="fixed bottom-8 right-8 z-50 p-3 bg-neutral-50 rounded-full transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary"
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

      {/* Contact Banner for non-logged-in users */}
      {!session?.user && <ContactBanner />}

      <div className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Search Icon Button */}
        {session?.user && (
          <div className="fixed top-20 sm:top-4 right-4 z-30">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-3 bg-neutral-50 rounded-full transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary"
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
        )}

        {/* Search Box Overlay */}
        {session?.user && (
          <>
            <div
              className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-20 ${isSearchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setIsSearchOpen(false)}
            />

            {/* Collapsible Search Box */}
            <div
              className={`fixed top-32 sm:top-16 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 transition-all duration-300 z-30 ${isSearchOpen
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
          </>
        )}

        <div className="flex justify-end items-center mb-8 mr-16">
          {session?.user && (
            <button
              onClick={() => updateViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-100 hover:bg-neutral-200 transition-colors"
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
          isHistoryLoading ? (
            <BrowsingHistorySkeleton />
          ) : (
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-3 text-gray-600">
                {translations.recentlyViewed}
              </h2>
              <div>
                <div className="flex overflow-x-auto space-x-3 p-2 scrollbar">
                  {browsingHistory.map(entry => (
                    <div
                      key={entry.history_id}
                      className="flex-shrink-0 w-[200px] bg-white rounded border border-gray-100 hover:border-gray-200 transition-colors relative"
                      style={{ height: '100px' }}
                    >
                      <Link href={`/schools/${entry.school_id}`} className="block h-full p-3">
                        <div className="flex flex-col h-full">
                          <h3 className="text-sm font-medium text-gray-700 hover:text-[#0057B7] line-clamp-2">
                            {getLocalizedContent(
                              entry.school.name_en,
                              entry.school.name_jp,
                              language
                            )}
                          </h3>
                          <div className="absolute bottom-2 left-3">
                            <p className="text-xs text-gray-400">
                              {new Date(entry.viewed_at).toLocaleDateString(
                                language === 'en' ? 'en-US' : 'ja-JP',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleDeleteHistoryEntry(entry.history_id)}
                        className="absolute bottom-2 right-3 text-xs text-neutral-400 hover:text-red-600 transition-colors z-10"
                      >
                        {language === 'en' ? 'Remove' : '削除'}
                      </button>
                    </div>
                  ))}
                </div>
                {browsingHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="block text-sm text-neutral-500 hover:text-neutral-700 mt-2"
                  >
                    {translations.clearHistory}
                  </button>
                )}
              </div>
            </div>
          )
        ) : null}

        {/* Featured Schools Section */}
        {isFeaturedLoading ? (
          <FeaturedSchoolsSkeleton />
        ) : (
          displaySchools.length > 0 && (
            <div className="mb-12 max-w-7xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                {language === 'en' ? 'Featured Schools' : '注目の学校'}
              </h2>
              <div className="flex flex-nowrap gap-4 overflow-x-auto sm:overflow-visible sm:grid sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 pb-4">
                {displaySchools.map((school, idx) => (
                  <div
                    key={`${school.school_id}-${idx}`}
                    className="transform transition-transform hover:scale-105 w-[300px] sm:w-auto flex-shrink-0"
                  >
                    <SchoolCard
                      school={school}
                      searchQuery=""
                      onNotification={handleNotification}
                      isFeatured={true}
                      userId={session?.user?.id ? Number(session.user.id) : null}
                    />
                  </div>
                ))}
              </div>
              {!session?.user && <RegistrationPrompt />}
            </div>
          )
        )}

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
            {/* Region → City Sections */}
            <div className={`space-y-8 ${!session?.user ? 'blur-sm pointer-events-none' : ''}`}>
              {Object.entries(groupedSchools).map(([region, cities]) => (
                <div
                  key={region}
                  id={region}
                  className={`${collapsedSections[region] ? 'mb-2' : 'mb-8'}`}
                >
                  <div
                    onClick={() => toggleSection(region)}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-25/50 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">
                        {REGIONS_CONFIG[region]
                          ? language === 'en'
                            ? REGIONS_CONFIG[region].en
                            : REGIONS_CONFIG[region].jp
                          : region}
                      </h2>
                      <span className="text-gray-500 text-sm">
                        ({Object.values(cities).reduce((sum, arr) => sum + arr.length, 0)} Schools)
                      </span>
                    </div>
                    <div>
                      {collapsedSections[region] ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`transition-all duration-300 ease-in-out ${collapsedSections[region]
                      ? 'h-0 opacity-0 invisible overflow-hidden'
                      : 'opacity-100 visible'
                      }`}
                  >
                    {Object.entries(cities)
                      .sort((a, b) => {
                        if (region === 'Kanto') {
                          if (a[0] === 'Tokyo') return -1;
                          if (b[0] === 'Tokyo') return 1;
                        }
                        return 0;
                      })
                      .map(([city, citySchools]) => (
                        <div key={city} id={`${region}-${city}`} className="mb-6 pl-4">
                          <h3 className="text-lg font-medium mb-2">
                            {city} ({citySchools.length})
                          </h3>
                          <SchoolList
                            schools={citySchools}
                            viewMode={viewMode}
                            language={language}
                            searchQuery={searchQuery}
                            onNotification={handleNotification}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListPage;
