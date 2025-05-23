import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

const noteSchema = z.object({
  content: z.string().min(1),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const applicationId = parseInt(id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { content } = noteSchema.parse(body);
    // create the note
    const note = await prisma.candidateNote.create({
      data: {
        applicationId,
        authorId: parseInt(session.user.id, 10),
        content,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (err: any) {
    console.error('Error creating note:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
