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
        <div className="flex overflow-x-auto space-x-4 p-4">
          {schools.map((school) => (
            <div key={school.id} className="flex-shrink-0">
              <SchoolCard school={school} searchQuery={searchQuery} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SchoolList;
