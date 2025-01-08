'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Define the type for user list items
type UserList = {
  list_id: number;
  list_name: string;
  created_at: Date;
  updated_at: Date;
  user_id: number;
  schools: { list_id: number; school_id: number }[];
};

type BrowsingHistory = {
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
  const [browsingHistory, setBrowsingHistory] = useState<BrowsingHistory[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

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
        setUserId(fetchedUserId);

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

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Return null since we're redirecting
  }

  const handleDeleteSchoolFromList = async (listId: number, schoolId: number) => {
    try {
      const response = await fetch(`/api/userLists?listId=${listId}&schoolId=${schoolId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove school from list');
      }

      // Refresh the list after deletion
      const updatedLists = userLists.map((list) => {
        if (list.list_id === listId) {
          return {
            ...list,
            schools: list.schools.filter((school) => school.school_id !== schoolId),
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

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-center sm:text-left">Your Lists</h2>
          <ul className="space-y-4">
            {userLists.map((list) => (
              <li key={list.list_id} className="border p-4 rounded shadow-sm">
                <span className="block font-medium">{list.list_name}</span>
                <ul className="mt-2 space-y-2">
                  {list.schools.map((school) => (
                    <li key={school.school_id} className="flex justify-between items-center">
                      <span>School ID: {school.school_id}</span>
                      <button
                        onClick={() => handleDeleteSchoolFromList(list.list_id, school.school_id)}
                        className="ml-2 text-red-500"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Browsing History</h2>
            {browsingHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
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
                      <h3 className="font-medium">
                        {entry.school.name_en || entry.school.name_jp}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.viewed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteHistoryEntry(entry.history_id)}
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
      </div>
    </div>
  );
};

export default DashboardPage;
