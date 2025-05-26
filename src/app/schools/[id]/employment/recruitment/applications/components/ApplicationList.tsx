'use client';

import Link from 'next/link';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface Application {
  id: number;
  applicantName: string;
  email: string;
  status: string;
  currentStage: string;
  journalEntries?: { rating?: number | null }[];
}

interface ApplicationListProps {
  applications: Application[];
  schoolId: string;
}

export default function ApplicationList({ applications, schoolId }: ApplicationListProps) {
  return (
    <ul className="space-y-4">
      {applications.map(app => {
        const latestRating = app.journalEntries && app.journalEntries.length > 0 ? app.journalEntries[0].rating : undefined;
        // Define progress milestones and compute percentage
        const milestones = ['Applied', 'Screening Complete', 'Invited', 'Offered'];
        const totalSteps = milestones.length - 1;
        let step = 0;
        if (app.currentStage !== 'SCREENING') step = 1;
        if (app.currentStage === 'INTERVIEW_INVITATION_SENT') step = 2;
        if (app.status === 'OFFERED') step = 3;
        const percent = Math.round((step / totalSteps) * 100);

        return (
          <li key={app.id} className="bg-white p-4 rounded shadow flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold flex items-center space-x-2">
                  <span>{app.applicantName}</span>
                  {latestRating != null && (
                    <span className="flex space-x-0.5">
                      {[1, 2, 3, 4, 5].map(star =>
                        star <= latestRating ? (
                          <StarSolidIcon key={star} className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <StarOutlineIcon key={star} className="h-4 w-4 text-gray-300" />
                        )
                      )}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">{app.email} | {app.status}</p>
              </div>
              <Link
                href={`/schools/${schoolId}/employment/recruitment/applications/${app.id}`}
                className="text-blue-500 hover:underline"
              >
                View
              </Link>
            </div>
            {/* Progress Bar */}
            <div className="w-full">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                {milestones.map((m, i) => (
                  <span key={i} className={i <= step ? 'font-medium text-blue-600' : ''}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
