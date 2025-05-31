import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';

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

// POST /api/admin/schools: create a new school (super admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    // Ensure only super admins can create schools
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const body = await request.json();
    const { name, address, city, country, website, phone_number, email } = body;
    // Create a new school with English fields; translations can be added later
    const newSchool = await prisma.school.create({
      data: {
        site_id: randomUUID(),
        name_en: name,
        address_en: address,
        location_en: city,
        country_en: country,
        url_en: website,
        phone_en: phone_number,
        email_en: email,
      },
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
    });
    // Transform for frontend
    const transformed = {
      school_id: newSchool.school_id,
      name: newSchool.name_en || newSchool.name_jp,
      address: newSchool.address_en || newSchool.address_jp,
      city: newSchool.location_en || newSchool.location_jp,
      country: newSchool.country_en || newSchool.country_jp,
      website: newSchool.url_en || newSchool.url_jp,
      phone_number: newSchool.phone_en || newSchool.phone_jp,
      email: newSchool.email_en || newSchool.email_jp,
    };
    return NextResponse.json(transformed, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/schools:', error);
    return NextResponse.json({ error: 'Failed to create school' }, { status: 500 });
  }
}
