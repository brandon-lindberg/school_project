'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface BrowsingHistoryRecorderProps {
  schoolId: number;
}

export default function BrowsingHistoryRecorder({ schoolId }: BrowsingHistoryRecorderProps) {
  const { data: session } = useSession();

  useEffect(() => {
    const recordVisit = async () => {
      if (!session) return;

      try {
        const response = await fetch('/api/browsing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schoolId }),
        });

        if (!response.ok) {
          console.error('Failed to record browsing history');
        }
      } catch (error) {
        console.error('Error recording browsing history:', error);
      }
    };

    recordVisit();
  }, [schoolId, session]);

  return null; // This component doesn't render anything
}
