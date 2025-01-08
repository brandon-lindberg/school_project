'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { School } from '../../interfaces/School';
import SearchBox from '../components/SearchBox';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SchoolList from '../components/SchoolList';

const SCHOOLS_PER_PAGE = 5;

const ListPageSkeleton = () => (
  <div className="animate-pulse">
    {/* Header placeholder */}
    <div className="h-8 bg-gray-200 rounded w-48 mb-6" />

    {/* Search box placeholder */}
    <div className="mb-6">
      <div className="h-12 bg-gray-200 rounded w-full max-w-md" />
    </div>

    {/* Section title placeholder */}
    <div className="h-7 bg-gray-200 rounded w-40 mb-4" />
  </div>
);

const ListPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const fetchSchools = async (pageNum: number, query: string = '') => {
    try {
      const endpoint = query
        ? `/api/schools?search=${encodeURIComponent(query)}&page=${pageNum}&limit=${SCHOOLS_PER_PAGE}`
        : `/api/schools?page=${pageNum}&limit=${SCHOOLS_PER_PAGE}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      return {
        schools: data.schools,
        hasMore: data.pagination.hasMore
      };
    } catch (error) {
      console.error('Error fetching schools:', error);
      return { schools: [], hasMore: false };
    }
  };

  useEffect(() => {
    const loadInitialSchools = async () => {
      setIsInitialLoad(true);
      const { schools: initialSchools, hasMore: hasMoreSchools } = await fetchSchools(1);
      setSchools(initialSchools);
      setHasMore(hasMoreSchools);
      setIsInitialLoad(false);
    };

    loadInitialSchools();
  }, []);

  const handleSearch = useCallback(
    debounce(async (query: string) => {
      setSearchQuery(query);
      setIsInitialLoad(true);
      setPage(1);

      const { schools: searchResults, hasMore: hasMoreSchools } = await fetchSchools(1, query);
      setSchools(searchResults);
      setHasMore(hasMoreSchools);
      setIsInitialLoad(false);
    }, 300),
    []
  );

  const loadMoreSchools = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const { schools: newSchools, hasMore: hasMoreSchools } = await fetchSchools(nextPage, searchQuery);

    if (newSchools.length > 0) {
      setSchools(prevSchools => {
        // Create a Set of existing school IDs for efficient lookup
        const existingIds = new Set(prevSchools.map((school: School) => school.school_id));
        // Filter out any duplicates from new schools
        const uniqueNewSchools = newSchools.filter((school: School) => !existingIds.has(school.school_id));
        return [...prevSchools, ...uniqueNewSchools];
      });
      setPage(nextPage);
      setHasMore(hasMoreSchools);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isInitialLoad) {
          loadMoreSchools();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [hasMore, isLoading, page, searchQuery, isInitialLoad]);

  const handleSearchInput = (query: string) => {
    handleSearch(query);
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {isInitialLoad ? (
        <ListPageSkeleton />
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6">School List</h1>
          <div className="mb-6">
            <SearchBox onSearch={handleSearchInput} />
          </div>
        </>
      )}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Featured Schools</h2>
        <SchoolList
          schools={schools}
          searchQuery={searchQuery}
          isLoading={isInitialLoad || isLoading}
          loadingCount={SCHOOLS_PER_PAGE}
        />
        {hasMore && <div ref={loadingRef} className="h-10" />}
      </div>
    </div>
  );
};

export default ListPage;
