'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { School } from '@/types/school';
import { useSession } from 'next-auth/react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedContent } from '@/utils/language';
import { useListStatus } from '../contexts/ListStatusContext';
import { Tooltip } from './Tooltip';
import type { Session } from 'next-auth';

interface SchoolCardProps {
  school: School;
  searchQuery?: string;
  onNotification?: (type: 'success' | 'error', message: string) => void;
  userId?: number | null;
  isFeatured?: boolean;
}

interface ManagedSchool {
  school_id: string;
}

type SessionUserManaged = Session['user'] & {
  managedSchools?: ManagedSchool[];
};

const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  searchQuery = '',
  onNotification,
  userId,
  isFeatured = false,
}) => {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const { listStatuses, updateListStatus } = useListStatus();
  const listStatus = listStatuses[school.school_id];
  const isInList = listStatus?.isInList || false;
  const listId = listStatus?.listId || null;
  const user = session?.user as SessionUserManaged;

  // Function to highlight search query in text
  const highlightText = (text: string | undefined, query: string) => {
    if (!text || !query) return text || '';

    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} className="bg-yellow-200">
              {part}
            </span>
          ) : (
            <React.Fragment key={index}>{part}</React.Fragment>
          )
        )}
      </>
    );
  };

  // Utility to escape special characters in the query
  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Get localized content
  const description = getLocalizedContent(school.description_en, school.description_jp, language);
  const url = getLocalizedContent(school.url_en, school.url_jp, language);

  // Resolve image URL: use external URL if provided, else fall back to existing logic
  const bannerSrc = school.image_url
    ? school.image_url
    : school.image_id
      ? school.image_id.startsWith('http')
        ? school.image_id
        : `/logos/${school.image_id}.png`
      : 'https://media.istockphoto.com/id/1654230729/ja/%E3%82%B9%E3%83%88%E3%83%83%E3%82%AF%E3%83%95%E3%82%A9%E3%83%88/%E6%97%A5%E6%9C%AC%E3%81%AE%E9%AB%98%E6%A0%A1%E3%81%AE%E3%83%95%E3%82%A1%E3%82%B5%E3%83%BC%E3%83%89%E3%81%AE%E5%BB%BA%E7%89%A9-%E6%BC%AB%E7%94%BB%E3%81%A7%E8%A6%8B%E3%81%88%E3%82%8B%E4%BC%9D%E7%B5%B1%E7%9A%84%E3%81%AA%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB.jpg?s=612x612&w=0&k=20&c=5fOeZO7_Stdrui-zCVAQ5RAxxgIjHpg9ZFPLEC9Q-2s=';
  // Resolve logo URL: use external URL if provided, else fall back to existing logic
  const logoSrc = school.logo_url
    ? school.logo_url
    : school.logo_id
      ? school.logo_id.startsWith('http')
        ? school.logo_id
        : `/logos/${school.logo_id}.png`
      : '/logo.png';

  const handleToggleList = async (e: React.MouseEvent) => {
    e.preventDefault();
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
        language === 'en' ? 'Failed to update your school list' : '学校リストの更新に失敗しました'
      );
    }
  };

  return (
    <div className="border rounded-lg shadow-md flex flex-col w-full relative overflow-hidden bg-white hover:shadow-lg transition-shadow h-[24rem]">
      {/* Image */}
      <div className="w-full h-36 relative">
        <Image
          src={bannerSrc}
          alt={getLocalizedContent(school.name_en, school.name_jp, language) || 'School image'}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Content section */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          {/* Logo and title container */}
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-10 h-10 relative">
              <Image
                src={logoSrc}
                alt="Logo"
                fill
                className="rounded-full object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/schools/${school.school_id}`} className="block hover:text-blue-600">
                <h3 className="font-bold text-gray-900 text-xs leading-5 line-clamp-2 cursor-pointer">
                  {highlightText(
                    getLocalizedContent(school.name_en, school.name_jp, language) || '',
                    searchQuery
                  )}
                </h3>
              </Link>
              <p className="text-gray-500 text-xs">
                {highlightText(
                  getLocalizedContent(school.location_en, school.location_jp, language) || '',
                  searchQuery
                )}
              </p>
            </div>
          </div>

          {/* Description */}
          {description && (
            <Tooltip content={description}>
              <p className="text-gray-600 text-xs leading-4 line-clamp-2 cursor-help">
                {highlightText(description, searchQuery)}
              </p>
            </Tooltip>
          )}

          {/* Requirements Info */}
          <div className="flex flex-col gap-1">
            <Tooltip content={
              school.admissions_language_requirements_students_en
                ? getLocalizedContent(
                  school.admissions_language_requirements_students_en,
                  school.admissions_language_requirements_students_jp,
                  language
                )
                : language === 'en'
                  ? 'N/A'
                  : '未定'
            }>
              <p className="text-gray-600 text-xs leading-4 truncate">
                <span className="font-medium">
                  {language === 'en' ? 'Student Language Requirements:' : '生徒の語学要件：'}
                </span>{' '}
                {highlightText(
                  school.admissions_language_requirements_students_en
                    ? getLocalizedContent(
                      school.admissions_language_requirements_students_en,
                      school.admissions_language_requirements_students_jp,
                      language
                    ) || ''
                    : language === 'en'
                      ? 'N/A'
                      : '未定',
                  searchQuery
                )}
              </p>
            </Tooltip>

            <Tooltip content={
              school.admissions_language_requirements_parents_en
                ? getLocalizedContent(
                  school.admissions_language_requirements_parents_en,
                  school.admissions_language_requirements_parents_jp,
                  language
                )
                : language === 'en'
                  ? 'N/A'
                  : '未定'
            }>
              <p className="text-gray-600 text-xs leading-4 truncate">
                <span className="font-medium">
                  {language === 'en' ? 'Parent Language Requirements:' : '保護者の語学要件：'}
                </span>{' '}
                {highlightText(
                  school.admissions_language_requirements_parents_en
                    ? getLocalizedContent(
                      school.admissions_language_requirements_parents_en,
                      school.admissions_language_requirements_parents_jp,
                      language
                    ) || ''
                    : language === 'en'
                      ? 'N/A'
                      : '未定',
                  searchQuery
                )}
              </p>
            </Tooltip>

            <Tooltip content={
              school.admissions_age_requirements_en
                ? getLocalizedContent(
                  school.admissions_age_requirements_en,
                  school.admissions_age_requirements_jp,
                  language
                )
                : language === 'en'
                  ? 'N/A'
                  : '未定'
            }>
              <p className="text-gray-600 text-xs leading-4 truncate">
                <span className="font-medium">
                  {language === 'en' ? 'Age Requirements:' : '年齢要件：'}
                </span>{' '}
                {highlightText(
                  school.admissions_age_requirements_en
                    ? getLocalizedContent(
                      school.admissions_age_requirements_en,
                      school.admissions_age_requirements_jp,
                      language
                    ) || ''
                    : language === 'en'
                      ? 'N/A'
                      : '未定',
                  searchQuery
                )}
              </p>
            </Tooltip>
          </div>
        </div>

        {/* Footer actions - fixed at bottom */}
        <div className="p-4 flex justify-between items-center border-t bg-white mt-auto">
          {/* Contact Info */}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              {language === 'en' ? 'Visit Website' : 'ウェブサイト'}
            </a>
          )}
          {/* List & Edit Actions */}
          <div className="flex items-center gap-2">
            {session && !isFeatured && (
              <Tooltip
                content={
                  isInList
                    ? language === 'en'
                      ? 'In List'
                      : 'リスト済み'
                    : language === 'en'
                      ? 'Add to List'
                      : 'リストに追加'
                }
              >
                <button
                  onClick={handleToggleList}
                  className={`${isInList ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
                    } text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer`}
                >
                  <span className="text-lg cursor-pointer">{isInList ? '✓' : '+'}</span>
                </button>
              </Tooltip>
            )}
            {session?.user?.role === 'SUPER_ADMIN' ||
              (session?.user?.role === 'SCHOOL_ADMIN' &&
                user.managedSchools?.some(ms => ms.school_id === school.school_id)) ? (
              <Link
                href={`/admin/schools/${school.school_id}`}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-xs"
              >
                Edit
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;
