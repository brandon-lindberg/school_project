import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export function GET() {
  const now = new Date();
  // define inclusive date range covering all of today
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  return prisma.featuredSlot
    .findMany({
      where: { startDate: { lte: todayEnd }, endDate: { gte: todayStart } },
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
