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

export default function ApplicationDetailPage() {
  const { id: schoolId, applicationId } = useParams() as { id: string; applicationId: string };
  const { data: session } = useSession();
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const userRole = session?.user?.role;
  const managedFromSession = session?.user?.managedSchools ?? [];
  const isAdmin =
    userRole === 'SUPER_ADMIN' ||
    (userRole === 'SCHOOL_ADMIN' && managedFromSession.some(s => s.school_id === parseInt(schoolId)));

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
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setRejecting(false);
    }
  };

  const [application, setApplication] = useState<any>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateRating, setCandidateRating] = useState<number>(0);
  const [emailCopied, setEmailCopied] = useState<boolean>(false);
  const [phoneCopied, setPhoneCopied] = useState<boolean>(false);

  useEffect(() => {
    async function fetchApplication() {
      try {
        const res = await fetch(`/api/applications/${applicationId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load application');
        const app = await res.json();
        setApplication(app);
        setCandidateRating(app.rating || 0);
      } catch (err: any) {
        setError(err.message);
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

  if (loading) return <div className="p-8">Loading...</div>;
  if (error || !application) return <div className="p-8 text-red-500">{error || 'Application not found'}</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
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
        {isAdmin && application.currentStage !== 'SCREENING' && (
          <div className="space-x-2">
            <button
              onClick={handleReject}
              disabled={rejecting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {rejecting ? 'Rejecting...' : 'Reject'}
            </button>
            <button
              onClick={() => setShowOfferForm(v => !v)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Offer
            </button>
          </div>
        )}
      </div>
      {actionError && <p className="text-red-500">{actionError}</p>}
      {showOfferForm && isAdmin && (
        <OfferLetterForm applicationId={applicationId} initialLetterUrl={application.offer?.letterUrl} />
      )}
      <div className="flex items-center space-x-2">
        <span><strong>Email:</strong> {application.email}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(application.email); setEmailCopied(true); setTimeout(() => setEmailCopied(false), 2000); }}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Copy email"
        >
          <ClipboardDocumentIcon className="h-5 w-5" />
        </button>
        {emailCopied && <span className="text-green-600 text-sm">Copied!</span>}
      </div>
      <div className="flex items-center space-x-2">
        <span><strong>Phone:</strong> {application.phone ?? 'N/A'}</span>
        {application.phone && (
          <button
            onClick={() => { navigator.clipboard.writeText(application.phone!); setPhoneCopied(true); setTimeout(() => setPhoneCopied(false), 2000); }}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Copy phone number"
          >
            <ClipboardDocumentIcon className="h-5 w-5" />
          </button>
        )}
        {phoneCopied && <span className="text-green-600 text-sm">Copied!</span>}
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
      {application.resumeUrl && (
        <p><strong>Resume:</strong> <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{application.resumeUrl}</a></p>
      )}
      {application.coverLetter && (
        <div>
          <h2 className="text-xl font-semibold mb-1">Cover Letter</h2>
          <p>{application.coverLetter}</p>
        </div>
      )}
      <p><strong>Status:</strong> {application.status}</p>
      <p><strong>Stage:</strong> {application.currentStage}</p>
      {!isAdmin && (
        <div className="space-y-6">
          {/* List all interviews with completion status */}
          {application.interviews.map((intv: any, idx: number) => (
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
              onScheduled={() => setRefreshFlag(f => f + 1)}
            />
          )}
        </div>
      )}
      {/* Employer workflow for application review, interviews, and offers */}
      {isAdmin && (
        <EmployerWorkflow
          application={application}
          refresh={() => setRefreshFlag(f => f + 1)}
        />
      )}
      {/* Journal entries are admin-only to prevent applicants from seeing employer notes */}
      {isAdmin && <JournalTimeline applicationId={applicationId} />}
      {isAdmin && <JournalEntryForm applicationId={applicationId} />}
    </div>
  );
}
