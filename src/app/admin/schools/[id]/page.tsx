'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface SchoolData {
  school_id: string;
  image_url: string | null;
  logo_url: string | null;
  name_en: string;
  name_jp: string;
  description_en: string | null;
  description_jp: string | null;
  admissions_language_requirements_students_en: string | null;
  admissions_language_requirements_students_jp: string | null;
  admissions_language_requirements_parents_en: string | null;
  admissions_language_requirements_parents_jp: string | null;
  admissions_age_requirements_en: string | null;
  admissions_age_requirements_jp: string | null;
  address_en: string;
  address_jp: string;
  location_en: string;
  location_jp: string;
  country_en: string;
  country_jp: string;
  url_en: string | null;
  url_jp: string | null;
  phone_en: string | null;
  phone_jp: string | null;
  email_en: string | null;
  email_jp: string | null;
  job_postings_enabled: boolean;
  job_postings_start: string | null;
  job_postings_end: string | null;
}

export default function EditSchoolPage() {
  const fetchedRef = useRef(false);
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { data: session, status } = useSession();
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // wait for authentication and run only once
    if (status !== 'authenticated' || fetchedRef.current) return;
    fetchedRef.current = true;
    // only SUPER_ADMIN or owning SCHOOL_ADMIN
    const role = session?.user.role;
    const isManaged = (session as any)?.user.managedSchools?.some(
      (ms: any) => String(ms.school_id) === id
    );
    if (role !== 'SUPER_ADMIN' && (role !== 'SCHOOL_ADMIN' || !isManaged)) {
      router.replace('/');
      return;
    }
    // fetch school (initial load)
    fetch(`/api/admin/schools/${id}`)
      .then(res => res.json())
      .then(data => setSchool(data))
      .catch(err => { console.error(err); toast.error('Failed to load school'); })
      .finally(() => setLoading(false));
  }, [status, session, id, router]);

  const handleChange = (key: keyof Omit<SchoolData, 'school_id'>, value: any) => {
    if (!school) return;
    setSchool({ ...school, [key]: value });
  };

  const handleSave = async () => {
    if (!school) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/schools/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(school),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      toast.success('School updated');
      // Redirect based on user role
      if (session?.user.role === 'SCHOOL_ADMIN') {
        router.push('/list');
      } else {
        router.push('/admin/schools');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!school) return <p className="p-4 text-red-500">School not found</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit School - {school.name_en ?? school.name_jp}</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Image URL</label>
          <input type="url" className="w-full border p-2 rounded" value={school.image_url ?? ''} onChange={e => handleChange('image_url', e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Logo URL</label>
          <input type="url" className="w-full border p-2 rounded" value={school.logo_url ?? ''} onChange={e => handleChange('logo_url', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Name (EN)</label>
            <input type="text" className="w-full border p-2 rounded" value={school.name_en ?? ''} onChange={e => handleChange('name_en', e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Name (JP)</label>
            <input type="text" className="w-full border p-2 rounded" value={school.name_jp ?? ''} onChange={e => handleChange('name_jp', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Description (EN)</label>
          <textarea className="w-full border p-2 rounded" value={school.description_en ?? ''} onChange={e => handleChange('description_en', e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description (JP)</label>
          <textarea className="w-full border p-2 rounded" value={school.description_jp ?? ''} onChange={e => handleChange('description_jp', e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Student Language Req (EN)</label>
          <input type="text" className="w-full border p-2 rounded" value={school.admissions_language_requirements_students_en ?? ''} onChange={e => handleChange('admissions_language_requirements_students_en', e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Student Language Req (JP)</label>
          <input type="text" className="w-full border p-2 rounded" value={school.admissions_language_requirements_students_jp ?? ''} onChange={e => handleChange('admissions_language_requirements_students_jp', e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Parent Language Req (EN)</label>
          <input type="text" className="w-full border p-2 rounded" value={school.admissions_language_requirements_parents_en ?? ''} onChange={e => handleChange('admissions_language_requirements_parents_en', e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Parent Language Req (JP)</label>
          <input type="text" className="w-full border p-2 rounded" value={school.admissions_language_requirements_parents_jp ?? ''} onChange={e => handleChange('admissions_language_requirements_parents_jp', e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Age Requirements (EN)</label>
          <input type="text" className="w-full border p-2 rounded" value={school.admissions_age_requirements_en ?? ''} onChange={e => handleChange('admissions_age_requirements_en', e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Age Requirements (JP)</label>
          <input type="text" className="w-full border p-2 rounded" value={school.admissions_age_requirements_jp ?? ''} onChange={e => handleChange('admissions_age_requirements_jp', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Address (EN)</label>
            <input type="text" className="w-full border p-2 rounded" value={school.address_en ?? ''} onChange={e => handleChange('address_en', e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address (JP)</label>
            <input type="text" className="w-full border p-2 rounded" value={school.address_jp ?? ''} onChange={e => handleChange('address_jp', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">City (EN)</label>
            <input type="text" className="w-full border p-2 rounded" value={school.location_en ?? ''} onChange={e => handleChange('location_en', e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 font-medium">City (JP)</label>
            <input type="text" className="w-full border p-2 rounded" value={school.location_jp ?? ''} onChange={e => handleChange('location_jp', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Country (EN)</label>
            <input type="text" className="w-full border p-2 rounded" value={school.country_en ?? ''} onChange={e => handleChange('country_en', e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Country (JP)</label>
            <input type="text" className="w-full border p-2 rounded" value={school.country_jp ?? ''} onChange={e => handleChange('country_jp', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Website (EN)</label>
          <input type="url" className="w-full border p-2 rounded" value={school.url_en ?? ''} onChange={e => handleChange('url_en', e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Website (JP)</label>
          <input type="url" className="w-full border p-2 rounded" value={school.url_jp ?? ''} onChange={e => handleChange('url_jp', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Phone (EN)</label>
            <input type="tel" className="w-full border p-2 rounded" value={school.phone_en ?? ''} onChange={e => handleChange('phone_en', e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone (JP)</label>
            <input type="tel" className="w-full border p-2 rounded" value={school.phone_jp ?? ''} onChange={e => handleChange('phone_jp', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Email (EN)</label>
            <input type="email" className="w-full border p-2 rounded" value={school.email_en ?? ''} onChange={e => handleChange('email_en', e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email (JP)</label>
            <input type="email" className="w-full border p-2 rounded" value={school.email_jp ?? ''} onChange={e => handleChange('email_jp', e.target.value)} />
          </div>
        </div>
        {session?.user.role === 'SUPER_ADMIN' && (
          <div className="border-t pt-4 mt-4">
            <h2 className="text-lg font-medium mb-2">Job Postings Feature</h2>
            <div className="flex items-center mb-4">
              <input
                id="job-postings-enabled"
                type="checkbox"
                className="h-4 w-4 mr-2"
                checked={school.job_postings_enabled}
                onChange={e => handleChange('job_postings_enabled', e.target.checked)}
              />
              <label htmlFor="job-postings-enabled" className="font-medium">
                Enable job postings
              </label>
            </div>
            {school.job_postings_enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Start Date</label>
                  <input
                    type="date"
                    className="w-full border p-2 rounded"
                    value={school.job_postings_start?.slice(0, 10) ?? ''}
                    onChange={e => handleChange('job_postings_start', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">End Date</label>
                  <input
                    type="date"
                    className="w-full border p-2 rounded"
                    value={school.job_postings_end?.slice(0, 10) ?? ''}
                    onChange={e => handleChange('job_postings_end', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >Save</button>
          <button
            onClick={() => {
              // Redirect based on user role
              if (session?.user.role === 'SCHOOL_ADMIN') {
                router.push('/list');
              } else {
                router.push('/admin/schools');
              }
            }}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
