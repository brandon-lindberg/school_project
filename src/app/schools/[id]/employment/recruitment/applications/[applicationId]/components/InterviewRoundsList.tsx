'use client';

import InterviewFeedbackForm from './InterviewFeedbackForm';

interface Interview {
  id: number;
  scheduledAt: string;
  location: string;
  status: string;
}

interface InterviewRoundsListProps {
  interviews: Interview[];
}

export default function InterviewRoundsList({ interviews }: InterviewRoundsListProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Interview Rounds</h2>
      {interviews.map(intv => (
        <div key={intv.id} className="border border-gray-200 rounded-md p-4 space-y-3">
          <p className="text-gray-700">
            <strong>Scheduled:</strong> {new Date(intv.scheduledAt).toLocaleString()} @ {intv.location}
          </p>
          <p className="text-gray-700">
            <strong>Status:</strong> {intv.status}
          </p>
          <InterviewFeedbackForm interviewId={intv.id.toString()} initialFeedbacks={[]} />
          <div className="flex space-x-3">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
              Reject
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
              Accept & Next
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
