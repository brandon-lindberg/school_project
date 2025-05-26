'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface JobPosting {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  employmentType: string;
  createdAt: string;
  hasApplied?: boolean;
}

export default function JobPostingDetailPage() {
  const { id: schoolId, jobId } = useParams() as { id: string; jobId: string };
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const userRole = session?.user?.role;
  const managedFromSession = session?.user?.managedSchools ?? [];
  const isAdmin = userRole === 'SUPER_ADMIN' || (userRole === 'SCHOOL_ADMIN' && managedFromSession.some(s => s.school_id === parseInt(schoolId)));
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/job-postings/${jobId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load job posting');
        setJob(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [jobId]);

  // Check if user already applied
  useEffect(() => {
    if (!isAuthenticated) return;
    async function checkApplied() {
      try {
        const res = await fetch('/api/applications', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const applied = data.some((app: any) => app.jobPosting?.id === parseInt(jobId, 10));
        setHasApplied(applied);
      } catch {
        // ignore
      }
    }
    checkApplied();
  }, [isAuthenticated, jobId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    setActionError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/job-postings/${jobId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete job posting');
      }
      window.location.href = `/schools/${schoolId}/employment/recruitment/job-postings`;
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error || !job) return <div className="p-8 text-red-500">{error || 'Job not found'}</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{job.title}</h1>
      <p className="text-gray-600">{job.location} — {job.employmentType}</p>
      <p>{job.description}</p>
      <div>
        <h2 className="text-xl font-semibold mb-2">Requirements</h2>
        <ul className="list-disc pl-5">
          {job.requirements.map((req, idx) => <li key={idx}>{req}</li>)}
        </ul>
      </div>
      <div className="mt-4">
        <div className="flex space-x-2">
          {isAdmin ? (
            <>
              <Link
                href={`/schools/${schoolId}/employment/recruitment/job-postings/${jobId}/edit`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          ) : isAuthenticated ? (
            job.hasApplied ? (
              <button
                disabled
                className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed disabled:opacity-50"
              >
                Applied
              </button>
            ) : (
              <Link
                href={`/schools/${schoolId}/employment/recruitment/job-postings/${jobId}/apply`}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Apply
              </Link>
            )
          ) : (
            <Link
              href={`/register?next=/schools/${schoolId}/employment/recruitment/job-postings/${jobId}/apply`}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Sign up to Apply
            </Link>
          )}
        </div>
        {actionError && <p className="text-red-500 mt-2">{actionError}</p>}
      </div>
    </div>
  );
}
