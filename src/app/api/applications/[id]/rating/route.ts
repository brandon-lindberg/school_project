import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

const ratingSchema = z.object({
  rating: z.number().int().min(0).max(5),
});

export async function PATCH(request: NextRequest, context: unknown) {
  // Extract dynamic route params
  const { params } = context as { params: { id: string } };
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const applicationId = parseInt(params.id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  let data;
  try {
    data = ratingSchema.parse(body);
  } catch (err) {
    const details = err instanceof z.ZodError ? err.errors : undefined;
    return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
  }
  try {
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { rating: data.rating },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error updating rating:', err);
    return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
  }
}
