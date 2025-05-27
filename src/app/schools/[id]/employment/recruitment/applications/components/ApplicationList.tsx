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
  rating?: number | null;
  interviews?: { id: number }[];
}

interface ApplicationListProps {
  applications: Application[];
  schoolId: string;
}

export default function ApplicationList({ applications, schoolId }: ApplicationListProps) {
  return (
    <ul className="space-y-4">
      {applications.map(app => {
        const latestRating = app.rating != null ? app.rating : undefined;
        // Define dynamic progress milestones and compute percentage
        const interviewCount = app.interviews?.length || 0;
        const milestones = [
          'Applied',
          'Screening Complete',
          'Invited',
          // Dynamically add interview rounds
          ...Array.from({ length: interviewCount }, (_, i) => `Interview Round ${i + 1}`),
          'Offered',
        ];
        const totalSteps = milestones.length - 1;
        let step = 0;
        // After screening
        if (app.currentStage !== 'SCREENING') step = 1;
        // Invitation sent
        if (app.currentStage === 'INTERVIEW_INVITATION_SENT') step = 2;
        // Advance for interview rounds scheduled
        if (interviewCount > 0) step = 2 + interviewCount;
        // If offered, mark final step
        if (app.status === 'OFFERED') step = totalSteps;
        const percent = Math.round((step / totalSteps) * 100);
        // Derive current status label from milestones
        const currentStatusLabel = milestones[step] || milestones[0];

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
                <p className="text-sm text-gray-600">{app.email} | {currentStatusLabel}</p>
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
