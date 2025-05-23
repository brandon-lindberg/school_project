'use client';

import React, { useState } from 'react';

interface OfferStatusProps {
  offerId: string;
  initialStatus: string;
}

export default function OfferStatus({ offerId, initialStatus }: OfferStatusProps) {
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status !== 'PENDING') {
    return <p>Your response: <strong>{status}</strong></p>;
  }

  return (
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
  );
}
