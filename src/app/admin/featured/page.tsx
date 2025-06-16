'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface SchoolOption {
  school_id: string;
  name: string;
}

interface SlotState {
  id?: number;
  slotNumber: number;
  schoolId?: string;
  startDate: string;
  endDate: string;
}

// Raw featured slot from API
interface RawSlot {
  id: number;
  slotNumber: number;
  startDate: string;
  endDate: string;
  schoolId: string;
}

// New schedule entry type
interface NewSchedule {
  schoolId?: string;
  startDate: string;
  endDate: string;
}

export default function AdminFeaturedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [slots, setSlots] = useState<SlotState[]>(
    Array.from({ length: 4 }, (_, i) => ({ slotNumber: i + 1, startDate: '', endDate: '' }))
  );
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [allSlots, setAllSlots] = useState<SlotState[]>([]);
  const [newSchedules, setNewSchedules] = useState<NewSchedule[]>(
    Array.from({ length: 4 }, () => ({ schoolId: undefined, startDate: '', endDate: '' }))
  );
  const [editingUpcomingId, setEditingUpcomingId] = useState<number | null>(null);
  const [editingUpcomingData, setEditingUpcomingData] = useState<{ schoolId?: string; startDate: string; endDate: string }>({ schoolId: undefined, startDate: '', endDate: '' });
  const [updatingUpcomingId, setUpdatingUpcomingId] = useState<number | null>(null);

  // Guard access
  useEffect(() => {
    if (status === 'authenticated' && session?.user.role !== 'SUPER_ADMIN') {
      router.replace('/');
    }
  }, [status, session, router]);

  // Fetch initial data
  useEffect(() => {
    if (status !== 'authenticated') return;
    const load = async () => {
      try {
        // fetch existing featured slots
        const resSlots = await fetch('/api/admin/featured');
        const dataSlots = (await resSlots.json()) as RawSlot[];
        setAllSlots(dataSlots);
        // fetch all schools
        const resSchools = await fetch('/api/admin/schools');
        const dataSchools = (await resSchools.json()) as SchoolOption[];
        // map schools
        setSchools(dataSchools);
        // build slots state to show currently active schedules (date-only inclusive)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const state: SlotState[] = Array.from({ length: 4 }, (_, i) => {
          const slotNum = i + 1;
          // filter slots for this slot number
          const relevantSlots = dataSlots.filter(d => d.slotNumber === slotNum);
          // find active slot
          const activeSlot = relevantSlots.find(d => {
            const startDate = new Date(d.startDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(d.endDate);
            endDate.setHours(0, 0, 0, 0);
            return startDate.getTime() <= today.getTime() && endDate.getTime() >= today.getTime();
          });
          if (activeSlot) {
            return {
              id: activeSlot.id,
              slotNumber: activeSlot.slotNumber,
              schoolId: activeSlot.schoolId,
              startDate: activeSlot.startDate.split('T')[0],
              endDate: activeSlot.endDate.split('T')[0],
            };
          }
          // no active schedule, show blank
          return { slotNumber: slotNum, startDate: '', endDate: '' };
        });
        setSlots(state);
      } catch (error) {
        console.error('Error loading featured admin data', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [status]);

  const handleChange = (
    index: number,
    key: keyof SlotState,
    value: SlotState[keyof SlotState]
  ) => {
    setSlots(curr =>
      curr.map((slot, i) =>
        i === index ? { ...slot, [key]: value } : slot
      )
    );
  };

  const handleNewChange = (
    index: number,
    key: keyof NewSchedule,
    value: NewSchedule[keyof NewSchedule]
  ) => {
    setNewSchedules(curr =>
      curr.map((sched, i) =>
        i === index ? { ...sched, [key]: value } : sched
      )
    );
  };

  const handleScheduleNext = async (index: number) => {
    const sched = newSchedules[index];
    if (!sched.schoolId || !sched.startDate || !sched.endDate || sched.startDate > sched.endDate) {
      toast.error('Invalid new schedule data');
      return;
    }
    // Prevent overlapping schedules in the same slot
    const slotNum = index + 1;
    const newStart = new Date(sched.startDate);
    newStart.setHours(0, 0, 0, 0);
    const newEnd = new Date(sched.endDate);
    newEnd.setHours(23, 59, 59, 999);
    const conflict = allSlots
      .filter(d => d.slotNumber === slotNum)
      .some(d => {
        const existingStart = new Date(d.startDate);
        existingStart.setHours(0, 0, 0, 0);
        const existingEnd = new Date(d.endDate);
        existingEnd.setHours(23, 59, 59, 999);
        return newStart <= existingEnd && newEnd >= existingStart;
      });
    if (conflict) {
      toast.error('This schedule overlaps an existing schedule for this slot.');
      return;
    }
    setSavingSlot(index);
    try {
      const body = { slotNumber: index + 1, schoolId: sched.schoolId, startDate: sched.startDate, endDate: sched.endDate };
      const res = await fetch('/api/admin/featured', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        const data = await res.json();
        setAllSlots(curr => [...curr, data]);
        toast.success('Future schedule added');
        setNewSchedules(curr => curr.map((s, i) => i === index ? { schoolId: undefined, startDate: '', endDate: '' } : s));
      } else {
        const err = await res.json();
        toast.error(err.error || 'Scheduling failed');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error scheduling new slot');
    } finally {
      setSavingSlot(null);
    }
  };

  const handleSave = async (index: number) => {
    const slot = slots[index];
    // basic validation
    if (!slot.schoolId || !slot.startDate || !slot.endDate || slot.startDate > slot.endDate) {
      alert('Invalid slot data');
      return;
    }
    setSavingSlot(index);
    try {
      const body = {
        slotNumber: slot.slotNumber,
        schoolId: slot.schoolId,
        startDate: slot.startDate,
        endDate: slot.endDate,
      };
      let res;
      if (slot.id) {
        res = await fetch(`/api/admin/featured/${slot.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/admin/featured', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
      }
      if (res.ok) {
        const data = await res.json();
        handleChange(index, 'id', data.id);
        setAllSlots(curr => {
          const exists = curr.find(d => d.id === data.id);
          if (exists) {
            return curr.map(d => d.id === data.id ? data : d);
          }
          return [...curr, data];
        });
        alert('Slot saved');
      } else {
        const err = await res.json();
        alert(err.error || 'Save failed');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving slot');
    } finally {
      setSavingSlot(null);
    }
  };

  const handleClear = async (index: number) => {
    const slot = slots[index];
    if (!slot.id) {
      // nothing to clear
      handleChange(index, 'schoolId', undefined);
      handleChange(index, 'startDate', '');
      handleChange(index, 'endDate', '');
      return;
    }
    setSavingSlot(index);
    try {
      const res = await fetch(`/api/admin/featured/${slot.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSlots(curr => curr.map((s, i) => i === index ? { slotNumber: s.slotNumber, startDate: '', endDate: '' } : s));
        setAllSlots(curr => curr.filter(d => d.id !== slot.id));
        alert('Slot cleared');
      } else {
        const err = await res.json();
        alert(err.error || 'Clear failed');
      }
    } catch (e) {
      console.error(e);
      alert('Error clearing slot');
    } finally {
      setSavingSlot(null);
    }
  };

  const handleEditUpcoming = (id: number, schoolId: string, startISO: string, endISO: string) => {
    setEditingUpcomingId(id);
    setEditingUpcomingData({
      schoolId,
      startDate: startISO.split('T')[0],
      endDate: endISO.split('T')[0],
    });
  };

  const handleUpdateUpcoming = async (id: number, slotNumber: number) => {
    const d = editingUpcomingData;
    if (!d.schoolId || !d.startDate || !d.endDate || d.startDate > d.endDate) {
      alert('Invalid data');
      return;
    }
    setUpdatingUpcomingId(id);
    try {
      const body = { slotNumber, schoolId: d.schoolId, startDate: d.startDate, endDate: d.endDate };
      const res = await fetch(`/api/admin/featured/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        setAllSlots(curr => curr.map(d => d.id === id ? updated : d));
        alert('Upcoming schedule updated');
        setEditingUpcomingId(null);
      } else {
        const err = await res.json(); alert(err.error || 'Update failed');
      }
    } catch (e) {
      console.error(e); alert('Error updating upcoming schedule');
    } finally {
      setUpdatingUpcomingId(null);
    }
  };

  const handleDeleteUpcoming = async (id: number) => {
    if (!confirm('Are you sure you want to delete this upcoming schedule?')) return;
    setUpdatingUpcomingId(id);
    try {
      const res = await fetch(`/api/admin/featured/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAllSlots(curr => curr.filter(d => d.id !== id));
        setEditingUpcomingId(null);
        alert('Upcoming schedule deleted');
      } else {
        const err = await res.json(); alert(err.error || 'Delete failed');
      }
    } catch (e) {
      console.error(e); alert('Error deleting upcoming schedule');
    } finally {
      setUpdatingUpcomingId(null);
    }
  };

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Featured Schools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {slots.map((slot, idx) => (
          <div key={slot.slotNumber} className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Slot {slot.slotNumber}</h2>
            <label className="block mb-2">
              <span className="text-sm">School</span>
              <select
                className="mt-1 block w-full border rounded p-2"
                value={slot.schoolId || ''}
                onChange={e => handleChange(idx, 'schoolId', e.target.value || undefined)}
              >
                <option value="">-- Select School --</option>
                {schools.map(s => (
                  <option key={s.school_id} value={s.school_id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="block mb-2">
              <span className="text-sm">Start Date</span>
              <input
                type="date"
                className="mt-1 block w-full border rounded p-2"
                value={slot.startDate}
                onChange={e => handleChange(idx, 'startDate', e.target.value)}
              />
            </label>
            <label className="block mb-4">
              <span className="text-sm">End Date</span>
              <input
                type="date"
                className="mt-1 block w-full border rounded p-2"
                value={slot.endDate}
                onChange={e => handleChange(idx, 'endDate', e.target.value)}
              />
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSave(idx)}
                disabled={savingSlot === idx}
                className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {slot.id ? 'Update' : 'Save'}
              </button>
              <button
                onClick={() => handleClear(idx)}
                disabled={savingSlot === idx}
                className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Clear
              </button>
            </div>
            {/* Schedule Next and Upcoming Schedules (up to 5) */}
            {(function () {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const futureSlots = allSlots.filter(d => d.slotNumber === slot.slotNumber);
              const upcomingSlots = futureSlots
                .filter(d => {
                  const start = new Date(d.startDate);
                  start.setHours(0, 0, 0, 0);
                  return start.getTime() > today.getTime();
                })
                .sort((a, b) => {
                  const aDate = new Date(a.startDate);
                  aDate.setHours(0, 0, 0, 0);
                  const bDate = new Date(b.startDate);
                  bDate.setHours(0, 0, 0, 0);
                  return aDate.getTime() - bDate.getTime();
                })
                .slice(0, 5);
              return (
                <>
                  <div className="mt-4 pt-4 border-t">
                    {upcomingSlots.length < 5 ? (
                      <>
                        <h3 className="font-medium mb-2">Schedule Next (Slot {slot.slotNumber})</h3>
                        <select
                          className="mb-2 block w-full border rounded p-2"
                          value={newSchedules[idx].schoolId || ''}
                          onChange={e => handleNewChange(idx, 'schoolId', e.target.value || undefined)}
                        >
                          <option value="">-- Select School --</option>
                          {schools.map(s => (
                            <option key={s.school_id} value={s.school_id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="date"
                          className="mb-2 block w-full border rounded p-2"
                          value={newSchedules[idx].startDate}
                          onChange={e => handleNewChange(idx, 'startDate', e.target.value)}
                        />
                        <input
                          type="date"
                          className="mb-4 block w-full border rounded p-2"
                          value={newSchedules[idx].endDate}
                          onChange={e => handleNewChange(idx, 'endDate', e.target.value)}
                        />
                        <button
                          onClick={() => handleScheduleNext(idx)}
                          disabled={savingSlot === idx}
                          className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          Schedule Next
                        </button>
                      </>
                    ) : (
                      <div className="p-2 bg-yellow-50 text-sm text-gray-700 rounded">
                        Maximum of 5 upcoming schedules reached.
                      </div>
                    )}
                  </div>
                  <div className="mt-4 mb-4 p-2 bg-gray-50 rounded">
                    <h3 className="font-medium mb-1">Currently Scheduled (Slot {slot.slotNumber})</h3>
                    <ol className="list-none space-y-4 ml-4 mb-4">
                      {slot.id ? (
                        <li key={slot.id} className="p-4 bg-white border border-gray-200 rounded">
                          {editingUpcomingId === slot.id ? (
                            <div className="space-y-2">
                              <label className="block">
                                <span className="text-sm">School</span>
                                <select
                                  className="mt-1 block w-full border rounded p-2"
                                  value={editingUpcomingData.schoolId || ''}
                                  onChange={e => setEditingUpcomingData(curr => ({ ...curr, schoolId: e.target.value || undefined }))}
                                >
                                  <option value="">-- Select School --</option>
                                  {schools.map(s => (
                                    <option key={s.school_id} value={s.school_id}>{s.name}</option>
                                  ))}
                                </select>
                              </label>
                              <label className="block">
                                <span className="text-sm">Start Date</span>
                                <input
                                  type="date"
                                  className="mt-1 block w-full border rounded p-2"
                                  value={editingUpcomingData.startDate}
                                  onChange={e => setEditingUpcomingData(curr => ({ ...curr, startDate: e.target.value }))}
                                />
                              </label>
                              <label className="block">
                                <span className="text-sm">End Date</span>
                                <input
                                  type="date"
                                  className="mt-1 block w-full border rounded p-2"
                                  value={editingUpcomingData.endDate}
                                  onChange={e => setEditingUpcomingData(curr => ({ ...curr, endDate: e.target.value }))}
                                />
                              </label>
                              <div className="flex space-x-2 pt-2">
                                <button
                                  onClick={() => handleUpdateUpcoming(slot.id!, slot.slotNumber)}
                                  disabled={updatingUpcomingId === slot.id}
                                  className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                                >Save</button>
                                <button
                                  onClick={() => setEditingUpcomingId(null)}
                                  className="flex-1 bg-gray-300 text-gray-800 px-3 py-2 rounded"
                                >Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-semibold">{schools.find(s => s.school_id === slot.schoolId)?.name || 'Unknown School'}</p>
                              <p className="text-sm">Start: {new Date(slot.startDate).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}</p>
                              <p className="text-sm">End: {new Date(slot.endDate).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}</p>
                              <div className="flex space-x-2 pt-2">
                                <button onClick={() => handleEditUpcoming(slot.id!, slot.schoolId!, slot.startDate, slot.endDate)} className="text-blue-500">Edit</button>
                                <button onClick={() => handleDeleteUpcoming(slot.id!)} className="text-red-500">Delete</button>
                              </div>
                            </div>
                          )}
                        </li>
                      ) : (
                        <li className="p-4 bg-white border border-gray-200 rounded">
                          <p className="text-sm italic text-gray-500">No school scheduled</p>
                        </li>
                      )}
                    </ol>
                    {upcomingSlots.length > 0 && (
                      <>
                        <h3 className="font-medium mb-1">Upcoming Schedules (Slot {slot.slotNumber})</h3>
                        <ol className="list-none space-y-4 ml-4">
                          {upcomingSlots.map((us) => {
                            const isEditing = editingUpcomingId === us.id;
                            const schoolObj = schools.find(s => s.school_id === us.schoolId);
                            const startFormatted = new Date(us.startDate).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
                            const endFormatted = new Date(us.endDate).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
                            return (
                              <li key={us.id} className="p-4 bg-white border border-gray-200 rounded">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <label className="block">
                                      <span className="text-sm">School</span>
                                      <select
                                        className="mt-1 block w-full border rounded p-2"
                                        value={editingUpcomingData.schoolId || ''}
                                        onChange={e => setEditingUpcomingData(curr => ({ ...curr, schoolId: e.target.value || undefined }))}
                                      >
                                        <option value="">-- Select School --</option>
                                        {schools.map(s => (
                                          <option key={s.school_id} value={s.school_id}>{s.name}</option>
                                        ))}
                                      </select>
                                    </label>
                                    <label className="block">
                                      <span className="text-sm">Start Date</span>
                                      <input
                                        type="date"
                                        className="mt-1 block w-full border rounded p-2"
                                        value={editingUpcomingData.startDate}
                                        onChange={e => setEditingUpcomingData(curr => ({ ...curr, startDate: e.target.value }))}
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="text-sm">End Date</span>
                                      <input
                                        type="date"
                                        className="mt-1 block w-full border rounded p-2"
                                        value={editingUpcomingData.endDate}
                                        onChange={e => setEditingUpcomingData(curr => ({ ...curr, endDate: e.target.value }))}
                                      />
                                    </label>
                                    <div className="flex space-x-2 pt-2">
                                      <button
                                        onClick={() => handleUpdateUpcoming(us.id!, slot.slotNumber)}
                                        disabled={updatingUpcomingId === us.id}
                                        className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                                      >Save</button>
                                      <button
                                        onClick={() => setEditingUpcomingId(null)}
                                        className="flex-1 bg-gray-300 text-gray-800 px-3 py-2 rounded"
                                      >Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <p className="font-semibold">{schoolObj?.name || 'Unknown School'}</p>
                                    <p className="text-sm">Start: {startFormatted}</p>
                                    <p className="text-sm">End: {endFormatted}</p>
                                    <div className="flex space-x-2 pt-2">
                                      <button onClick={() => handleEditUpcoming(us.id!, us.schoolId!, us.startDate, us.endDate)} className="text-blue-500">Edit</button>
                                      <button onClick={() => handleDeleteUpcoming(us.id!)} className="text-red-500">Delete</button>
                                    </div>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ol>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
