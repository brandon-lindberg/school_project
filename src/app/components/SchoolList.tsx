import React from 'react';
import { School } from '@/types/school';
import SchoolCard from './SchoolCard';
import SchoolCardSkeleton from './SchoolCardSkeleton';
import { getLocalizedContent } from '@/utils/language';
import { Tooltip } from './Tooltip';
import Image from 'next/image';
import { NotificationType } from './NotificationBanner';
import './styles/scrollbar.css';

interface SchoolListProps {
  schools: School[];
  searchQuery?: string;
  isLoading?: boolean;
  loadingCount?: number;
  isDropdown?: boolean;
  onNotification?: (type: NotificationType, message: string) => void;
  language: 'en' | 'jp';
  viewMode: 'list' | 'grid';
}

const SchoolList: React.FC<SchoolListProps> = ({
  schools,
  searchQuery = '',
  isLoading = false,
  loadingCount = 5,
  isDropdown = false,
  onNotification,
  language,
  viewMode,
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
        {schools.map(school => (
          <div
            key={`school-${school.school_id}`}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => (window.location.href = `/schools/${school.school_id}`)}
          >
            <div className="font-medium">{school.name_en}</div>
            {school.name_jp && <div className="text-sm text-gray-500">{school.name_jp}</div>}
          </div>
        ))}
        {isLoading &&
          Array.from({ length: loadingCount }).map((_, index) => (
            <div key={`skeleton-${schools.length + index}`} className="px-4 py-2">
              <SchoolCardSkeleton />
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {viewMode === 'grid' ? (
        <div className="w-full bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-[30px_minmax(200px,_1fr)_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 max-h-[calc(100vh-200px)]">
            {/* Header - Fixed at top */}
            <div className="col-span-full grid grid-cols-[30px_minmax(200px,_1fr)_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 bg-gray-50 font-semibold text-sm sticky top-0 z-10">
              <div></div>
              <div>{getLocalizedContent('Name', '名前', language)}</div>
              <div>{getLocalizedContent('Description', '説明', language)}</div>
              <div>{getLocalizedContent('Location', '場所', language)}</div>
              <div>{getLocalizedContent('Tuition', '学費', language)}</div>
              <div>{getLocalizedContent('Student Lang.', '生徒の語学要件', language)}</div>
              <div>{getLocalizedContent('Parent Lang.', '保護者の語学要件', language)}</div>
              <div>{getLocalizedContent('Age', '年齢', language)}</div>
              <div>{getLocalizedContent('Curriculum', 'カリキュラム', language)}</div>
            </div>

            {/* Scrollable content */}
            <div className="col-span-full divide-y divide-gray-200 max-h-[600px] overflow-y-auto scrollbar">
              {schools.map((school, index) => (
                <div
                  key={`school-${school.school_id}`}
                  className={`col-span-full grid grid-cols-[30px_minmax(200px,_1fr)_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                  onClick={() => (window.location.href = `/schools/${school.school_id}`)}
                >
                  <div className="flex items-center">
                    <Image
                      src={school.logo_id ? `/logos/${school.logo_id}.png` : '/logo.png'}
                      alt="Logo"
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                  </div>
                  <Tooltip
                    content={getLocalizedContent(school.name_en, school.name_jp, language)}
                    className="whitespace-normal"
                  >
                    {getLocalizedContent(school.name_en, school.name_jp, language)}
                  </Tooltip>
                  {/* Description */}
                  {getLocalizedContent(school.description_en, school.description_jp, language) ? (
                    <Tooltip
                      content={getLocalizedContent(
                        school.description_en,
                        school.description_jp,
                        language
                      )}
                      className="truncate"
                    >
                      {getLocalizedContent(school.description_en, school.description_jp, language)}
                    </Tooltip>
                  ) : (
                    <div className="truncate text-gray-400">
                      {language === 'en' ? 'N/A' : '未定'}
                    </div>
                  )}
                  {/* Location */}
                  {getLocalizedContent(school.location_en, school.location_jp, language) ? (
                    <Tooltip
                      content={getLocalizedContent(
                        school.location_en,
                        school.location_jp,
                        language
                      )}
                      className="truncate"
                    >
                      {getLocalizedContent(school.location_en, school.location_jp, language)}
                    </Tooltip>
                  ) : (
                    <div className="truncate text-gray-400">
                      {language === 'en' ? 'N/A' : '未定'}
                    </div>
                  )}
                  {/* Tuition */}
                  {getLocalizedContent(
                    school.admissions_fees_en,
                    school.admissions_fees_jp,
                    language
                  ) ? (
                    <Tooltip
                      content={getLocalizedContent(
                        school.admissions_fees_en,
                        school.admissions_fees_jp,
                        language
                      )}
                      className="truncate"
                    >
                      {getLocalizedContent(
                        school.admissions_fees_en,
                        school.admissions_fees_jp,
                        language
                      )}
                    </Tooltip>
                  ) : (
                    <div className="truncate text-gray-400">
                      {language === 'en' ? 'N/A' : '未定'}
                    </div>
                  )}
                  {/* Student Language Requirements */}
                  {getLocalizedContent(
                    school.admissions_language_requirements_students_en,
                    school.admissions_language_requirements_students_jp,
                    language
                  ) ? (
                    <Tooltip
                      content={getLocalizedContent(
                        school.admissions_language_requirements_students_en,
                        school.admissions_language_requirements_students_jp,
                        language
                      )}
                      className="truncate"
                    >
                      {getLocalizedContent(
                        school.admissions_language_requirements_students_en,
                        school.admissions_language_requirements_students_jp,
                        language
                      )}
                    </Tooltip>
                  ) : (
                    <div className="truncate text-gray-400">
                      {language === 'en' ? 'N/A' : '未定'}
                    </div>
                  )}
                  {/* Parent Language Requirements */}
                  {getLocalizedContent(
                    school.admissions_language_requirements_parents_en,
                    school.admissions_language_requirements_parents_jp,
                    language
                  ) ? (
                    <Tooltip
                      content={getLocalizedContent(
                        school.admissions_language_requirements_parents_en,
                        school.admissions_language_requirements_parents_jp,
                        language
                      )}
                      className="truncate"
                    >
                      {getLocalizedContent(
                        school.admissions_language_requirements_parents_en,
                        school.admissions_language_requirements_parents_jp,
                        language
                      )}
                    </Tooltip>
                  ) : (
                    <div className="truncate text-gray-400">
                      {language === 'en' ? 'N/A' : '未定'}
                    </div>
                  )}
                  {/* Age Requirements */}
                  {getLocalizedContent(
                    school.admissions_age_requirements_en,
                    school.admissions_age_requirements_jp,
                    language
                  ) ? (
                    <Tooltip
                      content={getLocalizedContent(
                        school.admissions_age_requirements_en,
                        school.admissions_age_requirements_jp,
                        language
                      )}
                      className="truncate"
                    >
                      {getLocalizedContent(
                        school.admissions_age_requirements_en,
                        school.admissions_age_requirements_jp,
                        language
                      )}
                    </Tooltip>
                  ) : (
                    <div className="truncate text-gray-400">
                      {language === 'en' ? 'N/A' : '未定'}
                    </div>
                  )}
                  {/* Curriculum */}
                  {getLocalizedContent(school.curriculum_en, school.curriculum_jp, language) ? (
                    <Tooltip
                      content={getLocalizedContent(
                        school.curriculum_en,
                        school.curriculum_jp,
                        language
                      )}
                      className="truncate"
                    >
                      {getLocalizedContent(school.curriculum_en, school.curriculum_jp, language)}
                    </Tooltip>
                  ) : (
                    <div className="truncate text-gray-400">
                      {language === 'en' ? 'N/A' : '未定'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile view - horizontal scrolling */}
          <div className="sm:hidden">
            <div className="flex overflow-x-auto space-x-4 p-4 scrollbar">
              {schools.map(school => (
                <div key={`school-${school.school_id}`} className="flex-shrink-0 w-[280px]">
                  <SchoolCard
                    school={school}
                    searchQuery={searchQuery}
                    onNotification={onNotification}
                  />
                </div>
              ))}
              {isLoading &&
                Array.from({ length: loadingCount }).map((_, index) => (
                  <div
                    key={`skeleton-${schools.length + index}`}
                    className="flex-shrink-0 w-[280px]"
                  >
                    <SchoolCardSkeleton />
                  </div>
                ))}
            </div>
          </div>

          {/* Desktop view - vertical grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {schools.map(school => (
              <div key={`school-${school.school_id}`}>
                <SchoolCard
                  school={school}
                  searchQuery={searchQuery}
                  onNotification={onNotification}
                />
              </div>
            ))}
            {isLoading &&
              Array.from({ length: loadingCount }).map((_, index) => (
                <div key={`skeleton-${schools.length + index}`}>
                  <SchoolCardSkeleton />
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SchoolList;
