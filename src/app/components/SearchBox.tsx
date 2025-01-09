import React, { useState, ChangeEvent } from 'react';
import { getLocalizedContent } from '@/utils/language';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  language: 'en' | 'jp';
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, language }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery.trim());
  };

  const placeholder = getLocalizedContent(
    'Search for schools...',
    '学校を検索...',
    language
  );

  return (
    <div className="w-full">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={placeholder}
      />
    </div>
  );
};

export default SearchBox;
