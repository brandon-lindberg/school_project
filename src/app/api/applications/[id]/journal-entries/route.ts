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

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { params } = await context;
  const applicationId = parseInt(params.id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }
  try {
    const entries = await prisma.journalEntry.findMany({
      where: { applicationId },
      include: { author: { select: { user_id: true, first_name: true, family_name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(entries);
  } catch (err) {
    console.error('Error fetching journal entries:', err);
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const { params } = await context;
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
    const { type, content, rating } = entrySchema.parse(body);
    const authorId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;
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
