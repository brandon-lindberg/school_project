'use client'

import React, { useState, useEffect, useCallback } from 'react';
import SchoolList from '../components/SchoolList';
import rawData from '../../../normalized_output.json';
import { NormalizedDataItem, SubPage } from '../../interfaces/NormalizedData';
import { School } from '../../interfaces/School';
import SearchBox from '../components/SearchBox';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const DEFAULT_LOGO_URL = 'https://www.cisjapan.net/files/libs/1370/202210271551078360.png?1690767172';

const ListPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  const parseSchools = (): School[] => {
    const parsedSchools: School[] = [];
    let idCounter = 1;

    ((rawData as unknown) as NormalizedDataItem[]).forEach((item) => {
      const schoolName = item.source?.title?.split("|")[0]?.trim() || 'Unnamed School';
      const website = item.source?.url || '#';

      let contactEmail = 'N/A';
      let contactPhone = 'N/A';
      let description = 'No description available.';

      const subPages = item.content?.sub_pages || [];
      if (subPages.length > 0) {
        const firstSubPage = subPages[0];
        description = firstSubPage?.data?.length ?
          (firstSubPage.data.length > 200 ? `${firstSubPage.data.substring(0, 200)}...` : firstSubPage.data)
          : 'No description available.';
      }

      subPages.forEach((subPage: SubPage) => {
        const data = subPage.data || '';

        // Extract Email
        if (contactEmail === 'N/A') {
          const emailMatch = data.match(/Email:\s*([\w.+-]+@[\w-]+\.[A-Za-z]{2,})/);
          if (emailMatch) {
            contactEmail = emailMatch[1];
          }
        }

        // Extract Phone
        if (contactPhone === 'N/A') {
          const phoneMatch = data.match(/TEL：[^\d]*(\+?\d{1,3}[-.\s]?)?(\d{2,4}[-.\s]?){2}\d{4}/);
          if (phoneMatch) {
            contactPhone = phoneMatch[0];
          }
        }

        // If both email and phone are found, no need to continue
        if (contactEmail !== 'N/A' && contactPhone !== 'N/A') {
          return;
        }
      });

      parsedSchools.push({
        id: (idCounter++).toString(),
        name: schoolName,
        description,
        contactEmail,
        contactPhone,
        website,
        logo_id: item.source?.id || 'default',
      });
    });

    return parsedSchools;
  };

  useEffect(() => {
    const allSchools = parseSchools();
    setSchools(allSchools);
    setFilteredSchools(allSchools.slice(0, 5));
  }, []);

  const handleSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query); // Update the search query state
      if (query === '') {
        setFilteredSchools(schools.slice(0, 5)); // Reset to initial state
      } else {
        const lowerCaseQuery = query.toLowerCase();
        const filtered = schools.filter(
          (school) =>
            school.name.toLowerCase().includes(lowerCaseQuery) ||
            school.description.toLowerCase().includes(lowerCaseQuery)
        );
        setFilteredSchools(filtered);
      }
    }, 300), // Delay of 300ms
    [schools]
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
        {searchQuery && (
          <div className="bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto z-10 mt-2 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent">
            {filteredSchools.length > 0 ? (
              <div className="space-y-4">
                {filteredSchools.map((school) => (
                  <div
                    key={school.id}
                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => router.push(`/schools/${school.id}`)}
                  >
                    <img
                      src={`/logos/${school.logo_id}.png`}
                      onError={(e) => (e.currentTarget.src = DEFAULT_LOGO_URL)}
                      alt={`${school.name} Logo`}
                      className="w-10 h-10 mr-4 object-contain"
                    />
                    <span>{school.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 text-gray-500">No schools found.</div>
            )}
          </div>
        )}
      </div>
      {!isLoading && (
        <SchoolList
          schools={filteredSchools}
          searchQuery={searchQuery}
          userId={userId}
        />
      )}
    </div>
  );
};

export default ListPage;
