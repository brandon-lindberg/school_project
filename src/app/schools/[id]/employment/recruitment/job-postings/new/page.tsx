'use client';

import { useRouter, useParams } from 'next/navigation';
import JobPostingForm from '../components/JobPostingForm';

export default function NewJobPostingPage() {
  const router = useRouter();
  const { id: schoolId } = useParams() as { id: string };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Create New Job Posting</h1>
      <JobPostingForm
        schoolId={schoolId!}
        onSuccess={() => router.push(`/schools/${schoolId}/employment/recruitment/job-postings`)}
      />
    </div>
  );
}
