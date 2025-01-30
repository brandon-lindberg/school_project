import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the user's claims
    const claims = await prisma.schoolClaim.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      select: {
        claim_id: true,
        status: true,
        notes: true,
        processed_at: true,
        school: {
          select: {
            school_id: true,
            name_en: true,
            name_jp: true,
          },
        },
      },
      orderBy: {
        submitted_at: 'desc',
      },
    });

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}
