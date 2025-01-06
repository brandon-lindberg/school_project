import React, { useState, ChangeEvent } from 'react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery.trim());
  };

  return (
    <div className="w-full">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search for schools..."
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Search for schools"
      />
    </div>
  );
};

export default SearchBox;
