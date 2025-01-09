'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedContent } from '@/utils/language';

type UserList = {
  list_id: number;
  list_name: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  schools: {
    list_id: number;
    school_id: number;
    created_at: string;
    school: {
      name_en: string | null;
      name_jp: string | null;
    };
  }[];
};

interface UserListsProps {
  userLists: UserList[];
  onDeleteSchool: (listId: number, schoolId: number) => Promise<void>;
}

const UserLists: React.FC<UserListsProps> = ({ userLists, onDeleteSchool }) => {
  const { language } = useLanguage();

  const translations = {
    title: language === 'en' ? 'Your Lists' : 'マイリスト',
    added: language === 'en' ? 'Added' : '追加日',
    remove: language === 'en' ? 'Remove' : '削除',
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 text-center sm:text-left">{translations.title}</h2>
      <ul className="space-y-4">
        {userLists.map((list) => (
          <li key={list.list_id} className="border p-4 rounded shadow-sm">
            <span className="block font-medium">{list.list_name}</span>
            <ul className="mt-2 space-y-2">
              {list.schools.map((school) => (
                <li key={school.school_id} className="flex justify-between items-center">
                  <div>
                    <Link
                      href={`/schools/${school.school_id}`}
                      className="text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {getLocalizedContent(school.school.name_en, school.school.name_jp, language) ||
                        (language === 'en' ? 'Unnamed School' : '名称未設定の学校')}
                    </Link>
                    <span className="text-sm text-gray-500 block">
                      {translations.added} {new Date(school.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteSchool(list.list_id, school.school_id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    {translations.remove}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default UserLists;
