'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useBrowsingHistory } from '../contexts/BrowsingHistoryContext';

interface BrowsingHistoryRecorderProps {
  schoolId: string;
}

export default function BrowsingHistoryRecorder({ schoolId }: BrowsingHistoryRecorderProps) {
  const { data: session } = useSession();
  const { fetchBrowsingHistory, browsingHistory } = useBrowsingHistory();
  const [hasRecorded, setHasRecorded] = useState(false);

  useEffect(() => {
    const recordVisit = async () => {
      if (!session || hasRecorded) return;

      // Check if this school was recently in browsing history
      // If it's not in the history, it's safe to record
      const wasRecentlyViewed = browsingHistory.some(entry => entry.school_id === schoolId);
      if (wasRecentlyViewed) {
        setHasRecorded(true);
        return;
      }

      try {
        const response = await fetch('/api/browsing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schoolId }),
        });

        if (!response.ok) {
          console.warn('Failed to record browsing history');
          return;
        }

        // Refresh the browsing history after successfully recording the visit
        await fetchBrowsingHistory();
        setHasRecorded(true);
      } catch (error) {
        console.warn('Error recording browsing history:', error);
      }
    };

    recordVisit();
  }, [schoolId, session, fetchBrowsingHistory, hasRecorded, browsingHistory]);

  return null; // This component doesn't render anything
}
