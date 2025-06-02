import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

const stageSchema = z.object({
  stage: z.enum(['SCREENING', 'INTERVIEW_INVITATION_SENT', 'INTERVIEW', 'OFFER', 'REJECTED']),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const applicationId = parseInt(params.id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }

  // Authorization: only SUPER_ADMIN or SCHOOL_ADMIN
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { managedSchools: true },
  });
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { jobPosting: true },
  });
  if (!user || !app) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const isAuthorized =
    user.role === 'SUPER_ADMIN' ||
    user.managedSchools.some(s => s.school_id === app.jobPosting.schoolId);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { stage } = stageSchema.parse(body);
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { currentStage: stage },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error updating application stage:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update application stage' }, { status: 500 });
  }
}
