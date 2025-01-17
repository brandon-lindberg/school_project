'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { School } from '../../interfaces/School';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedContent } from '@/utils/language';

interface SchoolCardProps {
  school: School;
  searchQuery?: string;
  onNotification?: (type: 'success' | 'error', message: string) => void;
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school, searchQuery = '', onNotification }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { language } = useLanguage();

  const handleCardClick = () => {
    router.push(`/schools/${school.school_id}`);
  };

  const handleAddToList = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const userResponse = await fetch('/api/user');
      const userData = await userResponse.json();

      if (!userData.userId) {
        onNotification?.(
          'error',
          language === 'en'
            ? 'Please log in to add schools to your list'
            : 'リストに学校を追加するにはログインしてください'
        );
        return;
      }

      const response = await fetch('/api/userLists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.userId,
          schoolId: school.school_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add school to list');
      }

      onNotification?.(
        'success',
        language === 'en' ? 'School added to your list!' : '学校がリストに追加されました！'
      );
    } catch (error) {
      console.error('Error adding school to list:', error);
      onNotification?.(
        'error',
        language === 'en'
          ? 'Failed to add school to list. Please try again.'
          : '学校をリストに追加できませんでした。もう一度お試しください。'
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
  const name = getLocalizedContent(school.name_en, school.name_jp, language);
  const description = getLocalizedContent(school.description_en, school.description_jp, language);
  const location = getLocalizedContent(school.location_en, school.location_jp, language);
  const email = getLocalizedContent(school.email_en, school.email_jp, language);
  const phone = getLocalizedContent(school.phone_en, school.phone_jp, language);
  const url = getLocalizedContent(school.url_en, school.url_jp, language);

  return (
    <div
      className="border rounded-lg shadow-md flex flex-col cursor-pointer hover:shadow-lg transition-shadow w-full max-w-xs sm:max-w-sm md:max-w-md relative overflow-hidden"
      style={{ height: '66.67vh', maxHeight: '32.125rem' }}
      onClick={handleCardClick}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-pressed="false"
    >
      <Image
        src={
          school.logo_id
            ? `/logos/${school.logo_id}.png`
            : 'https://media.istockphoto.com/id/1654230729/ja/%E3%82%B9%E3%83%88%E3%83%83%E3%82%AF%E3%83%95%E3%82%A9%E3%83%88/%E6%97%A5%E6%9C%AC%E3%81%AE%E9%AB%98%E6%A0%A1%E3%81%AE%E3%83%95%E3%82%A1%E3%82%B5%E3%83%BC%E3%83%89%E3%81%AE%E5%BB%BA%E7%89%A9-%E6%BC%AB%E7%94%BB%E3%81%A7%E8%A6%8B%E3%81%88%E3%82%8B%E4%BC%9D%E7%B5%B1%E7%9A%84%E3%81%AA%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB.jpg?s=612x612&w=0&k=20&c=5fOeZO7_Stdrui-zCVAQ5RAxxgIjHpg9ZFPLEC9Q-2s='
        }
        alt={`${name || 'School'} Image`}
        width={612}
        height={408}
        className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-t-lg"
      />
      <div className="relative p-4 flex flex-col flex-grow overflow-y-auto">
        <div className="flex items-center mb-2">
          <Image
            src={school.logo_id ? `/logos/${school.logo_id}.png` : '/logo.png'}
            alt="Logo"
            width={32}
            height={32}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 flex-shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold truncate">
              {highlightText(
                name || (language === 'en' ? 'Unnamed School' : '名称未設定の学校'),
                searchQuery
              )}
            </h2>
            {school.name_en && school.name_jp && language === 'jp' && (
              <h3 className="text-sm sm:text-base text-gray-600 truncate">
                {highlightText(school.name_en, searchQuery)}
              </h3>
            )}
            {school.name_en && school.name_jp && language === 'en' && (
              <h3 className="text-sm sm:text-base text-gray-600 truncate">
                {highlightText(school.name_jp, searchQuery)}
              </h3>
            )}
          </div>
        </div>

        <p className="text-gray-600 mb-4 text-sm sm:text-base line-clamp-3">
          {highlightText(
            description || (language === 'en' ? 'No description available.' : '説明がありません。'),
            searchQuery
          )}
        </p>

        {location && (
          <p className="text-gray-600 mb-2 text-sm truncate">
            <span className="font-medium">{language === 'en' ? 'Location:' : '場所：'}</span>{' '}
            {highlightText(location || '', searchQuery)}
          </p>
        )}

        <p className="text-gray-600 mb-2 text-sm truncate">
          <span className="font-medium">{language === 'en' ? 'Tuition:' : '学費：'}</span>{' '}
          {highlightText(
            school.admissions_fees_en
              ? getLocalizedContent(school.admissions_fees_en, school.admissions_fees_jp, language) || ''
              : language === 'en' ? 'N/A' : '未定',
            searchQuery
          )}
        </p>

        <p className="text-gray-600 mb-2 text-sm truncate">
          <span className="font-medium">{language === 'en' ? 'Student Language Requirements:' : '生徒の語学要件：'}</span>{' '}
          {highlightText(
            school.admissions_language_requirements_students_en
              ? getLocalizedContent(
                school.admissions_language_requirements_students_en,
                school.admissions_language_requirements_students_jp,
                language
              ) || ''
              : language === 'en' ? 'N/A' : '未定',
            searchQuery
          )}
        </p>

        <p className="text-gray-600 mb-2 text-sm truncate">
          <span className="font-medium">{language === 'en' ? 'Parent Language Requirements:' : '保護者の語学要件：'}</span>{' '}
          {highlightText(
            school.admissions_language_requirements_parents_en
              ? getLocalizedContent(
                school.admissions_language_requirements_parents_en,
                school.admissions_language_requirements_parents_jp,
                language
              ) || ''
              : language === 'en' ? 'N/A' : '未定',
            searchQuery
          )}
        </p>

        <p className="text-gray-600 mb-2 text-sm truncate">
          <span className="font-medium">{language === 'en' ? 'Age Requirements:' : '年齢要件：'}</span>{' '}
          {highlightText(
            school.admissions_age_requirements_en
              ? getLocalizedContent(
                school.admissions_age_requirements_en,
                school.admissions_age_requirements_jp,
                language
              ) || ''
              : language === 'en' ? 'N/A' : '未定',
            searchQuery
          )}
        </p>

        <div className="mt-auto space-y-1">
          {email && (
            <Link
              href={`mailto:${email}`}
              className="text-blue-500 hover:underline block text-sm truncate"
              onClick={e => e.stopPropagation()}
            >
              {email}
            </Link>
          )}
          {phone && (
            <Link
              href={`tel:${phone}`}
              className="text-blue-500 hover:underline block text-sm truncate"
              onClick={e => e.stopPropagation()}
            >
              {phone}
            </Link>
          )}
          {url && (
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline block text-sm truncate"
              onClick={e => e.stopPropagation()}
            >
              {language === 'en' ? 'Visit Website' : 'ウェブサイトを見る'}
            </Link>
          )}
        </div>
        {session && (
          <button
            onClick={handleAddToList}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full flex items-center justify-center absolute bottom-4 right-4 shadow-md transition-colors gap-2"
            title={language === 'en' ? 'Add to My Schools' : '私の学校に追加'}
          >
            <span className="text-xl">+</span>
            <span className="text-sm whitespace-nowrap">
              {language === 'en' ? 'Add to List' : 'リストに追加'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SchoolCard;
