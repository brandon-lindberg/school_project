'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CandidateNotes from '../components/CandidateNotes';
import InterviewScheduler from './components/InterviewScheduler';
import OfferLetterForm from './components/OfferLetterForm';

export default function ApplicationDetailPage() {
  const { id: schoolId, applicationId } = useParams() as { id: string; applicationId: string };
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplication() {
      try {
        const res = await fetch(`/api/applications/${applicationId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load application');
        setApplication(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchApplication();
  }, [applicationId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error || !application) return <div className="p-8 text-red-500">{error || 'Application not found'}</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{application.applicantName}</h1>
      <p><strong>Email:</strong> {application.email}</p>
      <p><strong>Status:</strong> {application.status}</p>
      <p><strong>Stage:</strong> {application.currentStage}</p>
      <div>
        <h2 className="text-xl font-semibold mb-2">Comment</h2>
        <p>{application.comment}</p>
      </div>
      <CandidateNotes applicationId={applicationId} notes={application.notes} />
      <div>
        <InterviewScheduler applicationId={applicationId} initialInterviews={application.interviews} />
      </div>
      <div>
        <OfferLetterForm applicationId={applicationId} initialLetterUrl={application.offer?.letterUrl} />
      </div>
    </div>
  );
}
