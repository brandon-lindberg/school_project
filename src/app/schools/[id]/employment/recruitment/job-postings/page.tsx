'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { Card } from '../../../../../components/shared/Card';

// Define shape of job posting items
interface JobPostingListItem {
  id: number;
  title: string;
  description?: string;
  requirements?: string[];
  location: string;
  employmentType: string;
  createdAt: string;
  isArchived: boolean;
  hasApplied?: boolean;
}

export default function JobPostingsPage() {
  const { id: schoolId } = useParams() as { id: string };
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const isAuthenticated = status === 'authenticated';

  // Derive typed managedSchools
  const managedSchools = session?.user?.managedSchools as { school_id: string }[] ?? [];
  const isAdmin = isAuthenticated && (
    session?.user?.role === 'SUPER_ADMIN' ||
    managedSchools.some(s => s.school_id === schoolId)
  );
  const [feature, setFeature] = useState<{ enabled: boolean; start: string; end: string }>({ enabled: false, start: '', end: '' });
  const [jobPostings, setJobPostings] = useState<JobPostingListItem[]>([]);
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
        const data: JobPostingListItem[] = await res.json();
        setJobPostings(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
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
        const filtered = jobPostings.filter(job => activeTab === 'ACTIVE' ? !job.isArchived : job.isArchived);
        if (filtered.length === 0) {
          return <p>{activeTab === 'ACTIVE' ? 'No active job postings.' : 'No archived job postings.'}</p>;
        }
        return (
          <ul className="space-y-6 list-none">
            {filtered.map((job: JobPostingListItem) => (
              <li key={job.id}>
                <Card>
                  <h2 className="text-2xl font-heading font-bold mb-4">
                    {job.title}
                    {job.isArchived && (
                      <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold bg-neutral-200 text-neutral-700 rounded-md">
                        Archived
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-700">
                    {job.location} — {job.employmentType}
                  </p>
                  {job.description && (
                    <div
                      className="mt-4 prose prose-sm text-gray-700 max-w-none"
                      dangerouslySetInnerHTML={{ __html: job.description }}
                    />
                  )}
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Requirements:</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {job.requirements.map((req: string, idx: number) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-6 flex justify-between items-center">
                    {isAdmin ? (
                      <div className="flex space-x-4">
                        <Link
                          href={`/schools/${schoolId}/employment/recruitment/applications?jobPostingId=${job.id}`}
                          className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-md transition-colors"
                        >
                          Applications
                        </Link>
                        <Link
                          href={`/schools/${schoolId}/employment/recruitment/job-postings/${job.id}`}
                          className="bg-secondary hover:bg-secondary/90 text-white font-medium px-4 py-2 rounded-md transition-colors"
                        >
                          Manage
                        </Link>
                      </div>
                    ) : job.hasApplied ? (
                      <button
                        disabled
                        className="bg-gray-400 text-white font-medium px-4 py-2 rounded-md transition-colors cursor-not-allowed"
                      >
                        Applied
                      </button>
                    ) : (
                      <Link
                        href={`/schools/${schoolId}/employment/recruitment/job-postings/${job.id}/apply`}
                        className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-md transition-colors"
                      >
                        Apply
                      </Link>
                    )}
                    <p className="text-sm text-neutral-700">
                      Created at:{' '}
                      {new Date(job.createdAt).toLocaleString(
                        language === 'en' ? 'en-US' : 'ja-JP',
                        { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }
                      )}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        );
      })()}
    </div>
  );
}
