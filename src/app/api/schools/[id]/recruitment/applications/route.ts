import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const schoolId = parseInt(id, 10);
  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }

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
    const applications = await prisma.application.findMany({
      where: { jobPosting: { schoolId } },
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
