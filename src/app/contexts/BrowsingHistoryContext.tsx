import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface BrowsingHistoryItem {
  history_id: number;
  school_id: string;
  viewed_at: Date;
  school: {
    name_en: string | null;
    name_jp: string | null;
  };
}

interface BrowsingHistoryContextType {
  browsingHistory: BrowsingHistoryItem[];
  fetchBrowsingHistory: () => Promise<void>;
  deleteHistoryEntry: (historyId: number) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const BrowsingHistoryContext = createContext<BrowsingHistoryContextType | undefined>(undefined);

export function BrowsingHistoryProvider({ children }: { children: React.ReactNode }) {
  const [browsingHistory, setBrowsingHistory] = useState<BrowsingHistoryItem[]>([]);
  const { data: session } = useSession();

  const fetchBrowsingHistory = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/browsing');
      if (!response.ok) {
        throw new Error(`Failed to fetch browsing history: ${response.status}`);
      }
      const data = await response.json();

      if (Array.isArray(data) && data.every(item => item.history_id && item.school_id)) {
        setBrowsingHistory(data);
      } else {
        console.warn('Invalid browsing history data received:', data);
        setBrowsingHistory([]);
      }
    } catch (error) {
      console.error('Error fetching browsing history:', error);
      setBrowsingHistory([]);
    }
  }, [session]);

  const deleteHistoryEntry = useCallback(
    async (historyId: number) => {
      try {
        // First update local state optimistically
        setBrowsingHistory(prev => {
          const newHistory = prev.filter(item => item.history_id !== historyId);
          return newHistory;
        });

        // Then make API call
        const response = await fetch(`/api/browsing?historyId=${historyId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // If delete fails, revert the state
          console.error('Delete failed, reverting state');
          await fetchBrowsingHistory();
          throw new Error('Failed to delete history entry');
        }
      } catch (error) {
        console.error('Error deleting history entry:', error);
      }
    },
    [fetchBrowsingHistory]
  );

  const clearHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/browsing', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear history');
      }

      setBrowsingHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchBrowsingHistory();
    }
  }, [session, fetchBrowsingHistory]);

  const value = {
    browsingHistory,
    fetchBrowsingHistory,
    deleteHistoryEntry,
    clearHistory,
  };

  return (
    <BrowsingHistoryContext.Provider value={value}>{children}</BrowsingHistoryContext.Provider>
  );
}

export function useBrowsingHistory() {
  const context = useContext(BrowsingHistoryContext);
  if (context === undefined) {
    throw new Error('useBrowsingHistory must be used within a BrowsingHistoryProvider');
  }
  return context;
}
