import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, context: unknown) {
  // Extract dynamic route params
  const { params } = context as { params: { id: string } };
  const offerId = parseInt(params.id, 10);
  if (isNaN(offerId)) {
    return NextResponse.json({ error: 'Invalid offer ID' }, { status: 400 });
  }
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { application: true },
    });
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    return NextResponse.json(offer);
  } catch (err) {
    console.error('Error fetching offer:', err);
    return NextResponse.json({ error: 'Failed to fetch offer' }, { status: 500 });
  }
}
