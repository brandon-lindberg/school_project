'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';

interface Slot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  user: { user_id: string; first_name: string; family_name: string };
  date: string;
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
  const { data: session } = useSession();
  const currentUserId: string | null = session?.user?.id ?? null;
  const [slots, setSlots] = useState<Slot[]>([]);
  // Add-slot form fields
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState<number>(30); // minutes
  const [partOfDay, setPartOfDay] = useState<'morning' | 'afternoon'>('morning');
  const [startTime, setStartTime] = useState('08:00');
  const [error, setError] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [editDayOfWeek, setEditDayOfWeek] = useState<string>('');
  const [editStartTime, setEditStartTime] = useState<string>('');
  const [editEndTime, setEditEndTime] = useState<string>('');
  const [updatingSlot, setUpdatingSlot] = useState(false);

  useEffect(() => {
    async function loadSlots() {
      try {
        const res = await fetch(`/api/applications/${applicationId}/availability-slots`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load availability slots');
        const data: Slot[] = await res.json();
        const now = Date.now();
        const upcoming = data.filter(s => new Date(`${s.date}T${s.endTime}`).getTime() > now);
        setSlots(upcoming);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      }
    }
    loadSlots();
  }, [applicationId]);

  async function addSlot() {
    // Compute endTime based on duration
    const [h0, m0] = startTime.split(':').map(Number);
    const startMinutes = h0 * 60 + m0;
    const endMinutes = startMinutes + duration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    // Prevent duplicate slots
    if (slots.some(s => s.date === selectedDate && s.startTime === startTime && s.endTime === endTime)) {
      setError('This availability slot already exists');
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}/availability-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, startTime, endTime }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add slot');
      }
      const newSlot = await res.json();
      setSlots(prev => [...prev, newSlot]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  }

  async function deleteSlot(slotId: string) {
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}/availability-slots/${slotId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete slot');
      }
      setSlots(prev => prev.filter(s => s.id !== slotId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  }

  function startEditing(slot: Slot) {
    setError(null);
    setEditingSlot(slot);
    setEditDayOfWeek(slot.dayOfWeek);
    setEditStartTime(slot.startTime);
    setEditEndTime(slot.endTime);
  }

  async function saveEdit() {
    if (!editingSlot) return;
    // Prevent duplicate on update
    if (
      slots.some(
        s => s.id !== editingSlot.id && s.dayOfWeek === editDayOfWeek && s.startTime === editStartTime && s.endTime === editEndTime
      )
    ) {
      setError('Another slot with these times already exists');
      return;
    }
    setError(null);
    setUpdatingSlot(true);
    try {
      const res = await fetch(
        `/api/applications/${applicationId}/availability-slots/${editingSlot.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dayOfWeek: editDayOfWeek, startTime: editStartTime, endTime: editEndTime }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update slot');
      }
      const updated = await res.json();
      setSlots(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      setEditingSlot(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setUpdatingSlot(false);
    }
  }

  // Only show days with at least one slot
  const activeDays = days.filter(day => slots.some(s => s.dayOfWeek === day));

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
      {/* Inline edit form */}
      {editingSlot && (
        <div className="mt-4 bg-yellow-50 rounded-md p-4 space-y-4">
          <h3 className="text-lg font-semibold">Edit Availability</h3>
          <div className="grid grid-cols-3 gap-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Day</span>
              <select
                value={editDayOfWeek}
                onChange={e => setEditDayOfWeek(e.target.value)}
                className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={editStartTime}
                onChange={e => setEditStartTime(e.target.value)}
                className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">End</span>
              <input
                type="time"
                value={editEndTime}
                onChange={e => setEditEndTime(e.target.value)}
                className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
          <div className="mt-4 space-x-2">
            <button
              onClick={saveEdit}
              disabled={updatingSlot}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              {updatingSlot ? 'Updating...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setEditingSlot(null)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-800">Availability</h3>
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        <div className="grid grid-flow-col auto-cols-min gap-4">
          {activeDays.map(day => (
            <div key={day} className="flex flex-col min-w-[12rem] bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700">{formatDayHeader(day)}</div>
              <div className="flex-1 p-2 space-y-1">
                {slots.filter(s => s.dayOfWeek === day).map(s => (
                  <div key={s.id} className="bg-white p-2 rounded text-sm text-gray-600 shadow-inner flex flex-col space-y-1">
                    <div className="font-medium">
                      {new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="font-semibold">{s.startTime} - {s.endTime}</div>
                    <div className="text-gray-700">by {s.user.first_name}</div>
                    {currentUserId === s.user.user_id && (
                      <div className="flex space-x-2">
                        <button onClick={() => startEditing(s)} className="text-blue-600 hover:underline">
                          Edit
                        </button>
                        <button onClick={() => deleteSlot(s.id)} className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 bg-gray-50 rounded-md p-4 space-y-4">
        <div className="grid grid-cols-3 gap-6">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Date</span>
            <input
              type="date"
              className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Duration</span>
            <select
              className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value, 10))}
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Session</span>
            <select
              className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={partOfDay}
              onChange={e => setPartOfDay(e.target.value as 'morning' | 'afternoon')}
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
            </select>
          </label>
        </div>
        <div className="mt-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Time</span>
            <select
              className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            >
              {useMemo(() => {
                const times: string[] = [];
                const startMinute = partOfDay === 'morning' ? 8 * 60 : 12 * 60;
                const endMinute = partOfDay === 'morning' ? 12 * 60 : 18 * 60;
                for (let t = startMinute; t + duration <= endMinute; t += duration) {
                  const h = Math.floor(t / 60);
                  const m = t % 60;
                  times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                }
                return times;
              }, [duration, partOfDay])?.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
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
