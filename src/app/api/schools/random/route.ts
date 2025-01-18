import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    // Fetch total count of schools with URLs
    const totalCount = await prisma.school.count({
      where: {
        OR: [
          { url_en: { not: null } },
          { url_jp: { not: null } }
        ]
      }
    });

    // Generate random offset
    const randomOffset = Math.floor(Math.random() * Math.max(0, totalCount - limit));

    // Fetch random schools with URLs
    const schools = await prisma.school.findMany({
      where: {
        OR: [
          { url_en: { not: null } },
          { url_jp: { not: null } }
        ]
      },
      take: limit,
      skip: randomOffset,
      orderBy: {
        school_id: 'asc', // Use consistent ordering after the random skip
      },
    });

    return NextResponse.json({ schools });
  } catch (error) {
    console.error('Error fetching random schools:', error);
    return NextResponse.json({ error: 'Failed to fetch random schools' }, { status: 500 });
  }
}
