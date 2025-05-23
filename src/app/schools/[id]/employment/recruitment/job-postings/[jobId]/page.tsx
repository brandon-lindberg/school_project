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
}

export default function JobPostingDetailPage() {
  const { id: schoolId, jobId } = useParams() as { id: string; jobId: string };
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

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
        {isAuthenticated ? (
          <Link
            href={`/schools/${schoolId}/employment/recruitment/job-postings/${jobId}/apply`}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Apply
          </Link>
        ) : (
          <Link
            href={`/register?next=/schools/${schoolId}/employment/recruitment/job-postings/${jobId}/apply`}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Sign up to Apply
          </Link>
        )}
      </div>
    </div>
  );
}
