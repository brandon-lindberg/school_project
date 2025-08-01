'use client';

import { useState } from 'react';

export default function JournalEntryForm({ applicationId }: { applicationId: string }) {
  const [type, setType] = useState('NOTE');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    try {
      const payload = { type, content };
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
      // Notify timeline to refresh
      window.dispatchEvent(new Event('journalEntryCreated'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Add Journal Entry</h3>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 gap-2">
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
