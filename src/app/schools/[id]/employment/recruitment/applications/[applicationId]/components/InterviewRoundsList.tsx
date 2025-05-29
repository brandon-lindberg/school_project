'use client';

import InterviewFeedbackForm from './InterviewFeedbackForm';
import InterviewInvitation from './InterviewInvitation';
import { useState, useEffect } from 'react';
import AddToCalendarButton from '@/app/components/AddToCalendarButton';

// Define feedback type for interviews
interface Feedback {
  id: number;
  content: string;
  rating?: number;
  createdAt: string;
}

interface Interview {
  id: number;
  scheduledAt: string;
  location: string;
  status: string;
  interviewer?: { first_name: string; family_name: string };
  interviewerNames?: string[];
  feedback?: Feedback[];
}

interface InterviewRoundsListProps {
  applicationId: string;
  interviews: Interview[];
  onNextRound: () => void;
  onRefresh: () => void;
}

export default function InterviewRoundsList({ applicationId, interviews, onNextRound, onRefresh }: InterviewRoundsListProps) {
  // Track which interview is being rescheduled
  const [reschedulingId, setReschedulingId] = useState<number | null>(null);
  // Track feedbacks per interview
  const [feedbackMap, setFeedbackMap] = useState<Record<number, Feedback[]>>({});

  // Initialize feedbackMap from interviews prop
  useEffect(() => {
    const map: Record<number, Feedback[]> = {};
    interviews.forEach(intv => {
      map[intv.id] = intv.feedback || [];
    });
    setFeedbackMap(map);
  }, [interviews]);

  // Handler to add new feedback into map and mark interview completed
  const handleNewFeedback = (id: number) => async (fb: Feedback) => {
    // update local feedback list
    setFeedbackMap(prev => ({
      ...prev,
      [id]: [fb, ...(prev[id] || [])],
    }));
    // mark interview as completed on the server
    const res = await fetch(`/api/applications/${applicationId}/interviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    if (res.ok) {
      onRefresh();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Interview Rounds</h2>
      {interviews.map((intv, idx) => (
        <div key={intv.id} className="border border-gray-200 rounded-md p-4 space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Round {idx + 1}</h3>
          <p className="text-gray-700">
            <strong>Scheduled:</strong> {new Date(intv.scheduledAt).toLocaleString()}
          </p>
          <p className="text-gray-700">
            <strong>Location:</strong>{' '}
            <a
              href={intv.location}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {intv.location}
            </a>
          </p>
          <p className="text-gray-700">
            <strong>Interviewer(s):</strong>{' '}
            {intv.interviewerNames && intv.interviewerNames.length > 0
              ? intv.interviewerNames.join(', ')
              : ''
            }
          </p>
          <AddToCalendarButton start={intv.scheduledAt} location={intv.location} />
          <p className="text-gray-700">
            <strong>Status:</strong> {intv.status}
          </p>
          {/* Display all saved feedback for this round */}
          {idx !== interviews.length - 1 && feedbackMap[intv.id] && feedbackMap[intv.id].length > 0 && (
            <div className="space-y-2">
              <h4 className="text-lg font-semibold">Feedback</h4>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {feedbackMap[intv.id].map(fb => (
                  <li key={fb.id} className="p-2 bg-gray-50 rounded">
                    <p>{fb.content}</p>
                    <p className="text-sm text-gray-600">— {new Date(fb.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {idx === interviews.length - 1 && (
            <>
              {reschedulingId === intv.id ? (
                <InterviewInvitation
                  applicationId={applicationId}
                  round={idx + 1}
                  isReschedule={true}
                  refresh={() => { setReschedulingId(null); onRefresh(); }}
                />
              ) : (
                <>
                  <InterviewFeedbackForm
                    interviewId={intv.id.toString()}
                    initialFeedbacks={feedbackMap[intv.id] || []}
                    onNewFeedback={handleNewFeedback(intv.id)}
                  />
                  <div className="flex justify-between">
                    <div className="flex space-x-3">
                      <button
                        onClick={async () => {
                          if (!confirm(`Cancel interview round ${idx + 1}?`)) return;
                          const res = await fetch(`/api/applications/${applicationId}/interviews/${intv.id}`, { method: 'DELETE' });
                          if (res.ok) onRefresh(); else alert('Failed to cancel interview');
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setReschedulingId(intv.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={async () => {
                          await fetch(`/api/applications/${applicationId}/interviews/${intv.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'COMPLETED' }),
                          });
                          const fbs = feedbackMap[intv.id] || [];
                          for (const fb of fbs) {
                            await fetch(`/api/applications/${applicationId}/journal-entries`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                type: 'FEEDBACK',
                                content: `Interview Notes (Round ${idx + 1}): ${fb.content}`,
                                rating: fb.rating,
                              }),
                            });
                          }
                          window.dispatchEvent(new Event('journalEntryCreated'));
                          onNextRound();
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                      >
                        Accept & Next
                      </button>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={async () => {
                          if (!confirm('Reject this application?')) return;
                          await fetch(`/api/applications/${applicationId}/interviews/${intv.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'COMPLETED' }),
                          });
                          const res = await fetch(`/api/applications/${applicationId}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'REJECTED' }),
                          });
                          if (res.ok) {
                            await fetch(`/api/applications/${applicationId}/stage`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ stage: 'REJECTED' }),
                            });
                            onRefresh();
                          } else alert('Failed to reject application');
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                      >
                        Reject
                      </button>
                      <button
                        onClick={async () => {
                          await fetch(`/api/applications/${applicationId}/interviews/${intv.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'COMPLETED' }),
                          });
                          await fetch(`/api/applications/${applicationId}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'OFFER' }),
                          });
                          await fetch(`/api/applications/${applicationId}/stage`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ stage: 'OFFER' }),
                          });
                          window.dispatchEvent(new Event('offerRequested'));
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                      >
                        Offer
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          {idx !== interviews.length - 1 && (
            <div className="flex space-x-3">
              <button
                onClick={async () => {
                  if (!confirm('Reject this application?')) return;
                  // mark interview completed
                  await fetch(`/api/applications/${applicationId}/interviews/${intv.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'COMPLETED' }),
                  });
                  // reject application
                  const res = await fetch(`/api/applications/${applicationId}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'REJECTED' }),
                  });
                  if (res.ok) {
                    await fetch(`/api/applications/${applicationId}/stage`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ stage: 'REJECTED' }),
                    });
                    onRefresh();
                  } else alert('Failed to reject application');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Reject
              </button>
              <button
                onClick={async () => {
                  // mark interview completed
                  await fetch(`/api/applications/${applicationId}/interviews/${intv.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'COMPLETED' }),
                  });
                  // open offer form
                  await fetch(`/api/applications/${applicationId}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'OFFER' }),
                  });
                  await fetch(`/api/applications/${applicationId}/stage`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stage: 'OFFER' }),
                  });
                  window.dispatchEvent(new Event('offerRequested'));
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Offer
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
