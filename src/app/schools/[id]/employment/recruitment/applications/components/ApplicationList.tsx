'use client';

import Link from 'next/link';

interface Application {
  id: number;
  applicantName: string;
  email: string;
  status: string;
}

interface ApplicationListProps {
  applications: Application[];
  schoolId: string;
}

export default function ApplicationList({ applications, schoolId }: ApplicationListProps) {
  return (
    <ul className="space-y-4">
      {applications.map(app => (
        <li key={app.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
          <div>
            <p className="font-semibold">{app.applicantName}</p>
            <p className="text-sm text-gray-600">{app.email} | {app.status}</p>
          </div>
          <Link
            href={`/schools/${schoolId}/employment/recruitment/applications/${app.id}`}
            className="text-blue-500 hover:underline"
          >
            View
          </Link>
        </li>
      ))}
    </ul>
  );
}
