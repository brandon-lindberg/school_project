'use client';

import { useState } from 'react';

export default function JournalEntryForm({ applicationId }: { applicationId: string }) {
  const [type, setType] = useState('NOTE');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    try {
      const payload: any = { type, content };
      if (rating) payload.rating = rating;
      const res = await fetch(`/api/applications/${applicationId}/journal-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add journal entry');
      }
      setContent('');
      setRating(undefined);
      // Notify timeline to refresh
      window.dispatchEvent(new Event('journalEntryCreated'));
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Add Journal Entry</h3>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block">
            <span className="text-sm font-medium">Type</span>
            <select
              className="mt-1 block w-full border p-1 rounded"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="NOTE">Note</option>
              <option value="FEEDBACK">Feedback</option>
              <option value="SYSTEM">System</option>
              <option value="JOURNAL">Journal</option>
            </select>
          </label>
        </div>
        <div>
          <label className="block">
            <span className="text-sm font-medium">Rating</span>
            <input
              type="number"
              min={1}
              max={5}
              className="mt-1 block w-full border p-1 rounded"
              value={rating ?? ''}
              onChange={e => setRating(e.target.value ? parseInt(e.target.value, 10) : undefined)}
            />
          </label>
        </div>
      </div>
      <div>
        <label className="block">
          <span className="text-sm font-medium">Content</span>
          <textarea
            rows={3}
            className="mt-1 block w-full border p-1 rounded"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </label>
      </div>
      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Add Entry
      </button>
    </div>
  );
}
