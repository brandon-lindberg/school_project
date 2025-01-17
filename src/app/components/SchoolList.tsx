import React, { useState } from 'react';
import SchoolCard from './SchoolCard';
import SchoolCardSkeleton from './SchoolCardSkeleton';
import { School } from '../../interfaces/School';
import { NotificationType } from './NotificationBanner';
import './styles/scrollbar.css';
import { getLocalizedContent } from '@/utils/language';
import { BsGrid, BsListUl } from 'react-icons/bs';
import { Tooltip } from './Tooltip';

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
  language,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

  const renderGridView = () => (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[30px_minmax(200px,_1fr)_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 bg-gray-50 font-semibold text-sm">
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
        {/* Rows */}
        <div className="divide-y divide-gray-200">
          {schools.map((school, index) => (
            <div
              key={`school-${school.school_id}`}
              className={`grid grid-cols-[30px_minmax(200px,_1fr)_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              onClick={() => (window.location.href = `/schools/${school.school_id}`)}
            >
              <div className="flex items-center">
                <img
                  src={school.logo_id ? `/logos/${school.logo_id}.png` : '/logo.png'}
                  alt="Logo"
                  className="w-[30px] h-[30px] rounded-full"
                />
              </div>
              <Tooltip content={getLocalizedContent(school.name_en, school.name_jp, language)} className="whitespace-normal">
                {getLocalizedContent(school.name_en, school.name_jp, language)}
              </Tooltip>
              <Tooltip
                content={getLocalizedContent(school.description_en, school.description_jp, language)}
                className="truncate"
              >
                {getLocalizedContent(school.description_en, school.description_jp, language)}
              </Tooltip>
              <Tooltip
                content={getLocalizedContent(school.location_en, school.location_jp, language)}
                className="truncate"
              >
                {getLocalizedContent(school.location_en, school.location_jp, language)}
              </Tooltip>
              <Tooltip
                content={getLocalizedContent(school.admissions_fees_en, school.admissions_fees_jp, language)}
                className="truncate"
              >
                {getLocalizedContent(school.admissions_fees_en, school.admissions_fees_jp, language)}
              </Tooltip>
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
              <Tooltip
                content={getLocalizedContent(school.curriculum_en, school.curriculum_jp, language)}
                className="truncate"
              >
                {getLocalizedContent(school.curriculum_en, school.curriculum_jp, language)}
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4 px-4">
        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {viewMode === 'list' ? (
            <>
              <BsGrid className="w-4 h-4" />
              <span>{getLocalizedContent('Grid View', 'グリッド表示', language)}</span>
            </>
          ) : (
            <>
              <BsListUl className="w-4 h-4" />
              <span>{getLocalizedContent('List View', 'リスト表示', language)}</span>
            </>
          )}
        </button>
      </div>

      {viewMode === 'grid' ? (
        renderGridView()
      ) : (
        <div className="flex overflow-x-auto space-x-4 p-4 scrollbar">
          {schools.map(school => (
            <div key={`school-${school.school_id}`} className="flex-shrink-0">
              <SchoolCard school={school} searchQuery={searchQuery} onNotification={onNotification} />
            </div>
          ))}
          {isLoading &&
            Array.from({ length: loadingCount }).map((_, index) => (
              <div key={`skeleton-${schools.length + index}`} className="flex-shrink-0">
                <SchoolCardSkeleton />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SchoolList;
