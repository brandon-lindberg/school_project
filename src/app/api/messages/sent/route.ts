import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, role: true },
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'desc';

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: Prisma.MessageWhereInput = {
      sender_id: user.user_id,
    };

    if (filter === 'broadcast') {
      whereClause.is_broadcast = true;
    } else if (filter === 'direct') {
      whereClause.is_broadcast = false;
    }

    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          } as Prisma.StringFilter,
        },
        {
          content: {
            contains: search,
            mode: 'insensitive',
          } as Prisma.StringFilter,
        },
      ];
    }

    // Get total count
    const total = await prisma.message.count({ where: whereClause });

    // Get messages
    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        recipients: {
          include: {
            user: {
              select: {
                email: true,
                family_name: true,
                first_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: sort as 'asc' | 'desc',
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    return NextResponse.json({ error: 'Failed to fetch sent messages' }, { status: 500 });
  }
}
