import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Use current date/time to find active slots
    const now = new Date();
    const slots = await prisma.featuredSlot.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { slotNumber: 'asc' },
      include: { school: true },
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching featured slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured slots' },
      { status: 500 }
    );
  }
}
