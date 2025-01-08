import React from 'react';
import SchoolCard from './SchoolCard';
import SchoolCardSkeleton from './SchoolCardSkeleton';
import { School } from '../../interfaces/School';
import './styles/scrollbar.css';

interface SchoolListProps {
  schools: School[];
  searchQuery?: string;
  isLoading?: boolean;
  loadingCount?: number;
}

const SchoolList: React.FC<SchoolListProps> = ({
  schools,
  searchQuery = '',
  isLoading = false,
  loadingCount = 5
}) => {
  return (
    <>
      {schools.length === 0 && !isLoading ? (
        <p>No schools found.</p>
      ) : (
        <div className="flex overflow-x-auto space-x-4 p-4 scrollbar">
          {schools.map((school) => (
            <div key={`school-${school.school_id}`} className="flex-shrink-0">
              <SchoolCard school={school} searchQuery={searchQuery} />
            </div>
          ))}
          {isLoading && Array.from({ length: loadingCount }).map((_, index) => (
            <div key={`skeleton-${schools.length + index}`} className="flex-shrink-0">
              <SchoolCardSkeleton />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SchoolList;
