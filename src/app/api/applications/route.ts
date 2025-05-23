import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = parseInt(session.user.id as string, 10);
  const applications = await prisma.application.findMany({
    where: { userId },
    include: { jobPosting: true, interviews: true, offer: true, notes: true },
    orderBy: { submittedAt: 'desc' },
  });
  return NextResponse.json(applications);
}
