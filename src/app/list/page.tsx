'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { School } from '../../interfaces/School';
import SearchBox from '../components/SearchBox';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const DEFAULT_LOGO_URL = 'https://www.cisjapan.net/files/libs/1370/202210271551078360.png?1690767172';
const DEFAULT_SCHOOL_IMAGE = "https://media.istockphoto.com/id/1654230729/ja/%E3%82%B9%E3%83%88%E3%83%83%E3%82%AF%E3%83%95%E3%82%A9%E3%83%88/%E6%97%A5%E6%9C%AC%E3%81%AE%E9%AB%98%E6%A0%A1%E3%81%AE%E3%83%95%E3%82%A1%E3%82%B5%E3%83%BC%E3%83%89%E3%81%AE%E5%BB%BA%E7%89%A9-%E6%BC%AB%E7%94%BB%E3%81%A7%E8%A6%8B%E3%81%88%E3%82%8B%E4%BC%9D%E7%B5%B1%E7%9A%84%E3%81%AA%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB.jpg?s=612x612&w=0&k=20&c=5fOeZO7_Stdrui-zCVAQ5RAxxgIjHpg9ZFPLEC9Q-2s=";

const ListPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<number | undefined>(undefined);
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

  useEffect(() => {
    let isMounted = true;

    const fetchUserId = async () => {
      if (!session?.user) {
        setUserId(undefined);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        if (isMounted && response.ok) {
          setUserId(data.userId);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    fetchUserId();

    return () => {
      isMounted = false;
    };
  }, [session?.user]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">School List</h1>
      <div className="mb-6">
        <SearchBox onSearch={handleSearchInput} />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => (
            <div
              key={school.school_id}
              className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                console.log('Clicking school:', school.school_id);
                router.push(`/schools/${school.school_id}`);
              }}
            >
              <img
                src={DEFAULT_SCHOOL_IMAGE}
                alt={`${school.name_jp || school.name_en || 'School'} Building`}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <img
                    src={school.logo_id ? `/logos/${school.logo_id}.png` : '/logo.png'}
                    onError={(e) => (e.currentTarget.src = '/logo.png')}
                    alt={`${school.name_jp || school.name_en || 'School'} Logo`}
                    className="w-12 h-12 object-contain mr-4"
                  />
                  <h2 className="text-xl font-semibold">
                    {school.name_jp || school.name_en || 'Unnamed School'}
                  </h2>
                </div>
                {school.location_jp && (
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Location:</span> {school.location_jp}
                  </p>
                )}
                {(school.description_jp || school.description_en) && (
                  <p className="text-gray-600">
                    {school.description_jp || school.description_en}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListPage;
