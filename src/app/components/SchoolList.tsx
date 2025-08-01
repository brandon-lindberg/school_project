import React, { useState } from 'react';
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
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { Session } from 'next-auth';

type SortField = 'location' | 'studentLang' | 'parentLang' | 'age' | 'list';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

interface SchoolListProps {
  schools: School[];
  searchQuery?: string;
  isLoading?: boolean;
  loadingCount?: number;
  onNotification?: (type: NotificationType, message: string) => void;
  language: 'en' | 'jp';
  viewMode: 'list' | 'grid';
}

interface ManagedSchool {
  school_id: string;
}

type SessionUserManaged = Session['user'] & {
  managedSchools?: ManagedSchool[];
};

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
  const [sortState, setSortState] = useState<SortState>({ field: null, direction: null });
  const user = session?.user as SessionUserManaged;

  const handleSort = (field: SortField) => {
    setSortState(prev => ({
      field,
      direction:
        prev.field === field
          ? prev.direction === 'asc'
            ? 'desc'
            : prev.direction === 'desc'
              ? null
              : 'asc'
          : 'asc',
    }));
  };

  const getSortedSchools = () => {
    if (!sortState.field || !sortState.direction) return schools;

    return [...schools].sort((a, b) => {
      if (sortState.field === 'list') {
        const compareA = !!listStatuses[a.school_id]?.isInList;
        const compareB = !!listStatuses[b.school_id]?.isInList;
        return sortState.direction === 'asc'
          ? Number(compareA) - Number(compareB)
          : Number(compareB) - Number(compareA);
      }

      let compareA = '';
      let compareB = '';

      switch (sortState.field) {
        case 'location': {
          const aContent = getLocalizedContent(a.location_en || '', a.location_jp || '', language);
          const bContent = getLocalizedContent(b.location_en || '', b.location_jp || '', language);
          compareA = String(aContent || '');
          compareB = String(bContent || '');
          break;
        }
        case 'studentLang': {
          const aContent = getLocalizedContent(
            a.admissions_language_requirements_students_en || '',
            a.admissions_language_requirements_students_jp || '',
            language
          );
          const bContent = getLocalizedContent(
            b.admissions_language_requirements_students_en || '',
            b.admissions_language_requirements_students_jp || '',
            language
          );
          compareA = String(aContent || '');
          compareB = String(bContent || '');
          break;
        }
        case 'parentLang': {
          const aContent = getLocalizedContent(
            a.admissions_language_requirements_parents_en || '',
            a.admissions_language_requirements_parents_jp || '',
            language
          );
          const bContent = getLocalizedContent(
            b.admissions_language_requirements_parents_en || '',
            b.admissions_language_requirements_parents_jp || '',
            language
          );
          compareA = String(aContent || '');
          compareB = String(bContent || '');
          break;
        }
        case 'age': {
          const aContent = getLocalizedContent(
            a.admissions_age_requirements_en || '',
            a.admissions_age_requirements_jp || '',
            language
          );
          const bContent = getLocalizedContent(
            b.admissions_age_requirements_en || '',
            b.admissions_age_requirements_jp || '',
            language
          );
          compareA = String(aContent || '');
          compareB = String(bContent || '');
          break;
        }
      }

      return sortState.direction === 'asc'
        ? compareA.localeCompare(compareB)
        : compareB.localeCompare(compareA);
    });
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <div className="flex items-center gap-1 cursor-pointer group" onClick={() => handleSort(field)}>
      <span>{label}</span>
      <div className="flex flex-col">
        <ChevronUpIcon
          className={`h-3 w-3 ${sortState.field === field && sortState.direction === 'asc'
            ? 'text-blue-500'
            : 'text-gray-300 group-hover:text-gray-400'
            }`}
        />
        <ChevronDownIcon
          className={`h-3 w-3 -mt-1 ${sortState.field === field && sortState.direction === 'desc'
            ? 'text-blue-500'
            : 'text-gray-300 group-hover:text-gray-400'
            }`}
        />
      </div>
    </div>
  );

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
        <div className="w-full bg-neutral-50 rounded-md">
          <div className="grid grid-cols-[30px_minmax(200px,_1fr)_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 max-h-[calc(100vh-200px)]">
            {/* Header - Fixed at top */}
            <div className="col-span-full grid grid-cols-[30px_minmax(200px,_1fr)_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-neutral-100 font-semibold text-sm sticky top-0 z-10">
              <div></div>
              <div>{getLocalizedContent('Name', '名前', language)}</div>
              <div>{getLocalizedContent('Description', '説明', language)}</div>
              <SortHeader
                field="location"
                label={getLocalizedContent('Location', '場所', language) || ''}
              />
              <div>{getLocalizedContent('Tuition', '学費', language)}</div>
              <SortHeader
                field="studentLang"
                label={getLocalizedContent('Student Lang.', '生徒の語学要件', language) || ''}
              />
              <SortHeader
                field="parentLang"
                label={getLocalizedContent('Parent Lang.', '保護者の語学要件', language) || ''}
              />
              <SortHeader field="age" label={getLocalizedContent('Age', '年齢', language) || ''} />
              <div>{getLocalizedContent('Curriculum', 'カリキュラム', language)}</div>
              <SortHeader field="list" label="" />
            </div>

            {/* Scrollable content */}
            <div className="col-span-full divide-y divide-neutral-200 max-h-[600px] overflow-y-auto scrollbar">
              {getSortedSchools().map((school, index) => (
                <div
                  key={`school-${school.school_id}`}
                  className={`col-span-full grid grid-cols-[30px_minmax(200px,_1fr)_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 cursor-pointer hover:bg-neutral-100 relative ${index % 2 === 0 ? 'bg-neutral-50' : 'bg-neutral-100'
                    }`}
                >
                  <Link href={`/schools/${school.school_id}`} className="contents">
                    <div className="flex items-center">
                      {(school.logo_url || (school.logo_id && school.logo_id.startsWith('http'))) ? (
                        <Image
                          src={(school.logo_url || school.logo_id)!}
                          alt="Logo"
                          width={30}
                          height={30}
                          className="rounded-full"
                          unoptimized
                        />
                      ) : (
                        <Image
                          src={school.logo_id ? `/logos/${school.logo_id}.png` : '/logo.png'}
                          alt="Logo"
                          width={30}
                          height={30}
                          className="rounded-full"
                          unoptimized
                        />
                      )}
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
                        {getLocalizedContent(
                          school.description_en,
                          school.description_jp,
                          language
                        )}
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
                          {getLocalizedContent(
                            school.curriculum_en,
                            school.curriculum_jp,
                            language
                          )}
                        </Tooltip>
                      ) : (
                        <div className="truncate text-gray-400">
                          {language === 'en' ? 'N/A' : '未定'}
                        </div>
                      )}
                    </div>
                  </Link>
                  {/* List & Edit Actions Column */}
                  <div className="flex items-center justify-center gap-2">
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
                            ? 'bg-secondary hover:bg-secondary/90'
                            : 'bg-primary hover:bg-primary/90'
                            } text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors`}
                        >
                          <span className="text-xs">
                            {listStatuses[school.school_id]?.isInList ? '✓' : '+'}
                          </span>
                        </button>
                      </Tooltip>
                    )}
                    {(user?.role === 'SUPER_ADMIN' ||
                      (user?.role === 'SCHOOL_ADMIN' &&
                        user.managedSchools?.some(ms => ms.school_id === school.school_id)
                      )
                    ) && (
                        <Tooltip
                          content={
                            user.role === 'SUPER_ADMIN'
                              ? 'Edit School'
                              : language === 'en'
                                ? 'Edit Your School'
                                : '学校を編集'
                          }
                        >
                          <Link
                            href={`/admin/schools/${school.school_id}`}
                            className="bg-secondary hover:bg-secondary/90 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                          >
                            <span className="text-xs">✎</span>
                          </Link>
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
                    isFeatured={false}
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
                  isFeatured={false}
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
