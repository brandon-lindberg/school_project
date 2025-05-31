import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

const entrySchema = z.object({
  type: z.enum(['NOTE', 'FEEDBACK', 'SYSTEM', 'JOURNAL']),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5).optional(),
});

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { id } = await params;
  const applicationId = parseInt(id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }
  try {
    // Fetch existing journal entries
    const entries = await prisma.journalEntry.findMany({
      where: { applicationId },
      include: { author: { select: { user_id: true, first_name: true, family_name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    // Fetch interviews to determine rounds
    const interviews = await prisma.interview.findMany({
      where: { applicationId },
      orderBy: { scheduledAt: 'asc' },
    });
    const roundMap: Record<number, number> = {};
    interviews.forEach((intv, idx) => {
      roundMap[intv.id] = idx + 1;
    });
    // Fetch interview feedbacks for this application
    const feedbacks = await prisma.interviewFeedback.findMany({
      where: { interview: { applicationId } },
      include: { author: { select: { user_id: true, first_name: true, family_name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    // Map feedbacks into timeline entries (use negative IDs to avoid collision)
    const feedbackEntries = feedbacks.map(fb => ({
      id: -fb.id,
      type: 'FEEDBACK',
      content: `Interview Notes (Round ${roundMap[fb.interviewId] || '?'}): ${fb.content}`,
      rating: fb.rating,
      createdAt: fb.createdAt,
      author: fb.author,
    }));
    // Merge and sort all entries by creation time
    const allEntries = [...entries, ...feedbackEntries].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return NextResponse.json(allEntries);
  } catch (err) {
    console.error('Error fetching journal entries:', err);
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: any }) {
  const { id } = await params;
  const applicationId = parseInt(id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { type, content, rating } = entrySchema.parse(body);
    const authorId = session.user.id;
    const entry = await prisma.journalEntry.create({ data: { applicationId, authorId, type, content, rating } });
    return NextResponse.json(entry, { status: 201 });
  } catch (err: any) {
    console.error('Error creating journal entry:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 });
  }
}
