'use client';

import { useEffect, useState } from 'react';

interface Suggestion {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  candidateSlot?: unknown;
  adminSlot?: unknown;
}

export default function MatchSuggestions({ applicationId }: { applicationId: string }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const res = await fetch(`/api/applications/${applicationId}/match-suggestions`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load suggestions');
        setSuggestions(await res.json());
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    loadSuggestions();
  }, [applicationId]);

  if (loading) {
    return <div className="p-2">Loading match suggestions...</div>;
  }
  if (error) {
    return <div className="p-2 text-red-500">Error: {error}</div>;
  }
  if (suggestions.length === 0) {
    return <p>No matching availability slots found.</p>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Match Suggestions</h3>
      <ul className="list-disc list-inside">
        {suggestions.map((s, i) => (
          <li key={i}>
            {s.dayOfWeek}: {s.startTime} - {s.endTime}
          </li>
        ))}
      </ul>
    </div>
  );
}
