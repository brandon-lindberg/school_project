import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

// GET: List all featured slots (including future)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const slots = await prisma.featuredSlot.findMany({
      orderBy: [
        { slotNumber: 'asc' },
        { startDate: 'asc' },
      ],
      include: { school: true },
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching featured slots:', error);
    return NextResponse.json({ error: 'Failed to fetch featured slots' }, { status: 500 });
  }
}

// POST: Create a new featured slot
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const { slotNumber, schoolId, startDate, endDate } = body;
    // Validate and parse inputs
    const slotNum = Number(slotNumber);
    const schoolIdStr = schoolId as string;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (
      isNaN(slotNum) || slotNum < 1 || slotNum > 4 ||
      typeof schoolIdStr !== 'string' || schoolIdStr.trim() === '' ||
      isNaN(start.getTime()) || isNaN(end.getTime()) ||
      start > end
    ) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    // Prevent overlapping schedules for the same slot
    const conflicts = await prisma.featuredSlot.findMany({
      where: {
        slotNumber: slotNum,
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });
    if (conflicts.length > 0) {
      return NextResponse.json({ error: 'Schedule overlaps an existing schedule for this slot.' }, { status: 400 });
    }
    const newSlot = await prisma.featuredSlot.create({
      data: {
        slotNumber: slotNum,
        schoolId: schoolIdStr,
        startDate: start,
        endDate: end,
      },
      include: { school: true },
    });

    return NextResponse.json(newSlot);
  } catch (error) {
    console.error('Error creating featured slot:', error);
    return NextResponse.json({ error: 'Failed to create featured slot' }, { status: 500 });
  }
}
