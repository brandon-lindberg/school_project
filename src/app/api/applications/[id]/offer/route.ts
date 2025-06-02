import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { ApplicationStatus, ApplicationStage } from '@prisma/client';

const offerSchema = z.object({
  letterUrl: z.string().url(),
});

export async function POST(request: NextRequest, context: unknown) {
  // Extract route params
  const { params } = context as { params: { id: string } };

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const applicationId = parseInt(params.id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }

  // Only authorized admins
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { managedSchools: true } });
  const app = await prisma.application.findUnique({ where: { id: applicationId }, include: { jobPosting: true } });
  if (!user || !app) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const schoolId = app.jobPosting.schoolId;
  const isAuthorized = user.role === 'SUPER_ADMIN' || user.managedSchools.some(s => s.school_id === schoolId);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { letterUrl } = offerSchema.parse(await request.json());
    const offer = await prisma.offer.create({
      data: { applicationId, letterUrl },
    });
    // Update application to OFFER status/stage
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.OFFER, currentStage: ApplicationStage.OFFER },
    });
    // notify applicant
    const notificationData: Prisma.NotificationCreateInput = {
      user: { connect: { user_id: app.userId! } },
      type: 'APPLICATION_STATUS_UPDATED',
      title: 'Offer Letter Sent',
      message: `An offer has been sent: ${letterUrl}`,
      url: `/schools/${schoolId}/employment/recruitment/applications/${applicationId}`,
    };
    await prisma.notification.create({ data: notificationData });
    return NextResponse.json(offer, { status: 201 });
  } catch (err) {
    console.error('Error sending offer:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to send offer' }, { status: 500 });
  }
}
