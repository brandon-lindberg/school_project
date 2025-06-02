'use client';

import { useState, useEffect } from 'react';

interface Slot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
}

interface CandidateScheduleProps {
  applicationId: string;
  onScheduled?: () => void;
  interviewId?: string;
  isReschedule?: boolean;
}

export default function CandidateSchedule({ applicationId, onScheduled, interviewId, isReschedule = false }: CandidateScheduleProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [interviewLocation, setInterviewLocation] = useState<string>('');
  const [interviewerNames, setInterviewerNames] = useState<string[]>([]);
  const [appLoading, setAppLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await fetch(`/api/applications/${applicationId}/availability-slots`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load availability');
        const data: Slot[] = await res.json();
        // Only include slots whose end time is in the future
        const now = Date.now();
        const upcoming = data.filter(s => {
          // Build a Date object at the slot's end time
          const dateObj = new Date(s.date);
          const [h, m] = s.endTime.split(':').map(Number);
          dateObj.setHours(h, m, 0, 0);
          return dateObj.getTime() > now;
        });
        setSlots(upcoming);
        if (upcoming.length > 0) {
          setSelectedSlotId(upcoming[0].id);
        } else {
          setSelectedSlotId(null);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
    async function fetchApplication() {
      try {
        const res = await fetch(`/api/applications/${applicationId}`, { cache: 'no-store' });
        if (res.ok) {
          const app = await res.json();
          setInterviewLocation(app.interviewLocation ?? '');
          setInterviewerNames(app.interviewerNames ?? []);
        }
      } catch { }
      setAppLoading(false);
    }
    fetchApplication();
  }, [applicationId]);

  const schedule = async () => {
    setError(null);
    setScheduling(true);
    try {
      const slot = slots.find(s => s.id === selectedSlotId);
      if (!slot) throw new Error('Please select a slot');
      const dateObj = new Date(slot.date);
      const [h, m] = slot.startTime.split(':').map(Number);
      dateObj.setHours(h, m, 0, 0);
      const scheduledAt = dateObj.toISOString();
      if (!interviewLocation) throw new Error('No interview location set by employer');
      let res;
      if (isReschedule && interviewId) {
        res = await fetch(`/api/applications/${applicationId}/interviews/${interviewId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scheduledAt, location: interviewLocation, interviewerNames }),
        });
      } else {
        res = await fetch(`/api/applications/${applicationId}/interviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scheduledAt, location: interviewLocation, interviewerNames }),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to schedule interview');
      }
      setScheduled(true);
      if (onScheduled) onScheduled();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setScheduling(false);
    }
  };

  if (loading || appLoading) return <div className="p-6">Loading availability...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (scheduled) return (
    <div className="p-6 space-y-4">
      <div className="text-green-600">Interview scheduled successfully!</div>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold">Schedule Interview</h2>
      <h3 className="text-lg font-medium">Available Slots</h3>
      <div className="space-y-4">
        {Array.from(new Set(slots.map(s => s.date)))
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .map(dateStr => (
            <div key={dateStr}>
              <div className="text-sm font-medium text-gray-700 mb-1">
                {new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div className="flex flex-wrap gap-2">
                {slots.filter(s => s.date === dateStr).map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSlotId(s.id)}
                    className={`px-3 py-1 rounded text-xs shadow-inner focus:outline-none ${selectedSlotId === s.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    {s.startTime} - {s.endTime}
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>
      <button
        onClick={schedule}
        disabled={scheduling}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
      >
        {scheduling ? 'Scheduling...' : 'Confirm Interview Time'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
