'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { countries } from '@/lib/countries';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function JobApplicationPage() {
  const params = useParams() as { id: string; jobId: string };
  const { id: schoolId, jobId } = params;
  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setApplicantName(session.user.name || '');
      setEmail(session.user.email ?? '');
      setPhone(session.user.phoneNumber ?? '');
    }
  }, [status, session]);
  const [coverLetter, setCoverLetter] = useState('');
  const [hasJapaneseVisa, setHasJapaneseVisa] = useState(false);
  const [certifications, setCertifications] = useState<string[]>(['']);
  const [degrees, setDegrees] = useState<string[]>(['']);
  const [currentResidence, setCurrentResidence] = useState('');
  const [nationality, setNationality] = useState('');
  const [jlpt, setJlpt] = useState('None');
  const [resumeUrl, setResumeUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Derive full country options with placeholder
  const countryOptions = useMemo(
    () => ['Select nationality', ...countries],
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/job-postings/${jobId}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          applicantName,
          email,
          phone,
          coverLetter,
          hasJapaneseVisa,
          certifications: certifications.filter(Boolean),
          degrees: degrees.filter(Boolean),
          currentResidence,
          nationality,
          jlpt,
          resumeUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit application');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (success) {
    return (
      <div className="p-8 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4">Application Submitted</h2>
        <p>Thank you for applying! We will be in touch soon.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Apply for this Position</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={applicantName}
            onChange={e => setApplicantName(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cover Letter</label>
          <textarea
            value={coverLetter}
            onChange={e => setCoverLetter(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={hasJapaneseVisa}
              onChange={e => setHasJapaneseVisa(e.target.checked)}
              className="mr-2"
            />
            I have a Japanese visa
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Certifications</label>
          {certifications.map((cert, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="text"
                value={cert}
                onChange={e => setCertifications(prev => prev.map((c, i) => i === idx ? e.target.value : c))}
                className="flex-grow border rounded p-2"
              />
              <button type="button" onClick={() => setCertifications(prev => prev.filter((_, i) => i !== idx))} className="ml-2 text-red-500">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setCertifications(prev => [...prev, ''])} className="text-blue-500 hover:underline">Add Certification</button>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Degrees</label>
          {degrees.map((deg, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="text"
                value={deg}
                onChange={e => setDegrees(prev => prev.map((d, i) => i === idx ? e.target.value : d))}
                className="flex-grow border rounded p-2"
              />
              <button type="button" onClick={() => setDegrees(prev => prev.filter((_, i) => i !== idx))} className="ml-2 text-red-500">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setDegrees(prev => [...prev, ''])} className="text-blue-500 hover:underline">Add Degree</button>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Current Residence</label>
          <input type="text" value={currentResidence} onChange={e => setCurrentResidence(e.target.value)} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nationality</label>
          <select
            value={nationality}
            onChange={e => setNationality(e.target.value)}
            required
            className="w-full border rounded p-2"
          >
            {countryOptions.map(c => (
              <option key={c} value={c === 'Select nationality' ? '' : c} disabled={c === 'Select nationality'}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">JLPT</label>
          <select
            value={jlpt}
            onChange={e => setJlpt(e.target.value)}
            className="w-full border rounded p-2"
          >
            {['None', 'N1', 'N2', 'N3', 'N4', 'N5'].map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center">
            Resume/CV
            <div className="relative flex items-center ml-2 group">
              <InformationCircleIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-60 bg-gray-800 text-white text-base rounded p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                Since we don't host files directly, please upload your CV to a free cloud service (e.g., Google Drive or Dropbox) and paste the shareable link here.
              </div>
            </div>
          </label>
          <input type="url" value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} className="w-full border rounded p-2" />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}
