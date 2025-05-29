import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const applicationId = parseInt(params.id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }

  try {
    // Authorization: only SUPER_ADMIN or SCHOOL_ADMIN for this school
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { managedSchools: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { jobPosting: true },
    });
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Determine if this is a reschedule invite (last interview still pending)
    const interviews = await prisma.interview.findMany({ where: { applicationId } });
    const lastInterview = interviews[interviews.length - 1];
    const isRescheduleInvite = lastInterview?.status === 'SCHEDULED';

    const isAuthorized =
      user.role === 'SUPER_ADMIN' ||
      user.managedSchools.some(s => s.school_id === app.jobPosting.schoolId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Ensure slots exist
    const slots = await prisma.availabilitySlot.findMany({ where: { applicationId } });
    if (slots.length === 0) {
      return NextResponse.json({ error: 'No availability slots set' }, { status: 400 });
    }

    // Parse employer-provided location and store on application
    const body = await request.json();
    const location = body?.location;
    const interviewerNames = Array.isArray(body.interviewerNames) ? body.interviewerNames : [];
    if (typeof location !== 'string' || !location.trim()) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }
    await prisma.application.update({ where: { id: applicationId }, data: { currentStage: 'INTERVIEW_INVITATION_SENT', interviewLocation: location, interviewerNames } as any });
    // Notify candidate: initial invite or reschedule
    const jobPosting = app.jobPosting;
    const jobTitle = jobPosting.title;
    const schoolRecord = await prisma.school.findUnique({
      where: { school_id: jobPosting.schoolId },
      select: { name_en: true },
    });
    const schoolName = schoolRecord?.name_en ?? '';
    const title = isRescheduleInvite
      ? `Interview Reschedule Request for ${jobTitle}`
      : `Interview Availability for ${jobTitle}`;
    const message = isRescheduleInvite
      ? `The ${schoolName} school has requested to reschedule your interview for the "${jobTitle}" position. Please select a new time slot in the portal.`
      : `The ${schoolName} school has sent you interview availability for the "${jobTitle}" position. Please select a time slot in the portal.`;
    await prisma.notification.create({
      data: {
        user_id: app.userId || 0,
        type: 'MESSAGE_RECEIVED',
        title,
        message,
        url: `/schools/${jobPosting.schoolId}/employment/recruitment/applications/${applicationId}`,
      } as any,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error sending availability invitation:', err);
    return NextResponse.json({ error: err.message || 'Failed to send availability invitation' }, { status: 500 });
  }
}
