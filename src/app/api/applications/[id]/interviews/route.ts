import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

const interviewSchema = z.object({
  scheduledAt: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  location: z.string(),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const applicationId = parseInt(params.id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { scheduledAt, location } = interviewSchema.parse(body);
    const interviewerId = parseInt(session.user.id, 10);

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        interviewerId,
        scheduledAt: new Date(scheduledAt),
        location,
      },
    });

    // create notification for applicant
    await prisma.notification.create({
      data: {
        user_id: (await prisma.application.findUnique({ where: { id: applicationId } }))?.userId || 0,
        type: 'MESSAGE_RECEIVED',
        title: 'Interview Scheduled',
        message: `Your interview has been scheduled for ${new Date(scheduledAt).toLocaleString()} at ${location}`,
      },
    });

    return NextResponse.json(interview, { status: 201 });
  } catch (err: any) {
    console.error('Error scheduling interview:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to schedule interview' }, { status: 500 });
  }
}
