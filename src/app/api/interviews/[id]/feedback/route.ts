import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

const feedbackSchema = z.object({
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5).optional(),
});

export async function PUT(request: NextRequest, context: unknown) {
  // Extract route params
  const { params } = context as { params: { id: string } };

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const interviewId = parseInt(params.id, 10);
  if (isNaN(interviewId)) {
    return NextResponse.json({ error: 'Invalid interview ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { content, rating } = feedbackSchema.parse(body);
    const authorId = session.user.id;

    const feedback = await prisma.interviewFeedback.create({
      data: { interviewId, authorId, content, rating },
    });

    // Optionally send notification/email here
    return NextResponse.json(feedback, { status: 201 });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
