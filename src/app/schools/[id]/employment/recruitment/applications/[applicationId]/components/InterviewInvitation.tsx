'use client';

import { useState, useEffect } from 'react';
import AvailabilityGrid from './AvailabilityGrid';

interface InterviewInvitationProps {
  applicationId: string;
  refresh: () => void;
}

// Suggestion shape from match-suggestions API
interface Suggestion {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

// Map day abbreviations to JS week indices
const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
function getNextDate(dayAbbrev: string): Date {
  const today = new Date();
  const target = dayMap[dayAbbrev];
  const diff = (target - today.getDay() + 7) % 7;
  const date = new Date(today);
  date.setDate(today.getDate() + diff);
  return date;
}

export default function InterviewInvitation({ applicationId, refresh }: InterviewInvitationProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [availabilitySent, setAvailabilitySent] = useState(false);
  const [sendingAvailability, setSendingAvailability] = useState(false);

  useEffect(() => {
    async function fetchSuggestions() {
      setError(null);
      try {
        const res = await fetch(`/api/applications/${applicationId}/match-suggestions`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load suggestions');
        const data = await res.json();
        setSuggestions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestions();
  }, [applicationId]);

  const sendAvailability = async () => {
    // Ensure employer provided a location
    if (!location.trim()) {
      setError('Please specify a location');
      return;
    }
    setError(null);
    setSendingAvailability(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/availability-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send availability');
      }
      setAvailabilitySent(true);
      refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingAvailability(false);
    }
  };

  const invite = async (s: Suggestion) => {
    if (!location) {
      setError('Please specify a location');
      return;
    }
    setError(null);
    try {
      const date = getNextDate(s.dayOfWeek);
      const [h, m] = s.startTime.split(':').map(Number);
      date.setHours(h, m, 0, 0);
      const scheduledAt = date.toISOString();
      const res = await fetch(`/api/applications/${applicationId}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt, location }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to invite for interview');
      }
      refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold">Interview Invitation</h2>
      <p className="text-gray-600">Select availability, then pick a suggested slot to invite:</p>
      <AvailabilityGrid applicationId={applicationId} />
      {!availabilitySent ? (
        <button
          onClick={sendAvailability}
          disabled={sendingAvailability || !location.trim()}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingAvailability ? 'Sending Availability...' : 'Confirm & Send Availability'}
        </button>
      ) : (
        <p className="mt-4 text-green-600">Availability sent to candidate. Waiting for their selection.</p>
      )}
      <div className="mt-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Location</span>
          <input
            type="text"
            className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </label>
      </div>
      {loading && <p className="text-gray-500">Loading match suggestions...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && suggestions.length === 0 && <p className="text-gray-500">No matching slots found.</p>}
      {!loading && suggestions.length > 0 && (
        <ul className="divide-y divide-gray-200">
          {suggestions.map((s, i) => (
            <li key={i} className="py-3 flex justify-between items-center">
              <span className="text-gray-800">{`${s.dayOfWeek} ${s.startTime} - ${s.endTime}`}</span>
              <button
                onClick={() => invite(s)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Invite
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
