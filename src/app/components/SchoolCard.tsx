'use client';

import React from 'react';
import Link from 'next/link';
import { School } from '../../interfaces/School';
import { useRouter } from 'next/navigation';

interface SchoolCardProps {
  school: School;
  searchQuery?: string;
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school, searchQuery = '' }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/schools/${school.id}`);
  };

  const handleAddToList = async () => {
    try {
      const response = await fetch('/api/userLists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schoolId: school.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to add school to list');
      }

      alert('School added to your list!');
    } catch (error) {
      console.error('Error adding school to list:', error);
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

  return (
    <div
      className="border rounded-lg shadow-md flex flex-col cursor-pointer hover:shadow-lg transition-shadow w-full max-w-xs sm:max-w-sm md:max-w-md"
      style={{ height: '66.67vh', maxHeight: '32.125rem' }}
      onClick={handleCardClick}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-pressed="false"
    >
      <img
        src="https://media.istockphoto.com/id/1654230729/ja/%E3%82%B9%E3%83%88%E3%83%83%E3%82%AF%E3%83%95%E3%82%A9%E3%83%88/%E6%97%A5%E6%9C%AC%E3%81%AE%E9%AB%98%E6%A0%A1%E3%81%AE%E3%83%95%E3%82%A1%E3%82%B5%E3%83%BC%E3%83%89%E3%81%AE%E5%BB%BA%E7%89%A9-%E6%BC%AB%E7%94%BB%E3%81%A7%E8%A6%8B%E3%81%88%E3%82%8B%E4%BC%9D%E7%B5%B1%E7%9A%84%E3%81%AA%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB.jpg?s=612x612&w=0&k=20&c=5fOeZO7_Stdrui-zCVAQ5RAxxgIjHpg9ZFPLEC9Q-2s="
        alt={`${school.name} Image`}
        className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-t-lg"
      />
      <div className="relative p-4 flex flex-col flex-grow">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 flex items-center">
          <img
            src="https://www.cisjapan.net/files/libs/1370/202210271551078360.png?1690767172"
            alt="Logo"
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2"
          />
          {highlightText(school.name, searchQuery)}
        </h2>
        <p className="text-gray-600 mb-4 text-sm sm:text-base flex-grow">
          {highlightText(school.description, searchQuery)}
        </p>
        <div className="mt-auto">
          <Link
            href={`mailto:${school.contactEmail}`}
            className="text-blue-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {school.contactEmail}
          </Link>
          <br />
          <Link
            href={`tel:${school.contactPhone}`}
            className="text-blue-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {school.contactPhone}
          </Link>
          <br />
          <Link
            href={school.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Visit Website
          </Link>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToList();
          }}
          className="bg-green-500 text-white p-2 rounded mt-2 absolute bottom-4 right-4"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default SchoolCard;
