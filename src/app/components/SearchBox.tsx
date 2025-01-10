import React, { useState, ChangeEvent } from 'react';
import { getLocalizedContent } from '@/utils/language';

interface SearchBoxProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  language: 'en' | 'jp';
}

export interface SearchFilters {
  region: string[];
  curriculum: string[];
}

const REGIONS = {
  'all': { en: 'All Regions', jp: '全ての地域' },
  'Tokyo': { en: 'Tokyo', jp: '東京' },
  'Kansai': { en: 'Kansai', jp: '関西' },
  'Aichi': { en: 'Aichi', jp: '愛知県' },
  'Ibaraki': { en: 'Ibaraki', jp: '茨城県' },
  'Nagano': { en: 'Nagano', jp: '長野県' },
  'Hokkaido': { en: 'Hokkaido', jp: '北海道' },
  'Okinawa': { en: 'Okinawa', jp: '沖縄県' },
  'Miyagi': { en: 'Miyagi', jp: '宮城県' },
  'Hiroshima': { en: 'Hiroshima', jp: '広島県' },
  'Fukuoka': { en: 'Fukuoka', jp: '福岡県' },
  'Iwate': { en: 'Iwate', jp: '岩手県' },
  'Yamanashi': { en: 'Yamanashi', jp: '山梨県' },
};

const CURRICULUMS = {
  'all': { en: 'All Curriculums', jp: '全てのカリキュラム' },
  'IB': { en: 'International Baccalaureate', jp: '国際バカロレア' },
  'American': { en: 'American Curriculum', jp: 'アメリカンカリキュラム' },
  'British': { en: 'British Curriculum', jp: 'イギリスカリキュラム' },
  'Japanese': { en: 'Japanese Curriculum', jp: '日本のカリキュラム' },
  'Mixed': { en: 'Mixed Curriculum', jp: '混合カリキュラム' },
};

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, language }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    region: ['all'],
    curriculum: ['all']
  });
  const [isRegionExpanded, setIsRegionExpanded] = useState(false);
  const [isCurriculumExpanded, setIsCurriculumExpanded] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery.trim(), filters);
  };

  const handleCheckboxChange = (filterType: keyof SearchFilters, value: string) => {
    let newValues: string[];

    if (value === 'all') {
      // If 'all' is selected, clear other selections
      newValues = ['all'];
    } else {
      const currentValues = filters[filterType].filter(v => v !== 'all');
      if (currentValues.includes(value)) {
        // Remove the value if it's already selected
        newValues = currentValues.filter(v => v !== value);
      } else {
        // Add the value if it's not selected
        newValues = [...currentValues, value];
      }
      // If no options are selected, default to 'all'
      if (newValues.length === 0) {
        newValues = ['all'];
      }
    }

    const newFilters = { ...filters, [filterType]: newValues };
    setFilters(newFilters);
    onSearch(query.trim(), newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      region: ['all'],
      curriculum: ['all']
    };
    setFilters(clearedFilters);
    setIsRegionExpanded(false);
    setIsCurriculumExpanded(false);
    onSearch(query.trim(), clearedFilters);
  };

  const searchPlaceholder = getLocalizedContent(
    'Search for schools...',
    '学校を検索...',
    language
  );

  const regionLabel = getLocalizedContent('Region', '地域', language);
  const curriculumLabel = getLocalizedContent('Curriculum', 'カリキュラム', language);
  const clearFiltersLabel = getLocalizedContent('Clear Filters', 'フィルターをクリア', language);

  const getSelectedCount = (filterType: keyof SearchFilters) => {
    const values = filters[filterType];
    if (values.includes('all')) return 0;
    return values.length;
  };

  const hasActiveFilters = !filters.region.includes('all') || !filters.curriculum.includes('all') || filters.region.length > 1 || filters.curriculum.length > 1;

  return (
    <div className="w-full space-y-4 bg-white p-4 rounded-lg shadow-md">
      {/* Search Input and Clear Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={searchPlaceholder}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={searchPlaceholder}
          />
          <svg
            className="absolute left-3 top-3 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A8 8 0 1 0 4 4a8 8 0 0 0 12.65 12.65z" />
          </svg>
        </div>
        <button
          onClick={handleClearFilters}
          className={`flex items-center px-4 py-2 text-sm font-medium border rounded-lg transition-colors duration-200 ${hasActiveFilters
            ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'
            : 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
          disabled={!hasActiveFilters}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {clearFiltersLabel}
        </button>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Region Filter */}
        <div className="flex flex-col sm:col-span-2">
          <button
            onClick={() => setIsRegionExpanded(!isRegionExpanded)}
            className="flex items-center justify-between w-full text-left p-2 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div>
              <span className="text-sm font-medium text-gray-700">{regionLabel}</span>
              {getSelectedCount('region') > 0 && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {getSelectedCount('region')}
                </span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isRegionExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isRegionExpanded ? 'max-h-[400px]' : 'max-h-0'}`}>
            <div className="p-2 border border-gray-200 rounded-lg mt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {Object.entries(REGIONS).map(([value, labels]) => (
                  <label key={value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={filters.region.includes(value)}
                      onChange={() => handleCheckboxChange('region', value)}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 truncate">
                      {language === 'en' ? labels.en : labels.jp}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum Filter */}
        <div className="flex flex-col sm:col-span-2 md:col-span-1">
          <button
            onClick={() => setIsCurriculumExpanded(!isCurriculumExpanded)}
            className="flex items-center justify-between w-full text-left p-2 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div>
              <span className="text-sm font-medium text-gray-700">{curriculumLabel}</span>
              {getSelectedCount('curriculum') > 0 && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {getSelectedCount('curriculum')}
                </span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isCurriculumExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCurriculumExpanded ? 'max-h-60' : 'max-h-0'}`}>
            <div className="space-y-2 p-2 border border-gray-200 rounded-lg mt-2">
              {Object.entries(CURRICULUMS).map(([value, labels]) => (
                <label key={value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={filters.curriculum.includes(value)}
                    onChange={() => handleCheckboxChange('curriculum', value)}
                    className="rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {language === 'en' ? labels.en : labels.jp}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBox;
