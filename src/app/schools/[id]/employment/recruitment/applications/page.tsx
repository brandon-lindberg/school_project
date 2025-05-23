'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ApplicationList from './components/ApplicationList';

export default function ApplicationsPage() {
  const { id: schoolId } = useParams() as { id: string };
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch(`/api/schools/${schoolId}/recruitment/applications`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch applications');
        setApplications(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, [schoolId]);

  if (loading) {
    return <div className="p-8">Loading applications...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Applications</h1>
      <ApplicationList applications={applications} schoolId={schoolId} />
    </div>
  );
}
