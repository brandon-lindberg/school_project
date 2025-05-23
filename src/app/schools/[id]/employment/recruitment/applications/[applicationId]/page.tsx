'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CandidateNotes from '../components/CandidateNotes';
import InterviewScheduler from './components/InterviewScheduler';
import OfferLetterForm from './components/OfferLetterForm';
import { useSession } from 'next-auth/react';

export default function ApplicationDetailPage() {
  const { id: schoolId, applicationId } = useParams() as { id: string; applicationId: string };
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const managedFromSession = session?.user?.managedSchools ?? [];
  const isAdmin =
    userRole === 'SUPER_ADMIN' ||
    (userRole === 'SCHOOL_ADMIN' && managedFromSession.some(s => s.school_id === parseInt(schoolId)));
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
      <p><strong>Phone:</strong> {application.phone ?? 'N/A'}</p>
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
      <div>
        <h2 className="text-xl font-semibold mb-2">Comment</h2>
        <p>{application.comment}</p>
      </div>
      {isAdmin && <CandidateNotes applicationId={applicationId} notes={application.notes} />}
      <div>
        {isAdmin && <InterviewScheduler applicationId={applicationId} initialInterviews={application.interviews} />}
      </div>
      <div>
        {isAdmin && <OfferLetterForm applicationId={applicationId} initialLetterUrl={application.offer?.letterUrl} />}
      </div>
    </div>
  );
}
