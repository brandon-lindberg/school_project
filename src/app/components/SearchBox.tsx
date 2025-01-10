import React, { useState, ChangeEvent } from 'react';
import { getLocalizedContent } from '@/utils/language';

interface SearchBoxProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  language: 'en' | 'jp';
}

export interface SearchFilters {
  region?: string;
  curriculum?: string;
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
    region: 'all',
    curriculum: 'all'
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery.trim(), filters);
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onSearch(query.trim(), newFilters);
  };

  const searchPlaceholder = getLocalizedContent(
    'Search for schools...',
    '学校を検索...',
    language
  );

  const regionLabel = getLocalizedContent('Region', '地域', language);
  const curriculumLabel = getLocalizedContent('Curriculum', 'カリキュラム', language);

  return (
    <div className="w-full space-y-4">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={searchPlaceholder}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={searchPlaceholder}
      />
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {regionLabel}
          </label>
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(REGIONS).map(([value, labels]) => (
              <option key={value} value={value}>
                {language === 'en' ? labels.en : labels.jp}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {curriculumLabel}
          </label>
          <select
            value={filters.curriculum}
            onChange={(e) => handleFilterChange('curriculum', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(CURRICULUMS).map(([value, labels]) => (
              <option key={value} value={value}>
                {language === 'en' ? labels.en : labels.jp}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBox;
