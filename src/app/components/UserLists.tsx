'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { TrashIcon } from '@heroicons/react/24/outline';

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

type UserListsProps = {
  userLists: UserList[];
  onDeleteSchool: (listId: number, schoolId: number) => Promise<void>;
};

const UserLists: React.FC<UserListsProps> = ({ userLists, onDeleteSchool }) => {
  const { language } = useLanguage();

  const getSchoolName = (school: { name_en: string | null; name_jp: string | null }) => {
    if (language === 'en') {
      return school.name_en || school.name_jp || 'Unnamed School';
    }
    return school.name_jp || school.name_en || '名称未設定の学校';
  };

  if (userLists.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        {language === 'en' ? 'No lists created yet.' : 'リストがまだ作成されていません。'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {userLists.map(list => (
        <div
          key={list.list_id}
          className="bg-white rounded-lg border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
        >
          <div className="divide-y divide-gray-100">
            {list.schools.map(school => (
              <div
                key={school.school_id}
                className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <Link
                  href={`/schools/${school.school_id}`}
                  className="text-[#0057B7] hover:text-[#004494] transition-colors"
                >
                  {getSchoolName(school.school)}
                </Link>
                <button
                  onClick={() => onDeleteSchool(list.list_id, school.school_id)}
                  className="p-2 text-[#D9534F] hover:bg-red-50 rounded-full transition-colors"
                  aria-label="Remove school from list"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            {list.schools.length === 0 && (
              <div className="px-4 py-3 text-gray-500 text-center">
                {language === 'en' ? 'No schools in this list' : 'このリストに学校がありません'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserLists;
