import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export function GET(request: Request) {
  const now = new Date();
  return prisma.featuredSlot
    .findMany({
      where: { startDate: { lte: now }, endDate: { gte: now } },
      orderBy: { slotNumber: 'asc' },
      include: { school: true },
    })
    .then((slots) => NextResponse.json({ slots }))
    .catch((error) => {
      console.error('Error fetching featured slots:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch featured slots' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    });
}
