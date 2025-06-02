'use client';

import { useEffect, useState } from 'react';

interface Entry {
  id: number;
  type: string;
  content: string;
  rating?: number;
  createdAt: string;
  author: { user_id: number; first_name: string; family_name: string };
}

export default function JournalTimeline({ applicationId }: { applicationId: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const typeStyles: Record<string, string> = {
    NOTE: 'border-blue-200 bg-blue-50',
    FEEDBACK: 'border-green-200 bg-green-50',
    SYSTEM: 'border-gray-300 bg-gray-100',
    JOURNAL: 'border-yellow-200 bg-yellow-50',
  };

  useEffect(() => {
    async function loadEntries() {
      try {
        const res = await fetch(`/api/applications/${applicationId}/journal-entries`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load journal entries');
        const data = await res.json();
        setEntries(data.reverse());
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    loadEntries();
    const handler = () => {
      setLoading(true);
      loadEntries();
    };
    window.addEventListener('journalEntryCreated', handler);
    return () => window.removeEventListener('journalEntryCreated', handler);
  }, [applicationId]);

  if (loading) return <div>Loading journal...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (entries.length === 0) return <p>No journal entries yet.</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Journal Entries</h3>
      <ul className="space-y-2">
        {entries.map(e => (
          <li key={e.id} className={`p-2 rounded border ${typeStyles[e.type] || 'border-gray-200 bg-white'}`}>
            <p className="text-sm text-gray-500">
              {new Date(e.createdAt).toLocaleString()} by {e.author.first_name}
            </p>
            <p className="text-sm flex items-center space-x-2">
              <strong>{e.type}</strong>
            </p>
            <p>{e.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
