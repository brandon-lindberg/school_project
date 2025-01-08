'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { School } from '../../interfaces/School';
import SearchBox from '../components/SearchBox';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SchoolList from '../components/SchoolList';

const DEFAULT_LOGO_URL = 'https://www.cisjapan.net/files/libs/1370/202210271551078360.png?1690767172';
const DEFAULT_SCHOOL_IMAGE = "https://media.istockphoto.com/id/1654230729/ja/%E3%82%B9%E3%83%88%E3%83%83%E3%82%AF%E3%83%95%E3%82%A9%E3%83%88/%E6%97%A5%E6%9C%AC%E3%81%AE%E9%AB%98%E6%A0%A1%E3%81%AE%E3%83%95%E3%82%A1%E3%82%B5%E3%83%BC%E3%83%89%E3%81%AE%E5%BB%BA%E7%89%A9-%E6%BC%AB%E7%94%BB%E3%81%A7%E8%A6%8B%E3%81%88%E3%82%8B%E4%BC%9D%E7%B5%B1%E7%9A%84%E3%81%AA%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB.jpg?s=612x612&w=0&k=20&c=5fOeZO7_Stdrui-zCVAQ5RAxxgIjHpg9ZFPLEC9Q-2s=";

const ListPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        console.log('Fetching schools...');
        const response = await fetch('/api/schools?limit=5');
        console.log('Schools response status:', response.status);
        const data = await response.json();
        console.log('Fetched schools data:', data);
        console.log('Individual schools:', data.schools.map((s: School) => ({
          id: s.school_id,
          nameEn: s.name_en,
          nameJp: s.name_jp
        })));
        setSchools(data.schools);
        setFilteredSchools(data.schools);
      } catch (error) {
        console.error('Error fetching schools:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const handleSearch = useCallback(
    debounce(async (query: string) => {
      setSearchQuery(query);
      try {
        if (query === '') {
          const response = await fetch('/api/schools?limit=5');
          const data = await response.json();
          setFilteredSchools(data.schools);
        } else {
          const response = await fetch(`/api/schools?search=${encodeURIComponent(query)}`);
          const data = await response.json();
          setFilteredSchools(data.schools);
        }
      } catch (error) {
        console.error('Error searching schools:', error);
      }
    }, 300),
    []
  );

  const handleSearchInput = (query: string) => {
    handleSearch(query);
  };

  useEffect(() => {
    return () => {
      handleSearch.cancel();
    };
  }, [handleSearch]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">School List</h1>
      <div className="mb-6">
        <SearchBox onSearch={handleSearchInput} />
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Featured Schools</h2>
          <SchoolList schools={filteredSchools} searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
};

export default ListPage;
