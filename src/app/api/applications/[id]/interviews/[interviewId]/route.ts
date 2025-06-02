import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { z } from 'zod';

const patchInterviewSchema = z.object({
  scheduledAt: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  location: z.string().optional(),
  interviewerNames: z.array(z.string()).optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED']).optional(),
});

export async function DELETE(request: NextRequest, { params }: { params: any }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // await params for sync-dynamic API compliance
  const { id: applicationIdStr, interviewId: interviewIdStr } = await params;
  const applicationId = parseInt(applicationIdStr, 10);
  const interviewId = parseInt(interviewIdStr, 10);
  if (isNaN(applicationId) || isNaN(interviewId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  // Authorization: only SUPER_ADMIN or SCHOOL_ADMIN for this school
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { managedSchools: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { application: { include: { jobPosting: true } } },
  });
  if (!interview || interview.application.id !== applicationId) {
    return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
  }

  const isAuthorized =
    user.role === 'SUPER_ADMIN' ||
    user.managedSchools.some(s => s.school_id === interview.application.jobPosting.schoolId) ||
    // allow candidate to update their own interview
    user.user_id === interview.application.userId;
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.interview.delete({ where: { id: interviewId } });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, { params }: { params: any }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // await params for sync-dynamic API compliance
  const { id: applicationIdStr, interviewId: interviewIdStr } = await params;
  const applicationId = parseInt(applicationIdStr, 10);
  const interviewId = parseInt(interviewIdStr, 10);
  if (isNaN(applicationId) || isNaN(interviewId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  let parsed;
  try {
    parsed = patchInterviewSchema.parse(body);
  } catch (err: any) {
    return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
  }
  const { scheduledAt, location, interviewerNames, status } = parsed;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { managedSchools: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { application: { include: { jobPosting: true } } },
  });
  if (!interview || interview.application.id !== applicationId) {
    return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
  }

  const isAuthorized =
    user.role === 'SUPER_ADMIN' ||
    user.managedSchools.some(s => s.school_id === interview.application.jobPosting.schoolId) ||
    // allow candidate to update their own interview
    user.user_id === interview.application.userId;
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      ...(scheduledAt !== undefined ? { scheduledAt: new Date(scheduledAt) } : {}),
      ...(location !== undefined ? { location } : {}),
      ...(interviewerNames !== undefined ? { interviewerNames } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  });

  // After scheduling/rescheduling by candidate, update application stage to INTERVIEW
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'IN_PROCESS', currentStage: 'INTERVIEW' } as any,
  });

  return NextResponse.json(updated);
}
