'use client';

import { useState } from 'react';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface Feedback {
  id: number;
  content: string;
  rating?: number;
  createdAt: string;
}

interface InterviewFeedbackFormProps {
  interviewId: string;
  initialFeedbacks: Feedback[];
}

export default function InterviewFeedbackForm({ interviewId, initialFeedbacks }: InterviewFeedbackFormProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, rating }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }
      const newFb = await res.json();
      setFeedbacks(prev => [newFb, ...prev]);
      setContent('');
      setRating(1);
    } catch (err: any) {
      setError(err.message);
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
            <p className="text-sm text-gray-600 flex items-center">
              {fb.rating ? (
                Array.from({ length: fb.rating }).map((_, i) => (
                  <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
                ))
              ) : (
                <span className="text-xs text-gray-500">No Rating</span>
              )}
              <span className="ml-2">— {new Date(fb.createdAt).toLocaleString()}</span>
            </p>
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
        <div>
          <label className="text-sm font-medium">Rating</label>
          <div className="mt-1 flex space-x-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="focus:outline-none"
              >
                {rating >= n ? (
                  <StarSolidIcon className="h-6 w-6 text-yellow-400" />
                ) : (
                  <StarOutlineIcon className="h-6 w-6 text-gray-300" />
                )}
              </button>
            ))}
          </div>
        </div>
        <button onClick={submitFeedback} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
