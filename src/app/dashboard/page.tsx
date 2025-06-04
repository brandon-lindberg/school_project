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
import AddToCalendarButton from '../components/AddToCalendarButton';
import { Card } from '../components/shared/Card';

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
  const { userLists, managedSchools, claims, applications, userRole, isLoading, refreshData } = useDashboard();

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
      updateListStatus(String(schoolId), { isInList: false, listId: null });

      // Refresh dashboard data
      await refreshData();
    } catch (error) {
      console.error('Error removing school from list:', error);
      router.replace('/list');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 font-sans">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - My Lists, Managed Schools, and Claimed Schools */}
          <div className="space-y-6">
            {/* Managed Schools Section */}
            {userRole === 'SCHOOL_ADMIN' && managedSchools.length > 0 && (
              <Card>
                <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-6">
                  {language === 'en' ? 'Managed Schools' : '管理している学校'}
                </h2>
                <div className="space-y-4">
                  {managedSchools.map(school => (
                    <div key={school.school_id} className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/schools/${school.school_id}`}
                          className="inline-block bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-md mr-4 transition-colors"
                        >
                          {school.name}
                        </Link>
                        {school.job_postings_enabled && (
                          <Link
                            href={`/schools/${school.school_id}/employment/recruitment/job-postings`}
                            className="inline-block bg-secondary hover:bg-secondary/90 text-white font-medium px-4 py-2 rounded-md transition-colors"
                          >
                            {language === 'en' ? 'Recruitment' : '採用'}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Claimed Schools Section */}
            <ClaimedSchools claims={claims} />

            {/* User Applications Section */}
            {userRole === 'USER' && applications.length > 0 && (
              <Card>
                <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-6">
                  {language === 'en' ? 'My Applications' : '応募'}
                </h2>
                <ul className="space-y-2">
                  {applications.map(app => (
                    <li key={app.id}>
                      <Link
                        href={`/schools/${app.jobPosting.schoolId}/employment/recruitment/applications/${app.id}`}
                        className="text-primary hover:underline"
                      >
                        {app.jobPosting.title} — {
                          /* Show offer response status if present */
                          app.offer?.status === 'ACCEPTED' ? (
                            <span className="text-green-600 font-medium">Accepted</span>
                          ) : app.offer?.status === 'REJECTED' ? (
                            <span className="text-red-600 font-medium">Rejected</span>
                          ) : (
                            <span>{app.status}</span>
                          )
                        }
                      </Link>
                      {app.interviews?.length > 0 && (
                        <p className="block text-sm text-neutral-700 mt-2">
                          Interview scheduled on {new Date(app.interviews[0].scheduledAt).toLocaleString(
                            language === 'en' ? 'en-US' : 'ja-JP',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                            }
                          )} at {app.interviews[0].location}
                        </p>
                      )}
                      {app.interviews?.length > 0 && (
                        <div className="flex space-x-2 mt-2">
                          <AddToCalendarButton start={app.interviews[0].scheduledAt} location={app.interviews[0].location} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* My Lists Section */}
            <Card>
              <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-6">
                {language === 'en' ? 'My List' : 'マイリスト'}
              </h2>
              <UserLists userLists={userLists} onDeleteSchool={handleDeleteSchoolFromList} />
            </Card>
          </div>

          {/* Right Column - Messages, Notifications and Browsing History */}
          <div className="space-y-6">
            {/* Messages Section */}
            <MessagesSection />

            {/* Notifications Section */}
            <NotificationsSection />

            {/* Browsing History Section */}
            <Card>
              <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-6">
                {language === 'en' ? 'Browsing History' : '閲覧履歴'}
              </h2>
              <BrowsingHistory
                browsingHistory={browsingHistory}
                onClearHistory={handleClearHistory}
                onDeleteEntry={handleDeleteHistoryEntry}
              />
            </Card>
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
