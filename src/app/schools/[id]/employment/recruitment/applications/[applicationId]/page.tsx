'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EmployerWorkflow from './components/EmployerWorkflow';
import JournalTimeline from './components/JournalTimeline';
import JournalEntryForm from './components/JournalEntryForm';
import CandidateSchedule from './components/CandidateSchedule';
import OfferLetterForm from './components/OfferLetterForm';
import AddToCalendarButton from '@/app/components/AddToCalendarButton';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import OfferStatus from '../../offers/components/OfferStatus';
import ApplicationMessages from './components/ApplicationMessages';
import { ChatBubbleLeftRightIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { Application as PrismaApplication, Notification } from '@prisma/client';

// Mapping backend status codes to user-friendly text
const statusLabelMap: Record<string, string> = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  IN_PROCESS: 'In Process',
  REJECTED: 'Rejected',
  OFFER: 'Offer Extended',
  ACCEPTED_OFFER: 'Offer Accepted',
  REJECTED_OFFER: 'Offer Rejected',
  WITHDRAWN: 'Withdrawn',
};

// Mapping backend stage codes to user-friendly text
const stageLabelMap: Record<string, string> = {
  SCREENING: 'Screening',
  INTERVIEW_INVITATION_SENT: 'Interview Invitation Sent',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
};

// Mapping offer status codes to user-friendly text
const offerStatusLabelMap: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

// Detailed application including related records (with serialized date strings)
type ApplicationDetail = Omit<PrismaApplication, 'interviews' | 'offer'> & {
  interviews: {
    id: number;
    scheduledAt: string;
    location: string;
    status: string;
    interviewerNames?: string[];
  }[];
  offer?: { id: number; letterUrl: string; status: string } | null;
  allowCandidateMessages?: boolean;
};

// Journal entry shape for this page
interface JournalEntry {
  id: number;
  type: string;
  content: string;
  rating?: number;
  createdAt: string;
  author: { user_id: number; first_name: string; family_name: string };
}

export default function ApplicationDetailPage() {
  const { id: schoolId, applicationId } = useParams() as { id: string; applicationId: string };
  const { data: session } = useSession();
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const userRole = session?.user?.role;
  const managedFromSession = session?.user?.managedSchools ?? [];
  const isAdmin =
    userRole === 'SUPER_ADMIN' ||
    (userRole === 'SCHOOL_ADMIN' && managedFromSession.some(s => s.school_id === schoolId));

  const handleReject = async () => {
    setActionError(null);
    setRejecting(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reject application');
      }
      setRefreshFlag(f => f + 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setActionError(message);
    } finally {
      setRejecting(false);
    }
  };

  const handleWithdraw = async () => {
    setActionError(null);
    setWithdrawing(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'WITHDRAWN' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to withdraw application');
      }
      setRefreshFlag(f => f + 1);
      setWithdrawSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setActionError(message);
    } finally {
      setWithdrawing(false);
    }
  };

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateRating, setCandidateRating] = useState<number>(0);
  const [emailCopied, setEmailCopied] = useState<boolean>(false);
  const [phoneCopied, setPhoneCopied] = useState<boolean>(false);
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);
  const [showJournalPanel, setShowJournalPanel] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [, setJournalLoading] = useState(true);
  const [, setJournalError] = useState<string | null>(null);

  // Handler to mark message notifications as read and open messages panel
  const handleOpenMessages = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const notifs = (await res.json()) as Notification[];
        const toMark = notifs.filter(n =>
          n.type === 'MESSAGE_RECEIVED' &&
          !n.is_read &&
          n.url === `/schools/${schoolId}/employment/recruitment/applications/${applicationId}`
        ).map(n => n.notification_id);
        if (toMark.length > 0) {
          await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationIds: toMark }),
          });
        }
        setUnreadMessagesCount(0);
      }
    } catch (err: unknown) {
      console.error('Error marking messages read:', err);
    }
    setShowMessagesPanel(true);
  };

  useEffect(() => {
    async function fetchApplication() {
      try {
        const res = await fetch(`/api/applications/${applicationId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load application');
        const app = await res.json();
        setApplication(app);
        setCandidateRating(app.rating || 0);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchApplication();
  }, [applicationId, refreshFlag]);

  // Open offer form when an interview-level Offer button is clicked
  useEffect(() => {
    const handleOfferRequest = () => setShowOfferForm(true);
    window.addEventListener('offerRequested', handleOfferRequest);
    return () => window.removeEventListener('offerRequested', handleOfferRequest);
  }, []);

  // Refetch application when candidate responds to offer
  useEffect(() => {
    const handleOfferResponded = () => setRefreshFlag(f => f + 1);
    window.addEventListener('offerResponded', handleOfferResponded);
    return () => window.removeEventListener('offerResponded', handleOfferResponded);
  }, []);

  // Fetch unread message notifications for this application
  useEffect(() => {
    async function fetchUnreadMessages() {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        const notifs = await res.json();
        const count = (notifs as Notification[]).filter(n =>
          n.type === 'MESSAGE_RECEIVED' &&
          !n.is_read &&
          n.url === `/schools/${schoolId}/employment/recruitment/applications/${applicationId}`
        ).length;
        setUnreadMessagesCount(count);
      } catch (err: unknown) {
        console.error('Error fetching unread notifications:', err);
      }
    }
    fetchUnreadMessages();
  }, [schoolId, applicationId, showMessagesPanel]);

  // Fetch journal entries for latest entry display
  useEffect(() => {
    async function fetchJournal() {
      try {
        const res = await fetch(`/api/applications/${applicationId}/journal-entries`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch journal entries');
        const data = (await res.json()) as JournalEntry[];
        setJournalEntries(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setJournalError(message);
      } finally {
        setJournalLoading(false);
      }
    }
    fetchJournal();
  }, [applicationId, refreshFlag]);

  // Determine the most recent journal entry
  const latestJournalEntry = journalEntries.length > 0 ? journalEntries[journalEntries.length - 1] : null;

  if (loading) return <div className="p-8">Loading...</div>;
  if (error || !application) return <div className="p-8 text-red-500">{error || 'Application not found'}</div>;
  console.log('ApplicationDetailPage data:', application, 'session:', session);

  // Determine if current user is the candidate for this application
  const isCandidate = session?.user?.id === String(application.userId);
  // Detail page override based on offer table state
  const isDetailOfferAccepted = application.offer?.status === 'ACCEPTED';
  const isDetailOfferRejected = application.offer?.status === 'REJECTED';
  const detailStatusText = isDetailOfferAccepted
    ? offerStatusLabelMap['ACCEPTED']
    : isDetailOfferRejected
      ? offerStatusLabelMap['REJECTED']
      : statusLabelMap[application.status] ?? application.status;
  const detailStatusClass = isDetailOfferAccepted
    ? 'text-green-600 font-medium'
    : isDetailOfferRejected
      ? 'text-red-600 font-medium'
      : '';

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{application.applicantName}</h1>
              {isAdmin && (
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={async () => {
                        setCandidateRating(n);
                        const resRating = await fetch(`/api/applications/${applicationId}/rating`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ rating: n }),
                        });
                        if (!resRating.ok) alert('Failed to update rating');
                      }}
                      className="focus:outline-none"
                    >
                      {candidateRating >= n ? (
                        <StarSolidIcon className="h-6 w-6 text-yellow-400" />
                      ) : (
                        <StarOutlineIcon className="h-6 w-6 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {isAdmin && !application.offer?.id && application.currentStage !== 'SCREENING' &&
                ['REJECTED', 'REJECTED_OFFER', 'WITHDRAWN'].indexOf(application.status) === -1 && (
                  <>
                    <button onClick={handleReject} disabled={rejecting}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50">
                      {rejecting ? 'Rejecting...' : 'Reject'}
                    </button>
                    <button onClick={() => setShowOfferForm(v => !v)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                      Offer
                    </button>
                  </>
                )}
              {/* Message panel trigger */}
              <button onClick={handleOpenMessages} className="relative text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer">
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
              {isAdmin && (
                <button onClick={() => setShowJournalPanel(true)} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                  <DocumentTextIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
          {actionError && <p className="text-red-500">{actionError}</p>}
          {showOfferForm && isAdmin && (
            <OfferLetterForm applicationId={applicationId} initialLetterUrl={application.offer?.letterUrl} />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium w-28">Email:</span>
              <span>{application.email}</span>
            </div>
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(application.email); setEmailCopied(true); setTimeout(() => setEmailCopied(false), 2000); }}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Copy email"
                >
                  <ClipboardDocumentIcon className="h-5 w-5" />
                </button>
                {emailCopied && <span className="text-green-600 text-sm">Copied!</span>}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="font-medium w-28">Phone:</span>
              <span>{application.phone ?? 'N/A'}</span>
            </div>
            {isAdmin && application.phone && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(application.phone!); setPhoneCopied(true); setTimeout(() => setPhoneCopied(false), 2000); }}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Copy phone number"
                >
                  <ClipboardDocumentIcon className="h-5 w-5" />
                </button>
                {phoneCopied && <span className="text-green-600 text-sm">Copied!</span>}
              </div>
            )}
          </div>
          <p><strong>Japanese Visa:</strong> {application.hasJapaneseVisa ? 'Yes' : 'No'}</p>
          {application.certifications?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-1">Certifications</h2>
              <ul className="list-disc list-inside">
                {application.certifications.map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {application.degrees?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-1">Degrees</h2>
              <ul className="list-disc list-inside">
                {application.degrees.map((d: string, i: number) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          <p><strong>Current Residence:</strong> {application.currentResidence ?? 'N/A'}</p>
          <p><strong>Nationality:</strong> {application.nationality ?? 'N/A'}</p>
          <p><strong>JLPT:</strong> {application.jlpt ?? 'None'}</p>
          {application.resumeUrl && (
            <p><strong>Resume:</strong> <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{application.resumeUrl}</a></p>
          )}
          {application.coverLetter && (
            <div>
              <h2 className="text-xl font-semibold mb-1">Cover Letter</h2>
              <p>{application.coverLetter}</p>
            </div>
          )}
          <p><strong>Status:</strong> <span className={detailStatusClass}>{detailStatusText}</span></p>
          <p><strong>Stage:</strong> {stageLabelMap[application.currentStage] ?? application.currentStage}</p>
          {withdrawSuccess && (
            <div className="p-4 bg-green-100 text-green-800 rounded mb-4">
              Application withdrawn successfully
            </div>
          )}
          {isCandidate && !application.offer && application.status !== 'WITHDRAWN' && application.status !== 'REJECTED' && (
            <div className="mb-4">
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
              </button>
            </div>
          )}
          {/* Candidate offer response UI */}
          {isCandidate && application.offer && (
            <OfferStatus
              offerId={String(application.offer.id)}
              initialStatus={application.offer.status}
              letterUrl={application.offer.letterUrl!}
            />
          )}
          {!isAdmin && !application.offer && application.status !== 'WITHDRAWN' && (
            <div className="space-y-6">
              {/* List all interviews with completion status */}
              {application.interviews.map((intv, idx: number) => (
                <div key={intv.id} className="bg-white shadow-lg rounded-lg p-6 space-y-2">
                  <h2 className="text-xl font-semibold">
                    Round {idx + 1}{' '}
                    {new Date(intv.scheduledAt).getTime() <= Date.now() ? 'Complete' : 'Scheduled'}
                  </h2>
                  <p><strong>Date & Time:</strong> {new Date(intv.scheduledAt).toLocaleString()}</p>
                  <p>
                    <strong>Location:</strong>{' '}
                    <a
                      href={intv.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >{intv.location}</a>
                  </p>
                  <p><strong>Interviewer(s):</strong> {intv.interviewerNames?.length ? intv.interviewerNames.join(', ') : ''}</p>
                  <AddToCalendarButton start={intv.scheduledAt} location={intv.location} />
                </div>
              ))}
              {/* Show scheduling UI when an interview invitation is pending */}
              {application.currentStage === 'INTERVIEW_INVITATION_SENT' && (
                <CandidateSchedule
                  applicationId={applicationId}
                  interviewId={
                    application.interviews[application.interviews.length - 1]?.status === 'SCHEDULED'
                      ? application.interviews[application.interviews.length - 1].id.toString()
                      : undefined
                  }
                  isReschedule={application.interviews[application.interviews.length - 1]?.status === 'SCHEDULED'}
                  onScheduled={() => setRefreshFlag(f => f + 1)}
                />
              )}
            </div>
          )}
          {isAdmin && application.status !== 'WITHDRAWN' && (
            <EmployerWorkflow application={application} refresh={() => setRefreshFlag(f => f + 1)} />
          )}
          {isAdmin && latestJournalEntry && (
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
              <h2 className="text-xl font-semibold">Most Recent Note</h2>
              <p className="text-sm text-gray-600">
                {new Date(latestJournalEntry.createdAt).toLocaleString()} by {latestJournalEntry.author.first_name} {latestJournalEntry.author.family_name}
              </p>
              <div className="text-gray-800">
                {latestJournalEntry.content}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Backdrop */}
      {showMessagesPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-30" onClick={() => setShowMessagesPanel(false)} />
      )}
      {/* Slide-out panel */}
      <div className={`fixed inset-y-0 right-0 w-1/3 bg-white shadow-lg transform transition-transform duration-300 z-40 flex flex-col ${showMessagesPanel ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-medium">Messages</h2>
          <button onClick={() => setShowMessagesPanel(false)} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1">
          <ApplicationMessages applicationId={applicationId} allowCandidateMessages={application.allowCandidateMessages} isAdmin={isAdmin} />
        </div>
      </div>
      {isAdmin && (
        <> {/* Journal slide-out and backdrop for admins only */}
          {showJournalPanel && (
            <div className="fixed inset-0 bg-black bg-opacity-30 z-30" onClick={() => setShowJournalPanel(false)} />
          )}
          <div className={`fixed inset-y-0 right-0 w-1/3 bg-white shadow-lg transform transition-transform duration-300 z-40 flex flex-col ${showJournalPanel ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-lg font-medium">Journal Entries</h2>
              <button onClick={() => setShowJournalPanel(false)} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <JournalTimeline applicationId={applicationId} />
              <JournalEntryForm applicationId={applicationId} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
