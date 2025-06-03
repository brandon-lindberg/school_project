import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { Prisma } from '@prisma/client';

const interviewSchema = z.object({
  scheduledAt: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  location: z.string(),
  interviewerNames: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest, context: unknown) {
  // Extract route params
  const { params } = context as { params: { id: string } };

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const applicationId = parseInt(id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { scheduledAt, location, interviewerNames } = interviewSchema.parse(body);
    const interviewerId = session.user.id;

    // Create interview, connecting relations
    const createData: Prisma.InterviewCreateInput = {
      application: { connect: { id: applicationId } },
      interviewer: { connect: { user_id: interviewerId } },
      scheduledAt: new Date(scheduledAt),
      location,
      interviewerNames: interviewerNames || [],
    };
    const interview = await prisma.interview.create({ data: createData });

    // Update application status and stage now that candidate has scheduled
    const appUpdateData: Prisma.ApplicationUpdateInput = {
      status: 'IN_PROCESS',
      currentStage: 'INTERVIEW',
    };
    await prisma.application.update({ where: { id: applicationId }, data: appUpdateData });
    // Clear out availability slots now that candidate has scheduled
    await prisma.availabilitySlot.deleteMany({ where: { applicationId } });

    // create notification for applicant
    await prisma.notification.create({
      data: {
        user_id: (await prisma.application.findUnique({ where: { id: applicationId } }))?.userId || '',
        type: 'MESSAGE_RECEIVED',
        title: 'Interview Scheduled',
        message: `Your interview has been scheduled for ${new Date(scheduledAt).toLocaleString()} at ${location}`,
      },
    });

    return NextResponse.json(interview, { status: 201 });
  } catch (err) {
    console.error('Error scheduling interview:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to schedule interview' }, { status: 500 });
  }
}
