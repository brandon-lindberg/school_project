'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface JobPosting {
  title: string;
  description: string;
  requirements: string[];
  location: string;
  employmentType: string;
  status: string;
}

export default function EditJobPostingPage() {
  const router = useRouter();
  const { id: schoolId, jobId } = useParams() as { id: string; jobId: string };
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const managedFromSession = session?.user?.managedSchools ?? [];
  const isAdmin =
    userRole === 'SUPER_ADMIN' ||
    (userRole === 'SCHOOL_ADMIN' && managedFromSession.some(s => s.school_id === parseInt(schoolId)));

  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState(['']);
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    async function fetchJob() {
      try {
        const res = await fetch(`/api/job-postings/${jobId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load job posting');
        const data = await res.json();
        setJob(data);
        setTitle(data.title);
        setDescription(data.description);
        setRequirements(data.requirements || []);
        setLocation(data.location);
        setEmploymentType(data.employmentType);
        setStatus(data.status);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [jobId, isAdmin]);

  const handleRequirementChange = (index: number, value: string) => {
    setRequirements(prev => prev.map((req, i) => (i === index ? value : req)));
  };
  const addRequirement = () => setRequirements(prev => [...prev, '']);
  const removeRequirement = (index: number) => setRequirements(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const cleanedRequirements = requirements.filter(req => req.trim() !== '');
      const res = await fetch(`/api/job-postings/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, requirements: cleanedRequirements, location, employmentType, status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update job posting');
      }
      router.push(`/schools/${schoolId}/employment/recruitment/job-postings/${jobId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!isAdmin) return <div className="p-8 text-red-500">Not authorized</div>;
  if (error && !job) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Job Posting</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Requirements</label>
          {requirements.map((req, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="text"
                value={req}
                onChange={e => handleRequirementChange(idx, e.target.value)}
                className="flex-grow border rounded p-2"
              />
              <button
                type="button"
                onClick={() => removeRequirement(idx)}
                className="ml-2 text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addRequirement} className="text-blue-500 hover:underline">
            Add Requirement
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Employment Type</label>
          <input
            type="text"
            value={employmentType}
            onChange={e => setEmploymentType(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Job Posting'}
          </button>
        </div>
      </form>
    </div>
  );
}
