'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { School } from '@/types/school';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedContent } from '@/utils/language';
import { useListStatus } from '../contexts/ListStatusContext';
import { Tooltip } from './Tooltip';

interface SchoolCardProps {
  school: School;
  searchQuery?: string;
  onNotification?: (type: 'success' | 'error', message: string) => void;
  userId?: number | null;
  isFeatured?: boolean;
}

const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  searchQuery = '',
  onNotification,
  userId,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { language } = useLanguage();
  const { listStatuses, updateListStatus } = useListStatus();
  const listStatus = listStatuses[school.school_id];
  const isInList = listStatus?.isInList || false;
  const listId = listStatus?.listId || null;

  const handleCardClick = () => {
    router.push(`/schools/${school.school_id}`);
  };

  const handleToggleList = async (e: React.MouseEvent) => {
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
        language === 'en'
          ? 'Failed to update your list. Please try again.'
          : 'リストの更新に失敗しました。もう一度お試しください。'
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  // Function to highlight search query in text
  const highlightText = (text: string, query: string) => {
    if (!query) return text;

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

  return (
    <div
      onClick={handleCardClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      className="border rounded-lg shadow-md flex flex-col w-full relative overflow-hidden bg-white hover:shadow-lg transition-shadow h-[26rem]"
    >
      {/* Image */}
      <div className="w-full h-36 relative">
        <Image
          src={
            school.image_id
              ? `/logos/${school.image_id}.png`
              : 'https://media.istockphoto.com/id/1654230729/ja/%E3%82%B9%E3%83%88%E3%83%83%E3%82%AF%E3%83%95%E3%82%A9%E3%83%88/%E6%97%A5%E6%9C%AC%E3%81%AE%E9%AB%98%E6%A0%A1%E3%81%AE%E3%83%95%E3%82%A1%E3%82%B5%E3%83%BC%E3%83%89%E3%81%AE%E5%BB%BA%E7%89%A9-%E6%BC%AB%E7%94%BB%E3%81%A7%E8%A6%8B%E3%81%88%E3%82%8B%E4%BC%9D%E7%B5%B1%E7%9A%84%E3%81%AA%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB.jpg?s=612x612&w=0&k=20&c=5fOeZO7_Stdrui-zCVAQ5RAxxgIjHpg9ZFPLEC9Q-2s='
          }
          alt={getLocalizedContent(school.name_en, school.name_jp, language) || 'School image'}
          fill
          className="object-cover"
        />
      </div>

      {/* Content container */}
      <div className="p-4 flex-1 flex flex-col space-y-3">
        {/* Logo and title container */}
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0">
            <Image
              src={school.logo_id ? `/logos/${school.logo_id}.png` : '/logo.png'}
              alt="Logo"
              width={20}
              height={20}
              className="rounded-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 text-xs leading-5 line-clamp-2">
              {highlightText(
                getLocalizedContent(school.name_en, school.name_jp, language) || '',
                searchQuery
              )}
            </h3>
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
        <div className="space-y-1">
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
        </div>

        {/* Contact Info */}
        <div className="absolute bottom-4 left-4">
          {url && (
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-xs"
              onClick={e => e.stopPropagation()}
            >
              {language === 'en' ? 'Visit Website' : 'ウェブサイトを見る'}
            </Link>
          )}
        </div>

        {session && (
          <button
            onClick={handleToggleList}
            className={`${isInList ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
              } text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full flex items-center justify-center absolute bottom-4 right-4 shadow-md transition-colors gap-1 sm:gap-2`}
            title={
              isInList
                ? language === 'en'
                  ? 'Remove from My Schools'
                  : '私の学校から削除'
                : language === 'en'
                  ? 'Add to My Schools'
                  : '私の学校に追加'
            }
          >
            <span className="text-lg sm:text-xl">{isInList ? '✓' : '+'}</span>
            <span className="text-xs sm:text-sm whitespace-nowrap">
              {isInList
                ? language === 'en'
                  ? 'In List'
                  : 'リスト済み'
                : language === 'en'
                  ? 'Add to List'
                  : 'リストに追加'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SchoolCard;
