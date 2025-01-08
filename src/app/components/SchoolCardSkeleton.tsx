import React from 'react';

const SchoolCardSkeleton: React.FC = () => {
  return (
    <div
      className="border rounded-lg shadow-md flex flex-col w-full max-w-xs sm:max-w-sm md:max-w-md relative overflow-hidden bg-gray-100 animate-pulse"
      style={{ height: '66.67vh', maxHeight: '32.125rem' }}
    />
  );
};

export default SchoolCardSkeleton;
