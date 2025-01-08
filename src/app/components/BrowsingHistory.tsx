import React from 'react';
import Link from 'next/link';

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
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Browsing History</h2>
        {browsingHistory.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Clear All
          </button>
        )}
      </div>
      {browsingHistory.length === 0 ? (
        <p className="text-gray-500 text-center">No browsing history</p>
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
                    {entry.school.name_en || entry.school.name_jp}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {new Date(entry.viewed_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteEntry(entry.history_id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
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
