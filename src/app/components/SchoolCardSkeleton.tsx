import React from 'react';

const SchoolCardSkeleton: React.FC = () => {
  return (
    <div
      className="border rounded-lg shadow-md flex flex-col w-full max-w-xs sm:max-w-sm md:max-w-md relative overflow-hidden bg-white"
      style={{ width: '320px', height: '66.67vh', maxHeight: '32.125rem' }}
    >
      {/* Image placeholder */}
      <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-200 animate-pulse" />

      {/* Content container */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Logo and title container */}
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 animate-pulse mr-2 flex-shrink-0" />
          <div className="min-w-0">
            <div className="h-6 sm:h-7 md:h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>

        {/* Location placeholder */}
        <div className="h-4 bg-gray-100 rounded w-2/3 mb-2 animate-pulse" />

        {/* Description placeholder */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-4/6 animate-pulse" />
        </div>

        {/* Contact details placeholder */}
        <div className="mt-auto space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>

        {/* Add button placeholder */}
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse absolute bottom-4 right-4" />
      </div>
    </div>
  );
};

export default SchoolCardSkeleton;
