import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// Validate incoming slot data (date, startTime, endTime)
const slotSchema = z.object({
  date: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const applicationId = parseInt(params.id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }

  try {
    const slots = await prisma.availabilitySlot.findMany({
      where: { applicationId },
      include: { user: { select: { user_id: true, first_name: true, family_name: true } } },
      orderBy: { dayOfWeek: 'asc' },
    });
    return NextResponse.json(slots);
  } catch (err) {
    console.error('Error fetching availability slots:', err);
    return NextResponse.json({ error: 'Failed to fetch availability slots' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const applicationId = parseInt(params.id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { date, startTime, endTime } = slotSchema.parse(body);
    // Derive dayOfWeek from the given date
    const parsedDate = new Date(date);
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parsedDate.getDay()];

    const userId = session.user.id;
    const slot = await prisma.availabilitySlot.create({
      data: {
        applicationId,
        userId,
        date: parsedDate,
        dayOfWeek,
        startTime,
        endTime,
      } as any,
      include: {
        user: { select: { user_id: true, first_name: true, family_name: true } },
      },
    });
    return NextResponse.json(slot, { status: 201 });
  } catch (err: any) {
    console.error('Error creating availability slot:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create availability slot' }, { status: 500 });
  }
}
