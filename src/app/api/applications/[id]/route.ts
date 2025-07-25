import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(request: NextRequest, context: unknown) {
  // Extract route params
  const { params } = context as { params: { id: string } };
  const { id } = params;
  const applicationId = parseInt(id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobPosting: { select: { title: true } },
        notes: { orderBy: { createdAt: 'desc' } },
        interviews: {
          orderBy: { scheduledAt: 'asc' },
          include: {
            interviewer: { select: { user_id: true, first_name: true, family_name: true } },
            feedback: {
              include: { author: { select: { user_id: true, first_name: true, family_name: true } } }
            }
          }
        },
        offer: true,
      },
    });
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    console.log(`GET /api/applications/${applicationId}`, application);
    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: unknown) {
  // Extract route params
  const { params } = context as { params: { id: string } };
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = params;
  const applicationId = parseInt(id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { jobPosting: { select: { schoolId: true } } },
  });
  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }
  const user = await prisma.user.findUnique({ where: { user_id: userId }, select: { role: true } });
  const isAdmin =
    user?.role === 'SUPER_ADMIN' ||
    (user?.role === 'SCHOOL_ADMIN' &&
      (await prisma.schoolAdmin.findFirst({ where: { user_id: userId, school_id: application.jobPosting.schoolId } })));
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const { allowCandidateMessages } = await request.json();
    if (typeof allowCandidateMessages !== 'boolean') {
      return NextResponse.json({ error: 'Invalid allowCandidateMessages value' }, { status: 400 });
    }
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { allowCandidateMessages },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error updating application:', err);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
