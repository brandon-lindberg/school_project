'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { TrashIcon } from '@heroicons/react/24/outline';

type BrowsingHistoryItem = {
  history_id: number;
  school_id: number;
  viewed_at: Date;
  school: {
    name_en: string | null;
    name_jp: string | null;
  };
};

type BrowsingHistoryProps = {
  browsingHistory: BrowsingHistoryItem[];
  onClearHistory: () => Promise<void>;
  onDeleteEntry: (historyId: number) => Promise<void>;
};

const BrowsingHistory: React.FC<BrowsingHistoryProps> = ({
  browsingHistory,
  onClearHistory,
  onDeleteEntry,
}) => {
  const { language } = useLanguage();

  const getSchoolName = (school: { name_en: string | null; name_jp: string | null }) => {
    if (language === 'en') {
      return school.name_en || school.name_jp || 'Unnamed School';
    }
    return school.name_jp || school.name_en || '名称未設定の学校';
  };

  if (browsingHistory.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        {language === 'en' ? 'No browsing history.' : '閲覧履歴がありません。'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={onClearHistory}
          className="text-sm px-3 py-1 text-[#D9534F] hover:bg-red-50 rounded-md transition-colors"
        >
          {language === 'en' ? 'Clear All' : 'すべて削除'}
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {browsingHistory.map((entry) => (
          <div
            key={entry.history_id}
            className="py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="space-y-1">
              <Link
                href={`/schools/${entry.school_id}`}
                className="text-[#0057B7] hover:text-[#004494] transition-colors block"
              >
                {getSchoolName(entry.school)}
              </Link>
              <span className="text-sm text-gray-500">
                {new Date(entry.viewed_at).toLocaleDateString(
                  language === 'en' ? 'en-US' : 'ja-JP',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )}
              </span>
            </div>
            <button
              onClick={() => onDeleteEntry(entry.history_id)}
              className="p-2 text-[#D9534F] hover:bg-red-50 rounded-full transition-colors"
              aria-label="Remove from history"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowsingHistory;
