import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// GET: Fetch a single featured slot by ID
export async function GET(request: NextRequest) {
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
    const url = new URL(request.url);
    const idStr = url.pathname.split('/')[4]; // /api/admin/featured/[id]
    const slotId = parseInt(idStr, 10);
    if (isNaN(slotId)) {
      return NextResponse.json({ error: 'Invalid slot ID' }, { status: 400 });
    }
    const slot = await prisma.featuredSlot.findUnique({
      where: { id: slotId },
      include: { school: true },
    });
    if (!slot) {
      return NextResponse.json({ error: 'Featured slot not found' }, { status: 404 });
    }
    return NextResponse.json(slot);
  } catch (error) {
    console.error('Error fetching featured slot:', error);
    return NextResponse.json({ error: 'Failed to fetch featured slot' }, { status: 500 });
  }
}

// PUT: Update a featured slot by ID
export async function PUT(request: NextRequest) {
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
    const url = new URL(request.url);
    const idStr = url.pathname.split('/')[4]; // /api/admin/featured/[id]
    const slotId = parseInt(idStr, 10);
    if (isNaN(slotId)) {
      return NextResponse.json({ error: 'Invalid slot ID' }, { status: 400 });
    }
    const body = await request.json();
    const { slotNumber, schoolId, startDate, endDate } = body;
    const data: Prisma.FeaturedSlotUpdateInput = {};
    if (slotNumber !== undefined) data.slotNumber = Number(slotNumber);
    if (schoolId !== undefined) {
      data.school = { connect: { school_id: schoolId as string } };
    }
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = new Date(endDate);
    const updated = await prisma.featuredSlot.update({
      where: { id: slotId },
      data,
      include: { school: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating featured slot:', error);
    return NextResponse.json({ error: 'Failed to update featured slot' }, { status: 500 });
  }
}

// DELETE: Remove a featured slot by ID
export async function DELETE(request: NextRequest) {
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
    const url = new URL(request.url);
    const idStr = url.pathname.split('/')[4]; // /api/admin/featured/[id]
    const slotId = parseInt(idStr, 10);
    if (isNaN(slotId)) {
      return NextResponse.json({ error: 'Invalid slot ID' }, { status: 400 });
    }
    await prisma.featuredSlot.delete({ where: { id: slotId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting featured slot:', error);
    return NextResponse.json({ error: 'Failed to delete featured slot' }, { status: 500 });
  }
}
