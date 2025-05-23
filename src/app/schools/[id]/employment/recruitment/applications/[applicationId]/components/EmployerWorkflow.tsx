'use client';

import { useState } from 'react';
import ApplicationReview from './ApplicationReview';
import InterviewInvitation from './InterviewInvitation';
import InterviewRoundsList from './InterviewRoundsList';
import OfferLetterForm from './OfferLetterForm';

interface EmployerWorkflowProps {
  application: any;
  refresh: () => void;
}

export default function EmployerWorkflow({ application, refresh }: EmployerWorkflowProps) {
  const [reviewDone, setReviewDone] = useState(false);
  const app = application;

  return (
    <div className="space-y-8">
      {!reviewDone && (
        <ApplicationReview
          applicationId={app.id.toString()}
          onAccept={() => setReviewDone(true)}
          onReject={refresh}
        />
      )}
      {reviewDone && app.interviews.length === 0 && (
        <InterviewInvitation
          applicationId={app.id.toString()}
          refresh={refresh}
        />
      )}
      {app.interviews.length > 0 && <InterviewRoundsList interviews={app.interviews} />}
      {app.offer && (
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Offer</h2>
          <OfferLetterForm applicationId={app.id.toString()} initialLetterUrl={app.offer.letterUrl} />
        </div>
      )}
    </div>
  );
}
