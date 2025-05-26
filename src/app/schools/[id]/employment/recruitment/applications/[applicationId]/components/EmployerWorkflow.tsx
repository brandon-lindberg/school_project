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
  // Persist review state based on currentStage
  const initialReviewDone = application.currentStage !== 'SCREENING';
  const [reviewDone, setReviewDone] = useState(initialReviewDone);
  // Toggle invitation UI for next round
  const [inviting, setInviting] = useState(false);
  const app = application;

  return (
    <div className="space-y-8">
      {!reviewDone && (
        <ApplicationReview
          applicationId={app.id.toString()}
          onAccept={() => {
            setReviewDone(true);
            refresh();
          }}
          onReject={refresh}
        />
      )}
      {/* Interview invitation for initial or next round */}
      {reviewDone && (app.interviews.length === 0 || inviting) && (
        <InterviewInvitation
          applicationId={app.id.toString()}
          round={app.interviews.length === 0 ? 1 : app.interviews.length + 1}
          refresh={() => { setInviting(false); refresh(); }}
        />
      )}
      {/* Show rounds list when interviews exist and not inviting */}
      {reviewDone && app.interviews.length > 0 && !inviting && (
        <InterviewRoundsList
          applicationId={app.id.toString()}
          interviews={app.interviews}
          onNextRound={() => setInviting(true)}
          onRefresh={refresh}
        />
      )}
      {app.offer && (
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Offer</h2>
          <OfferLetterForm applicationId={app.id.toString()} initialLetterUrl={app.offer.letterUrl} />
        </div>
      )}
    </div>
  );
}
