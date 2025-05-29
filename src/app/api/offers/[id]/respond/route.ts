import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

const responseSchema = z.object({
  response: z.enum(['ACCEPTED', 'REJECTED']),
});

export async function PATCH(request: NextRequest, { params }: { params: any }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const offerId = parseInt(id, 10);
  if (isNaN(offerId)) {
    return NextResponse.json({ error: 'Invalid offer ID' }, { status: 400 });
  }

  // verify this user is the applicant
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { application: { include: { jobPosting: true } } },
  });
  if (!offer) {
    return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
  }
  if (offer.application.userId?.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { response } = responseSchema.parse(await request.json());
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: { status: response, responseAt: new Date() },
    });
    // Update application status based on candidate response (cast to any to bypass TS mismatch)
    const updatedApp = await prisma.application.update({
      where: { id: offer.applicationId },
      data: { status: (response === 'ACCEPTED' ? 'ACCEPTED_OFFER' : 'REJECTED_OFFER') as any },
    });
    console.log('Respond route: updated application record:', updatedApp);
    // Notify all school admins of this response
    const schoolId = offer.application.jobPosting.schoolId;
    const admins = await prisma.schoolAdmin.findMany({ where: { school_id: schoolId } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          user_id: admin.user_id,
          type: 'APPLICATION_STATUS_UPDATED',
          title: response === 'ACCEPTED' ? 'Offer Accepted' : 'Offer Rejected',
          message: `${offer.application.applicantName} has ${response === 'ACCEPTED' ? 'accepted' : 'rejected'} the offer for "${offer.application.jobPosting.title}"`,
          url: `/schools/${schoolId}/employment/recruitment/applications/${offer.applicationId}`,
        },
      });
    }
    return NextResponse.json(updatedOffer);
  } catch (err: any) {
    console.error('Error responding to offer:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to respond to offer' }, { status: 500 });
  }
}
