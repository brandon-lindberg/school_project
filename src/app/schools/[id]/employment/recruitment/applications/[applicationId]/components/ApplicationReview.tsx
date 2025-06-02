'use client';

import { useState } from 'react';

interface ApplicationReviewProps {
  applicationId: string;
  onAccept: () => void;
  onReject?: () => void;
}

export default function ApplicationReview({ applicationId, onAccept, onReject }: ApplicationReviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReject = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reject application');
      }
      onReject?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'INTERVIEW' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to accept application');
      }
      onAccept();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-4 sm:space-y-0">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Review Application</h3>
        {error && <p className="text-red-500 mt-1">{error}</p>}
      </div>
      <div className="flex space-x-3">
        <button
          onClick={handleReject}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? 'Rejecting...' : 'Reject'}
        </button>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? 'Accepting...' : 'Accept'}
        </button>
      </div>
    </div>
  );
}
