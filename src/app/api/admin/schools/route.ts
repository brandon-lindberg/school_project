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

    // Fetch the user to check their role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Fetch all schools
    const schools = await prisma.school.findMany({
      select: {
        school_id: true,
        name_en: true,
        name_jp: true,
        address_en: true,
        address_jp: true,
        location_en: true,
        location_jp: true,
        country_en: true,
        country_jp: true,
        url_en: true,
        url_jp: true,
        phone_en: true,
        phone_jp: true,
        email_en: true,
        email_jp: true,
      },
      orderBy: {
        name_en: 'asc',
      },
    });

    // Transform the data to match the frontend expectations
    const transformedSchools = schools.map(school => ({
      school_id: school.school_id,
      name: school.name_en || school.name_jp,
      address: school.address_en || school.address_jp,
      city: school.location_en || school.location_jp,
      country: school.country_en || school.country_jp,
      website: school.url_en || school.url_jp,
      phone_number: school.phone_en || school.phone_jp,
      email: school.email_en || school.email_jp,
    }));

    return NextResponse.json(transformedSchools);
  } catch (error) {
    console.error('Error in schools route:', error);
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 });
  }
}
