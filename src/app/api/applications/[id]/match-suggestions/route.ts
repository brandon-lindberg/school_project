import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import type { AvailabilitySlot } from '@prisma/client';

// Suggestion shape for matching candidate/admin slots
type MatchSuggestion = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  candidateSlot: AvailabilitySlot;
  adminSlot: AvailabilitySlot;
};

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export async function GET(request: NextRequest, context: unknown) {
  // Extract dynamic route params
  const { params } = context as { params: { id: string } };
  const applicationId = parseInt(params.id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [slots, app] = await Promise.all([
      prisma.availabilitySlot.findMany({ where: { applicationId } }),
      prisma.application.findUnique({ where: { id: applicationId } }),
    ]);
    if (!app || !app.userId) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    const candidateId = app.userId;
    const candidateSlots = slots.filter(s => s.userId === candidateId);
    const adminSlots = slots.filter(s => s.userId !== candidateId);
    const suggestions: MatchSuggestion[] = [];
    for (const cs of candidateSlots) {
      for (const as of adminSlots) {
        if (cs.dayOfWeek === as.dayOfWeek) {
          const csStart = parseTime(cs.startTime);
          const csEnd = parseTime(cs.endTime);
          const asStart = parseTime(as.startTime);
          const asEnd = parseTime(as.endTime);
          const start = Math.max(csStart, asStart);
          const end = Math.min(csEnd, asEnd);
          if (start < end) {
            suggestions.push({
              dayOfWeek: cs.dayOfWeek,
              startTime: formatTime(start),
              endTime: formatTime(end),
              candidateSlot: cs,
              adminSlot: as,
            });
          }
        }
      }
    }
    return NextResponse.json(suggestions);
  } catch (err) {
    console.error('Error computing match suggestions:', err);
    return NextResponse.json({ error: 'Failed to compute suggestions' }, { status: 500 });
  }
}
