import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

const slotSchema = z.object({
  dayOfWeek: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string; slotId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const applicationId = parseInt(params.id, 10);
  const slotId = parseInt(params.slotId, 10);
  if (isNaN(applicationId) || isNaN(slotId)) {
    return NextResponse.json({ error: 'Invalid application or slot ID' }, { status: 400 });
  }

  try {
    const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });
    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }
    const userId = session.user.id;
    if (slot.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const { dayOfWeek, startTime, endTime } = slotSchema.parse(data);
    const updated = await prisma.availabilitySlot.update({
      where: { id: slotId },
      data: { dayOfWeek, startTime, endTime },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error updating availability slot:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update slot' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; slotId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const applicationId = parseInt(params.id, 10);
  const slotId = parseInt(params.slotId, 10);
  if (isNaN(applicationId) || isNaN(slotId)) {
    return NextResponse.json({ error: 'Invalid application or slot ID' }, { status: 400 });
  }

  try {
    const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });
    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }
    const userId = session.user.id;
    if (slot.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.availabilitySlot.delete({ where: { id: slotId } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting availability slot:', err);
    return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 });
  }
}
