'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardSkeleton from '../components/DashboardSkeleton';
import UserLists from '../components/UserLists';
import BrowsingHistory from '../components/BrowsingHistory';
import NotificationsSection from '../components/NotificationsSection';
import MessagesSection from '../components/MessagesSection';
import { useLanguage } from '../contexts/LanguageContext';
import { useListStatus } from '../contexts/ListStatusContext';
import { useBrowsingHistory } from '../contexts/BrowsingHistoryContext';
import Link from 'next/link';

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

type ManagedSchool = {
  school_id: number;
  name: string;
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
  const [managedSchools, setManagedSchools] = useState<ManagedSchool[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const { updateListStatus } = useListStatus();
  const {
    browsingHistory,
    deleteHistoryEntry: handleDeleteHistoryEntry,
    clearHistory: handleClearHistory,
  } = useBrowsingHistory();

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

        // Fetch user role and managed schools
        const roleResponse = await fetch('/api/user/role');
        if (!roleResponse.ok) {
          throw new Error('Failed to fetch user role');
        }
        const roleData = await roleResponse.json();
        setUserRole(roleData.role);
        setManagedSchools(roleData.managedSchools);
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

  const handleDeleteSchoolFromList = async (listId: number, schoolId: number) => {
    try {
      const response = await fetch(`/api/userLists?listId=${listId}&schoolId=${schoolId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove school from list');
      }

      // Update the list status context
      updateListStatus(schoolId, { isInList: false, listId: null });

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
          {/* Left Column - My Lists and Managed Schools */}
          <div className="space-y-6">
            {/* Managed Schools Section */}
            {userRole === 'SCHOOL_ADMIN' && managedSchools.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-[#333333] mb-6">
                  {language === 'en' ? 'Managed Schools' : '管理している学校'}
                </h2>
                <div className="space-y-4">
                  {managedSchools.map(school => (
                    <div key={school.school_id} className="flex items-center justify-between">
                      <Link
                        href={`/schools/${school.school_id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {school.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Lists Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-[#333333] mb-6">
                {language === 'en' ? 'My List' : 'マイリスト'}
              </h2>
              <UserLists userLists={userLists} onDeleteSchool={handleDeleteSchoolFromList} />
            </div>
          </div>

          {/* Right Column - Messages, Notifications and Browsing History */}
          <div className="space-y-6">
            {/* Messages Section */}
            <MessagesSection />

            {/* Notifications Section */}
            <NotificationsSection />

            {/* Browsing History Section */}
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
