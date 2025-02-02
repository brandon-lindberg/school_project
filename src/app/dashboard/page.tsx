'use client';

import React from 'react';
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
import { DashboardProvider, useDashboard } from '../contexts/DashboardContext';
import Link from 'next/link';
import ClaimedSchools from '../components/ClaimedSchools';

function DashboardContent() {
  const router = useRouter();
  const { status } = useSession();
  const { language } = useLanguage();
  const { updateListStatus } = useListStatus();
  const {
    browsingHistory,
    deleteHistoryEntry: handleDeleteHistoryEntry,
    clearHistory: handleClearHistory,
  } = useBrowsingHistory();
  const { userLists, managedSchools, claims, userRole, isLoading, refreshData } = useDashboard();

  if (status === 'loading' || isLoading) {
    return <DashboardSkeleton />;
  }

  if (status === 'unauthenticated') {
    router.replace('/list');
    return null;
  }

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

      // Refresh dashboard data
      await refreshData();
    } catch (error) {
      console.error('Error removing school from list:', error);
      router.replace('/list');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - My Lists, Managed Schools, and Claimed Schools */}
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

            {/* Claimed Schools Section */}
            <ClaimedSchools claims={claims} />

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
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
