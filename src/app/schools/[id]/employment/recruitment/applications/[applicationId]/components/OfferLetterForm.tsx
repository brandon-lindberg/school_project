'use client';

import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

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
      window.dispatchEvent(new Event('offerResponded'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
      <h2 className="text-xl font-semibold">Offer Letter</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Offer sent successfully.</p>}
      <div>
        <label className="block text-sm font-medium mb-1 flex items-center">
          Letter URL
          <div className="relative flex items-center ml-2 group">
            <InformationCircleIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-60 bg-gray-800 text-white text-base rounded p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
              We don&apos;t host files directly, please upload your offer letter to a free cloud service (e.g., Google Drive or Dropbox) and paste the shareable link here.
            </div>
          </div>
        </label>
        <input
          type="text"
          value={letterUrl}
          onChange={e => setLetterUrl(e.target.value)}
          required
          className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
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
