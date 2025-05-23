import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

const responseSchema = z.object({
  response: z.enum(['ACCEPTED', 'REJECTED']),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const offerId = parseInt(params.id, 10);
  if (isNaN(offerId)) {
    return NextResponse.json({ error: 'Invalid offer ID' }, { status: 400 });
  }

  // verify this user is the applicant
  const offer = await prisma.offer.findUnique({ where: { id: offerId }, include: { application: true } });
  if (!offer) {
    return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
  }
  if (offer.application.userId?.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { response } = responseSchema.parse(await request.json());
    const updated = await prisma.offer.update({
      where: { id: offerId },
      data: { status: response, responseAt: new Date() },
    });
    // optionally notify admins here
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error responding to offer:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to respond to offer' }, { status: 500 });
  }
}
