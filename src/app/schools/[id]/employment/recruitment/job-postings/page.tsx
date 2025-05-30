'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function JobPostingsPage() {
  const { id: schoolId } = useParams() as { id: string };
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobPostings() {
      try {
        const res = await fetch(`/api/schools/${schoolId}/recruitment/job-postings`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Failed to fetch job postings');
        }
        const data = await res.json();
        setJobPostings(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJobPostings();
  }, [schoolId]);

  if (loading) {
    return <div className="p-8">Loading job postings...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Job Postings</h1>
        <Link
          href={`/schools/${schoolId}/employment/recruitment/job-postings/new`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          New Job Posting
        </Link>
      </div>
      {jobPostings.length === 0 ? (
        <p>No job postings yet.</p>
      ) : (
        <ul className="space-y-4">
          {jobPostings.map((job: any) => (
            <li key={job.id} className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-1">{job.title}</h2>
              <p className="text-gray-600">{job.location} — {job.employmentType}</p>
              <p className="text-gray-500 text-sm">Created at: {new Date(job.createdAt).toLocaleString()}</p>
              <div className="mt-2 flex space-x-4">
                {isAuthenticated ? (
                  (session?.user?.role === 'SUPER_ADMIN' || session?.user?.managedSchools?.some(s => s.school_id === schoolId)) ? (
                    <Link
                      href={`/schools/${schoolId}/employment/recruitment/applications`}
                      className="text-green-500 hover:underline"
                    >
                      Applications
                    </Link>
                  ) : (
                    job.hasApplied ? (
                      <button
                        disabled
                        className="text-gray-400 cursor-not-allowed"
                      >
                        Applied
                      </button>
                    ) : (
                      <Link
                        href={`/schools/${schoolId}/employment/recruitment/job-postings/${job.id}/apply`}
                        className="text-green-500 hover:underline"
                      >
                        Apply
                      </Link>
                    )
                  )
                ) : (
                  <Link
                    href={`/register?next=/schools/${schoolId}/employment/recruitment/job-postings/${job.id}/apply`}
                    className="text-green-500 hover:underline"
                  >
                    Sign up to Apply
                  </Link>
                )}
                <Link
                  href={`/schools/${schoolId}/employment/recruitment/job-postings/${job.id}`}
                  className="text-blue-500 hover:underline"
                >
                  Manage
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
