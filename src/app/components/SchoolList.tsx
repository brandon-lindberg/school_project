import React from 'react';
import SchoolCard from './SchoolCard';
import SchoolCardSkeleton from './SchoolCardSkeleton';
import { School } from '../../interfaces/School';
import { NotificationType } from './NotificationBanner';
import './styles/scrollbar.css';
import { getLocalizedContent } from '@/utils/language';

interface SchoolListProps {
  schools: School[];
  searchQuery?: string;
  isLoading?: boolean;
  loadingCount?: number;
  isDropdown?: boolean;
  onNotification?: (type: NotificationType, message: string) => void;
  language: 'en' | 'jp';
}

const SchoolList: React.FC<SchoolListProps> = ({
  schools,
  searchQuery = '',
  isLoading = false,
  loadingCount = 5,
  isDropdown = false,
  onNotification,
  language
}) => {
  if (!schools || schools.length === 0) {
    return (
      <p className="p-4">
        {getLocalizedContent('No schools found.', '学校が見つかりませんでした。', language)}
      </p>
    );
  }

  if (isDropdown) {
    return (
      <div className="py-1">
        {schools.map((school) => (
          <div
            key={`school-${school.school_id}`}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => window.location.href = `/schools/${school.school_id}`}
          >
            <div className="font-medium">{school.name_en}</div>
            {school.name_jp && (
              <div className="text-sm text-gray-500">{school.name_jp}</div>
            )}
          </div>
        ))}
        {isLoading && Array.from({ length: loadingCount }).map((_, index) => (
          <div key={`skeleton-${schools.length + index}`} className="px-4 py-2">
            <SchoolCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto space-x-4 p-4 scrollbar">
      {schools.map((school) => (
        <div key={`school-${school.school_id}`} className="flex-shrink-0">
          <SchoolCard
            school={school}
            searchQuery={searchQuery}
            onNotification={onNotification}
          />
        </div>
      ))}
      {isLoading && Array.from({ length: loadingCount }).map((_, index) => (
        <div key={`skeleton-${schools.length + index}`} className="flex-shrink-0">
          <SchoolCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export default SchoolList;
