'use client';

import { useState } from 'react';

interface Feedback {
  id: number;
  content: string;
  createdAt: string;
}

interface InterviewFeedbackFormProps {
  interviewId: string;
  initialFeedbacks: Feedback[];
  onNewFeedback?: (feedback: Feedback) => void;
}

export default function InterviewFeedbackForm({ interviewId, initialFeedbacks, onNewFeedback }: InterviewFeedbackFormProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }
      const newFb = await res.json();
      setFeedbacks(prev => [newFb, ...prev]);
      if (onNewFeedback) onNewFeedback(newFb);
      setContent('');
      // Notify timeline to refresh new feedback entries
      window.dispatchEvent(new Event('journalEntryCreated'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Feedback</h3>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-2 max-h-40 overflow-y-auto">
        {feedbacks.map(fb => (
          <li key={fb.id} className="p-2 bg-gray-50 rounded">
            <p>{fb.content}</p>
            <p className="text-sm text-gray-600">— {new Date(fb.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-2">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full border rounded p-2"
          rows={3}
          placeholder="Add feedback..."
        />
        <button onClick={submitFeedback} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
