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
  // Persist review state based on currentStage or if already rejected
  const initialReviewDone = application.currentStage !== 'SCREENING' || application.status === 'REJECTED';
  const [reviewDone, setReviewDone] = useState(initialReviewDone);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Toggle invitation UI for next round
  const [inviting, setInviting] = useState(false);
  const app = application;
  // Determine if awaiting candidate confirmation (invite or reschedule)
  const isInvitingStage = app.currentStage === 'INTERVIEW_INVITATION_SENT';
  // Identify the last interview, if any
  const lastInterview = app.interviews[app.interviews.length - 1];
  // Determine if this invitation is rescheduling an existing scheduled interview
  const isReschedule = isInvitingStage && lastInterview?.status === 'SCHEDULED';
  // Determine round number: first round if no interviews; if rescheduling, use existing round; otherwise next round
  const roundNum = app.interviews.length === 0
    ? 1
    : isReschedule
      ? app.interviews.length
      : app.interviews.length + 1;
  // Track last interview ID for reschedule
  const lastInterviewId = lastInterview ? lastInterview.id.toString() : undefined;

  return (
    <div className="space-y-8">
      {successMessage && (
        <div className="p-4 bg-green-100 text-green-800 rounded mb-4">
          {successMessage}
        </div>
      )}
      {!reviewDone && (
        <ApplicationReview
          applicationId={app.id.toString()}
          onAccept={() => {
            setReviewDone(true);
            refresh();
            setSuccessMessage('Application accepted successfully');
          }}
          onReject={() => {
            setReviewDone(true);
            refresh();
            setSuccessMessage('Application rejected successfully');
          }}
        />
      )}
      {/* Interview invitation for initial or next round, including when awaiting candidate confirmation */}
      {reviewDone && (app.interviews.length === 0 || inviting || isInvitingStage) && !app.offer && app.status !== 'REJECTED' && (
        <InterviewInvitation
          applicationId={app.id.toString()}
          round={roundNum}
          isReschedule={isReschedule}
          interviewId={isReschedule ? lastInterviewId : undefined}
          refresh={() => { setInviting(false); refresh(); }}
        />
      )}
      {/* Show rounds list when interviews exist and not inviting or waiting on candidate */}
      {reviewDone && app.interviews.length > 0 && !inviting && !isInvitingStage && !app.offer && app.status !== 'REJECTED' && (
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
