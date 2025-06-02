'use client';

import { useState } from 'react';

interface Note {
  id: number;
  content: string;
  createdAt: string;
}

interface CandidateNotesProps {
  applicationId: string;
  notes: Note[];
}

export default function CandidateNotes({ applicationId, notes: initialNotes }: CandidateNotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addNote = async () => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add note');
      }
      const note = await res.json();
      setNotes(prev => [note, ...prev]);
      setContent('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notes</h3>
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-y-2">
        {notes.map(note => (
          <div key={note.id} className="p-2 bg-gray-50 rounded">
            <p>{note.content}</p>
            <p className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full border rounded p-2"
          rows={3}
          placeholder="Add a note..."
        />
        <button onClick={addNote} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add Note
        </button>
      </div>
    </div>
  );
}
