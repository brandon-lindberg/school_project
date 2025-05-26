'use client';

import InterviewFeedbackForm from './InterviewFeedbackForm';
import AddToCalendarButton from '@/app/components/AddToCalendarButton';

interface Interview {
  id: number;
  scheduledAt: string;
  location: string;
  status: string;
  interviewer?: { first_name: string; family_name: string };
  interviewerNames?: string[];
}

interface InterviewRoundsListProps {
  applicationId: string;
  interviews: Interview[];
  onNextRound: () => void;
  onRefresh: () => void;
}

export default function InterviewRoundsList({ applicationId, interviews, onNextRound, onRefresh }: InterviewRoundsListProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Interview Rounds</h2>
      {interviews.map((intv, idx) => (
        <div key={intv.id} className="border border-gray-200 rounded-md p-4 space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Round {idx + 1}</h3>
          <p className="text-gray-700">
            <strong>Scheduled:</strong> {new Date(intv.scheduledAt).toLocaleString()}
          </p>
          <p className="text-gray-700">
            <strong>Location:</strong>{' '}
            <a
              href={intv.location}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {intv.location}
            </a>
          </p>
          <p className="text-gray-700">
            <strong>Interviewer(s):</strong>{' '}
            {intv.interviewerNames && intv.interviewerNames.length > 0
              ? intv.interviewerNames.join(', ')
              : intv.interviewer
                ? `${intv.interviewer.first_name} ${intv.interviewer.family_name}`
                : ''
            }
          </p>
          <AddToCalendarButton start={intv.scheduledAt} location={intv.location} />
          <p className="text-gray-700">
            <strong>Status:</strong> {intv.status}
          </p>
          <InterviewFeedbackForm interviewId={intv.id.toString()} initialFeedbacks={[]} />
          <div className="flex space-x-3">
            <button
              onClick={async () => {
                if (!confirm(`Cancel interview round ${idx + 1}?`)) return;
                const res = await fetch(`/api/applications/${applicationId}/interviews/${intv.id}`, { method: 'DELETE' });
                if (res.ok) onRefresh();
                else alert('Failed to cancel interview');
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                const newDate = prompt('Enter new date and time (ISO format):', intv.scheduledAt);
                if (!newDate) return;
                const res = await fetch(`/api/applications/${applicationId}/interviews/${intv.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ scheduledAt: newDate }),
                });
                if (res.ok) onRefresh();
                else alert('Failed to reschedule interview');
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
            >
              Reschedule
            </button>
            <button
              onClick={onNextRound}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Accept & Next
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
