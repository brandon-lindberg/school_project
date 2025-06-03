'use client';

import { useState, useEffect } from 'react';
import AvailabilityGrid from './AvailabilityGrid';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface InterviewInvitationProps {
  applicationId: string;
  refresh: () => void;
  round?: number;
  isReschedule?: boolean;
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

export default function InterviewInvitation({ applicationId, refresh, round = 1, isReschedule = false }: InterviewInvitationProps) {
  const [newInterviewer, setNewInterviewer] = useState<string>('');
  const [interviewerNames, setInterviewerNames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [availabilitySent, setAvailabilitySent] = useState(false);
  const [sendingAvailability, setSendingAvailability] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    async function fetchSuggestions() {
      setError(null);
      try {
        const res = await fetch(`/api/applications/${applicationId}/match-suggestions`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load suggestions');
        const data = await res.json();
        setSuggestions(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestions();
  }, [applicationId]);

  useEffect(() => {
    async function fetchAppState() {
      try {
        const res = await fetch(`/api/applications/${applicationId}`, { cache: 'no-store' });
        if (res.ok) {
          const app = await res.json();
          if (app.currentStage === 'INTERVIEW_INVITATION_SENT') {
            setAvailabilitySent(true);
          }
          setInterviewerNames(app.interviewerNames ?? []);
          setLocation(app.interviewLocation ?? '');
        }
      } catch (err) {
        console.error('Failed to fetch application state:', err);
      } finally {
        setAppLoading(false);
      }
    }
    fetchAppState();
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
        body: JSON.stringify({ location, interviewerNames }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send availability');
      }
      setAvailabilitySent(true);
      refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setSendingAvailability(false);
    }
  };

  const handleReschedule = async () => {
    // On reschedule, just re-send availability invitation
    setError(null);
    await sendAvailability();
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
        body: JSON.stringify({ scheduledAt, location, interviewerNames }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to invite for interview');
      }
      refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold">Interview Invitation{round ? ` (Round ${round})` : ''}</h2>
      {!availabilitySent && !appLoading && (
        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Interviewer Name(s)</span>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                value={newInterviewer}
                onChange={e => setNewInterviewer(e.target.value)}
                className="border border-gray-300 rounded-md p-2 flex-grow"
                placeholder="Enter interviewer name"
              />
              <button
                type="button"
                disabled={!newInterviewer.trim()}
                onClick={() => {
                  setInterviewerNames(prev => [...prev, newInterviewer.trim()]);
                  setNewInterviewer('');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {interviewerNames.map((name, i) => (
              <span key={i} className="bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center space-x-1">
                <span>{name}</span>
                <button
                  type="button"
                  onClick={() => setInterviewerNames(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      {!availabilitySent && !appLoading && (
        <>
          <p className="text-gray-600">Select availability, then pick a suggested slot to invite:</p>
          <AvailabilityGrid applicationId={applicationId} />
          <button
            onClick={async () => {
              if (isReschedule) await handleReschedule(); else await sendAvailability();
            }}
            disabled={sendingAvailability || !location.trim()}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingAvailability
              ? isReschedule ? 'Rescheduling...' : 'Sending Availability...'
              : isReschedule ? 'Confirm & Reschedule' : 'Confirm & Send Availability'}
          </button>
          <div className="mt-4">
            <label className="block">
              <div className="flex items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Location</span>
                <div className="relative flex items-center ml-2 group">
                  <InformationCircleIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-60 bg-gray-800 text-white text-base rounded p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                    Please enter a Google Maps URL for an in-person location or a meeting link for online interviews (Zoom, Google Meet, Microsoft Teams).
                  </div>
                </div>
              </div>
              <input
                type="text"
                className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </label>
          </div>
        </>
      )}
      {availabilitySent && (
        <p className="mt-4 text-green-600">Availability sent to candidate. Waiting for their selection.</p>
      )}
      {loading && <p className="text-gray-500">Loading match suggestions...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && suggestions.length > 0 && !isReschedule && (
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
