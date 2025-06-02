'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import react-quill-new to avoid SSR
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface JobPostingFormProps {
  schoolId: string;
  onSuccess: () => void;
}

export default function JobPostingForm({ schoolId, onSuccess }: JobPostingFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState(['']);
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Quill modules and formats
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  };
  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanedRequirements = requirements.filter(req => req.trim() !== '');
      const res = await fetch(`/api/schools/${schoolId}/recruitment/job-postings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, requirements: cleanedRequirements, location, employmentType }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create job posting');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addRequirement = () => setRequirements(prev => [...prev, '']);
  const updateRequirement = (index: number, value: string) => {
    setRequirements(prev => prev.map((req, i) => (i === index ? value : req)));
  };
  const removeRequirement = (index: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <div className="border rounded h-[300px] overflow-hidden">
          <ReactQuill
            value={description}
            onChange={setDescription}
            modules={modules}
            formats={formats}
            theme="snow"
            className="h-full"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Requirements</label>
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input
              type="text"
              value={req}
              onChange={e => updateRequirement(idx, e.target.value)}
              className="flex-grow border rounded p-2"
            />
            <button
              type="button"
              onClick={() => removeRequirement(idx)}
              className="ml-2 text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRequirement}
          className="text-blue-500 hover:underline"
        >
          Add Requirement
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Employment Type</label>
        <input
          type="text"
          value={employmentType}
          onChange={e => setEmploymentType(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Job Posting
        </button>
      </div>
    </form>
  );
}
