import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const schoolId = parseInt(params.id);
    if (isNaN(schoolId)) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    // Fetch the user to check their role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, managedSchools: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is authorized to access this school
    if (user.role !== 'SUPER_ADMIN') {
      const isSchoolAdmin = user.managedSchools.some(admin => admin.school_id === schoolId);

      if (!isSchoolAdmin) {
        return NextResponse.json(
          { error: 'Not authorized to access this school' },
          { status: 403 }
        );
      }
    }

    // Fetch the school
    const school = await prisma.school.findUnique({
      where: { school_id: schoolId },
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

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Transform the data to match the frontend expectations
    const transformedSchool = {
      school_id: school.school_id,
      name: school.name_en || school.name_jp,
      address: school.address_en || school.address_jp,
      city: school.location_en || school.location_jp,
      country: school.country_en || school.country_jp,
      website: school.url_en || school.url_jp,
      phone_number: school.phone_en || school.phone_jp,
      email: school.email_en || school.email_jp,
    };

    return NextResponse.json(transformedSchool);
  } catch (error) {
    console.error('Error in school route:', error);
    return NextResponse.json({ error: 'Failed to fetch school' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const schoolId = parseInt(params.id);
    if (isNaN(schoolId)) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    // Fetch the user to check their role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, managedSchools: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is authorized to update this school
    if (user.role !== 'SUPER_ADMIN') {
      const isSchoolAdmin = user.managedSchools.some(admin => admin.school_id === schoolId);

      if (!isSchoolAdmin) {
        return NextResponse.json(
          { error: 'Not authorized to update this school' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { name, address, city, country, website, phone_number, email } = body;

    // Update school with bilingual fields
    const updatedSchool = await prisma.school.update({
      where: { school_id: schoolId },
      data: {
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

    // Transform the response to match frontend expectations
    const transformedSchool = {
      school_id: updatedSchool.school_id,
      name: updatedSchool.name_en || updatedSchool.name_jp,
      address: updatedSchool.address_en || updatedSchool.address_jp,
      city: updatedSchool.location_en || updatedSchool.location_jp,
      country: updatedSchool.country_en || updatedSchool.country_jp,
      website: updatedSchool.url_en || updatedSchool.url_jp,
      phone_number: updatedSchool.phone_en || updatedSchool.phone_jp,
      email: updatedSchool.email_en || updatedSchool.email_jp,
    };

    return NextResponse.json(transformedSchool);
  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json({ error: 'Failed to update school' }, { status: 500 });
  }
}
