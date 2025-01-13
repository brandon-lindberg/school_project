import React from 'react';

const ListSkeleton = () => (
  <div className="border p-4 rounded shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex justify-between items-center">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded ml-2"></div>
        </div>
      ))}
    </div>
  </div>
);

const HistoryItemSkeleton = () => (
  <div className="border p-4 rounded shadow-sm animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
      </div>
      <div className="h-6 w-16 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="h-7 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <ListSkeleton key={i} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="h-7 bg-gray-200 rounded w-40"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <HistoryItemSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
