import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(request: NextRequest, context: unknown) {
  // Extract dynamic route params
  const { params } = context as { params: { id: string } };
  const { id } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const schoolId = id;

  // Only super admins or managed school admins can view
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { managedSchools: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const isAuthorized =
    user.role === 'SUPER_ADMIN' ||
    user.managedSchools.some(admin => admin.school_id === schoolId);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Support filtering by jobPostingId via query string
    const url = new URL(request.url);
    const jobPostingIdParam = url.searchParams.get('jobPostingId');
    const whereClause: Prisma.ApplicationWhereInput = jobPostingIdParam
      ? {
        jobPostingId: parseInt(jobPostingIdParam, 10),
        jobPosting: { is: { schoolId } },
      }
      : {
        jobPosting: { is: { schoolId } },
      };
    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        notes: { orderBy: { createdAt: 'desc' } },
        offer: true,
        journalEntries: {
          orderBy: { createdAt: 'desc' },
          select: { rating: true, createdAt: true },
        },
        interviews: { select: { id: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
    console.log(`GET /api/schools/${schoolId}/recruitment/applications`, applications);
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
