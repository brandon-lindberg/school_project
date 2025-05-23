'use client';

import { useEffect, useState } from 'react';

interface Slot {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  user: { user_id: number; first_name: string; family_name: string };
}

// Map day abbreviations to JavaScript week indices
const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Get the next date for the given day-of-week abbreviation
function getNextDate(dayAbbrev: string): Date {
  const today = new Date();
  const targetIndex = dayMap[dayAbbrev];
  const diff = (targetIndex - today.getDay() + 7) % 7;
  const date = new Date(today);
  date.setDate(today.getDate() + diff);
  return date;
}

// Format the header to include both day abbreviation and full date
function formatDayHeader(dayAbbrev: string): string {
  const date = getNextDate(dayAbbrev);
  return `${dayAbbrev} ${date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AvailabilityGrid({ applicationId }: { applicationId: string }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState('Mon');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    try {
      const res = await fetch(`/api/applications/${applicationId}/availability-slots`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load availability slots');
      setSlots(await res.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function addSlot() {
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}/availability-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek, startTime, endTime }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add slot');
      }
      const newSlot = await res.json();
      setSlots(prev => [...prev, newSlot]);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Availability</h3>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-7 gap-4">
        {days.map(day => (
          <div key={day} className="flex flex-col bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700">{formatDayHeader(day)}</div>
            <div className="flex-1 p-2 space-y-1">
              {slots.filter(s => s.dayOfWeek === day).map(s => (
                <div key={s.id} className="bg-white p-1 rounded text-xs text-gray-600 shadow-inner">
                  {s.startTime} - {s.endTime} by {s.user.first_name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-gray-50 rounded-md p-4 space-y-4">
        <div className="grid grid-cols-3 gap-6">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Day</span>
            <select
              className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dayOfWeek}
              onChange={e => setDayOfWeek(e.target.value)}
            >
              {days.map(day => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Start</span>
            <input
              type="time"
              className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">End</span>
            <input
              type="time"
              className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            />
          </label>
        </div>
        <button
          onClick={addSlot}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Add Slot
        </button>
      </div>
    </div>
  );
}
