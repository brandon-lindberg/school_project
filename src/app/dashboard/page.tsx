'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardSkeleton from '../components/DashboardSkeleton';
import UserLists from '../components/UserLists';
import BrowsingHistory from '../components/BrowsingHistory';
import { useLanguage } from '../contexts/LanguageContext';

// Define the type for user list items
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

type BrowsingHistoryItem = {
  history_id: number;
  school_id: number;
  viewed_at: Date;
  school: {
    name_en: string;
    name_jp: string;
  };
};

// Function to fetch the user ID dynamically
const getUserId = async (): Promise<number> => {
  const response = await fetch('/api/user');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch user ID');
  }

  return data.userId;
};

const DashboardPage: React.FC = () => {
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [browsingHistory, setBrowsingHistory] = useState<BrowsingHistoryItem[]>([]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      router.replace('/list');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Get the actual userId using the getUserId function
        const fetchedUserId = await getUserId();

        // Fetch user lists
        const listsResponse = await fetch(`/api/userLists?userId=${fetchedUserId}`);
        if (!listsResponse.ok) {
          throw new Error('Failed to fetch user lists');
        }
        const listsData = await listsResponse.json();
        setUserLists(listsData.lists);

        // Fetch browsing history
        const historyResponse = await fetch('/api/browsing');
        if (!historyResponse.ok) {
          throw new Error('Failed to fetch browsing history');
        }
        const historyData = await historyResponse.json();
        setBrowsingHistory(historyData);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.replace('/list');
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, status, router]);

  const handleClearHistory = async () => {
    try {
      const response = await fetch('/api/browsing', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear browsing history');
      }

      setBrowsingHistory([]);
    } catch (error) {
      console.error('Error clearing browsing history:', error);
    }
  };

  const handleDeleteHistoryEntry = async (historyId: number) => {
    try {
      const response = await fetch(`/api/browsing?historyId=${historyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete history entry');
      }

      setBrowsingHistory(prevHistory =>
        prevHistory.filter(entry => entry.history_id !== historyId)
      );
    } catch (error) {
      console.error('Error deleting history entry:', error);
    }
  };

  const handleDeleteSchoolFromList = async (listId: number, schoolId: number) => {
    try {
      const response = await fetch(`/api/userLists?listId=${listId}&schoolId=${schoolId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove school from list');
      }

      // Refresh the list after deletion
      const updatedLists = userLists.map(list => {
        if (list.list_id === listId) {
          return {
            ...list,
            schools: list.schools.filter(school => school.school_id !== schoolId),
          };
        }
        return list;
      });

      setUserLists(updatedLists);
    } catch (error) {
      console.error('Error removing school from list:', error);
      router.replace('/list');
    }
  };

  if (status === 'loading' || isLoading) {
    return <DashboardSkeleton />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - My Lists */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-[#333333] mb-6">
                {language === 'en' ? 'My List' : 'マイリスト'}
              </h2>
              <UserLists userLists={userLists} onDeleteSchool={handleDeleteSchoolFromList} />
            </div>
          </div>

          {/* Right Column - Browsing History */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-[#333333] mb-6">
                {language === 'en' ? 'Browsing History' : '閲覧履歴'}
              </h2>
              <BrowsingHistory
                browsingHistory={browsingHistory}
                onClearHistory={handleClearHistory}
                onDeleteEntry={handleDeleteHistoryEntry}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
