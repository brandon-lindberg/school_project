import React from 'react';
import SchoolCard from './SchoolCard';
import { School } from '../../interfaces/School';

interface SchoolListProps {
  schools: School[];
  searchQuery?: string;
}

const SchoolList: React.FC<SchoolListProps> = ({ schools, searchQuery = '' }) => {
  return (
    <>
      {schools.length === 0 ? (
        <p>No schools found.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-4 p-4">
          {schools.map((school) => (
            <SchoolCard key={school.id} school={school} searchQuery={searchQuery} />
          ))}
        </div>
      )}
    </>
  );
};

export default SchoolList; 
