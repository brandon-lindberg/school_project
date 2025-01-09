'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedContent } from '@/utils/language';

type BrowsingHistory = {
  history_id: number;
  school_id: number;
  viewed_at: Date;
  school: {
    name_en: string;
    name_jp: string;
  };
};

interface BrowsingHistoryProps {
  browsingHistory: BrowsingHistory[];
  onClearHistory: () => Promise<void>;
  onDeleteEntry: (historyId: number) => Promise<void>;
}

const BrowsingHistory: React.FC<BrowsingHistoryProps> = ({
  browsingHistory,
  onClearHistory,
  onDeleteEntry,
}) => {
  const { language } = useLanguage();

  const translations = {
    title: language === 'en' ? 'Browsing History' : '閲覧履歴',
    clearAll: language === 'en' ? 'Clear All' : 'すべてクリア',
    noHistory: language === 'en' ? 'No browsing history' : '閲覧履歴がありません',
    remove: language === 'en' ? 'Remove' : '削除',
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{translations.title}</h2>
        {browsingHistory.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-sm text-red-500 hover:text-red-700"
          >
            {translations.clearAll}
          </button>
        )}
      </div>
      {browsingHistory.length === 0 ? (
        <p className="text-gray-500 text-center">{translations.noHistory}</p>
      ) : (
        <ul className="space-y-4">
          {browsingHistory.map((entry) => (
            <li key={entry.history_id} className="border p-4 rounded shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/schools/${entry.school_id}`}
                    className="text-gray-900 hover:text-blue-600 transition-colors font-medium"
                  >
                    {getLocalizedContent(entry.school.name_en, entry.school.name_jp, language) ||
                      (language === 'en' ? 'Unnamed School' : '名称未設定の学校')}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {new Date(entry.viewed_at).toLocaleDateString(language === 'en' ? 'en-US' : 'ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteEntry(entry.history_id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  {translations.remove}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default BrowsingHistory;
