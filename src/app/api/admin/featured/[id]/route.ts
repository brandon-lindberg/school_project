import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

// Helper to extract ID from URL
const getIdFromUrl = (url: string) => {
  const parts = new URL(url).pathname.split('/');
  const id = parseInt(parts[parts.length - 1]);
  return isNaN(id) ? null : id;
};

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
    const id = getIdFromUrl(request.url);
    if (!id) {
      return NextResponse.json({ error: 'Invalid slot ID' }, { status: 400 });
    }
    const slot = await prisma.featuredSlot.findUnique({
      where: { id },
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
    const id = getIdFromUrl(request.url);
    if (!id) {
      return NextResponse.json({ error: 'Invalid slot ID' }, { status: 400 });
    }
    const body = await request.json();
    const { slotNumber, schoolId, startDate, endDate } = body;
    const data: any = {};
    if (slotNumber !== undefined) data.slotNumber = parseInt(slotNumber);
    if (schoolId !== undefined) data.schoolId = parseInt(schoolId);
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = new Date(endDate);
    const updated = await prisma.featuredSlot.update({
      where: { id },
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
    const id = getIdFromUrl(request.url);
    if (!id) {
      return NextResponse.json({ error: 'Invalid slot ID' }, { status: 400 });
    }
    await prisma.featuredSlot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting featured slot:', error);
    return NextResponse.json({ error: 'Failed to delete featured slot' }, { status: 500 });
  }
}
