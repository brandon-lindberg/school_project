'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SchoolOption {
  school_id: number;
  name: string;
}

interface SlotState {
  id?: number;
  slotNumber: number;
  schoolId?: number;
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
  const [newSchedules, setNewSchedules] = useState(
    Array.from({ length: 4 }, () => ({ schoolId: undefined as number | undefined, startDate: '', endDate: '' }))
  );

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
        const dataSlots = await resSlots.json();
        setAllSlots(dataSlots);
        // fetch all schools
        const resSchools = await fetch('/api/admin/schools');
        const dataSchools = await resSchools.json();
        // map schools
        setSchools(dataSchools.map((s: any) => ({ school_id: s.school_id, name: s.name })));
        // build slots state
        const state: SlotState[] = Array.from({ length: 4 }, (_, i) => {
          const found = dataSlots.find((d: any) => d.slotNumber === i + 1);
          return found
            ? {
              id: found.id,
              slotNumber: found.slotNumber,
              schoolId: found.school.school_id,
              startDate: found.startDate.split('T')[0],
              endDate: found.endDate.split('T')[0],
            }
            : { slotNumber: i + 1, startDate: '', endDate: '' };
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

  const handleChange = (index: number, key: keyof SlotState, value: any) => {
    setSlots(curr => {
      const next = [...curr];
      (next[index] as any)[key] = value;
      return next;
    });
  };

  const handleNewChange = (index: number, key: keyof typeof newSchedules[0], value: any) => {
    setNewSchedules(curr => {
      const next = [...curr];
      (next[index] as any)[key] = value;
      return next;
    });
  };

  const handleScheduleNext = async (index: number) => {
    const sched = newSchedules[index];
    if (!sched.schoolId || !sched.startDate || !sched.endDate || sched.startDate > sched.endDate) {
      alert('Invalid new schedule data'); return;
    }
    setSavingSlot(index);
    try {
      const body = { slotNumber: index + 1, schoolId: sched.schoolId, startDate: sched.startDate, endDate: sched.endDate };
      const res = await fetch('/api/admin/featured', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        const data = await res.json();
        setAllSlots(curr => [...curr, data]);
        alert('Future schedule added');
        setNewSchedules(curr => curr.map((s, i) => i === index ? { schoolId: undefined, startDate: '', endDate: '' } : s));
      } else {
        const err = await res.json(); alert(err.error || 'Scheduling failed');
      }
    } catch (e) { console.error(e); alert('Error scheduling new slot'); }
    finally { setSavingSlot(null); }
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
                onChange={e => handleChange(idx, 'schoolId', parseInt(e.target.value) || undefined)}
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
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-2">Schedule Next</h3>
              <select className="mb-2 block w-full border rounded p-2" value={newSchedules[idx].schoolId || ''} onChange={e => handleNewChange(idx, 'schoolId', parseInt(e.target.value) || undefined)}>
                <option value="">-- Select School --</option>
                {schools.map(s => <option key={s.school_id} value={s.school_id}>{s.name}</option>)}
              </select>
              <input type="date" className="mb-2 block w-full border rounded p-2" value={newSchedules[idx].startDate} onChange={e => handleNewChange(idx, 'startDate', e.target.value)} />
              <input type="date" className="mb-4 block w-full border rounded p-2" value={newSchedules[idx].endDate} onChange={e => handleNewChange(idx, 'endDate', e.target.value)} />
              <button onClick={() => handleScheduleNext(idx)} disabled={savingSlot === idx} className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50">Schedule Next</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
