'use client';

import React, { useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface OfferStatusProps {
  offerId: string;
  initialStatus: string;
  letterUrl: string;
}

export default function OfferStatus({ offerId, initialStatus, letterUrl }: OfferStatusProps) {
  const [status, setStatus] = useState<string>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const respond = async (response: 'ACCEPTED' | 'REJECTED') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/offers/${offerId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to respond to offer');
      }
      setStatus(response);
      // Notify parent to refresh application data
      window.dispatchEvent(new Event('offerResponded'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status !== 'PENDING') {
    return (
      <div>
        <div className="mb-2">
          <a
            href={letterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>View Offer Letter</span>
          </a>
        </div>
        <p>Your response: <strong>{status}</strong></p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2">
        <a
          href={letterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
        >
          <DocumentTextIcon className="h-5 w-5" />
          <span>View Offer Letter</span>
        </a>
      </div>
      <div className="space-x-4">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button
          disabled={loading}
          onClick={() => respond('ACCEPTED')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Accept
        </button>
        <button
          disabled={loading}
          onClick={() => respond('REJECTED')}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
