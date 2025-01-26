import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Get users who already have claims
    const usersWithClaims = await prisma.schoolClaim.findMany({
      where: {
        status: {
          in: ['APPROVED', 'PENDING'],
        },
      },
      select: {
        user_id: true,
      },
    });

    const userIdsWithClaims = usersWithClaims.map(claim => claim.user_id);

    // Search for users by email, first name, or family name, excluding those with claims
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { first_name: { contains: query, mode: 'insensitive' } },
              { family_name: { contains: query, mode: 'insensitive' } },
            ],
          },
          {
            user_id: {
              notIn: userIdsWithClaims,
            },
          },
        ],
      },
      select: {
        user_id: true,
        email: true,
        first_name: true,
        family_name: true,
      },
      take: 10, // Limit results to 10 users
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
