'use client';

import { useState } from 'react';

interface Interview {
  id: number;
  scheduledAt: string;
  location: string;
  status: string;
}

interface InterviewSchedulerProps {
  applicationId: string;
  initialInterviews: Interview[];
  /** Optional custom header text for the interview list */
  title?: string;
  /** Hide the default heading when true */
  hideHeader?: boolean;
}

export default function InterviewScheduler({ applicationId, initialInterviews, title = 'Interviews', hideHeader = false }: InterviewSchedulerProps) {
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const scheduleInterview = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt, location }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to schedule interview');
      }
      const newInterview = await res.json();
      setInterviews(prev => [newInterview, ...prev]);
      setScheduledAt('');
      setLocation('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  return (
    <div className="space-y-4">
      {!hideHeader && <h3 className="text-lg font-semibold">{title}</h3>}
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-2">
        {interviews.map(intv => (
          <li key={intv.id} className="p-2 bg-gray-50 rounded">
            <p>
              {new Date(intv.scheduledAt).toLocaleString()} @ {intv.location} - <span className="font-medium">{intv.status}</span>
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-2">
        <label className="block">
          <span className="text-sm font-medium">Schedule Date & Time</span>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
            className="mt-1 w-full border rounded p-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Location</span>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="mt-1 w-full border rounded p-2"
          />
        </label>
        <button
          onClick={scheduleInterview}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Schedule Interview
        </button>
      </div>
    </div>
  );
}
