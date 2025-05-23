'use client';

import React, { useState } from 'react';

interface OfferLetterFormProps {
  applicationId: string;
  initialLetterUrl?: string;
}

export default function OfferLetterForm({ applicationId, initialLetterUrl }: OfferLetterFormProps) {
  const [letterUrl, setLetterUrl] = useState<string>(initialLetterUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send offer');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
      <h2 className="text-xl font-semibold">Offer Letter</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Offer sent successfully.</p>}
      <label className="flex flex-col">
        Letter URL
        <input
          type="text"
          value={letterUrl}
          onChange={e => setLetterUrl(e.target.value)}
          required
          className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? 'Sending...' : initialLetterUrl ? 'Update Offer' : 'Send Offer'}
      </button>
    </form>
  );
}
