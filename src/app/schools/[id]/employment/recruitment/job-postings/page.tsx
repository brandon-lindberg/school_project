'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function JobPostingsPage() {
  const { id: schoolId } = useParams() as { id: string };
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isAdmin = isAuthenticated && (
    session?.user?.role === 'SUPER_ADMIN' ||
    session?.user?.managedSchools?.some((s: any) => s.school_id === schoolId)
  );
  const [feature, setFeature] = useState<{ enabled: boolean; start: string; end: string }>({ enabled: false, start: '', end: '' });
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  useEffect(() => {
    async function fetchFeature() {
      try {
        const res = await fetch(`/api/schools?id=${schoolId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setFeature({
          enabled: data.job_postings_enabled,
          start: data.job_postings_start || '',
          end: data.job_postings_end || '',
        });
      } catch {
        // ignore
      }
    }
    fetchFeature();
  }, [schoolId]);

  const now = new Date();
  const isFeatureOpen =
    feature.enabled &&
    feature.start &&
    feature.end &&
    now >= new Date(feature.start) &&
    now <= new Date(feature.end);

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
        {isAdmin && isFeatureOpen && (
          <Link
            href={`/schools/${schoolId}/employment/recruitment/job-postings/new`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            New Job Posting
          </Link>
        )}
      </div>
      {/* Tabs for Active / Archived postings */}
      {isAdmin && (
        <div className="border-b mb-4">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 -mb-px font-medium ${activeTab === 'ACTIVE' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('ARCHIVED')}
            className={`ml-4 px-4 py-2 -mb-px font-medium ${activeTab === 'ARCHIVED' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Archived
          </button>
        </div>
      )}
      {/* Filter postings by tab */}
      {(() => {
        const filtered = jobPostings.filter((job: any) => activeTab === 'ACTIVE' ? !job.isArchived : job.isArchived);
        if (filtered.length === 0) {
          return <p>{activeTab === 'ACTIVE' ? 'No active job postings.' : 'No archived job postings.'}</p>;
        }
        return (
          <ul className="space-y-4">
            {filtered.map((job: any) => (
              <li key={job.id} className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-1">
                  {job.title}
                  {job.isArchived && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded">
                      Archived
                    </span>
                  )}
                </h2>
                <p className="text-gray-600">{job.location} — {job.employmentType}</p>
                {job.description && (
                  <div className="mt-2 prose prose-sm" dangerouslySetInnerHTML={{ __html: job.description }} />
                )}
                {job.requirements && job.requirements.length > 0 && (
                  <div className="mt-2">
                    <h3 className="font-medium">Requirements:</h3>
                    <ul className="list-disc list-inside mt-1">
                      {job.requirements.map((req: string, idx: number) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-gray-500 text-sm">Created at: {new Date(job.createdAt).toLocaleString()}</p>
                <div className="mt-2 flex space-x-4">
                  {isAuthenticated ? (
                    (session?.user?.role === 'SUPER_ADMIN' || session?.user?.managedSchools?.some((s: any) => s.school_id === schoolId)) ? (
                      <Link
                        href={`/schools/${schoolId}/employment/recruitment/applications?jobPostingId=${job.id}`}
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
        );
      })()}
    </div>
  );
}
