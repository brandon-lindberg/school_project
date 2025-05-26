import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { id } = await params;
  const applicationId = parseInt(id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }

  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        notes: { orderBy: { createdAt: 'desc' } },
        interviews: {
          orderBy: { scheduledAt: 'asc' },
          include: {
            interviewer: { select: { user_id: true, first_name: true, family_name: true } }
          }
        },
        offer: true,
      },
    });
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}
