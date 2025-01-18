import React from 'react';
import { School } from '@/types/school';
import SchoolCard from './SchoolCard';
import SchoolCardSkeleton from './SchoolCardSkeleton';
import { getLocalizedContent } from '@/utils/language';
import { Tooltip } from './Tooltip';
import Image from 'next/image';
import { NotificationType } from './NotificationBanner';
import './styles/scrollbar.css';
import { useUser } from '../contexts/UserContext';
import { useSession } from 'next-auth/react';
import { useListStatus } from '../contexts/ListStatusContext';

interface SchoolListProps {
  schools: School[];
  searchQuery?: string;
  isLoading?: boolean;
  loadingCount?: number;
  onNotification?: (type: NotificationType, message: string) => void;
  language: 'en' | 'jp';
  viewMode: 'list' | 'grid';
}

const SchoolList: React.FC<SchoolListProps> = ({
  schools,
  searchQuery = '',
  isLoading = false,
  loadingCount = 5,
  onNotification,
  language,
  viewMode,
}) => {
  const { userId } = useUser();
  const { data: session } = useSession();
  const { listStatuses, updateListStatus } = useListStatus();

  const handleToggleList = async (e: React.MouseEvent, school: School) => {
    e.stopPropagation();

    try {
      if (!userId) {
        onNotification?.(
          'error',
          language === 'en'
            ? 'Please log in to manage your school list'
            : 'リストを管理するにはログインしてください'
        );
        return;
      }

      const listStatus = listStatuses[school.school_id];
      const isInList = listStatus?.isInList || false;
      const listId = listStatus?.listId || null;

      if (isInList && listId) {
        // Remove from list
        const response = await fetch(
          `/api/userLists?listId=${listId}&schoolId=${school.school_id}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to remove school from list');
        }

        updateListStatus(school.school_id, { isInList: false, listId: null });
        onNotification?.(
          'success',
          language === 'en' ? 'School removed from your list!' : '学校がリストから削除されました！'
        );
      } else {
        // Add to list
        const response = await fetch('/api/userLists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            schoolId: school.school_id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add school to list');
        }

        const data = await response.json();
        updateListStatus(school.school_id, { isInList: true, listId: data.userList.list_id });
        onNotification?.(
          'success',
          language === 'en' ? 'School added to your list!' : '学校がリストに追加されました！'
        );
      }
    } catch (error) {
      console.error('Error managing school list:', error);
      onNotification?.(
        'error',
        language === 'en'
          ? 'Failed to update your list. Please try again.'
          : 'リストの更新に失敗しました。もう一度お試しください。'
      );
    }
  };

  if (!schools || schools.length === 0) {
    return (
      <p className="p-4">
        {getLocalizedContent('No schools found.', '学校が見つかりませんでした。', language)}
      </p>
    );
  }

  return (
    <div className="w-full">
      {viewMode === 'grid' ? (
        <div className="w-full bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-[30px_minmax(200px,_1fr)_1fr_1fr_1fr_1fr_1fr_1fr_1fr_50px] gap-4 max-h-[calc(100vh-200px)]">
            {/* Header - Fixed at top */}
            <div className="col-span-full grid grid-cols-[30px_minmax(200px,_1fr)_1fr_1fr_1fr_1fr_1fr_1fr_1fr_50px] gap-4 px-4 py-3 bg-gray-50 font-semibold text-sm sticky top-0 z-10">
              <div></div>
              <div>{getLocalizedContent('Name', '名前', language)}</div>
              <div>{getLocalizedContent('Description', '説明', language)}</div>
              <div>{getLocalizedContent('Location', '場所', language)}</div>
              <div>{getLocalizedContent('Tuition', '学費', language)}</div>
              <div>{getLocalizedContent('Student Lang.', '生徒の語学要件', language)}</div>
              <div>{getLocalizedContent('Parent Lang.', '保護者の語学要件', language)}</div>
              <div>{getLocalizedContent('Age', '年齢', language)}</div>
              <div>{getLocalizedContent('Curriculum', 'カリキュラム', language)}</div>
              <div></div>
            </div>

            {/* Scrollable content */}
            <div className="col-span-full divide-y divide-gray-200 max-h-[600px] overflow-y-auto scrollbar">
              {schools.map((school, index) => (
                <div
                  key={`school-${school.school_id}`}
                  className={`col-span-full grid grid-cols-[30px_minmax(200px,_1fr)_1fr_1fr_1fr_1fr_1fr_1fr_1fr_50px] gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 relative ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
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
                  <div className="truncate">
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
                  {/* List Button Column */}
                  <div className="flex items-center justify-center">
                    {session && (
                      <Tooltip
                        content={
                          listStatuses[school.school_id]?.isInList
                            ? language === 'en'
                              ? 'In List'
                              : 'リスト済み'
                            : language === 'en'
                              ? 'Add to List'
                              : 'リストに追加'
                        }
                      >
                        <button
                          onClick={e => handleToggleList(e, school)}
                          className={`${listStatuses[school.school_id]?.isInList
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-green-500 hover:bg-green-600'
                            } text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors`}
                        >
                          <span className="text-lg">
                            {listStatuses[school.school_id]?.isInList ? '✓' : '+'}
                          </span>
                        </button>
                      </Tooltip>
                    )}
                  </div>
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
                    userId={userId}
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
                  userId={userId}
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
